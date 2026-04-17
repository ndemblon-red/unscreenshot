
User wants per-trigger email toggles: "due tomorrow" (6pm day before) and "due today" (8am day of), independently. Currently `email_enabled` is a single boolean.

### Approach

**Schema** — add two booleans to `notification_preferences`, both defaulting to `true`:
- `email_due_tomorrow boolean not null default true`
- `email_due_today boolean not null default true`

Keep `email_enabled` as a master switch (off → no emails of any kind). Simpler than removing it and migrating, and matches the existing UI mental model.

**Edge function** — in `check-deadlines`, after the master `email_enabled` check, also gate on the per-type flag:
- `due_tomorrow` requires `email_due_tomorrow`
- `due_today` requires `email_due_today`

If gated off, log status `skipped_email` (reuse existing skipped path) so we still record + don't retry.

**UI** — `NotificationPreferences.tsx`:
- Replace the single "Email reminders" row with a parent row (master toggle, same description) plus two indented child toggles below it: "Day before (6 PM)" and "Day of (8 AM)".
- Children disabled when master is off (visually muted).
- All three persist via the same `persist()` upsert.

**Out of scope**
- Per-category email prefs
- Quiet hours
- Browser-notification per-type split (only email per the user's ask)
