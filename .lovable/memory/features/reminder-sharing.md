---
name: Reminder Sharing
description: Per-reminder sharing to non-users via email. 10 recipients max per reminder, soft-delete via revoked_at.
type: feature
---
Sender opens Share dialog on `/reminder/:id`, enters one or more emails, clicks Share.

- Max 10 active recipients per reminder (per-reminder business rule, not platform rate limiting).
- `reminder_shares` table: soft-delete via `revoked_at`. Unique active index on `(reminder_id, recipient_email) WHERE revoked_at IS NULL`.
- Recipients do NOT need an account. They receive:
  1. Immediate "shared with you" email (template in `_shared/share-notification-email-template.ts`).
  2. Deadline emails via `check-deadlines` cron, alongside the owner. New `notification_type` values: `shared_due_today`, `shared_due_tomorrow`. Share entries bypass owner's email-pref toggles.
- Edge function `share-reminder` validates ownership, dedupes against existing active shares, enforces the 10-cap, and skips sender's own email.
- Revoke: in-app via direct supabase update (RLS scoped to sender). Recipient stops getting deadline emails immediately.
- Out of scope: recipient-facing "Save to your account" cloning flow, share open/click tracking, fixing the gated-preview "Open reminder" link.
- Backend rate limiting (e.g. shares-per-day cap) intentionally NOT implemented per platform guidance.
