# Switch email sending to Lovable Emails

## Why the change
When we last looked at this, the plan was to verify `send.unscreenshot.ai` in Resend and update `SENDER_EMAIL` in the edge functions. You hit Resend's paywall for adding a second verified domain, and it stalled.

Lovable has since shipped first-party email infrastructure (Lovable Emails). It lets us:
- Send from a verified subdomain of `unscreenshot.ai` (e.g. `notify.unscreenshot.ai`) with no Resend upgrade.
- Use one queue + cron worker for both auth emails (signup confirm, password reset) and app emails (share, deadline reminders).
- Get suppression, retries, DLQ, and an unsubscribe page out of the box.

DNS uses NS delegation from a subdomain to Lovable nameservers — your root `unscreenshot.ai` keeps working unchanged.

## What we'll switch to
- **Sender domain:** `notify.unscreenshot.ai` (delegated to Lovable; root domain untouched)
- **Auth emails:** signup confirm, password reset, magic link, etc. — moved off Lovable's default templates onto branded templates sent from your domain
- **App emails:** the two existing edge functions (`share-reminder`, `check-deadlines`) re-pointed to the Lovable email send function instead of Resend

## Steps

1. **Set up the email domain** — you click through the email setup dialog, pick `notify.unscreenshot.ai`, and add the NS records Lovable shows you to your DNS provider. DNS can verify in minutes or take up to 72h.
2. **Provision email infrastructure** — creates the send queue, cron worker, suppression list, unsubscribe tokens, and unsubscribe handler. One-time, automated.
3. **Scaffold auth email templates** — branded React Email templates (signup, recovery, magic link, invite, email-change, reauthentication) styled to match Unscreenshot. Deployed as the `auth-email-hook` edge function.
4. **Scaffold app email send function** — creates `send-transactional-email` plus the unsubscribe page wiring.
5. **Migrate share + deadline emails** — port the existing Resend HTML in `_shared/reminder-email-template.ts` and `_shared/share-notification-email-template.ts` into React Email templates registered with the new send function. Replace the direct Resend gateway calls in `share-reminder/index.ts` and `check-deadlines/index.ts` with `supabase.functions.invoke('send-transactional-email', …)`. Per-share `reply_to` behavior preserved.
6. **Add a branded unsubscribe page** in the React app at the path Lovable assigns.
7. **Deploy & smoke test** — trigger one share email, one deadline reminder, one password reset; verify deliverability and that the sender shows `notify.unscreenshot.ai`.
8. **Resend cleanup** — once everything is green, disconnect the Resend connector and remove the now-unused `RESEND_API_KEY` references. (Resend account itself: you keep or cancel — not touched by us.)

## What stays the same
- `unscreenshot.ai` custom domain and site DNS — untouched.
- Reminder content, share flow, deadline logic, beta caps — untouched.
- The two existing app-email triggers (share, deadline reminder) — same triggers, just a different transport underneath.

## What I need from you before step 1
- **Confirm the subdomain:** `notify.unscreenshot.ai` good, or prefer `mail.` / `send.` / `email.`?
- **Confirm auth-email migration is in scope** (recommend yes — it's the main upside vs. our old Resend-only plan).

Once you reply, I'll switch to build mode and walk through the setup dialog with you, then do all the code changes in one pass.
