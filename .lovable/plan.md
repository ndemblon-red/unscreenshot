

## Add Due Time to Reminders

Currently deadlines are stored as `YYYY-MM-DD` text. We need to add a time component so cards show "Tomorrow 9am" and custom dates allow custom time selection.

### Approach

**Keep the `deadline` column as-is** (text) but change the format from `YYYY-MM-DD` to `YYYY-MM-DDTHH:MM` (e.g. `2026-04-05T09:00`). No database migration needed — it's already a text field. Existing date-only values are handled gracefully with fallback parsing.

### Changes

**1. Update `src/lib/deadlines.ts`**
- `deadlineLabelToDate()` → returns `YYYY-MM-DDTHH:MM` with `T09:00` appended (presets default to 9am)
- `isDateString()` → also accept `YYYY-MM-DDTHH:MM` format
- `dateToDeadlineLabel()` → append time to labels, e.g. "Tomorrow · 9:00 AM", "15 March 2026 · 2:30 PM". For preset matches at 9am, show "Tomorrow · 9 AM"
- `getDeadlineUrgency()` → extract date portion for comparison (unchanged logic)
- Add helper `extractDate(deadline)` and `extractTime(deadline)` for parsing
- Backward compat: treat existing `YYYY-MM-DD` values as `T09:00`

**2. Update `src/components/TaskCard.tsx`**
- No structural changes needed — it already calls `dateToDeadlineLabel()` which will now return time-inclusive labels like "Tomorrow · 9 AM"

**3. Update `src/pages/Review.tsx`**
- Default deadline already uses `deadlineLabelToDate("Next Week")` which will now include `T09:00`
- When user picks a custom date, show a time input field after date selection (default 9:00 AM)
- Combine date + time into `YYYY-MM-DDTHH:MM` before saving

**4. Update `src/pages/ReminderDetail.tsx`**
- Preset buttons work as before (now produce `T09:00` timestamps)
- Custom date picker: add a time input that appears alongside the date input
- Combine date + time on save

**5. Update `supabase/functions/check-deadlines/index.ts`**
- Extract date portion from deadline for "due today" / "due tomorrow" comparisons (currently compares full string to `YYYY-MM-DD`, needs to handle the new format)

### No migration needed
The `deadline` column is `TEXT` — the format change is handled entirely in application code with backward compatibility for old `YYYY-MM-DD` values.

