
The user wants three cron passes, not one:
1. **6pm local** — send "due tomorrow" emails
2. **8am local** — send "due today" emails
3. **Hourly** — catch reminders added later in the day (for both today and tomorrow)

### Timezone problem

pg_cron runs in UTC. "Local time" only works if we know the user's timezone. Two options:

**A. Single timezone (hardcode)** — pick one timezone (e.g. Europe/London) and schedule everything against it. Simple, but wrong for users in other zones. Fine for a single-user / small-beta phase.

**B. Per-user timezone** — store `timezone` on `notification_preferences`, then run cron hourly, and inside `check-deadlines` only send emails to users whose local time matches the target hour. Works globally, slightly more code.

Option B is the right answer because the hourly run is already needed — we just teach it to also do the 6pm/8am gating per user. One cron job, all logic server-side.

### Plan

**1. Schema**
Add `timezone text default 'UTC'` to `notification_preferences` (IANA name, e.g. `Europe/London`).

**2. Account UI**
Add a timezone select to `NotificationPreferences.tsx`. Default to the browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` on first load if no preference exists.

**3. `check-deadlines` logic rewrite**

Replace the current "send everything due today/tomorrow" pass with per-user time-gated logic:

- Query all reminders where `deadline` falls on today or tomorrow (in any timezone — widen the window to ±1 day in UTC to be safe).
- For each user, look up their `timezone` and `email_enabled`.
- Compute the user's local hour right now.
- For each reminder belonging to that user:
  - If reminder is due **tomorrow (user-local)** AND user-local hour == 18 AND no `due_tomorrow` log exists → send + log
  - If reminder is due **today (user-local)** AND user-local hour == 8 AND no `due_today` log exists → send + log
  - Otherwise skip (the hourly run will catch it at the right hour, including reminders added later that day)

The dedup via `notification_log` already prevents duplicates if the function runs more than once at the target hour.

**4. Cron schedule**
One job, hourly on the hour:
```
0 * * * *
```
Runs `check-deadlines` 24 times a day. Each run only emails users whose local clock has just struck 8 or 18.

**5. Migration + cron setup**
- Migration: enable `pg_cron` + `pg_net`, add `timezone` column to `notification_preferences`.
- Separate DB insert (not migration): `cron.schedule('check-deadlines-hourly', '0 * * * *', ...)` with project URL + anon key.

**6. Docs**
Mark cron as done in `docs/TASKS.md`; log the timing decision in `docs/DECISIONS.md`.

### Files
- New migration: `pg_cron`/`pg_net` + `timezone` column
- DB insert: `cron.schedule(...)` (uses project URL + anon key — not a migration)
- `supabase/functions/check-deadlines/index.ts` — rewrite send loop with timezone gating
- `src/components/account/NotificationPreferences.tsx` — add timezone select with browser-detected default
- `docs/TASKS.md`, `docs/DECISIONS.md`

### Out of scope
- Per-user choice of send hours (8/18 are fixed)
- Quiet hours / weekend skip
- Backfill migration for existing users (they get `'UTC'` until they visit `/account`; the UI auto-detects on first load and saves)
