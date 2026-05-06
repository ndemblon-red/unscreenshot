## Goal

Close the "Share recipient email sanity check (sender name + unsubscribe)" audit item by tightening sender attribution and giving non-user recipients a clear way to stop the emails. Two small, targeted changes — no new infrastructure, no schema changes.

## Current state

- Sender display name is present (`Unscreenshot <onboarding@resend.dev>`).
- Subject and body name the sharer's email.
- Footer says only "Sent by Unscreenshot. Turn screenshots into reminders at unscreenshot." — no opt-out, no reply path.
- `reply_to` is not set, so any reply goes to a dead Resend test inbox.

## Changes

### 1. `supabase/functions/share-reminder/index.ts`
- Add `reply_to: <sharer's email>` to the Resend payload when `user.email` is present. This makes "Reply" go directly to the person who shared the reminder — recipients can ask the sharer to stop, which is the natural opt-out for a 1:1 share.
- No change to `from:` (separate verified-domain item already tracked).

### 2. `supabase/functions/_shared/share-notification-email-template.ts`
Extend the footer to make consent and opt-out explicit. New footer copy (dry, on-brand, no exclamation marks):

> You received this because **`<sender email>`** chose to share a reminder with you. Reply to this email to ask them to stop, or [unsubscribe from all share emails](unsubscribeUrl).

Implementation notes:
- Plain-text version updated to match.
- Add `unsubscribeUrl` to `ShareNotificationEmailOptions` so the unsubscribe link is composable rather than hard-coded.
- For now, link to `mailto:<sharer>?subject=Please%20stop%20sharing%20reminders%20with%20me` as the unsubscribe target — same effect as Reply, but explicit. A proper token-backed suppression list is a follow-up if/when Lovable Emails replaces Resend test mode.
- Add `List-Unsubscribe` and `List-Unsubscribe-Post` headers to the Resend payload pointing at the same mailto. Gmail/Outlook surface these as a one-click "Unsubscribe" link in the inbox UI, which dramatically reduces spam complaint rates.

### 3. `docs/DECISIONS.md`
Add a short entry under May 2026 documenting:
- Why share-reminder uses `reply_to: sharer` instead of a generic noreply.
- Why opt-out is implemented as mailto + List-Unsubscribe header rather than a token-backed suppression list (deferred until verified-domain migration).
- The trade-off: we get inbox-provider unsubscribe UX without standing up a suppression table; if shared volumes grow, revisit with a proper token flow.

## Out of scope (already tracked separately)

- Migrating off `onboarding@resend.dev` to a verified domain — known item.
- Token-backed suppression list — deferred until Lovable Emails or verified domain is in place.
- Touching the `check-deadlines` reminder emails — different recipient model (own user, has account, has in-app prefs).

## Files touched

- `supabase/functions/share-reminder/index.ts` — add `reply_to` and List-Unsubscribe headers.
- `supabase/functions/_shared/share-notification-email-template.ts` — extend footer + accept `unsubscribeUrl`.
- `docs/DECISIONS.md` — log the decision.

No migrations, no new edge functions, no schema changes.
