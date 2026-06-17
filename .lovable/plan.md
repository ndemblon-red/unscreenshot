# Accept both ERROR findings, document in security memory, resume launch checklist

## Decisions
- **Screenshots bucket public** → accepted. Documented in T&Cs / Privacy. URLs are random UUIDs; product allows sharing reminders externally which requires public-readable images.
- **Realtime channel topic auth missing** → accepted. All three channels (`reminders_changes_<uid>`, `web-notifications-<uid>`, `notification_log_bell_<uid>`) use `postgres_changes`, which re-checks the source table's RLS under the subscriber's JWT before delivering events. An attacker can open a socket on someone else's topic but receives no payload. Existing RLS on `reminders` and `notification_log` is `user_id = auth.uid()`.

## Actions

### 1. Mark both findings as ignored in the scanner
- `PUBLIC_BUCKET_UNRESTRICTED` (screenshots) — ignore with rationale: "Intentionally public for shared-reminder use case; documented in Privacy + Terms; URLs are unguessable random UUIDs."
- `REALTIME_MISSING_CHANNEL_AUTHORIZATION` — ignore with rationale: "Channels use postgres_changes, which enforces source-table RLS per subscriber. Topic enumeration yields no payload."

### 2. Update `security-memory` doc
Add a short "Accepted risks" section capturing the two decisions and the invariants that keep them safe ("must keep RLS on reminders/notification_log scoped to auth.uid()", "if any channel migrates from postgres_changes to broadcast, revisit"). Remove any stale advice.

### 3. Resume pre-launch checklist
- Run SEO scan on `/` (Landing).
- Email smoke test: signup, password reset, password-changed, share-reminder to outside address, force a deadline reminder. Verify each lands as `sent` in `email_send_log`.
- Publish.

## Out of scope
- No code changes. No migration. No client changes.
