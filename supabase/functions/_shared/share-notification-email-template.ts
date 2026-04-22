// HTML/text email template for "a reminder has been shared with you".
// Pure presentation — mirrors the styling of reminder-email-template.ts so
// recipients get a consistent visual experience.

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

function formatDeadlineHuman(deadline: string): string {
  // deadline is "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM"
  const [datePart, timePartRaw] = deadline.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  const dateLabel = dt.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
  if (!timePartRaw) return dateLabel;
  const [hh, mm] = timePartRaw.slice(0, 5).split(":").map(Number);
  if (isNaN(hh)) return dateLabel;
  const suffix = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 || 12;
  const timeLabel = mm === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(mm).padStart(2, "0")} ${suffix}`;
  return `${dateLabel} · ${timeLabel}`;
}

export interface ShareNotificationEmailOptions {
  senderEmail: string;
  title: string;
  category: string;
  deadline: string;
  imageUrl: string;
  signupLink: string;
  logoUrl: string;
  appUrl: string;
}

export function buildShareNotificationEmail(opts: ShareNotificationEmailOptions): { html: string; text: string } {
  const { senderEmail, title, category, deadline, imageUrl, signupLink, logoUrl, appUrl } = opts;
  const senderSafe = escapeHtml(senderEmail);
  const titleSafe = escapeHtml(title);
  const categorySafe = escapeHtml(category);
  const deadlineLabel = formatDeadlineHuman(deadline);
  const pillBg = CATEGORY_COLORS[category] ?? "#6E6E73";

  const fontStack = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', 'Segoe UI', sans-serif`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${senderSafe} shared a reminder with you</title>
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
              <p style="margin:0; font-size:13px; color:#6e6e73; text-transform:uppercase; letter-spacing:0.04em; font-weight:500;">Shared with you</p>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 28px 12px;">
              <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:600; color:#1d1d1f;">${titleSafe}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 16px;">
              <p style="margin:0; font-size:14px; color:#6e6e73; line-height:1.5;"><strong style="color:#1d1d1f;">${senderSafe}</strong> shared this reminder with you. We'll email you again when it's due.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;">
              <span style="display:inline-block; background-color:${pillBg}; color:#ffffff; font-size:12px; font-weight:600; padding:5px 10px; border-radius:999px; margin-right:8px;">${categorySafe}</span>
              <span style="display:inline-block; font-size:13px; color:#6e6e73; vertical-align:middle;">Due ${escapeHtml(deadlineLabel)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <img src="${imageUrl}" alt="Reminder screenshot" width="464" style="display:block; width:100%; max-width:464px; height:auto; border-radius:12px; border:1px solid #e5e5ea;" />
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <a href="${signupLink}" style="display:inline-block; background-color:#000000; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:10px; font-size:14px; font-weight:500;">Save your own reminders</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 24px; border-top:1px solid #e5e5ea;">
              <p style="margin:0; font-size:12px; color:#6e6e73; line-height:1.5;">Sent by Unscreenshot. Turn screenshots into reminders at <a href="${appUrl}" style="color:#6e6e73; text-decoration:underline;">unscreenshot</a>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${senderEmail} shared a reminder with you\n\n${title}\n${category} · Due ${deadlineLabel}\n\n${senderEmail} shared this reminder with you. We'll email you again when it's due.\n\nSave your own reminders: ${signupLink}\n\n— Sent by Unscreenshot`;

  return { html, text };
}
