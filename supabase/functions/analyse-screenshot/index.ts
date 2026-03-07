import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

function validateAndFix(result: Partial<AnalysisResult>): AnalysisResult {
  const safeDefaults: AnalysisResult = {
    title: "Review this item",
    category: "To Do",
    deadline: "Next Week",
  };

  let title = result.title?.trim() || safeDefaults.title;
  if (title.length === 0) title = safeDefaults.title;

  let category = result.category?.trim() || safeDefaults.category;
  if (!VALID_CATEGORIES.includes(category)) category = safeDefaults.category;

  let deadline = result.deadline?.trim() || safeDefaults.deadline;
  // Validate deadline is either a known string or a valid YYYY-MM-DD date
  if (!VALID_DEADLINES.includes(deadline)) {
    const dateMatch = deadline.match(/^\d{4}-\d{2}-\d{2}$/);
    if (dateMatch) {
      const parsed = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(parsed.getTime()) || parsed < today) {
        deadline = safeDefaults.deadline;
      }
    } else {
      deadline = safeDefaults.deadline;
    }
  }

  return { title, category, deadline };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "Missing imageBase64 or mimeType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || "";

    let parsed: Partial<AnalysisResult>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse AI response as JSON:", rawText);
      parsed = {};
    }

    const result = validateAndFix(parsed);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyse-screenshot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
