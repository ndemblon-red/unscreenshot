import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";
import { z } from "https://esm.sh/zod@3.23.8";
import {
  MAX_RECIPIENTS_PER_REMINDER,
  normaliseEmails,
  selectNewRecipients,
  checkRecipientCap,
} from "../_shared/share-logic.ts";

const BodySchema = z.object({
  reminderId: z.string().uuid(),
  recipientEmails: z.array(z.string().email()).min(1).max(MAX_RECIPIENTS_PER_REMINDER),
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
    if (!userData.user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: "Please confirm your email before sharing." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const user = userData.user;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { reminderId, recipientEmails } = parsed.data;

    const normalisedEmails = normaliseEmails(recipientEmails);

    const admin = createClient(supabaseUrl, serviceRoleKey);

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

    const { data: existingShares } = await admin
      .from("reminder_shares")
      .select("recipient_email")
      .eq("reminder_id", reminderId)
      .is("revoked_at", null);

    const existingActive = (existingShares ?? []).map((s) => s.recipient_email);
    const activeCount = new Set(existingActive).size;

    const filteredNew = selectNewRecipients(normalisedEmails, existingActive, user.email);

    const cap = checkRecipientCap(activeCount, filteredNew.length);
    if (!cap.ok) {
      return new Response(
        JSON.stringify({
          error: cap.message,
          code: "recipient_cap_exceeded",
          activeCount: cap.activeCount,
          max: cap.max,
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

    const insertRows = filteredNew.map((email) => ({
      reminder_id: reminderId,
      shared_by_user_id: user.id,
      recipient_email: email,
    }));
    const { error: insertErr } = await admin.from("reminder_shares").insert(insertRows);
    if (insertErr) {
      console.error("Insert reminder_shares failed:", insertErr);
      return new Response(JSON.stringify({ error: "Could not save shares. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via Lovable Emails (send-transactional-email handles queueing,
    // suppression, and unsubscribe tokens).
    const senderEmail = user.email ?? "A friend";
    let sentCount = 0;
    let failedCount = 0;
    for (const recipient of filteredNew) {
      try {
        const { error: sendErr } = await admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "reminder-shared",
            recipientEmail: recipient,
            idempotencyKey: `share-${reminderId}-${recipient}`,
            templateData: {
              senderEmail,
              title: reminder.title,
              category: reminder.category,
              deadline: reminder.deadline,
              imageUrl: reminder.image_url,
              signupLink: "https://unscreenshot.ai/auth",
            },
          },
        });
        if (sendErr) {
          failedCount++;
          console.error(`Share email failed for ${recipient}:`, sendErr);
        } else {
          sentCount++;
        }
      } catch (err) {
        failedCount++;
        console.error(`Share email threw for ${recipient}:`, err);
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
