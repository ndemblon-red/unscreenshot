
### Goal
Add in-tab browser notifications (system toasts via the Notification API) that fire when a new row appears in `notification_log`, plus a per-channel preferences UI on the Account page (email on/off, web push on/off).

### Approach

**1. Permission + foreground listener**
- New hook `src/hooks/use-web-notifications.ts`:
  - On mount, check `Notification.permission` and the user's `web_notifications_enabled` preference.
  - If both are granted/enabled, subscribe to a Supabase Realtime channel on `notification_log` (INSERT, filtered by `user_id`).
  - On each new row, fetch the linked reminder title + deadline and call `new Notification(...)` with title `"Due today"` / `"Due tomorrow"`, body = reminder title, icon = `/icon.svg`, and an `onclick` that focuses the window and navigates to `/reminder/:id`.
- Mount the hook once at the app level (inside `AuthGuard` so it only runs when signed in).

**2. Preferences UI (Account page)**
- New component `src/components/account/NotificationPreferences.tsx`:
  - Two switches: "Email reminders" and "Browser notifications".
  - "Browser notifications" toggle handles the permission prompt: if user flips it on and permission is `default`, call `Notification.requestPermission()`. If `denied`, show inline help text explaining how to re-enable in browser settings.
  - Both switches read/write to a new `notification_preferences` table.
- Slot it into `src/pages/Account.tsx` between `CategoryChart` and `ChangePasswordForm`.

**3. Database**
New table `notification_preferences`:
- `user_id uuid PK references auth.users`
- `email_enabled boolean default true`
- `web_enabled boolean default false`
- `updated_at timestamptz default now()`

RLS: users can select/insert/update their own row. Auto-create a row on first read via upsert from the client (no trigger needed).

**4. Wire into `check-deadlines`**
- Before sending an email for a given reminder, look up the user's `notification_preferences.email_enabled`. If `false`, skip the email and instead insert the `notification_log` row with `status = 'skipped_email'` so the in-tab toast still fires via realtime.
- If preferences row doesn't exist, default to `email_enabled = true` (current behavior preserved).
- Note: web notifications don't need any backend send — the existing `notification_log` insert is the trigger; the client listens via realtime.

**5. Realtime**
- Add `ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_log;` (might already be set since `NotificationBell` subscribes — will verify; if already added, the migration line is a no-op-safe `ADD TABLE` that we'll guard).

### Files

New:
- `src/hooks/use-web-notifications.ts`
- `src/components/account/NotificationPreferences.tsx`
- One migration: create `notification_preferences` table + RLS

Edited:
- `src/pages/Account.tsx` — slot in the new component
- `src/components/AuthGuard.tsx` — call `useWebNotifications()` once
- `supabase/functions/check-deadlines/index.ts` — read preferences, skip email when disabled

### Out of scope (this turn)
- True background push / service worker / VAPID
- Notification grouping or quiet hours
- Per-category preferences
- Rewriting the existing email (unchanged from last turn)

### Verification (after approval)
Open `/account`, toggle browser notifications on (accept the permission prompt), then manually invoke `check-deadlines` and confirm a system toast appears that links to `/reminder/:id` on click. Then toggle "Email reminders" off, clear the relevant `notification_log` row, re-invoke, and confirm only a toast fires (no email).
