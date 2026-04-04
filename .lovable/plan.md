

## Smarter Deadline Labels

Replace generic "Next Week" / "Next Month" labels with actual day/date names for much more useful card text.

### New label rules

| Scenario | Current | Proposed |
|---|---|---|
| Due today | Today · 9 AM | **Today · 9 AM** (unchanged) |
| Due tomorrow | Tomorrow · 9 AM | **Tomorrow · 9 AM** (unchanged) |
| Due within 7 days | Next Week · 9 AM | **Next Thursday · 9 AM** |
| Due beyond 7 days | Next Month · 9 AM | **21 May 2026 · 9 AM** |

### Logic change

Update `dateToDeadlineLabel()` in `src/lib/deadlines.ts`:

1. **Today** → "Today · {time}" (no change)
2. **Tomorrow** → "Tomorrow · {time}" (no change)
3. **Within the next 6 days** (day after tomorrow through 6 days out) → "Next {Weekday} · {time}" e.g. "Next Thursday · 9 AM"
4. **Everything else** → "{day} {Month} {year} · {time}" e.g. "21 May 2026 · 9 AM"

Remove the current loop that matches against preset labels — it's no longer needed since we derive the label purely from the date's proximity to today.

### Files changed

- **`src/lib/deadlines.ts`** — rewrite `dateToDeadlineLabel()` with the new proximity-based logic. One file, ~15 lines changed.

No other files need changes — `TaskCard`, `Review`, and `ReminderDetail` all call this function already.

