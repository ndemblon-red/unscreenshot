
The user wants branded reminder emails that match the `/reminder/:id` page aesthetic and include the screenshot image. Let me check what that page looks like and plan accordingly.

Key facts from context:
- Currently using Resend via connector gateway with `onboarding@resend.dev` (test mode → only delivers to ndemblon@gmail.com)
- Email is inline HTML in `check-deadlines/index.ts` — basic heading + title + button
- App aesthetic: minimalist, SF Pro Display, dry copy, HSL category color tokens
- Reminder detail page shows: image preview, title, category pill, deadline label, created date, action buttons
- Screenshots are in a public Supabase Storage bucket (`screenshots`) — so `image_url` is publicly accessible and can be referenced directly in emails

The user explicitly wants Resend (already set up), so I won't push them to Lovable Emails. I'll keep the existing send mechanism and just redesign the HTML.

### What to build

Redesign the email HTML in `check-deadlines/index.ts` to mirror the reminder detail page:

**Layout (single column, ~520px max width, white background):**
1. Small header strip with "Unscreenshot" wordmark (left-aligned, muted)
2. Section heading: "Due today" or "Due tomorrow" (the existing notification type)
3. Reminder title (large, bold, SF Pro stack)
4. Category pill — colored chip matching the app's category palette (use the category's HSL color inline)
5. Deadline line (e.g., "Today · 9:00 AM") — muted text
6. **Screenshot image** — full-width, rounded corners, subtle border. Reference the public `image_url` directly.
7. CTA button — "Open reminder" (black bg, white text, rounded, matching app button style)
8. Footer — small muted text "Sent by Unscreenshot" + a plain-text note about how to manage reminders (no unsubscribe link yet — that's a separate task already in TASKS.md)

**Styling approach:**
- Inline styles only (email client compatibility)
- System font stack: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif`
- Colors mirroring the app: white bg `#ffffff`, near-black text `#0a0a0a`, muted `#71717a`, subtle border `#e5e5e5`, button bg `#0a0a0a`
- Category pill colors: hardcode the 8 category → HSL background mappings (read from `src/lib/categories.ts` to match exactly)
- Image styled with `max-width: 100%`, `border-radius: 12px`, `border: 1px solid #e5e5e5`

**Subject line:** Keep current format ("Reminder due today: {title}" / "Reminder due tomorrow: {title}") — it's already correct.

**Plain-text fallback:** Add a simple text version alongside the HTML so the email passes spam filters better (Resend supports both `html` and `text` fields).

### Image considerations

- The `screenshots` bucket is public, so `image_url` works directly in `<img src>` tags — no signed URL needed.
- Email clients sometimes block images by default. We'll add `alt="Reminder screenshot"` and ensure the email still reads well without the image (title + category + deadline + CTA all visible above/around it).

### Code changes

**File:** `supabase/functions/check-deadlines/index.ts`
- Extract the HTML generation into a helper function `buildReminderEmail({ title, category, deadline, imageUrl, link, dueWhen })` returning `{ html, text }`
- Replace the existing inline `html = ...` block with this call
- Add a category → color map at the top of the file (8 categories matching `src/lib/categories.ts`)
- Add a small deadline formatter (today / tomorrow + time, since deadlines are stored as `YYYY-MM-DDTHH:MM`)

**Files NOT touched:**
- No new Edge Functions
- No DB changes
- No frontend changes
- No switch to Lovable Emails (separate task)
- No cron schedule (separate task)

### Verification plan

After deploying, manually invoke `check-deadlines` (or clear the relevant `notification_log` rows so a fresh email fires) and confirm the email arrives at `ndemblon@gmail.com` with:
- Image visible
- Category pill colored correctly
- CTA button works
- Layout holds in Gmail web + iOS Mail

### Out of scope
- Switching off Resend test mode (separate TASKS.md item)
- pg_cron schedule (separate TASKS.md item)
- Per-user notification preferences / unsubscribe link (separate TASKS.md item)
- Morning-of timing rule (separate TASKS.md item)
- Refactoring email into React Email templates — keeping inline HTML for now since we're staying on Resend; can revisit if/when we move to Lovable Emails

### Files touched
- `supabase/functions/check-deadlines/index.ts` (~80 lines added: helper + category map + formatter)
