

## Fix "Next {Weekday}" Calendar Logic

**One file**: `src/lib/deadlines.ts` — rewrite the proximity logic in `dateToDeadlineLabel()`.

### Label rules

| When | Label |
|---|---|
| Today | Today · 9 AM |
| Tomorrow | Tomorrow · 9 AM |
| Later this week (same Mon–Sun block) | Thursday · 9 AM |
| Next calendar week (next Mon–Sun) | Next Thursday · 9 AM |
| Beyond next week | 21 May 2026 · 9 AM |

### Implementation

Replace the current `diffDays >= 2 && diffDays <= 6` check with calendar-week logic:

1. Compute the Monday of the current week and the Monday of next week from `today`
2. If target is in the **current week** (after tomorrow) → `"{Weekday} · {time}"`
3. If target is in **next week** (next Monday through next Sunday) → `"Next {Weekday} · {time}"`
4. Otherwise → `"{day} {Month} {year} · {time}"`

~15 lines changed, no other files affected.

