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


---

### May 2026 — Pre-launch security audit (Phase 3)

**Context:** Continued the audit by tightening schema constraints on the remaining tables and finishing the edge-function error-message sweep.

**Decisions:**
1. **NOT NULL across the board.** Verified zero null values in `notification_log.user_id`/`reminder_id`, `reminder_shares.shared_by_user_id`/`reminder_id`/`recipient_email`, then added the constraints. Schema now matches RLS expectations on every owner-scoped table.
2. **Edge-function error sanitisation completed.**
   - `analyse-screenshot`: replaced "ANTHROPIC_API_KEY is not configured" leak with generic 503 "Service temporarily unavailable" (real reason still in server logs). Catch-all replaced raw `e.message` with "Internal server error".
   - `check-deadlines`: three raw Postgres `error.message` returns replaced with generic "Internal server error". Cron-only function so threat surface is small, but defence in depth.

**Why:** A consistent rule — clients only see actionable, generic error strings; operators get the real diagnostic in server logs. Eliminates accidental DB schema, library, or config leaks via error responses.

**What I'd revisit:** If a user reports a confusing failure that I can't reproduce, having the server log surfaced via Langfuse / Cloud logs becomes the only diagnostic path — make sure those stay queryable.

---

### May 2026 — Pre-launch security audit (Phase 4: GDPR, CORS, audits)

**Context:** Final phase of Milestone 7. Closed the remaining items: GDPR right-to-erasure, data portability, CORS posture, dependency CVEs, and logging hygiene.

**Decisions:**
- **Account deletion** — built `delete-account` edge function. Validates JWT, then cascades: storage objects under `{user_id}/`, then DB rows in `reminders`, `reminder_shares`, `notification_log`, `notification_preferences`, `analysis_usage`, then `auth.admin.deleteUser`. UI lives in a new `DangerZone` component with a confirmation dialog. Service-role key required for `auth.admin.deleteUser` and to bypass RLS during cascade.
- **Data export** — implemented client-side: parallel `select *` across all five user-owned tables, packaged as a single JSON blob and downloaded as `unscreenshot-export-YYYY-MM-DD.json`. No edge function needed because RLS already scopes selects to the caller.
- **CORS** — kept `Access-Control-Allow-Origin: *`. Reasoning: (a) the public landing page at `/` may call edge functions before login; (b) shared-reminder emails embed image URLs from `screenshots` bucket fetched cross-origin; (c) Lovable-hosted preview, prod, and custom-domain deployments would require an allowlist that drifts. Auth on every protected endpoint is enforced via JWT validation in code, not by origin.
- **Logging hygiene** — audited every `console.*` call in `supabase/functions/`. Findings: recipient email addresses appear in two error logs (`share-reminder` send failure, `check-deadlines` send failure) — acceptable, these are server-side logs and emails are necessary to debug delivery. No JWTs, no Anthropic responses, no image data, no service-role keys logged.
- **Dependency scan** — `npm audit` returned zero high or critical vulnerabilities. No action needed.
- **Session refresh** — Supabase JS client has `autoRefreshToken: true` by default. Sessions are silently refreshed; no custom logic required.

**Status:** Milestone 7 complete. App is ready for public launch from a security standpoint.

---

### May 2026 — Screenshots bucket remains public for shared-reminder email rendering

**Context:** During the security audit, the question was raised whether the `screenshots` storage bucket should stay public or be locked down to authenticated users only.

**Options considered:**
- Make bucket private — all image fetches require an auth token; shared-reminder emails could not embed images
- Make bucket private but generate signed URLs for share emails — complex, short-lived, breaks non-user email rendering
- Keep bucket public with path-based RLS for writes — anyone can fetch an image if they have the URL, but only the owner can upload or delete

**Decision:** Keep the `screenshots` bucket public. INSERT/UPDATE/DELETE are already protected by path-based RLS (`auth.uid()::text = (storage.foldername(name))[1]`). SELECT remains open so that shared-reminder emails can render screenshot thumbnails without requiring the recipient to be authenticated.

**Why:** Shared reminders are sent to non-users (friends, family, colleagues). If the bucket were private, those recipients would see broken image placeholders in their emails, which would gut the product experience. The risk of public SELECT is mitigated by unguessable UUID filenames inside per-user folders — there is no directory listing, and objects are only discoverable via the reminder record that the sharer explicitly distributes.

**What I'd revisit:** If image privacy becomes a hard requirement (e.g. sensitive documents shared by accident), migrate to signed URLs with a tokenized viewer route. This would require all shared images to be fetched through an authenticated proxy, and non-user email rendering would need to use expiring signed links instead of direct public URLs.

---

### May 2026 — Share-reminder emails: reply-to sharer + mailto unsubscribe

**Context:** The pre-launch deliverability audit flagged that `share-reminder` emails (sent to non-user recipients) lacked a clear opt-out mechanism and a working reply path. Replies bounced into the Resend test sender, and the footer offered no way to stop receiving share emails. This is the kind of thing that drives spam complaints and damages sender reputation for the whole domain — including auth emails.

**Options considered:**
- Do nothing — rely on the recipient asking the sharer in person
- Build a token-backed suppression list with a hosted unsubscribe page
- Use `reply_to: <sharer>` plus a mailto-based List-Unsubscribe header

**Decision:** Set `reply_to` on every share email to the sharer's own address, add a footer line explaining who sent it and how to stop, and emit `List-Unsubscribe` / `List-Unsubscribe-Post` headers pointing at a `mailto:<sharer>` link. Gmail and Outlook surface this as a one-click "Unsubscribe" button in their inbox UI.

**Why:** Share emails are inherently 1:1 and triggered by the sharer, not by us. The natural opt-out is "tell the person who shared with you to stop" — which `reply_to` and the mailto unsubscribe both achieve, with zero new infrastructure. We get the inbox-provider unsubscribe affordance (which is what actually moves the spam-complaint needle) without standing up a suppression table, token rotation, or a hosted unsubscribe route. A proper token-backed flow is overkill at current volumes and would duplicate work that Lovable Emails will eventually provide natively.

**What I'd revisit:** If share volume grows or recipients start reporting "I asked them to stop and they didn't", build a real suppression list keyed on `(sharer_user_id, recipient_email)` and check it in `share-reminder` before sending. Migrate the unsubscribe link from `mailto:` to a tokenized `/unsubscribe/:token` route at the same time.

---

### May 2026 — Pre-launch edge function & cron audit

**Context:** Final pre-launch sweep of the four user-facing edge functions (`analyse-screenshot`, `share-reminder`, `delete-account`, `check-deadlines`) and the deadline cron schedule.

**Findings:**
- Edge function logs: no errors, no 500s, no Anthropic/Resend failures across the recent window. `check-deadlines` shows clean Boot/Shutdown lifecycle only.
- Cron: two active jobs were both invoking `check-deadlines` — `check-deadlines-hourly` (`0 * * * *`, intended) and a legacy `check-deadlines-every-minute` (`* * * * *`). Both succeeded on every run, but the per-minute job produced no extra emails because the function time-gates internally to user-local 8 AM / 6 PM. It just burned function quota.

**Decision:** Unscheduled `check-deadlines-every-minute`. Hourly is now the single source of truth, matching the documented design.

**What I'd revisit:** If we ever want sub-hour granularity (e.g. user-configurable send times), reintroduce a faster cron — but only after the function's time-gating logic is re-checked end-to-end.

---

### May 2026 — Rate limiting on share-reminder and signups deferred

**Context:** Pre-launch checklist flagged "rate limiting on share-reminder / signups" as an open item. There is no first-class backend primitive for ad-hoc per-user rate limiting available right now, and the existing mitigations cover the realistic abuse vectors at beta volume.

**Existing mitigations:**
- `share-reminder`: per-reminder cap of 10 active recipients (enforced server-side in the edge function and via a unique active index), JWT-validated caller, and email-confirmed-account requirement.
- `analyse-screenshot`: 30-analysis per-user beta cap, JWT-validated.
- Signups: Supabase Auth's built-in signup throttling.

**Decision:** Defer custom rate limiting. The 10-recipient cap, the 30-analysis beta cap, and Supabase's built-in throttling are sufficient for the beta. Logged in TASKS Milestone 7 for a post-launch revisit.

**What I'd revisit:** If we see abuse patterns (e.g. one user sharing the same reminder repeatedly across many fresh recipient addresses to spam, or signup floods), introduce a `rate_limits` table keyed on `(user_id, action, window_start)` and check it in the relevant edge functions.

---

### May 2026 — Admin stats: hardcoded email allowlist (Option A)

**Context:** Pre-launch checklist flagged the absence of basic product analytics (signups, first-analysis, week-2 retention). Rather than add a third-party tracker (PostHog, Plausible, Firebase) and the privacy-policy/cookie-banner overhead it brings, all the raw data is already in Postgres (`auth.users`, `analysis_usage`, `reminders`, `reminder_shares`).

**Options considered:**
- Third-party product analytics tool — extra disclosure, cookie banner, ongoing cost
- Proper `user_roles` table + `has_role()` security-definer + RLS-gated aggregate views — the textbook approach, but overkill for a single solo-founder admin
- Hardcoded email allowlist in an edge function + a thin `/admin/stats` page

**Decision:** Option A. `admin-stats` edge function checks `user.email` against a hardcoded `ADMIN_EMAILS` set (`ndemblon@gmail.com`), uses the service role to run aggregate queries, returns JSON. `/admin/stats` page renders the numbers behind an `AdminGuard` (client-side redirect for non-admins). Real enforcement is server-side; the client guard only prevents rendering the empty shell.

**Why:** Beta has one admin. Existing data covers the metrics that matter. No new dependency, no privacy disclosure, no cookie banner. ~150 lines of code total. Migrating to a `user_roles` table later is mechanical: replace the allowlist check in the edge function and the guard with `has_role(auth.uid(), 'admin')`.

**What I'd revisit:** When a second admin is needed, or when finer-grained roles (moderator, support) become useful — see TASKS Future entry "Roles and permissions system".

---

### May 2026 — Google sign-in via Lovable Cloud managed OAuth

**Context:** Pre-launch, Auth page only supported email/password. Wanted lower signup friction before opening the beta.

**Decision:** Enabled Google OAuth using Lovable Cloud's managed credentials (no Google Cloud Console setup, no client ID/secret to rotate). Implemented via `lovable.auth.signInWithOAuth("google", { redirect_uri: origin + "/app" })` from `@lovable.dev/cloud-auth-js`. "Continue with Google" button sits above the email/password form on the Auth page, with a divider. Email/password kept enabled — Google is additive, not a replacement.

**Why:** One-tap signup typically lifts conversion 20–40%. Auth flow keys off `auth.uid()` so RLS, the 30-analysis cap, and reminders all work unchanged regardless of sign-in method. Managed credentials mean zero ops overhead.

**Caveats:** Users who sign up with Google then later try email/password with the same address will get a "user already exists" error — standard Supabase behavior, accepted for beta.

**What I'd revisit:** If we want our own branding on the Google consent screen, swap to BYO Google OAuth credentials in Cloud → Auth Settings → Google.

---

### May 2026 — No cookie consent banner

**Context:** Privacy Policy got a "Cookies and local storage" section. Question: does EU ePrivacy / UK PECR require a consent banner on top of that?

**Decision:** No banner. Disclosure-only in the Privacy Policy is sufficient for the current shape of the app.

**Why:** ePrivacy/PECR consent applies to non-essential device storage. Everything we store qualifies for the "strictly necessary" exemption:
- Supabase auth tokens in localStorage — needed to keep the user signed in (a service they explicitly requested).
- Sidebar collapsed cookie — UI preference for a UI the user is actively using; CNIL/ICO explicitly exempt this.
- Offline upload queue in localStorage — needed to complete a user-initiated action.
- No analytics, ads, session replay, or third-party trackers on the client. Langfuse is server-side only.

Showing a banner for exempt storage is actively discouraged by regulators (it trains users to click through and misrepresents the legal basis).

**Trigger to revisit — add a banner the moment we add any of:**
- Client analytics (PostHog, GA, Mixpanel, Plausible cloud is borderline-exempt but verify)
- Marketing/ads pixels (Meta, LinkedIn, Reddit, Google Ads)
- Session replay (Hotjar, FullStory, Clarity)
- A/B testing with fingerprinting
- Embedded YouTube (use `youtube-nocookie.com` to stay exempt) or similar third-party embeds that set cookies
- Chat widgets that drop tracking cookies (Intercom, Crisp, Drift)

If any of the above lands, switch to a proper consent-mode banner (granular categories, reject-all as easy as accept-all, no pre-ticked boxes) — not a cookie wall.

---

### May 2026 — Governing law: England and Wales

**Context:** Terms previously said "the jurisdiction where the service operator is based" — too vague for beta launch.

**Decision:** Named England and Wales explicitly. Operator is UK-based.

**What I'd revisit:** If the operating entity moves jurisdiction, or if a non-UK entity (e.g. a US Inc or EU GmbH) becomes the contracting party.
