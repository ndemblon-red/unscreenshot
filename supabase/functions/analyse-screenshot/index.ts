import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { BETA_ANALYSIS_CAP, isOverCap } from "../_shared/beta-limits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a personal task assistant that reads screenshots and turns them into short, actionable reminders.

Your job is to look at an image and return exactly three things:
1. A title — a short action trigger (under 8 words) that tells the user what to do
2. A category — one of: Restaurants, Shopping, To Do, Events, Reading, Home, Travel, Wishlist
3. A deadline — one of: Tomorrow, Next Week, Next Month, or a specific date string (YYYY-MM-DD) if a date is visible in the image

TITLE RULES:
- Always start with a verb (Buy, Try, Book, Read, Watch, Visit, Check, etc.)
- Be specific — include names, places, or products if visible
- Under 8 words
- The image will be shown alongside the title, so you don't need to describe everything — just trigger the action
- Never use rude, lewd, suggestive, or alarming language
- Never use technical labels like "OCR_FAIL", "UNKNOWN", or "ERROR"
- If you cannot determine intent, use "Review this item"

CATEGORY RULES:
- Choose exactly one category
- Restaurants: any food, drink, or dining recommendation
- Shopping: any product, item, or thing to buy
- Events: concerts, shows, exhibitions, sports — anything with a date
- Reading: articles, books, newsletters, blog posts
- Home: anything related to home improvement, décor, or household tasks
- Travel: trips, flights, hotels, destinations, or travel inspiration
- Wishlist: things to save for later that aren't an immediate purchase
- To Do: anything that doesn't fit the above

DEADLINE RULES:
- If a specific date is visible in the image and it's in the future, use it (YYYY-MM-DD format)
- If the image suggests urgency (e.g. "limited time", "selling fast"), use Tomorrow or Next Week
- If no urgency signal is present, default to Next Week
- Never return a date in the past

SAFETY:
- If the image contains sensitive, adult, or unreadable content, return: title = "Review this item", category = "To Do", deadline = "Next Week"
- Always return all three fields — never return null or empty values

OUTPUT FORMAT:
Return only valid JSON. No explanation, no markdown, no extra text.

{
  "title": "string",
  "category": "Restaurants | Shopping | To Do | Events | Reading | Home | Travel | Wishlist",
  "deadline": "Tomorrow | Next Week | Next Month | YYYY-MM-DD"
}

EXAMPLES:

Input: [Concert poster for Massive Attack at Brixton Academy, Saturday 14 June]
Output: {"title": "Buy tickets for Massive Attack", "category": "Events", "deadline": "2025-06-07"}

Input: [Screenshot of Nike Air Max trainers on a shopping website]
Output: {"title": "Buy Nike Air Max trainers", "category": "Shopping", "deadline": "Next Week"}

Input: [WhatsApp message: "You have to try Bancone in Covent Garden, best pasta in London"]
Output: {"title": "Try Bancone in Covent Garden", "category": "Restaurants", "deadline": "Next Month"}

Input: [Blurry unreadable image]
Output: {"title": "Review this item", "category": "To Do", "deadline": "Next Week"}`;

const VALID_CATEGORIES = [
  "Restaurants",
  "Shopping",
  "To Do",
  "Events",
  "Reading",
  "Home",
  "Travel",
  "Wishlist",
];

const VALID_DEADLINES = ["Tomorrow", "Next Week", "Next Month"];

interface AnalysisResult {
  title: string;
  category: string;
  deadline: string;
}

function validateAndFix(result: Partial<AnalysisResult>): { validated: AnalysisResult; wasModified: boolean } {
  const safeDefaults: AnalysisResult = {
    title: "Review this item",
    category: "To Do",
    deadline: "Next Week",
  };

  let wasModified = false;

  let title = result.title?.trim() || safeDefaults.title;
  if (title.length === 0) { title = safeDefaults.title; wasModified = true; }
  if (title !== result.title?.trim()) wasModified = true;

  let category = result.category?.trim() || safeDefaults.category;
  if (!VALID_CATEGORIES.includes(category)) { category = safeDefaults.category; wasModified = true; }
  if (category !== result.category?.trim()) wasModified = true;

  let deadline = result.deadline?.trim() || safeDefaults.deadline;
  if (!VALID_DEADLINES.includes(deadline)) {
    const dateMatch = deadline.match(/^\d{4}-\d{2}-\d{2}$/);
    if (dateMatch) {
      const parsed = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(parsed.getTime()) || parsed < today) {
        deadline = safeDefaults.deadline;
        wasModified = true;
      }
    } else {
      deadline = safeDefaults.deadline;
      wasModified = true;
    }
  }
  if (deadline !== result.deadline?.trim()) wasModified = true;

  return { validated: { title, category, deadline }, wasModified };
}

// --- Langfuse helpers ---

function generateId(): string {
  return crypto.randomUUID();
}

interface LangfuseConfig {
  secretKey: string;
  publicKey: string;
  host: string;
}

function getLangfuseConfig(): LangfuseConfig | null {
  const secretKey = Deno.env.get("LANGFUSE_SECRET_KEY");
  const publicKey = Deno.env.get("LANGFUSE_PUBLIC_KEY");
  const host = Deno.env.get("LANGFUSE_HOST");
  if (!secretKey || !publicKey || !host) return null;
  return { secretKey, publicKey, host };
}

async function flushToLangfuse(
  config: LangfuseConfig,
  events: Record<string, unknown>[]
): Promise<void> {
  try {
    const auth = btoa(`${config.publicKey}:${config.secretKey}`);
    await fetch(`${config.host}/api/public/ingestion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ batch: events }),
    });
  } catch (e) {
    console.warn("Langfuse flush failed (non-blocking):", e);
  }
}

// --- Main handler ---

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const langfuse = getLangfuseConfig();
  const traceId = generateId();
  const generationId = generateId();
  const requestStartTime = new Date().toISOString();

  try {
    // --- Auth: verify caller's JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!userData.user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: "Please confirm your email before using this feature." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = userData.user.id;

    // --- Beta cap check (service role bypasses RLS) ---
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { count: usedCount, error: countError } = await adminClient
      .from("analysis_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Failed to count analysis usage:", countError);
      // Fail open: allow analysis if usage check itself errors, to avoid blocking valid users
    } else if (isOverCap(usedCount ?? 0, BETA_ANALYSIS_CAP)) {
      return new Response(
        JSON.stringify({
          error: "beta_cap_reached",
          used: usedCount ?? 0,
          limit: BETA_ANALYSIS_CAP,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "Missing imageBase64 or mimeType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Validate mimeType (Anthropic-supported only) ---
    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!ALLOWED_MIME.includes(mimeType)) {
      return new Response(
        JSON.stringify({ error: `Unsupported image type: ${mimeType}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Validate size (~7 MB base64 ≈ 5 MB raw, matches client compression target) ---
    const MAX_BASE64_BYTES = 7 * 1024 * 1024;
    if (typeof imageBase64 !== "string" || imageBase64.length > MAX_BASE64_BYTES) {
      return new Response(
        JSON.stringify({ error: "Image too large. Max ~5 MB after compression." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generationStartTime = new Date().toISOString();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: "Analyse this screenshot and return the JSON.",
              },
            ],
          },
        ],
      }),
    });

    const generationEndTime = new Date().toISOString();

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);

      // Log failed generation to Langfuse
      if (langfuse) {
        await flushToLangfuse(langfuse, [
          {
            id: generateId(),
            type: "trace-create",
            timestamp: requestStartTime,
            body: { id: traceId, name: "analyse-screenshot", input: { mimeType }, metadata: { status: "error", httpStatus: response.status } },
          },
          {
            id: generateId(),
            type: "generation-create",
            timestamp: generationStartTime,
            body: {
              id: generationId,
              traceId,
              name: "anthropic-vision",
              model: "claude-sonnet-4-20250514",
              startTime: generationStartTime,
              endTime: generationEndTime,
              input: { system: SYSTEM_PROMPT, userMessage: "Analyse this screenshot and return the JSON.", imageMimeType: mimeType },
              statusMessage: `API error: ${response.status}`,
              level: "ERROR",
            },
          },
        ]);
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || "";
    const usage = data.usage || {};

    let parsed: Partial<AnalysisResult>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse AI response as JSON:", rawText);
      parsed = {};
    }

    const { validated: result, wasModified } = validateAndFix(parsed);
    const requestEndTime = new Date().toISOString();

    // Log successful generation to Langfuse
    if (langfuse) {
      await flushToLangfuse(langfuse, [
        {
          id: generateId(),
          type: "trace-create",
          timestamp: requestStartTime,
          body: {
            id: traceId,
            name: "analyse-screenshot",
            input: { mimeType },
            output: result,
            metadata: { validationModified: wasModified },
          },
        },
        {
          id: generateId(),
          type: "generation-create",
          timestamp: generationStartTime,
          body: {
            id: generationId,
            traceId,
            name: "anthropic-vision",
            model: "claude-sonnet-4-20250514",
            modelParameters: { max_tokens: 256 },
            startTime: generationStartTime,
            endTime: generationEndTime,
            completionStartTime: generationEndTime,
            input: {
              system: SYSTEM_PROMPT,
              userMessage: "Analyse this screenshot and return the JSON.",
              imageMimeType: mimeType,
            },
            output: rawText,
            usage: {
              input: usage.input_tokens,
              output: usage.output_tokens,
            },
            level: "DEFAULT",
            metadata: { validationModified: wasModified },
          },
        },
      ]);
    }

    // Record successful analysis toward beta cap (fire-and-forget)
    adminClient
      .from("analysis_usage")
      .insert({ user_id: userId })
      .then(({ error }) => {
        if (error) console.error("Failed to log analysis_usage:", error);
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyse-screenshot error:", e);

    // Log exception to Langfuse
    if (langfuse) {
      await flushToLangfuse(langfuse, [
        {
          id: generateId(),
          type: "trace-create",
          timestamp: requestStartTime,
          body: {
            id: traceId,
            name: "analyse-screenshot",
            metadata: { status: "exception", error: e instanceof Error ? e.message : "Unknown error" },
          },
        },
      ]);
    }

    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
