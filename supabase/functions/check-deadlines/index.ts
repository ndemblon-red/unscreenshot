import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";
import { buildReminderEmail } from "../_shared/reminder-email-template.ts";
import {
  localParts,
  classifyDue,
  shouldSendNow,
  deadlineDatePart,
} from "../_shared/deadline-logic.ts";

// Change this one line when you get a verified domain (e.g. "reminders@yourdomain.com")
const SENDER_EMAIL = "Unscreenshot <onboarding@resend.dev>";
const RESEND_GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
// NOTE: This is the Lovable preview URL — gated behind auth, so the
// "Open reminder" link won't work for unauthenticated email clicks until
// the project is published or moved to a custom domain.
const APP_URL = "https://id-preview--6b3058fd-4727-4ff6-b954-440c6a622739.lovable.app";
// Public Storage URL for the brand logo. Hosted in the `public-assets`
// bucket so email clients can fetch it without auth.
const LOGO_URL = "https://eialbbgpkyjjzcfkxbgc.supabase.co/storage/v1/object/public/public-assets/icon-128.png";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Allow manual/test runs to bypass per-user time gating: ?force=1
    const url = new URL(req.url);
    const forceSend = url.searchParams.get("force") === "1";

    const now = new Date();
    // Widen the date window to ±1 UTC day so we catch reminders whose
    // local "today" / "tomorrow" straddles a UTC boundary.
    const yesterdayUtc = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    const todayUtc = now.toISOString().slice(0, 10);
    const tomorrowUtc = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
    const dayAfterUtc = new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10);
    const candidateDates = [yesterdayUtc, todayUtc, tomorrowUtc, dayAfterUtc];

    const orFilter = candidateDates
      .flatMap((d) => [`deadline.eq.${d}`, `deadline.like.${d}T%`])
      .join(",");

    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select("id, user_id, title, deadline, category, image_url")
      .eq("status", "next")
      .or(orFilter);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      return new Response(JSON.stringify({ error: remindersError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: "No due reminders", notified: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reminderIds = reminders.map((r) => r.id);
    const { data: existingLogs, error: logsError } = await supabase
      .from("notification_log")
      .select("reminder_id, notification_type, recipient_email")
      .in("reminder_id", reminderIds)
      .in("notification_type", ["due_today", "due_tomorrow", "shared_due_today", "shared_due_tomorrow"]);

    if (logsError) {
      console.error("Error fetching existing logs:", logsError);
      return new Response(JSON.stringify({ error: logsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const alreadyNotified = new Set(
      (existingLogs || []).map((l) => `${l.reminder_id}:${l.notification_type}:${l.recipient_email ?? ""}`)
    );

    const userIds = [...new Set(reminders.map((r) => r.user_id).filter(Boolean))];
    const emailMap: Record<string, string> = {};
    for (const uid of userIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(uid);
      if (userData?.user?.email) {
        emailMap[uid] = userData.user.email;
      }
    }

    // Fetch per-user preferences (email + timezone). Defaults: email on, UTC.
    const { data: prefsRows } = await supabase
      .from("notification_preferences")
      .select("user_id, email_enabled, email_due_today, email_due_tomorrow, timezone")
      .in("user_id", userIds);
    const emailPrefMap: Record<string, boolean> = {};
    const emailTodayMap: Record<string, boolean> = {};
    const emailTomorrowMap: Record<string, boolean> = {};
    const tzMap: Record<string, string> = {};
    for (const uid of userIds) {
      emailPrefMap[uid] = true;
      emailTodayMap[uid] = true;
      emailTomorrowMap[uid] = true;
      tzMap[uid] = "UTC";
    }
    for (const row of prefsRows || []) {
      emailPrefMap[row.user_id] = row.email_enabled;
      emailTodayMap[row.user_id] = row.email_due_today ?? true;
      emailTomorrowMap[row.user_id] = row.email_due_tomorrow ?? true;
      if (row.timezone) tzMap[row.user_id] = row.timezone;
    }

    // Fetch active shares for these reminders so we can also email recipients.
    const { data: shareRows } = await supabase
      .from("reminder_shares")
      .select("reminder_id, recipient_email")
      .in("reminder_id", reminderIds)
      .is("revoked_at", null);
    const sharesByReminder: Record<string, string[]> = {};
    for (const row of shareRows ?? []) {
      (sharesByReminder[row.reminder_id] ||= []).push(row.recipient_email);
    }

    type Entry = {
      reminder_id: string;
      user_id: string;
      recipient_email: string | null;
      notification_type: string;
      status: string;
      reminder_title: string;
      reminder_category: string;
      reminder_deadline: string;
      reminder_image_url: string;
      is_share?: boolean;
    };
    const entries: Entry[] = [];

    for (const reminder of reminders) {
      if (!reminder.user_id) continue;
      const tz = tzMap[reminder.user_id] || "UTC";
      const local = localParts(now, tz);
      const deadlineDate = deadlineDatePart(reminder.deadline);

      const notificationType = classifyDue(deadlineDate, local.date);
      if (!notificationType) continue;

      // Time-gate: only send at the user's local 8 AM (today) or 6 PM (tomorrow),
      // unless this is a forced/manual run.
      if (!shouldSendNow(notificationType, local.hour, forceSend)) continue;

      // Owner entry — keyed with the owner's email so it stays distinct from share rows.
      const ownerEmail = emailMap[reminder.user_id] || null;
      const ownerKey = `${reminder.id}:${notificationType}:${ownerEmail ?? ""}`;
      if (!alreadyNotified.has(ownerKey)) {
        entries.push({
          reminder_id: reminder.id,
          user_id: reminder.user_id,
          recipient_email: ownerEmail,
          notification_type: notificationType,
          status: "logged",
          reminder_title: reminder.title,
          reminder_category: reminder.category,
          reminder_deadline: reminder.deadline,
          reminder_image_url: reminder.image_url,
        });
      }

      // Share recipient entries — same time-gate as owner. Distinct
      // notification_type so they don't collide with the owner's log row.
      const sharedType = notificationType === "due_today" ? "shared_due_today" : "shared_due_tomorrow";
      const recipients = sharesByReminder[reminder.id] ?? [];
      for (const recipient of recipients) {
        const shareKey = `${reminder.id}:${sharedType}:${recipient}`;
        if (alreadyNotified.has(shareKey)) continue;
        entries.push({
          reminder_id: reminder.id,
          user_id: reminder.user_id,
          recipient_email: recipient,
          notification_type: sharedType,
          status: "logged",
          reminder_title: reminder.title,
          reminder_category: reminder.category,
          reminder_deadline: reminder.deadline,
          reminder_image_url: reminder.image_url,
          is_share: true,
        });
      }
    }

    if (entries.length === 0) {
      return new Response(JSON.stringify({ message: "Nothing to send this hour", notified: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Attempt email sends, then mark status accordingly
    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    for (const entry of entries) {
      // Owner entries respect the user's notification preferences. Share
      // entries are recipient-driven and bypass the owner's email toggles.
      if (!entry.is_share) {
        if (emailPrefMap[entry.user_id] === false) {
          entry.status = "skipped_email";
          skippedCount++;
          continue;
        }
        const isToday = entry.notification_type === "due_today";
        const typeAllowed = isToday
          ? emailTodayMap[entry.user_id] !== false
          : emailTomorrowMap[entry.user_id] !== false;
        if (!typeAllowed) {
          entry.status = "skipped_email";
          skippedCount++;
          continue;
        }
      }
      if (!entry.recipient_email) {
        entry.status = "no_email";
        continue;
      }
      const dueWhen: "today" | "tomorrow" =
        entry.notification_type === "due_today" || entry.notification_type === "shared_due_today"
          ? "today"
          : "tomorrow";
      const subject = entry.is_share
        ? `Shared reminder due ${dueWhen}: ${entry.reminder_title}`
        : `Reminder due ${dueWhen}: ${entry.reminder_title}`;
      const link = `${APP_URL}/reminder/${entry.reminder_id}`;
      const { html, text } = buildReminderEmail({
        title: entry.reminder_title,
        category: entry.reminder_category,
        deadline: entry.reminder_deadline,
        imageUrl: entry.reminder_image_url,
        link,
        dueWhen,
        logoUrl: LOGO_URL,
        appUrl: APP_URL,
      });
      const result = await sendEmail(entry.recipient_email, subject, html, text);
      if (result.ok) {
        entry.status = "sent";
        sentCount++;
      } else {
        entry.status = "failed";
        failedCount++;
        console.error(`Email send failed for ${entry.recipient_email}:`, result.error);
      }
    }

    // Strip helper fields before insert
    const insertRows = entries.map(
      ({ reminder_title, reminder_category, reminder_deadline, reminder_image_url, is_share, ...rest }) => rest
    );
    const { error: insertError } = await supabase
      .from("notification_log")
      .insert(insertRows);

    if (insertError) {
      console.error("Error inserting notifications:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Logged ${entries.length} notifications (sent: ${sentCount}, failed: ${failedCount}, skipped: ${skippedCount})`);
    return new Response(
      JSON.stringify({ message: "Success", notified: entries.length, sent: sentCount, failed: failedCount, skipped: skippedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
