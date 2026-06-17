# Add "your password was changed" security email

## What it does
After a user successfully changes their password on `/account`, send them a branded email confirming the change, with guidance to reset immediately if it wasn't them.

## Files to add
- `supabase/functions/_shared/transactional-email-templates/password-changed.tsx` — React Email template matching the Unscreenshot brand (white bg, SF Pro, black CTA). Copy: confirms the change, timestamp, and a "Reset password" button pointing to `/auth` if it wasn't them.

## Files to edit
- `supabase/functions/_shared/transactional-email-templates/registry.ts` — register `password-changed`.
- `src/components/account/ChangePasswordForm.tsx` — after a successful `updateUser({ password })`, fire-and-forget `supabase.functions.invoke('send-transactional-email', { body: { templateName: 'password-changed', recipientEmail: <user email>, idempotencyKey: `pwd-changed-${user.id}-${Date.now()}`, templateData: { changedAt: new Date().toISOString() } } })`. Don't block the success toast on the email result; log failures to console.

## Deploy
- `send-transactional-email` (picks up the new registry entry).

## Out of scope
- No new DB tables, no auth config changes, no UI changes besides the silent send.
