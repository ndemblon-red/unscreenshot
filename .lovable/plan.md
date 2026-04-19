
## Two issues — one answer for each

### 1. Logo not rendering in the email

The PNG file is valid. The problem is the URL it's served from.

`APP_URL` in `check-deadlines/index.ts` points to:
```
https://id-preview--6b3058fd-4727-4ff6-b954-440c6a622739.lovable.app
```

That domain is gated behind Lovable auth — fetching `/icon-128.png` returns a 302 redirect to `lovable.dev/auth-bridge`, not the image. Email clients show a broken icon (exactly what you see in your screenshot).

**Fix options:**

**A. Host the PNG on Supabase Storage (recommended, works now)**
- Upload `icon-128.png` to a public Storage bucket (e.g. `public-assets`)
- Use that public URL in the email template
- Pros: works immediately, no publish needed, stable URL
- Cons: one-time setup of the bucket + upload

**B. Inline the logo as base64**
- Embed the PNG directly in the HTML as `data:image/png;base64,...`
- Pros: zero hosting, always works
- Cons: Gmail strips `data:` images in many cases — unreliable

**C. Wait until you publish the project**
- Once published, `https://your-published-url.lovable.app/icon-128.png` is publicly fetchable
- Pros: nothing to change in code if `APP_URL` already points there
- Cons: blocks until publish; `APP_URL` would still need updating to the published URL

I'd go with **A**. Concrete steps:
1. Create a public storage bucket `public-assets` via migration
2. Upload `public/icon-128.png` to it (one-off script or manual via Storage UI)
3. Replace the logo `<img src>` in `buildReminderEmail` with the public Storage URL
4. Also update the reminder `link` to use a permanent URL (currently same broken preview URL — clicking "Open reminder" in the email also fails for the same reason). For now keep it as-is but flag this.

### 2. "Extract email HTML" task — what it means

Right now the entire email template (~120 lines of HTML, inline CSS, helpers like `formatDeadlineLabel`, `escapeHtml`, `buildReminderEmail`) lives inside `supabase/functions/check-deadlines/index.ts`. That file is now ~400 lines and mixes two concerns: the cron logic (who to notify, when) and the presentation (what the email looks like).

"Extract email HTML" = move `buildReminderEmail` and its helpers into a separate file, e.g. `supabase/functions/_shared/reminder-email-template.ts`, and import it from `check-deadlines/index.ts`. Pure refactor, no behaviour change. Makes the cron function easier to read and lets future templates (e.g. weekly digest) reuse the same helpers.

**Honest take:** it's nice-to-have, not blocking. Skip until the file actually becomes painful, or do it alongside the logo URL fix since you'll be touching the template anyway.

### Recommended action this turn

Fix the logo (option A) and do the small extract refactor at the same time, since both touch the email template. Out of scope: fixing the "Open reminder" link URL (separate concern, needs a published URL or a proper redirect endpoint — I'll flag it but not fix it yet).
