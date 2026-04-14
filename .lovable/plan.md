

## Fix: Custom deadline picker saves too eagerly on ReminderDetail

**Problem**: When editing a reminder's deadline with the custom date/time picker, changing the date immediately saves and closes the picker (via `handleDeadlineDateSelect` which calls `setEditingDeadline(false)`). This means you can't set both date and time before saving. The time input is even worse — changing the hour fires `onChange`, which saves and closes before you can set the minutes.

**Root cause**: `handleDeadlineDateSelect` (used by both date and time inputs) calls `setEditingDeadline(false)` and saves to the database on every change. The Review page doesn't have this problem because it only updates local state without closing.

**Fix**: Stop auto-closing and auto-saving on every input change. Instead, update local state only, and add an explicit "Done" button to commit the custom deadline.

### Changes (1 file)

**`src/pages/ReminderDetail.tsx`**:

1. Change the date `onChange` handler to only update local state (`setDeadline`) — do NOT call `handleDeadlineDateSelect`
2. Change the time `onChange` handler to only update local state (`setCustomTime` + `setDeadline`) — do NOT call `handleDeadlineDateSelect`
3. Add a "Done" button below the date/time inputs that:
   - Calls `setEditingDeadline(false)` and `setShowCustomPicker(false)`
   - Calls `saveDeadlineWithStatusCheck(deadline)` if the value changed
4. Keep `handleDeadlinePreset` unchanged (presets should still save immediately since they're one-click actions)

