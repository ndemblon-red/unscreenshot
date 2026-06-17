# Next steps — finish email migration

Domain `notify.unscreenshot.ai` and queue infrastructure are live. Remaining work from the originally approved plan:

## 1. Auth email templates
- Scaffold the 6 auth templates (signup, magic-link, recovery, invite, email-change, reauthentication) + `auth-email-hook`.
- Brand-style each template against `src/index.css` tokens and SF Pro Display typography. Body bg stays white.
- Match Unscreenshot's dry, no-buzzword copy.
- Deploy `auth-email-hook`.

## 2. App email scaffolding
- Scaffold `send-transactional-email`, `handle-email-unsubscribe`, `handle-email-suppression`, sample template, registry.
- Add a branded unsubscribe page in the React app at the path Lovable assigns.

## 3. Port existing Resend emails → Lovable Emails
- Convert `_shared/reminder-email-template.ts` → React Email template `reminder-deadline.tsx`.
- Convert `_shared/share-notification-email-template.ts` → React Email template `reminder-shared.tsx`.
- Register both in `TEMPLATES`.
- Replace direct Resend calls in `share-reminder/index.ts` and `check-deadlines/index.ts` with `supabase.functions.invoke('send-transactional-email', …)`. Preserve per-share `reply_to` behavior.
- Deploy `send-transactional-email`, `share-reminder`, `check-deadlines`, `handle-email-unsubscribe`, `handle-email-suppression`.

## 4. Resend cleanup
- Disconnect Resend connector and remove unused `RESEND_API_KEY` references from code.
- Resend account itself: untouched (user decides whether to cancel).

## What stays the same
- Reminder content, share flow, deadline logic, beta caps, custom domain, site DNS — untouched.
- Triggers for share + deadline emails — same triggers, new transport.

## DNS note
DNS for `notify.unscreenshot.ai` may still be verifying. Scaffolding and deploys don't require verification; actual sending starts once DNS is green (visible in Cloud → Emails).
