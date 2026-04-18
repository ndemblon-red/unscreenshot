
User wants the brand logo added to the reminder email. The logo exists at `public/icon.svg` — purple rounded square with white screenshot-frame corners + checkmark.

Email clients don't reliably render inline SVG. Standard approach: host as PNG and reference via absolute URL in `<img>`. Two options:

**A. Reference the SVG directly from the deployed site** (`https://.../icon.svg`)
- Cheap, no asset pipeline. But Gmail/Outlook commonly strip or fail to render SVG `<img>`. Not reliable.

**B. Add a PNG version to `public/`, reference by absolute URL**
- Reliable across all major clients. One-time export needed.
- I'd add `public/icon-128.png` (64×64 displayed at retina) and reference it via `${APP_URL}/icon-128.png` in the email header.

Going with B.

### Changes

1. **Add `public/icon-128.png`** — 128×128 raster of the existing icon (purple bg, white frame corners, white checkmark). Match `hsl(241, 64%, 59%)` background.

2. **Edit `supabase/functions/check-deadlines/index.ts`** — in `buildReminderEmail`, replace the current text-only "UNSCREENSHOT" header row with a logo + wordmark row:
   ```
   [logo 32x32]  Unscreenshot
   ```
   Logo is an `<img src="${APP_URL}/icon-128.png" width="32" height="32">`. Keep existing typography (SF Pro stack, #1d1d1f). Add `alt="Unscreenshot"` for screen readers / image-blocked clients.

3. **Plain-text version** — unchanged (no logo needed in text part).

### Out of scope
- Replacing the footer link
- Restyling the rest of the email
- Adding logo to in-app `NotificationBell`

### Verification
Trigger `check-deadlines?force=1` against a real reminder, open the resulting email in Gmail web + iOS Mail, confirm logo renders at the top-left of the card.
