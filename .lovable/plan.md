## Goal

Stop sending from `onboarding@resend.dev` and start sending Unscreenshot emails from your own domain via Resend. Keep `hello@unscreenshot.ai` as the public contact / reply-to.

## Steps

### 1. Verify `unscreenshot.ai` in Resend (you do this, outside Lovable)

In the Resend dashboard:
- Domains → Add Domain → enter `unscreenshot.ai` (or a subdomain like `send.unscreenshot.ai` if you want to keep the root clean — recommended).
- Resend will give you DNS records (SPF/TXT, DKIM CNAMEs, and an MX for bounces).
- Add those records at your registrar (the same place you set up the custom domain). Wait for Resend to mark them Verified.

I cannot do this step for you — it requires access to Resend and your DNS provider.

### 2. Pick the sender identity

Suggested:
- `From:` `Unscreenshot <noreply@unscreenshot.ai>` (or `hello@` if you prefer warmth)
- `Reply-To:` `hello@unscreenshot.ai` for share + deadline emails (currently set to the sender's own email for shares — we'll keep that for shares but add `hello@` as fallback for system mail)

Confirm which `From:` address you want before I edit code.

### 3. Code changes (I'll do this once domain is verified)

Two edge functions hardcode the sender:
- `supabase/functions/share-reminder/index.ts` — `SENDER_EMAIL`
- `supabase/functions/check-deadlines/index.ts` — `SENDER_EMAIL`

Change both from `"Unscreenshot <onboarding@resend.dev>"` to the new verified address. For `check-deadlines` (system notifications, no human sender), also set a default `reply_to: hello@unscreenshot.ai`.

Then redeploy both functions.

### 4. `hello@unscreenshot.ai` inbox

You don't have a real mailbox yet. Two easy options for later:
- **Forwarding only (free/cheap):** Cloudflare Email Routing, ImprovIt, or your registrar's forwarding — forwards `hello@unscreenshot.ai` to your personal inbox. Requires MX records on the root domain. Note: if you used the root `unscreenshot.ai` for Resend in step 1, the Resend MX (for bounces) and the forwarding MX can conflict — that's why I recommend verifying Resend on a subdomain like `send.unscreenshot.ai` and leaving the root MX free for forwarding.
- **Real mailbox:** Google Workspace / Fastmail / Migadu (~$3-6/mo).

Out of scope for this plan — just flagging the DNS interaction so you don't paint yourself into a corner.

### 5. Update legal pages + waitlist mailto

`waitlist@unscreenshot.ai` is referenced in the beta cap dialog and `hello@unscreenshot.ai` in the privacy policy. Both will start working as soon as forwarding is set up — no code change needed.

## What I need from you to proceed

1. Confirm the sender domain: root (`unscreenshot.ai`) or subdomain (`send.unscreenshot.ai` — recommended).
2. Confirm the `From:` address (e.g. `noreply@…` or `hello@…`).
3. Tell me when Resend shows the domain as Verified — then I'll do step 3 and redeploy.
