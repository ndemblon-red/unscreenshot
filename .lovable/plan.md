

The user finds the native HTML `<input type="time">` painful. Let me think about where time picking happens.

From context: `ReminderDetail.tsx` and `Review.tsx` both use `<input type="time">` for the custom deadline picker. The native control varies by browser/OS — on desktop it's a tiny stepper, on mobile a wheel. Common complaints: hard to click, AM/PM toggle awkward, no quick presets.

Alternatives to consider:

1. **Quick-pick chips (recommended)** — Replace the time input with a row of preset buttons: 9 AM, 12 PM, 3 PM, 6 PM, 9 PM. Plus an "Other" that reveals the native input as fallback. Matches the app's existing "Tomorrow / Next Week / Next Month" pattern. Zero new dependencies. Fastest UX for the common case (most reminders are at a sensible round hour).

2. **Two dropdowns (hour + AM/PM)** — Use shadcn Select for hour (1-12) and AM/PM. More flexible than chips, slower than chips, no minute precision unless we add a third dropdown.

3. **Scrollable wheel picker** — Like iOS. Needs a library (react-mobile-picker or similar). Heavier, more code, overkill for this app.

4. **Third-party time picker component** — e.g. `react-time-picker`. Adds dependency, styling work to match the design system.

Given the app's minimalist style and existing chip pattern for dates, **option 1 is the clear fit**. It's consistent, fast, and removes the pain point for ~95% of cases while keeping a fallback.

Keep scope small — only touch the two files that have the time input.

## Plan: Replace native time input with preset chips

### What changes
Replace `<input type="time">` in the custom deadline picker with a row of preset time chips matching the existing date-chip pattern. Keep a fallback for non-standard times.

### Preset times
`9 AM · 12 PM · 3 PM · 6 PM · 9 PM · Other`

These cover the most common reminder slots (morning, lunch, afternoon, evening, late). "Other" reveals the existing native time input as fallback so power users aren't blocked.

### Files to edit
1. **`src/pages/ReminderDetail.tsx`** — In the custom picker block (around the `<input type="time">`), swap the time input for a chip row. Same `onChange` logic — set `customTime` and update `deadline`.
2. **`src/pages/Review.tsx`** — Same swap in the equivalent custom picker block.

### Implementation notes
- Chip styling reuses the existing pattern: `rounded-btn`, muted background when unselected, `bg-primary text-primary-foreground` when selected
- "Other" toggles a small inline `<input type="time">` so the fallback still exists
- Default `customTime` stays `09:00` so behavior is unchanged for users who don't touch it
- No new dependencies, no design system changes, no DB changes

### Out of scope
- Changing the date input (that one's fine — calendar pickers are well-understood)
- Adding minute-level presets (15/30/45) — adds clutter, low value for reminder app
- Replacing the date input with a shadcn Calendar popover — separate decision, can be a follow-up if you want

