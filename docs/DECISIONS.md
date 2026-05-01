# DECISIONS.md — Unscreenshot Desktop

---

## How to use this file
After every significant decision during your build, add an entry. A "significant decision" = choosing between alternatives, changing your original plan, or cutting scope.

---

## Decision Log

### March 2026 — Build a desktop web app, not a second mobile app

**Context:** Unscreenshot already exists as a mobile app. The question was whether a second platform was worth building and what form it should take.

**Options considered:**
- Build nothing — focus only on the mobile app
- Build a React Native or Flutter version that mirrors the mobile app
- Build a desktop web app with a distinct use case

**Decision:** Build a desktop web app targeting the "bulk processing" use case — someone who wants to clear a backlog of screenshots in one sitting.

**Why:** The mobile app serves the reactive use case well (screenshot taken, action it now). The desktop version unlocks a different behaviour: proactive, batch-mode organisation. These two use cases complement each other without cannibalising each other. A web app also builds faster in tools like Lovable than a native app.

**What I'd revisit:** If analytics show that desktop users actually upload one screenshot at a time rather than in bulk, the distinct positioning of this version may need rethinking.

---

### March 2026 — AI pre-fills all three fields (title, category, deadline)

**Context:** The mobile app requires the user to manually enter a title, select a category, and choose a deadline. The question was how much of this the AI should automate in the desktop version.

**Options considered:**
- AI suggests title only — user still picks category and deadline manually
- AI suggests all three fields — user reviews and confirms
- Fully automatic — AI saves the reminder without user review

**Decision:** AI suggests all three fields. User sees a review panel with suggestions pre-filled and can confirm or edit before saving.

**Why:** The review step preserves user trust — they stay in control and can catch mistakes. Fully automatic would be faster but risks wrong suggestions being saved silently, which erodes trust. Suggesting all three fields (not just the title) is where the AI earns its value in this product.

**What I'd revisit:** If edit rates are very low (under 10% of fields are changed), consider offering a "quick confirm all" mode that skips the review panel for users who trust the AI.

---

### March 2026 — Fixed category list, not custom tags

**Context:** Deciding whether users should be able to create their own categories or work from a fixed list.

**Options considered:**
- Fully custom tags — user creates and names their own categories
- Fixed list — app ships with a defined set of categories
- Hybrid — fixed list with an "other" option that lets users add one custom tag

**Decision:** Fixed list of 8 categories: Restaurants, Shopping, To Do, Events, Reading, Home, Travel, Wishlist.

**Why:** A fixed list means the AI can be trained and tested against a known set of outputs. Custom categories would make AI classification unpredictable and harder to evaluate. The fixed list also keeps the UI simpler — filter pills, colour coding, and the review panel selector all work cleanly with a known set. The 8 categories chosen cover the vast majority of real screenshot use cases.

**What I'd revisit:** If users consistently try to create categories outside this list (visible through feedback or support requests), add a "Custom" category as a catch-all in v2.

---

### March 2026 — Images stored permanently until user deletes

**Context:** Deciding how long uploaded screenshot images should be retained after a reminder is created.

**Options considered:**
- Store image only during analysis, discard after reminder is saved (store metadata only)
- Store image for a fixed period (e.g. 30 days), then auto-delete
- Store image permanently until the user explicitly deletes the reminder

**Decision:** Images are stored permanently alongside the reminder until the user deletes it.

**Why:** The image is not just a source of data — it is the reminder. When a user sees a task card for "Buy tickets for Massive Attack," the screenshot of the concert poster is what makes it meaningful and memorable. Removing the image after saving would undermine the core product experience. The title is a short trigger; the image provides the full context.

**What I'd revisit:** If storage costs become significant at scale, introduce an optional "image compression on save" setting. Auto-deletion would only make sense if users explicitly opted in.

---

### March 2026 — Added search bar to MVP despite original exclusion

**Context:** PLANNING.md originally listed "No search bar" under Screen 1's "Does NOT include" section.

**Options considered:** Keep without search; add collapsible search icon in header; add persistent search bar above category pills.

**Decision:** Added a persistent search input above category pills that filters reminders by title in real-time.

**Why:** As the reminder list grows, finding specific items by scrolling or filtering by category alone becomes impractical. A simple title search is low-effort to build and high-value for daily use.

**What I'd revisit:** Could extend to search by category or deadline text if users need it.

---

### March 2026 — Auth added to v1, reversing original "no auth" plan

**Context:** The original plan explicitly deferred authentication to v2. However, once the app was functional and ready to share with others, user isolation became necessary.

**Options considered:**
- Keep no auth — single shared Supabase instance, acceptable for solo use
- Add basic email/password auth with RLS
- Add OAuth only (Google/Apple)

**Decision:** Added email/password authentication with Supabase Auth. All reminders are now scoped to the authenticated user via RLS policies. Includes forgot-password flow and password reset page.

**Why:** Sharing the app with even one other person would mean shared data. Auth was the minimum requirement to make this usable beyond a single user. Email/password is the simplest to implement and doesn't require third-party OAuth setup.

**What I'd revisit:** Add Google OAuth as a convenience option once the core auth flow is stable.

---

### March 2026 — Landing page and route restructure

**Context:** With auth added, the app needed a public entry point separate from the authenticated task list.

**Options considered:**
- Keep `/` as the task list, add `/login` separately
- Move app to `/app`, use `/` as a public landing page
- Use a modal overlay for auth on the existing task list

**Decision:** Public landing page at `/`, authenticated app at `/app`. Landing page is minimal — hero, pain statement, how-it-works steps, CTA to `/auth`.

**Why:** A dedicated landing page lets the product explain itself before asking for a login. Moving the app to `/app` creates a clean separation between marketing and product. The landing page follows the same dry, minimal design language as the rest of the app.

**What I'd revisit:** If conversion from landing to signup is low, test removing the landing page and going straight to auth.

---

### March 2026 — Client-side image compression before AI analysis

**Context:** Anthropic's API has a 5MB base64 payload limit. Large screenshots (especially from Retina displays) were causing 502 errors during analysis.

**Options considered:**
- Reject images over 5MB with an error message
- Compress server-side in the edge function before sending to Anthropic
- Compress client-side before upload

**Decision:** Client-side compression: resize to max 1568px on longest edge, reduce JPEG quality iteratively until base64 output is under 4MB target.

**Why:** Client-side compression reduces upload time and edge function payload size simultaneously. No server resources consumed for resizing. The 1568px cap matches Anthropic's recommended input size for vision models, so there's no quality loss for analysis purposes.

**What I'd revisit:** If compression artefacts cause AI accuracy issues, consider server-side sharp/libvips processing with more control over output quality.

---

### March 2026 — Langfuse for LLM observability

**Context:** Needed visibility into AI analysis performance — latency, token usage, error rates — without building custom logging infrastructure.

**Options considered:**
- Console logging only
- Custom metrics table in Supabase
- Langfuse Cloud integration

**Decision:** Integrated Langfuse Cloud in the analyse-screenshot edge function. Traces capture model, latency, token counts, and errors. Image data is excluded from traces for privacy.

**Why:** Langfuse is purpose-built for LLM observability and provides dashboards, cost tracking, and error alerting out of the box. Far less effort than building custom logging. Fire-and-forget integration means it doesn't affect request latency.

**What I'd revisit:** If Langfuse costs become significant or if we need tighter integration with other monitoring, consider switching to a self-hosted alternative.

---

### April 2026 — In-app deadline notifications (bell icon + cron)

**Context:** Users needed a way to know when reminders were approaching their deadline without manually checking the task list.

**Options considered:**
- Email notifications only
- Push notifications (browser)
- In-app notification bell with a backend cron job
- Combination of in-app + email

**Decision:** Built in-app notifications first: a bell icon with unread badge on the task list and account pages, powered by a `check-deadlines` edge function running on pg_cron. Notifications are logged to a `notification_log` table.

**Why:** In-app notifications are the simplest to implement and don't require email infrastructure or browser permission prompts. The cron + notification_log pattern is extensible — email notifications can be added later by reading from the same log table.

**What I'd revisit:** Add email notifications as a follow-up once email infrastructure (custom domain, transactional email provider) is set up.

---

### April 2026 — Upload batch limit capped at 10 screenshots

**Context:** Needed to decide whether to cap the number of screenshots per upload batch and, if so, what the limit should be.

**Options considered:**
- No limit — let users upload as many as they want
- 5 per batch — conservative, fast processing
- 10 per batch — balanced limit
- 20+ per batch — generous but risks long processing times

**Decision:** Cap at 10 screenshots per batch. Drop zone disables at 10. Excess files are silently truncated with a toast explaining the limit.

**Why:** 10 is enough to clear a meaningful backlog in one session without creating excessive AI API costs or long wait times. At ~5 seconds per analysis, 10 images means ~50 seconds of processing — acceptable. 20+ would push past a minute, which feels too long for a single batch.

**What I'd revisit:** If users consistently hit the limit and request more, consider raising to 15 or adding a queue system that processes in background.

---

### April 2026 — Per-trigger email notification toggles (master + two children)

**Context:** Email reminders previously had a single on/off switch. Some users want only the day-before nudge, others only the day-of nudge, and some want both.

**Options considered:**
- Keep a single email on/off toggle
- Replace the master with two independent toggles (one per trigger)
- Master switch + two child toggles (one per trigger), children disabled when master is off

**Decision:** Master "Email reminders" switch plus two indented child toggles: "Day before · 6 PM" and "Day of · 8 AM", both defaulting to on. Master off disables all email regardless of children. Per-type gating happens in the `check-deadlines` edge function; skipped sends are logged with status `skipped_email` to prevent retries.

**Why:** The master switch preserves a single, obvious "turn it all off" action — the most common intent. The two children give granular control without forcing users to think about both triggers if they don't want to. Logging skipped sends keeps the dedup model consistent with the existing notification log.

**What I'd revisit:** If users ask for per-category email prefs or quiet hours, layer those on top — the per-trigger model already establishes the pattern.

---

### April 2026 — Sign-out moved to Account page

**Context:** The sign-out button was initially in the main task list header. As the header gained more icons (upload, notifications, account), it became cluttered.

**Options considered:**
- Keep sign-out in main header
- Move to a dropdown menu in the header
- Move to the Account page

**Decision:** Moved sign-out to the Account page. Main header now has only Upload, Notification Bell, and Account icons.

**Why:** Sign-out is an infrequent action. Keeping it in the main header used prime real estate for something users rarely need. The Account page is the natural home for account-level actions like password changes and sign-out.

**What I'd revisit:** If users report difficulty finding sign-out, add it to a header dropdown menu as well.

---

### May 2026 — Pre-launch security audit (Phase 1)

**Context:** Pre-launch hardening pass before opening beta to a wider audience. Goal: close gaps that could enable cross-tenant access, abuse of the AI quota, or unbounded backend cost.

**Options considered (storage paths):**
- Bucket-level RLS only (Option 2 — fastest, opaque)
- Path-based RLS with per-user folders (Option 1 — Supabase-canonical, self-documenting)

**Decision:** Applied six hardening changes:
1. **Storage paths** — Screenshots now saved as `{user_id}/{uuid}.ext`. Backfilled 27 existing objects; 12 ownerless orphans left inert. Public SELECT preserved so emails still render images via public URL.
2. **Storage RLS** — INSERT/UPDATE/DELETE now require `auth.uid()::text = (storage.foldername(name))[1]`. Listing locked to owners; URL-based fetch stays public.
3. **HIBP** — Leaked-password protection enabled on auth.
4. **Realtime filters** — `Index.tsx` and `NotificationBell.tsx` subscriptions now pass `user_id=eq.<uid>` server-side filters. Per-user channel names. RLS was already enforcing safety; this is a worker-load optimisation.
5. **Email-confirmation gate** — `analyse-screenshot` and `share-reminder` reject users whose `email_confirmed_at` is null (403). Aligns backend with the email-verification requirement on signup.
6. **`analyse-screenshot` input validation** — mimeType allowlist (`jpeg/png/gif/webp`); base64 payload capped at ~7 MB (≈5 MB raw, matches client compression target). Rejects oversized/invalid payloads before any Anthropic call or beta-cap consumption.

**Why Option 1 for storage:** Path-based RLS is the Supabase-canonical pattern — every doc and example uses it. Ownership is encoded in the path, so future devs reading a policy understand it immediately. Worth the one-time backfill cost.

**Why email-confirmation gate strict (not lenient):** With email verification on at signup, allowing unconfirmed users to call backend functions would make the gate cosmetic. Strict mode keeps the security boundary meaningful.

**What I'd revisit:**
- If unconfirmed users complain about being blocked, soften to "warn but allow" with a banner.
- If image fetch privacy becomes a requirement (e.g. shared reminders should expire), migrate from public URLs to signed URLs — this would break share-email images for non-users and require a tokenized viewer route.


---

### May 2026 — Pre-launch security audit (Phase 2)

**Context:** Follow-up pass after Phase 1, focusing on schema correctness, error-message hygiene, and frontend XSS surface.

**Decisions:**
1. **Skip backend rate limiting.** `share-reminder` is already well-bounded (10 recipients per reminder, skip-already-shared, ownership check). `analyse-screenshot` has the 30-call beta cap. Lovable backend has no established rate-limiting primitives — deferring deeper limits until proper infra exists.
2. **`reminders.user_id` is now NOT NULL.** Deleted 4 orphan rows (unreachable via RLS, no recovery path). Schema now matches the RLS contract: every reminder has an owner.
3. **`share-reminder` error response sanitised.** Replaced raw `insertErr.message` with a generic "Could not save shares" string. Real error still goes to server logs. Prevents Postgres error details (column names, constraint internals) from leaking to clients.
4. **XSS surface clean.** Only `dangerouslySetInnerHTML` usage is the stock shadcn `chart.tsx` rendering developer-controlled colour tokens — no user input path.

**What I'd revisit:**
- When Lovable adds rate-limiting primitives, add a per-user-per-window cap on `share-reminder` to close the revoke-and-replay loop.
- Audit `check-deadlines` error returns if it ever becomes user-callable (currently cron-only).

