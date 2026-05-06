## Audit findings

**1. Edge function log skim — ✅ clean**
- `analyse-screenshot`, `share-reminder`, `delete-account`: no recent invocations, no errors.
- `check-deadlines`: only Boot/Shutdown lifecycle entries, zero errors or 500s in the recent window. No Anthropic/Resend failures surfaced.

**2. Cron schedule — ⚠️ duplicate jobs found**
Two active cron jobs both invoke `check-deadlines`:
- `check-deadlines-hourly` — `0 * * * *` (intended, matches docs)
- `check-deadlines-every-minute` — `* * * * *` (legacy, redundant)

Both succeed every run (1440 + 24 successful runs in last 24h). The per-minute job is wasteful: the function does its own time-gating (only sends at user-local 8 AM / 6 PM), so the extra 1416 invocations/day produce no emails but burn function quota and log noise.

**3. Rate limiting on share-reminder / signups — deferred**
No backend primitive in place; per existing platform guidance and the `reminder-sharing` memory, this stays deferred until post-launch.

## Plan

1. **Drop the redundant per-minute cron job** via a migration:
   ```sql
   SELECT cron.unschedule('check-deadlines-every-minute');
   ```
   Keep `check-deadlines-hourly` as the single source of truth.

2. **Update `docs/DECISIONS.md`** with three short entries:
   - Edge function log skim performed, no errors observed across the four user-facing functions.
   - `check-deadlines` runs hourly via pg_cron; duplicate per-minute job removed.
   - Rate limiting on `share-reminder` and signups intentionally deferred (rationale: no backend rate-limit primitive available; mitigations in place are the per-reminder 10-recipient cap, the 30-analysis beta cap, and Supabase's built-in auth signup throttling).

3. **No code changes** to edge functions — they're healthy.

No schema changes beyond unscheduling the cron job. No frontend impact.
