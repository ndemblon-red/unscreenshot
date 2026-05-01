# TASKS.md — Unscreenshot Desktop

---

## Milestone 1: AI Core — Screenshot Analysis
**Goal:** Prove the AI can take a screenshot image and return a valid title, category, and deadline before building any UI around it.
**Test:** Upload 3 different screenshots (a concert poster, a product, a restaurant recommendation) via a simple test harness or console. Verify each returns valid JSON with all three fields populated, no nulls, no crashes.

- [x] Set up project in Lovable (React + Vite + Tailwind)
- [x] Add Anthropic API key to environment variables
- [x] Write the system prompt exactly as specified in PLANNING.md
- [x] Build a minimal API call function: takes an image file, converts to base64, sends to Claude API with system prompt, returns parsed JSON
- [x] Test with 5 images from PRD Section 8 must-pass cases — log results to console
- [x] Confirm safe fallback: test with a blank image and a blurry image — verify safe defaults are returned
- [x] Confirm JSON always contains title, category, and deadline — add error handling if any field is missing

---

## Milestone 2: Static UI — All Screens Built
**Goal:** Every screen exists with the correct layout, elements, and design applied — no functionality yet, just the shell.
**Test:** Click through every screen manually. Every element listed in PLANNING.md should be visible. Nothing should be missing or invented.

- [x] Apply design tokens: colours, typography, spacing, border radius as specified in PLANNING.md
- [x] Build Task List screen (Screen 1): header, upload button, tab bar (Next/Done/Archive), category filter pills (all 8 + Everything), sort control, empty state
- [x] Build task card component: thumbnail, title, category pill (correct colour per tag), deadline with clock icon, mark as done button, delete icon
- [x] Build Upload screen (Screen 2): drag and drop zone, file picker, thumbnail grid with remove buttons, Analyse button, cancel link
- [x] Build Review Panel screen (Screen 3): screenshot preview, title input, category selector (all 8 categories), deadline selector (Tomorrow/Next Week/Next Month/Custom), Save and Discard buttons, progress indicator
- [x] Build Reminder Detail screen (Screen 4): full image, editable title, editable category, editable deadline, mark as done button, delete button, created date
- [x] Build Delete Confirmation overlay (Screen 5): modal with screenshot thumbnail, Delete and Cancel buttons
- [x] Build Loading overlay state: per-image spinner, "Analysing X of Y" progress message
- [x] Build Error state: inline error per failed image, Try Again and Add Manually options
- [x] Verify all category pill colours match PLANNING.md colour tokens
- [x] Verify "Does NOT include" items from PLANNING.md are absent from every screen

---

## Milestone 3: Upload and Review Flow
**Goal:** A user can upload screenshots, the AI analyses them, and the review panel shows the AI suggestions ready to confirm or edit.
**Test:** Upload 3 screenshots. Loading state appears. Review panel opens showing AI-suggested title, category, and deadline for the first image. Edit one field. Click Save. See the item appear in the Next tab on the Task List.

- [x] Wire up file picker and drag-and-drop to accept JPG, PNG, WEBP up to 10MB
- [x] Show selected image thumbnails in the upload grid with working remove (×) buttons
- [x] Disable "Analyse Screenshots" button until at least 1 image is selected
- [x] On submit: show loading overlay, send each image to AI analysis function from Milestone 1
- [x] Handle batch processing: analyse images sequentially, update progress indicator per image
- [x] On completion: navigate to Review Panel with first image and AI suggestions pre-filled
- [x] Title field is editable, pre-filled with AI suggestion
- [x] Category selector shows all 8 categories, AI suggestion pre-selected
- [x] Deadline selector shows Tomorrow / Next Week / Next Month / Custom date picker, AI suggestion pre-selected
- [x] "Save Reminder" writes reminder to Supabase database + uploads image to Supabase Storage
- [x] "Discard" skips without saving, advances to next screenshot
- [x] After final screenshot reviewed: navigate back to Task List
- [x] Non-image file upload shows clear error: "Please upload image files only"
- [x] Network/API error shows inline retry option

---

## Milestone 3b: Authentication & Account Management
**Goal:** Users can sign up, log in, recover forgotten passwords, and manage their account settings.
**Test:** Sign up, verify email, log in. Click "Forgot password" on sign-in, receive reset email, set new password. Open Account page, change password successfully. Mark a reminder as done, open it, click Undo Done — it moves back to Next.

- [x] Add email/password auth via Supabase Auth (sign up + sign in)
- [x] Add "Forgot password" mode to Auth page — sends password reset email via Supabase
- [x] Build Reset Password page (`/reset-password`) — handles PASSWORD_RECOVERY auth event, lets user set new password
- [x] Build Account page (`/account`) — shows user email, change password form, sign out button
- [x] Add Account icon link to Task List header
- [x] Add "Undo Done" button on Reminder Detail for completed reminders — moves status back to "next"
- [x] Add RLS policies to scope reminders to authenticated user

---

## Milestone 3c: Search
**Goal:** Users can search reminders by title from the home screen.
**Test:** Type a query in the search bar — only matching reminders show. Clear the search — all reminders return.

- [x] Add search input with search icon above category filter pills on Task List
- [x] Filter reminders by title in real-time as user types
- [x] Add clear (×) button to reset search query

---

## Milestone 3d: Landing Page
**Goal:** A public landing page explains the product and directs visitors to sign up.
**Test:** Visit `/` — see hero, pain statement, how-it-works, and CTA. Click CTA — navigate to `/auth`.

- [x] Build public landing page at `/` with hero section, pain statement, how-it-works steps, and CTA
- [x] Restructure routing: public landing at `/`, authenticated app at `/app`
- [x] Apply minimal, dry design language consistent with the rest of the app

---

## Milestone 3e: Image Compression
**Goal:** Large screenshots are compressed client-side before AI analysis to stay under Anthropic's 5MB base64 limit.
**Test:** Upload a 10MB Retina screenshot — it should compress and analyse successfully without 502 errors.

- [x] Add client-side image resizing (max 1568px longest edge)
- [x] Iterative JPEG quality reduction until base64 < 4MB target
- [x] Integrated into upload flow before navigation to review

---

## Milestone 3f: Observability
**Goal:** AI analysis calls are traced for latency, token usage, and error monitoring.
**Test:** Run an analysis — verify trace appears in Langfuse dashboard with model, duration, and token counts.

- [x] Integrate Langfuse Cloud in analyse-screenshot edge function
- [x] Trace model, latency, token counts, and errors
- [x] Exclude image data from traces for privacy

---

## Milestone 3g: Deadline Notifications
**Goal:** Users receive in-app alerts when reminders are approaching their deadline.
**Test:** Create a reminder due today — bell icon shows unread badge. Open notification list — see the alert. Mark as read — badge clears.

- [x] Build `check-deadlines` edge function with pg_cron schedule
- [x] Create `notification_log` table with RLS
- [x] Build NotificationBell component with unread badge and popover list
- [x] Realtime subscription for new notifications
- [x] Mark individual/all notifications as read

---

## Milestone 3h: Email Reminders

**Goal:** Deadline notifications reach users by email reliably, on a sensible schedule, with a branded format and per-user control.
**Test:** Create a reminder due today as any signed-up user — receive a well-formatted email at a reasonable hour. Toggle email notifications off in Account — no further emails arrive.

- [ ] Redesign email format — match app aesthetic (SF Pro, minimal, dry copy); improve subject, body layout, and CTA; extract to a template file instead of inline HTML in `check-deadlines`
- [ ] Schedule `check-deadlines` via pg_cron (every ~30 min)
- [ ] Add morning-of timing rule — do not fire "due today" emails before ~8 AM local
- [ ] Move off Resend test mode — verify custom domain OR switch to Lovable Emails so any signed-up user can receive notifications
- [x] Add per-user email notification preference toggle on the Account page (master switch + per-trigger toggles for "Day before · 6 PM" and "Day of · 8 AM")

---

## Milestone 4: Task List — View, Filter, Sort and Status
**Goal:** Saved reminders appear in the task list and the user can filter, sort, change status, and navigate to detail.
**Test:** Save 5 reminders across different categories. Filter by one category — only matching items show. Sort by date newest/oldest — order changes correctly. Mark one as Done — it moves to the Done tab. Check Archive tab shows items whose deadline has passed.

- [x] Fetch and display all reminders from Supabase on Task List load
- [x] Display reminders in the correct tab based on status (next/done/archive)
- [x] Auto-move reminders to Archive where deadline < today and status = next (query-based, on load)
- [x] Category filter pills filter the list in place — "Everything" shows all
- [x] Sort by date toggle: newest first / oldest first — updates list order in place
- [x] "Mark as Done" button on task card updates status in Supabase, moves card to Done tab
- [x] Clicking a task card navigates to Reminder Detail screen (Screen 4)
- [x] Reminder Detail: display full image, title, category, deadline, created date
- [x] Reminder Detail: inline editing of title, category, and deadline — saves to Supabase on change
- [x] Empty state displays correctly when a tab or filter has no results
- [x] Delete icon on task card triggers Delete Confirmation overlay
- [x] Delete Confirmation: shows screenshot thumbnail, confirm deletes from Supabase DB and Storage, cancel dismisses

---

## Milestone 5: Polish and Edge Cases
**Goal:** The app handles every weird input gracefully, feels smooth, and matches the design spec precisely.
**Test:** Work through every edge case and must-fail-safely case from PRD Section 8. Every one should behave as specified. The app should feel calm and considered at every step.

- [ ] Test and fix: blurry/unreadable image — safe defaults returned, no crash
- [ ] Test and fix: blank white image — safe defaults, no hang
- [ ] Test and fix: corrupted file — flagged as unprocessable, manual entry option shown
- [ ] Test and fix: screenshot with a past date — deadline defaults to Next Week, not a past date
- [ ] Test and fix: batch of 10 screenshots — all process, UI handles gracefully (capped at 10 per batch)
- [ ] Test and fix: screenshot with sensitive/personal content — safe neutral title returned
- [x] Add confirmation behaviour: delete confirmation overlay works on both task card and detail screen
- [x] Loading states: every async action (upload, analyse, save, delete) has a visible loading indicator
- [ ] Error states: every failure mode has a user-facing message — no silent failures, no raw error text shown to user
- [ ] Spacing, typography, and colour audit — compare every screen against PLANNING.md design spec
- [x] Category pill colours consistent everywhere: task list, review panel, detail screen, filter bar
- [x] Verify "Does NOT include" items are absent from every screen (final check)
- [x] Offline detection banner — shows when user loses connectivity
- [x] Offline save queue — queues reminders when offline, auto-syncs on reconnect
- [x] Pending queue counter badge — shows number of queued reminders waiting to sync
- [x] Upload batch limit — capped at 10 screenshots per batch with toast feedback

---

## Milestone 6: Test Set Validation
**Goal:** Every test case from PRD Section 8 passes. The product is ready to share.
**Test:** Run through all 17 test cases from PRD Section 8 manually — 7 must-pass, 5 edge cases, 5 must-fail-safely. Document results. Fix any failures before calling this done.

- [ ] Run must-pass case 1: concert poster — verify Events category, correct deadline from image date
- [ ] Run must-pass case 2: product screenshot — verify Shopping category, Next Week deadline
- [ ] Run must-pass case 3: restaurant recommendation — verify Restaurants category, Next Month deadline
- [ ] Run must-pass case 4: article/blog post — verify Reading category, title starts with "Read"
- [ ] Run must-pass case 5: to-do note — verify To Do category, Tomorrow or Next Week deadline
- [ ] Run must-pass case 6: 5 screenshots uploaded at once — verify all 5 return suggestions, none blank
- [ ] Run must-pass case 7: user edits AI suggestion — verify edited version saves correctly
- [ ] Run edge case 1: blurry image — verify safe defaults, no crash
- [ ] Run edge case 2: map/location pin — verify sensible title and category
- [ ] Run edge case 3: past date visible — verify deadline is not set in the past
- [ ] Run edge case 4: 10-image batch — verify all process, no UI breakdown
- [ ] Run edge case 5: sensitive/personal info — verify no sensitive content in task card
- [ ] Run must-fail-safely case 1: non-image file — verify clear error message, no crash
- [ ] Run must-fail-safely case 2: adult content image — verify safe neutral title returned
- [ ] Run must-fail-safely case 3: blank white image — verify safe defaults, no hang
- [ ] Run must-fail-safely case 4: network failure mid-analysis — verify retry button shown, no data lost
- [ ] Run must-fail-safely case 5: corrupted image — verify unprocessable flag shown, manual entry option available
- [ ] Document any failures and fix before marking Milestone 6 complete

---

---

## Milestone 7: Pre-Launch Security Audit
**Goal:** Close obvious security gaps before opening beta to a wider audience. Cover storage, auth, RLS, edge function hardening, and frontend XSS surface.
**Test:** Re-run Supabase linter — no critical findings. Manually verify: (a) signed-out users can't read another user's storage paths, (b) unconfirmed-email users get 403 on `analyse-screenshot` and `share-reminder`, (c) oversized payload to `analyse-screenshot` returns 413 before any Anthropic call.

**Completed:**
- [x] Restructure storage paths to `{user_id}/{uuid}.ext`; backfill existing 27 objects
- [x] Apply path-based RLS on `storage.objects` (INSERT/UPDATE/DELETE require ownership)
- [x] Lock screenshot listing to owners; keep public SELECT for email image fetches
- [x] Enable HIBP leaked-password protection on auth
- [x] Add `user_id=eq.<uid>` filters to Realtime subscriptions in `Index.tsx` and `NotificationBell.tsx`
- [x] Reject unconfirmed-email users (403) in `analyse-screenshot` and `share-reminder`
- [x] Validate `analyse-screenshot` input: mimeType allowlist + ~7 MB base64 cap
- [x] Delete 4 orphan reminders; add NOT NULL constraint on `reminders.user_id`
- [x] Sanitise `share-reminder` error response (no raw Postgres messages to client)
- [x] Scan frontend for `dangerouslySetInnerHTML` — only stock shadcn chart usage, no user input

**Deferred:**
- [ ] Backend rate limiting on `share-reminder` (revoke-and-replay loop) — no Lovable rate-limit primitive yet

**Not yet started:**
- [x] Add NOT NULL constraint on `notification_log.user_id`/`reminder_id`, `reminder_shares.shared_by_user_id`/`reminder_id`/`recipient_email` (verified zero nulls before applying)
- [ ] CORS review — current `Access-Control-Allow-Origin: *` is intentional for the public API; document the decision
- [ ] Auth audit: session refresh behaviour, account deletion flow (GDPR right to erasure), data export endpoint
- [ ] Logging hygiene pass — verify no PII or auth tokens leak to `console.log` or Langfuse traces
- [ ] Run `npm audit` for dependency vulnerabilities; patch high/critical
- [x] Verify all edge function error responses use generic messages — fixed `analyse-screenshot` (Anthropic key + catch-all) and `check-deadlines` (3 raw Postgres messages)

**Details:**
- Decisions logged in `docs/DECISIONS.md` under "May 2026 — Pre-launch security audit (Phase 1 / Phase 2)"
- The "Not yet started" items are not blockers for a closed beta but should be cleared before public launch

---

## Future: Google Picker API Integration

**Goal:** Let users import screenshots directly from Google Photos via the Google Picker API.

**Steps (not yet started):**
1. Register app in Google Cloud Console; enable Google Picker API
2. Add a "Google Photos" button alongside existing drag-and-drop on Upload page
3. Use existing Google auth or a scoped picker-only token to authenticate
4. Configure picker to show only the user's Photos library, filtered to images
5. Download selected images client-side, convert to existing `QueuedFile` format, feed into current upload/review flow

**Details:**
- Medium-effort feature; no changes to current upload architecture
- Adds an additional image source alongside drag-and-drop

---

## Future: Recurring Reminders

**Goal:** Allow users to set reminders that repeat on a schedule (daily, weekly, monthly) so recurring tasks don't need to be re-created each time.

**Steps (not yet started):**
1. Add recurrence fields to reminders (frequency, interval, end condition)
2. When a recurring reminder is marked as done, auto-create the next occurrence with the updated deadline
3. Add recurrence UI to the review panel and reminder detail (e.g. "Repeat: Weekly")
4. Handle edge cases: editing a single occurrence vs. all future occurrences

**Details:**
- Requires a database schema change (new columns or a recurrence rules table)
- AI analysis would not set recurrence — this is a manual user choice

---

## Future: Web Push Notifications

**Goal:** Send browser push notifications to remind users of approaching deadlines, even when the app is not open.

**Steps (not yet started):**
1. Register a service worker and request Notification permission from the user
2. Store push subscription endpoints per user in the database
3. Extend `check-deadlines` edge function to send web push via the Web Push protocol
4. Add notification preferences to Account page (enable/disable, timing before deadline)

**Details:**
- Requires VAPID key pair generation and storage as secrets
- Complements existing in-app bell notifications — does not replace them
- Users must explicitly grant permission; provide clear opt-in UI

---

## Future: Custom Categories

**Goal:** Allow users to create, edit, and delete their own categories instead of being limited to the fixed set of 8.

**Steps (not yet started):**
1. Create a user_categories table to store custom categories per user
2. Seed default categories on signup so existing behaviour is preserved
3. Add category management UI to the Account page (create, rename, delete with reassignment)
4. Update AI system prompt to use the user's category list instead of the hardcoded set
5. Update category pills, filters, and colour assignment to support dynamic categories

**Details:**
- Requires database schema change and updated AI prompt logic
- Deleting a category should prompt reassignment of existing reminders
- Colour assignment needs a strategy for user-created categories beyond the original 8

---

## Future: Final SEO Audit

**Goal:** Run a final end-to-end SEO audit before launch to confirm metadata, structured data, and social previews render correctly on the production domain.

**Steps (not yet started):**
1. Confirm canonical domain and update `index.html`, `sitemap.xml`, and OG image URLs accordingly
2. Validate Open Graph and Twitter cards via opengraph.xyz and Twitter card validator
3. Validate JSON-LD via Google Rich Results Test
4. Submit sitemap to Google Search Console and Bing Webmaster Tools
5. Re-check page weight, lazy loading, and Lighthouse SEO score (target 100)
6. Add per-route meta tags (e.g. via react-helmet-async) so `/pricing` and `/auth` get unique titles and descriptions

**Details:**
- Requires the production/custom domain to be live first
- Some checks (social scrapers) may require pre-rendering or SSR if the SPA shell is not enough

---

## Future: Home Page Redesign

**Goal:** Revisit and fix the landing page at `/` to better communicate the product value and convert visitors.

**Steps (not yet started):**
1. Audit current landing page against design tokens and copy guidelines
2. Identify layout, messaging, or visual issues
3. Redesign and implement fixes

**Details:**
- Scope TBD — needs a review of what specifically is broken or underperforming
