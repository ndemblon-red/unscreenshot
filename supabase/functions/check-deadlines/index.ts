import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";

// Change this one line when you get a verified domain (e.g. "reminders@yourdomain.com")
const SENDER_EMAIL = "Unscreenshot <onboarding@resend.dev>";
const RESEND_GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const APP_URL = "https://id-preview--6b3058fd-4727-4ff6-b954-440c6a622739.lovable.app";

// Category → background color (matches src/index.css --tag-* HSL values)
const CATEGORY_COLORS: Record<string, string> = {
  Events: "#5856D6",
  Shopping: "#FF9500",
  Restaurants: "#34C759",
  "To Do": "#007AFF",
  Reading: "#AF52DE",
  Home: "#FF6B35",
  Travel: "#32ADE6",
  Wishlist: "#FF2D55",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDeadlineLabel(deadline: string, dueWhen: "today" | "tomorrow"): string {
  // deadline is "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM"
  const parts = deadline.split("T");
  const timePart = parts.length > 1 && /^\d{2}:\d{2}/.test(parts[1]) ? parts[1].slice(0, 5) : "09:00";
  const [h, m] = timePart.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  const timeLabel = m === 0 ? `${hour12} ${suffix}` : `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
  const day = dueWhen === "today" ? "Today" : "Tomorrow";
  return `${day} · ${timeLabel}`;
}

function buildReminderEmail(opts: {
  title: string;
  category: string;
  deadline: string;
  imageUrl: string;
  link: string;
  dueWhen: "today" | "tomorrow";
}): { html: string; text: string } {
  const { title, category, deadline, imageUrl, link, dueWhen } = opts;
  const titleSafe = escapeHtml(title);
  const categorySafe = escapeHtml(category);
  const deadlineLabel = formatDeadlineLabel(deadline, dueWhen);
  const heading = dueWhen === "today" ? "Due today" : "Due tomorrow";
  const pillBg = CATEGORY_COLORS[category] ?? "#6E6E73";

  const fontStack = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', 'Segoe UI', sans-serif`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(heading)}: ${titleSafe}</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f7; font-family:${fontStack}; color:#1d1d1f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px; width:100%; background-color:#ffffff; border-radius:16px; border:1px solid #e5e5ea;">
          <tr>
            <td style="padding:24px 28px 8px;">
              <p style="margin:0; font-size:13px; font-weight:600; color:#6e6e73; letter-spacing:0.02em;">UNSCREENSHOT</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 4px;">
              <p style="margin:0; font-size:13px; color:#6e6e73; text-transform:uppercase; letter-spacing:0.04em; font-weight:500;">${escapeHtml(heading)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 28px 16px;">
              <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:600; color:#1d1d1f;">${titleSafe}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;">
              <span style="display:inline-block; background-color:${pillBg}; color:#ffffff; font-size:12px; font-weight:600; padding:5px 10px; border-radius:999px; margin-right:8px;">${categorySafe}</span>
              <span style="display:inline-block; font-size:13px; color:#6e6e73; vertical-align:middle;">${escapeHtml(deadlineLabel)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <a href="${link}" style="text-decoration:none;">
                <img src="${imageUrl}" alt="Reminder screenshot" width="464" style="display:block; width:100%; max-width:464px; height:auto; border-radius:12px; border:1px solid #e5e5ea;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <a href="${link}" style="display:inline-block; background-color:#000000; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:10px; font-size:14px; font-weight:500;">Open reminder</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 24px; border-top:1px solid #e5e5ea;">
              <p style="margin:0; font-size:12px; color:#6e6e73; line-height:1.5;">Sent by Unscreenshot. Manage your reminders at <a href="${APP_URL}/app" style="color:#6e6e73; text-decoration:underline;">unscreenshot</a>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${heading}\n\n${title}\n${category} · ${deadlineLabel}\n\nOpen reminder: ${link}\n\n— Sent by Unscreenshot`;

  return { html, text };
}

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

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);

    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select("id, user_id, title, deadline, category, image_url")
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

    // Fetch per-user email preferences (default to true if missing)
    const { data: prefsRows } = await supabase
      .from("notification_preferences")
      .select("user_id, email_enabled")
      .in("user_id", userIds);
    const emailPrefMap: Record<string, boolean> = {};
    for (const uid of userIds) emailPrefMap[uid] = true;
    for (const row of prefsRows || []) {
      emailPrefMap[row.user_id] = row.email_enabled;
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
        reminder_category: reminder.category,
        reminder_deadline: reminder.deadline,
        reminder_image_url: reminder.image_url,
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
    let skippedCount = 0;
    for (const entry of entries) {
      if (emailPrefMap[entry.user_id] === false) {
        entry.status = "skipped_email";
        skippedCount++;
        continue;
      }
      if (!entry.recipient_email) {
        entry.status = "no_email";
        continue;
      }
      const dueWhen: "today" | "tomorrow" = entry.notification_type === "due_today" ? "today" : "tomorrow";
      const subject = `Reminder due ${dueWhen}: ${entry.reminder_title}`;
      const link = `${APP_URL}/reminder/${entry.reminder_id}`;
      const { html, text } = buildReminderEmail({
        title: entry.reminder_title,
        category: entry.reminder_category,
        deadline: entry.reminder_deadline,
        imageUrl: entry.reminder_image_url,
        link,
        dueWhen,
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
      ({ reminder_title, reminder_category, reminder_deadline, reminder_image_url, ...rest }) => rest
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
