# Wire up custom email domain (Resend)

You're keeping Resend as the outgoing email provider. The job here is:
verify a sender domain in Resend, then flip the two edge functions that
send mail (`share-reminder` and `check-deadlines`) over to it.

## Decision recap (from earlier)

- **Sender domain:** `send.unscreenshot.ai` (subdomain, not the root).
  Keeps the root MX free so `hello@unscreenshot.ai` can forward to a
  real inbox later via Cloudflare Email Routing or similar.
- **Sender address:** `Unscreenshot <noreply@send.unscreenshot.ai>`.
- **Reply-To on system emails:** `hello@unscreenshot.ai`. Today the
  share-reminder function already sets reply-to to the sharer's own
  email (correct — recipients reply to the human who shared with them),
  so this only changes for `check-deadlines`.

## What you do (one-time, in your DNS provider + Resend)

1. **Resend dashboard → Domains → Add Domain** → enter
   `send.unscreenshot.ai`.
2. Resend will show ~3 DNS records (SPF TXT, DKIM CNAME, MX). Add them
   at whichever provider manages `unscreenshot.ai` DNS (Lovable's DNS
   manager if bought through Lovable, otherwise Cloudflare / your
   registrar).
3. Wait until Resend marks the domain **Verified** (usually minutes,
   can take up to a few hours).
4. Tell me it's verified — then I run the code changes below.

## What I do (after verification)

1. Update `SENDER_EMAIL` in two edge functions:
   - `supabase/functions/share-reminder/index.ts`
   - `supabase/functions/check-deadlines/index.ts`

   From: `Unscreenshot <onboarding@resend.dev>`
   To:   `Unscreenshot <noreply@send.unscreenshot.ai>`

2. Add `Reply-To: hello@unscreenshot.ai` on `check-deadlines` emails
   (system reminder notifications). `share-reminder` keeps its existing
   per-share reply-to behaviour.

3. Redeploy both edge functions.

4. Smoke test: trigger one share email and one deadline reminder,
   confirm they land with the new From address and don't get filed as
   spam.

## What I do NOT touch

- `hello@unscreenshot.ai` forwarding — separate setup (Cloudflare Email
  Routing or ImprovMX), and it's blocked on you deciding where the
  forwarded mail should land. Park it for later.
- Auth emails (signup confirm, password reset) — these still go through
  Lovable's default sender. Switching those to your domain is a bigger
  change (Lovable Emails infra) and you didn't ask for it. Flag if you
  want it.

## Technical notes

- The Resend connector is already linked (`RESEND_API_KEY` is in
  secrets, managed by the connector). No new secrets needed.
- Both functions already call Resend via the connector gateway — only
  the `SENDER_EMAIL` constant and one `reply_to` line change.
- `verify_jwt` settings in `supabase/config.toml` are unchanged.
