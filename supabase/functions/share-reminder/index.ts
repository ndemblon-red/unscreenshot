import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";
import { z } from "https://esm.sh/zod@3.23.8";
import { buildShareNotificationEmail } from "../_shared/share-notification-email-template.ts";

// Mirrors check-deadlines: same sender, same gateway, same brand assets.
const SENDER_EMAIL = "Unscreenshot <onboarding@resend.dev>";
const RESEND_GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const APP_URL = "https://id-preview--6b3058fd-4727-4ff6-b954-440c6a622739.lovable.app";
const LOGO_URL = "https://eialbbgpkyjjzcfkxbgc.supabase.co/storage/v1/object/public/public-assets/icon-128.png";

// Per-reminder cap on active recipients.
const MAX_RECIPIENTS_PER_REMINDER = 10;

const BodySchema = z.object({
  reminderId: z.string().uuid(),
  recipientEmails: z.array(z.string().email()).min(1).max(MAX_RECIPIENTS_PER_REMINDER),
});

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!lovableKey) return { ok: false, error: "LOVABLE_API_KEY not configured" };
  if (!resendKey) return { ok: false, error: "RESEND_API_KEY not configured" };

  try {
    const res = await fetch(`${RESEND_GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({ from: SENDER_EMAIL, to: [to], subject, html, text }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ---- Auth (verify_jwt is false at the platform level; validate in code) ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    // ---- Validate body ----
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { reminderId, recipientEmails } = parsed.data;

    // Normalise: lowercase + trim + dedupe
    const normalisedEmails = Array.from(
      new Set(recipientEmails.map((e) => e.trim().toLowerCase())),
    );

    // ---- Service-role client for everything below ----
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // ---- Verify reminder ownership ----
    const { data: reminder, error: remErr } = await admin
      .from("reminders")
      .select("id, user_id, title, category, deadline, image_url")
      .eq("id", reminderId)
      .single();
    if (remErr || !reminder) {
      return new Response(JSON.stringify({ error: "Reminder not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (reminder.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not your reminder" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Fetch existing active shares for this reminder ----
    const { data: existingShares } = await admin
      .from("reminder_shares")
      .select("recipient_email")
      .eq("reminder_id", reminderId)
      .is("revoked_at", null);

    const existingSet = new Set((existingShares ?? []).map((s) => s.recipient_email));
    const activeCount = existingSet.size;

    // Skip emails already actively shared
    const newEmails = normalisedEmails.filter((e) => !existingSet.has(e));

    // Don't allow sender sharing with themselves
    const senderEmail = (user.email ?? "").toLowerCase();
    const filteredNew = newEmails.filter((e) => e !== senderEmail);

    // ---- Enforce 10-recipient cap (per reminder) ----
    if (activeCount + filteredNew.length > MAX_RECIPIENTS_PER_REMINDER) {
      return new Response(
        JSON.stringify({
          error: `This reminder can be shared with at most ${MAX_RECIPIENTS_PER_REMINDER} people. Currently shared with ${activeCount}.`,
          code: "recipient_cap_exceeded",
          activeCount,
          max: MAX_RECIPIENTS_PER_REMINDER,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (filteredNew.length === 0) {
      return new Response(
        JSON.stringify({ shared: 0, skipped: normalisedEmails.length, message: "All recipients already shared" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- Insert share rows ----
    const insertRows = filteredNew.map((email) => ({
      reminder_id: reminderId,
      shared_by_user_id: user.id,
      recipient_email: email,
    }));
    const { error: insertErr } = await admin.from("reminder_shares").insert(insertRows);
    if (insertErr) {
      console.error("Insert reminder_shares failed:", insertErr);
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Send "shared with you" emails ----
    const subject = `${user.email ?? "Someone"} shared a reminder: ${reminder.title}`;
    const signupLink = `${APP_URL}/auth`;
    const { html, text } = buildShareNotificationEmail({
      senderEmail: user.email ?? "A friend",
      title: reminder.title,
      category: reminder.category,
      deadline: reminder.deadline,
      imageUrl: reminder.image_url,
      signupLink,
      logoUrl: LOGO_URL,
      appUrl: APP_URL,
    });

    let sentCount = 0;
    let failedCount = 0;
    for (const recipient of filteredNew) {
      const result = await sendEmail(recipient, subject, html, text);
      if (result.ok) sentCount++;
      else {
        failedCount++;
        console.error(`Share email failed for ${recipient}:`, result.error);
      }
    }

    return new Response(
      JSON.stringify({
        shared: filteredNew.length,
        skipped: normalisedEmails.length - filteredNew.length,
        emailsSent: sentCount,
        emailsFailed: failedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("share-reminder unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
