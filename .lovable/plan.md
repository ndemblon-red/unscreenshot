

## Reminder Notification System (Database-Logged)

Build the backend logic for deadline-based reminder notifications, logging them to a database table instead of sending emails. This lets you test and verify the notification trigger logic now, and swap in real email sending later when you have a domain.

### What gets built

1. **`notification_log` table** — stores every notification that *would* be sent: reminder ID, user ID, recipient email, notification type (e.g. "deadline_approaching"), scheduled time, and status ("logged" now, "sent" later when email is live).

2. **`check-deadlines` Edge Function** — a scheduled function that runs on a cron (e.g. daily at 8am). It queries reminders with deadlines approaching (due today or tomorrow), checks if a notification was already logged for that reminder+type combo (deduplication), and inserts new rows into `notification_log`.

3. **`pg_cron` job** — schedules the Edge Function to run daily.

4. **Dashboard visibility** — add a simple notification log view on the Account page so you can verify notifications are being generated correctly.

### Database changes

```
notification_log table:
- id (uuid, PK)
- reminder_id (uuid, FK → reminders.id)
- user_id (uuid, not null)
- recipient_email (text)
- notification_type (text: "due_today", "due_tomorrow")
- created_at (timestamptz)
- status (text: "logged" | "sent" | "failed")
```

RLS: authenticated users can read their own rows only.

### Future-proofing for shared reminders

The `notification_log` already includes `recipient_email` separate from `user_id`. When you add sharing later:
- **Internal sharing**: the cron job queries shared reminders too and logs notifications for each shared user
- **External sharing**: same table, just with an external email and null `user_id`

When you get your email domain set up, the only change is: the Edge Function calls `send-transactional-email` instead of inserting a "logged" row.

### Files to create/modify

- **Migration**: create `notification_log` table with RLS
- **`supabase/functions/check-deadlines/index.ts`**: Edge Function that queries due reminders and inserts notification log entries
- **`pg_cron` job**: schedule daily execution via SQL insert
- **`src/pages/Account.tsx`**: add a "Recent Notifications" section showing logged notifications

