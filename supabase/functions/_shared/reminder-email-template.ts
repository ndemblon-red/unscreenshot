// HTML/text email template for deadline reminders.
// Pure presentation — no Supabase, no network, no env access.
// Kept separate from `check-deadlines/index.ts` so the cron logic stays
// focused on "who to notify, when" and the template can be reused (e.g.
// future weekly digest).

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

export interface ReminderEmailOptions {
  title: string;
  category: string;
  deadline: string;
  imageUrl: string;
  link: string;
  dueWhen: "today" | "tomorrow";
  logoUrl: string;
  appUrl: string;
}

export function buildReminderEmail(opts: ReminderEmailOptions): { html: string; text: string } {
  const { title, category, deadline, imageUrl, link, dueWhen, logoUrl, appUrl } = opts;
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
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle; padding-right:10px;">
                    <img src="${logoUrl}" alt="Unscreenshot" width="28" height="28" style="display:block; width:28px; height:28px; border-radius:6px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0; font-size:15px; font-weight:600; color:#1d1d1f; letter-spacing:-0.01em;">Unscreenshot</p>
                  </td>
                </tr>
              </table>
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
              <p style="margin:0; font-size:12px; color:#6e6e73; line-height:1.5;">Sent by Unscreenshot. Manage your reminders at <a href="${appUrl}/app" style="color:#6e6e73; text-decoration:underline;">unscreenshot</a>.</p>
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
