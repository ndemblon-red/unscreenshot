## Daily signup digest

Send one email per day to **ndemblon@gmail.com** summarizing new user signups from the past 24 hours.

### What you'll get
- Email arrives once a day (09:00 UTC) with:
  - Total new signups in the last 24h
  - Running total of all-time users
  - A list of each new signup (email + signup time)
- If there were zero signups, no email is sent (avoids inbox noise)

### How it's built
1. **New transactional email template** `signup-digest.tsx` — branded, minimalist, matches your existing email styling
2. **New edge function** `send-signup-digest` — queries `auth.users` for accounts created in the last 24h, then invokes the existing `send-transactional-email` function
3. **Daily cron job** at 09:00 UTC that triggers the edge function (uses your existing pg_cron setup)
4. Register the new template in the transactional email registry

### Notes
- Uses your existing Lovable Emails infrastructure — no new secrets, no third-party service
- Recipient is hardcoded to ndemblon@gmail.com; easy to change later
- You can preview/monitor sends in Cloud → Emails
