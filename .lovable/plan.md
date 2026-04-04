
## Completed Features

### ✅ Due Time for Reminders (April 2026)

Added specific due times to reminders. Deadlines now stored as `YYYY-MM-DDTHH:MM` (e.g. `2026-04-05T09:00`) instead of `YYYY-MM-DD`. No database migration needed — the column is TEXT.

**What was done:**
- **`src/lib/deadlines.ts`** — Added `extractDate()`, `extractTime()` helpers. Presets default to 9:00 AM. Labels now show time (e.g. "Tomorrow · 9 AM", "15 March 2026 · 2:30 PM"). Backward compat: old `YYYY-MM-DD` values treated as `T09:00`.
- **`src/pages/Review.tsx`** — Custom date picker now shows a time input (defaults to 09:00). Date + time combined into `YYYY-MM-DDTHH:MM` on save.
- **`src/pages/ReminderDetail.tsx`** — Same time input added for custom dates. Preset buttons produce `T09:00` timestamps.
- **`supabase/functions/check-deadlines/index.ts`** — Updated to handle both `YYYY-MM-DD` and `YYYY-MM-DDTHH:MM` formats for due-today/tomorrow comparisons.
- **`src/components/TaskCard.tsx`** — No changes needed; already uses `dateToDeadlineLabel()` which now returns time-inclusive labels.

---

## Upcoming

- **Milestone 5:** Polish & edge cases (blurry images, past dates, UI audit)
- **Milestone 6:** PRD test set validation
- **Shared Reminders:** Internal (between users) and external (email) sharing
- **Time-aware sorting:** Sort same-day reminders by time
