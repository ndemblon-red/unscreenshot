# Unscreenshot Desktop

> **Status: Work in progress (beta).** Core flow is live; some polish, full test-set validation, and email reminders are still in flight. See the status table below.

Turn a backlog of screenshots into a trusted task list. Upload your camera-roll graveyard, let an AI suggest a title, category, and deadline for each one, confirm or edit, and walk away with reminders that actually nudge you.

---

## The problem

People screenshot everything — restaurant recs, concert posters, products to buy, articles to read — and then never action any of it. The screenshots pile up silently. The concert sells out, the restaurant is forgotten, the product goes out of stock. Each ignored screenshot is a small broken promise.

Unscreenshot Desktop is the bulk-mode companion to the Unscreenshot mobile app. Sit down for ten minutes, clear the backlog, leave with a list you trust.

---

## How it works

1. Sign in and open the app at `/app`.
2. Click **Upload Screenshots**, drop in up to 10 images (JPG, PNG, WEBP, max 10MB each).
3. Each image is compressed client-side, then sent to Claude Sonnet for analysis. The model returns a short verb-led title, one of 8 categories, and a deadline.
4. Review each suggestion in turn — confirm, edit, or discard.
5. Saved reminders land in the **Next** tab. Mark them Done, let them auto-archive past their deadline, or open the detail view to edit inline.
6. A bell icon and (optional) email surface deadlines as they approach. Reminders can also be shared with non-users by email.

---

## Architecture

**Frontend** — React 18 + Vite + TypeScript, Tailwind CSS with a semantic-token design system, shadcn/ui primitives, React Router, TanStack Query.

**Backend** — Supabase (Postgres + Auth + Storage), with Row-Level Security scoping all reminder data to the authenticated user. Edge Functions (Deno) handle anything that touches a secret or runs on a schedule.

**AI** — Anthropic Claude (`claude-sonnet-4-20250514`) via the `analyse-screenshot` edge function. Strict JSON output, server-side validation with safe defaults, beta cap of 30 successful analyses per user.

**Scheduling** — `pg_cron` triggers `check-deadlines` to write in-app notifications and (when enabled) send emails for reminders due tomorrow or today.

**Observability** — Langfuse Cloud captures model latency, token counts, and errors. Image data is excluded from traces for privacy.

```
┌─────────────────┐    ┌────────────────────┐    ┌──────────────────┐
│  React (Vite)   │───▶│ Supabase Edge Fn   │───▶│  Anthropic API   │
│  /app, /upload  │    │ analyse-screenshot │    │  (Claude Sonnet) │
│  /review, etc.  │    └─────────┬──────────┘    └──────────────────┘
└────────┬────────┘              │                         │
         │                       ▼                         ▼
         │              ┌────────────────┐         ┌──────────────┐
         │              │ Supabase DB +  │         │   Langfuse   │
         └─────────────▶│ Storage + Auth │         │   (traces)   │
                        └────────┬───────┘         └──────────────┘
                                 │
                                 ▼
                        ┌────────────────────┐    ┌──────────────────┐
                        │ pg_cron triggers   │───▶│ check-deadlines  │
                        │  every ~30 min     │    │  + share-reminder│
                        └────────────────────┘    └──────────────────┘
```

---

## Key technical decisions

A condensed pull from `docs/DECISIONS.md` — full rationale lives there.

| Decision | Why |
|---|---|
| **Desktop web app, not a second mobile app** | Mobile serves the reactive use case; desktop unlocks bulk processing. Different behaviour, complementary product. |
| **AI pre-fills all three fields, user reviews** | Review step preserves trust. Fully automatic risks silent mistakes; title-only undersells the AI's value. |
| **Fixed list of 8 categories** | Lets the AI be tested against a known output set and keeps colour coding / filters consistent. |
| **Images stored permanently until user deletes** | The image *is* the reminder — it's what jogs memory at action time. Removing it would gut the experience. |
| **Auth added to v1 (originally deferred)** | Sharing the app with even one other person required user isolation. Email/password + RLS was the minimum bar. |
| **Public landing at `/`, app at `/app`** | Clean separation between marketing and product once auth was added. |
| **Client-side image compression** | Anthropic's 5MB base64 limit was breaking Retina screenshots. Resizing to 1568px and reducing JPEG quality client-side is faster than server-side and uses no edge-function CPU. |
| **Langfuse for LLM observability** | Purpose-built for LLM traces (latency, tokens, errors) without building custom dashboards. Fire-and-forget so it adds no request latency. |
| **In-app bell + cron before email** | Bell needs no email infra or browser permission prompt. The `notification_log` table is a natural extension point for email/push later. |
| **Beta cap of 30 analyses per user** | Keeps Anthropic spend bounded during free beta; enforced server-side after JWT validation, with a waitlist mailto fallback in the UI. |
| **Upload batch capped at 10** | ~50s of processing feels acceptable; 20+ would drag past a minute and balloon costs. |
| **Per-trigger email toggles (master + 2 children)** | One-click "turn it all off" preserved, with granular control for users who want only the day-before or day-of nudge. |

---

## Project structure

```
src/
  pages/              Route components — Landing, Auth, Index (task list),
                      Upload, Review, ReminderDetail, Account, Pricing, ResetPassword
  components/         App-level components (TaskCard, NotificationBell,
                      ShareReminderDialog, AuthGuard, OfflineBanner, …)
    account/          Account-page sub-components (stats, charts, prefs)
    ui/               shadcn/ui primitives
  lib/                categories, deadlines, save-queue, beta-limits, utils
  hooks/              use-online-status, use-web-notifications, use-toast
  integrations/
    supabase/         Auto-generated client + types — do not edit
  test/               Vitest unit tests (deadlines, share-logic, save-queue, beta-cap)

supabase/
  functions/
    analyse-screenshot/   Claude vision call, JWT auth, beta cap, Langfuse
    check-deadlines/      pg_cron job: in-app + email reminders
    share-reminder/       Email a reminder to non-users (max 10 recipients)
    _shared/              Shared logic: deadline rules, share rules,
                          email templates, beta-limits
  config.toml             Function settings (verify_jwt, etc.)

docs/
  PRD.md                  Problem, user flow, AI quality bar, test set
  PLANNING.md             Screen-by-screen spec, system prompt, tech stack
  TASKS.md                Milestone-based task tracker
  DECISIONS.md            Decision log
  KNOWLEDGE.md            Condensed reference for the build agent

.lovable/
  memory/                 Project memory (rules + feature notes)
  plan.md                 Current working plan
```

---

## Status

| Milestone | Status |
|---|---|
| 1. AI core — screenshot analysis | ✅ Done |
| 2. Static UI — all screens built | ✅ Done |
| 3. Upload + review flow | ✅ Done |
| 3b. Auth + account management | ✅ Done |
| 3c. Search | ✅ Done |
| 3d. Landing page | ✅ Done |
| 3e. Client-side image compression | ✅ Done |
| 3f. Observability (Langfuse) | ✅ Done |
| 3g. In-app deadline notifications | ✅ Done |
| 3h. Email reminders | 🟡 In progress — per-user prefs done; template redesign, cron schedule, morning-of timing, and custom-domain send still pending |
| 4. Task list — view, filter, sort, status | ✅ Done |
| 5. Polish + edge cases | 🟡 In progress — offline queue, batch limit, delete confirmations done; full edge-case sweep + final design audit pending |
| 6. Test set validation (PRD §8, 17 cases) | ⬜ Not started |
| Reminder sharing (per-reminder, email, 10 max) | ✅ Done |
| Beta analysis cap (30/user) | ✅ Done |
| **Future** | |
| Google Picker API (import from Google Photos) | ⬜ Planned |
| Recurring reminders | ⬜ Planned |
| Web push notifications | ⬜ Planned |
| Custom categories | ⬜ Planned |
| Final SEO audit | ⬜ Planned (needs production domain) |
| Home page redesign | ⬜ Planned |
| Stripe / paid plans | ⬜ Planned (post-beta) |

Legend: ✅ done · 🟡 in progress · ⬜ planned / not started.
