import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";

// Change this one line when you get a verified domain (e.g. "reminders@yourdomain.com")
const SENDER_EMAIL = "Unscreenshot <onboarding@resend.dev>";
const RESEND_GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const APP_URL = "https://id-preview--6b3058fd-4727-4ff6-b954-440c6a622739.lovable.app";

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
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
      body: JSON.stringify({ from: SENDER_EMAIL, to: [to], subject, html }),
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

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);

    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select("id, user_id, title, deadline, category")
      .eq("status", "next")
      .or(`deadline.eq.${today},deadline.eq.${tomorrow},deadline.like.${today}T%,deadline.like.${tomorrow}T%`);

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
      .select("reminder_id, notification_type")
      .in("reminder_id", reminderIds)
      .in("notification_type", ["due_today", "due_tomorrow"]);

    if (logsError) {
      console.error("Error fetching existing logs:", logsError);
      return new Response(JSON.stringify({ error: logsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const alreadyNotified = new Set(
      (existingLogs || []).map((l) => `${l.reminder_id}:${l.notification_type}`)
    );

    const userIds = [...new Set(reminders.map((r) => r.user_id).filter(Boolean))];
    const emailMap: Record<string, string> = {};
    for (const uid of userIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(uid);
      if (userData?.user?.email) {
        emailMap[uid] = userData.user.email;
      }
    }

    type Entry = {
      reminder_id: string;
      user_id: string;
      recipient_email: string | null;
      notification_type: string;
      status: string;
      reminder_title: string;
    };
    const entries: Entry[] = [];

    for (const reminder of reminders) {
      if (!reminder.user_id) continue;
      const deadlineDate = reminder.deadline?.split("T")[0] || reminder.deadline;
      const notificationType = deadlineDate === today ? "due_today" : "due_tomorrow";
      const key = `${reminder.id}:${notificationType}`;
      if (alreadyNotified.has(key)) continue;

      entries.push({
        reminder_id: reminder.id,
        user_id: reminder.user_id,
        recipient_email: emailMap[reminder.user_id] || null,
        notification_type: notificationType,
        status: "logged",
        reminder_title: reminder.title,
      });
    }

    if (entries.length === 0) {
      return new Response(JSON.stringify({ message: "All already notified", notified: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Attempt email sends, then mark status accordingly
    let sentCount = 0;
    let failedCount = 0;
    for (const entry of entries) {
      if (!entry.recipient_email) {
        entry.status = "no_email";
        continue;
      }
      const when = entry.notification_type === "due_today" ? "today" : "tomorrow";
      const subject = `Reminder due ${when}: ${entry.reminder_title}`;
      const link = `${APP_URL}/reminder/${entry.reminder_id}`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; color: #111; max-width: 480px;">
          <h2 style="font-size: 18px; margin: 0 0 12px;">Reminder due ${when}</h2>
          <p style="font-size: 16px; margin: 0 0 20px;">${entry.reminder_title}</p>
          <a href="${link}" style="display: inline-block; padding: 10px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px;">Open reminder</a>
          <p style="font-size: 12px; color: #666; margin-top: 24px;">Sent by Unscreenshot</p>
        </div>
      `;
      const result = await sendEmail(entry.recipient_email, subject, html);
      if (result.ok) {
        entry.status = "sent";
        sentCount++;
      } else {
        entry.status = "failed";
        failedCount++;
        console.error(`Email send failed for ${entry.recipient_email}:`, result.error);
      }
    }

    // Strip helper field before insert
    const insertRows = entries.map(({ reminder_title, ...rest }) => rest);
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

    console.log(`Logged ${entries.length} notifications (sent: ${sentCount}, failed: ${failedCount})`);
    return new Response(
      JSON.stringify({ message: "Success", notified: entries.length, sent: sentCount, failed: failedCount }),
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
