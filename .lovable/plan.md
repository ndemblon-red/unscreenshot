

## In-App Notification Center

**What**: Replace the basic "Recent Notifications" list on the Account page with a proper notification bell + dropdown accessible from every page, plus a dedicated notifications view.

### Design

- **Bell icon with badge** in the main app header (Index page header, ReminderDetail header, Account header) showing unread count
- **Dropdown panel** on click: shows latest ~10 notifications with title, due label, and timestamp; each links to the reminder
- **"Mark all read" button** in the dropdown
- **Unread tracking**: Add a `read` boolean column to `notification_log` (default `false`)
- Remove the `NotificationList` from the Account page (or keep it as a "View all" link target)

### Database Changes

1. **Migration**: Add `read` column to `notification_log`:
   ```sql
   ALTER TABLE notification_log ADD COLUMN read boolean NOT NULL DEFAULT false;
   ```
2. **RLS policy**: Allow authenticated users to UPDATE their own notifications (for marking as read):
   ```sql
   CREATE POLICY "Users can update own notifications"
   ON notification_log FOR UPDATE TO authenticated
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
   ```

### Frontend Changes

1. **`src/components/NotificationBell.tsx`** (new) — Bell icon + unread badge + popover dropdown
   - Fetches `notification_log` where `user_id = auth.uid()`, ordered by `created_at desc`, limit 10
   - Shows unread count as a red badge
   - Each item shows reminder title (fetched via join or separate query) + "Due today/tomorrow" + relative time
   - "Mark all read" button updates `read = true` for all unread
   - Clicking a notification navigates to `/reminder/:id` and marks it read

2. **`src/components/account/NotificationList.tsx`** — Either remove or simplify to link to a full notifications page

3. **Update headers** in `Index.tsx`, `ReminderDetail.tsx`, `Account.tsx` — Add `<NotificationBell />` to each page header

4. **Realtime subscription** — Subscribe to `notification_log` inserts so the bell updates live without refresh

### Complexity

This is moderate — roughly 1 new component, 1 migration, and small header updates across 3 pages. The existing `notification_log` table already has all the data; we just need the `read` column and a better UI.

