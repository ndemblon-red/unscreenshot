

### The bug
You're right. In `NotificationBell.tsx` line 160:
```ts
formatDistanceToNow(new Date(n.created_at), { addSuffix: true })
```
`n.created_at` is when the **notification log row was inserted** (when the cron job ran and detected your reminder), not when the reminder is due. So "14 minutes ago" really means "this notification was created 14 minutes ago" — coincidentally close to your reminder time, but unrelated.

### The fix
Show time relative to the **deadline** instead. That matches what users expect from a deadline notification ("Due 9 minutes ago", "Due in 2 hours", "Due tomorrow at 9 AM").

### Changes
**`src/components/NotificationBell.tsx`**
1. Include `deadline` in the reminder lookup (line ~46): `.select("id, title, deadline")`
2. Add `reminder_deadline` to the `Notification` interface and the title-map merge
3. Replace the `formatDistanceToNow(created_at...)` line with a small helper:
   - If deadline is in the future → `"Due in X"` (e.g., "Due in 2 hours")
   - If deadline is in the past → `"Due X ago"` (e.g., "Due 9 minutes ago")
   - Use `formatDistanceToNow(new Date(deadline), { addSuffix: false })` and prefix `"Due "` + suffix `" ago"` / `"in "` manually for clarity

### Out of scope
- Changing the email template wording (it already says "due today/tomorrow" which is correct)
- Backfilling old notification rows — the data itself is fine, only the display label was wrong

### Files touched
- `src/components/NotificationBell.tsx` (one query change + one helper, ~10 lines)

