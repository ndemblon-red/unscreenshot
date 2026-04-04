

## Current Status

Milestones 1–4 and 3b/3c are complete. Milestone 5 (polish/edge cases) and Milestone 6 (test set validation) have outstanding tasks. The notification system (database-logged) is built and deployed.

---

## Reminder Notification System (Database-Logged) ✅

Built the backend logic for deadline-based reminder notifications, logging them to a database table instead of sending emails.

### What was built

1. **`notification_log` table** — stores every notification that *would* be sent: reminder ID, user ID, recipient email, notification type, and status ("logged" now, "sent" later when email is live).
2. **`check-deadlines` Edge Function** — runs daily at 8am UTC via pg_cron. Queries reminders due today/tomorrow, deduplicates, and inserts rows into `notification_log`.
3. **`pg_cron` job** — scheduled daily execution.
4. **Account page** — "Recent Notifications" section showing logged notifications.

### Future: swap to real email

When a custom domain is set up, the Edge Function calls a send-email function instead of inserting a "logged" row. No schema changes needed.

---

## Outstanding: Milestone 5 — Polish & Edge Cases

- [ ] Test blurry/unreadable image — safe defaults returned
- [ ] Test blank white image — safe defaults, no hang
- [ ] Test corrupted file — flagged as unprocessable, manual entry shown
- [ ] Test screenshot with past date — deadline defaults to Next Week
- [ ] Test batch of 15+ screenshots — all process, UI handles gracefully
- [ ] Test sensitive/personal content — safe neutral title returned
- [ ] Delete confirmation works on both task card and detail screen
- [ ] Every async action has a visible loading indicator
- [ ] Every failure mode has a user-facing message
- [ ] Spacing, typography, and colour audit vs PLANNING.md
- [ ] Category pill colours consistent everywhere
- [ ] Verify "Does NOT include" items are absent

---

## Outstanding: Milestone 6 — Test Set Validation

All 17 PRD Section 8 test cases need manual validation (7 must-pass, 5 edge, 5 must-fail-safely). See docs/TASKS.md for full checklist.

---

## Planned: Shared Reminders (Internal First)

**Phase 1 — Internal sharing (between Unscreenshot users)**
- `shared_reminders` table linking a reminder to other user IDs
- Shared reminders appear in the recipient's task list
- `check-deadlines` Edge Function extended to notify shared users too
- Share UI on Reminder Detail page (search by email, add/remove)

**Phase 2 — External sharing (anyone via email)**
- Share with any email address (no account required)
- `notification_log` already supports `recipient_email` with null `user_id`
- Requires custom email domain to be configured first

---

## Planned: Custom Email Domain & Live Notifications

- Register and verify a custom domain for transactional email
- Configure DNS/NS records via Lovable Cloud
- Swap `check-deadlines` from logging to actual email sending
- Email templates for "due today" and "due tomorrow" notifications

---

## Planned: Other Roadmap Items

- **Security hardening**: leaked password protection, private storage bucket with signed URLs
- **Stripe integration**: payment links for premium features
- **Landing page**: public marketing page at `/`
- **Mobile app**: Capacitor wrapper for rich notifications with images
