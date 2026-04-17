

The user wants email reminders for deadlines but doesn't have a custom domain. They're asking about Resend specifically.

Let me think about what they actually need:
- They already have `check-deadlines` edge function that logs in-app notifications
- They want to add email delivery on top of that
- No custom domain yet

Options analysis:

**Option A: Lovable Emails (built-in)**
- Requires a custom domain (subdomain delegation)
- Not viable right now since they don't have one

**Option B: Resend with `onboarding@resend.dev` test sender**
- Works without a custom domain
- BUT the test sender only sends to the verified account owner's email — not arbitrary users
- Good for testing only, not real users

**Option C: Resend with their own verified domain**
- Same domain requirement as Lovable Emails — no advantage if they don't have a domain
- Adds a third-party dependency

**Honest answer:** Without a custom domain, neither option lets them email arbitrary users in production. The "rework" question is small either way — the existing `check-deadlines` function already finds due reminders. Adding email is ~30 lines of code calling Resend's API via the gateway. The blocker isn't code, it's the domain.

Recommendation: be straight with them. Don't oversell. Suggest a phased approach: scaffold the code now using Resend test mode so they can test it themselves, then flip to a verified domain when they get one.

Let me check the existing check-deadlines function to confirm what's there.

Actually I have it from context already. The function logs to `notification_log` but doesn't send emails. Adding email send is a small addition.

Plan:

## Email Reminders — Honest Assessment

### Short answer
You can do this with Resend, but **without a custom domain you can only email yourself** (the address you sign up to Resend with). Real users won't get anything until you verify a domain — same blocker either way.

The code rework is tiny (~30 lines). The blocker is the domain, not the architecture.

### Three paths

**1. Build it now in test mode (recommended)**
Wire up Resend using their test sender `onboarding@resend.dev`. Emails will only deliver to your own verified Resend address — perfect for you to test the flow end-to-end. When you get a domain later, swap one constant and you're live.
- Pros: No wasted work, you can validate the experience today
- Cons: Only you receive emails until a domain is verified

**2. Wait until you have a domain**
Skip email entirely until a domain exists, then use either Lovable's built-in email (no extra account) or Resend.
- Pros: No throwaway setup
- Cons: Feature shipped later

**3. Use Lovable's built-in email later**
Once you have a domain, Lovable's built-in system needs no third-party account, no API keys, and includes queueing/retries automatically. If you don't strongly prefer Resend, this is less moving parts.

### My recommendation
Go with **path 1**. Here's the actual plan:

### Implementation (path 1)

1. **Connect Resend** via Lovable's connector system (one click, no API key to manage manually)
2. **Update `check-deadlines` edge function**:
   - After inserting a row into `notification_log`, also call Resend via the connector gateway
   - Use `from: 'Unscreenshot <onboarding@resend.dev>'`
   - Compose a short email: subject "Reminder due today" / "Reminder due tomorrow", body with the title and a link to `/reminder/:id`
   - Log result back to `notification_log.status` (`sent` / `failed`)
3. **Add a constant `SENDER_EMAIL`** at the top of the function so when you get a domain you change one line
4. **No DB changes needed** — `notification_log` already has `recipient_email` and `status` columns

### Rework when you get a domain
Literally one line: change `SENDER_EMAIL` from `onboarding@resend.dev` to `reminders@yourdomain.com`. That's it. No schema changes, no architectural changes, no client changes.

### What I won't do
- Set up a custom domain in Resend before you've picked one
- Add user preferences UI for opting out (you can add later if needed — at MVP, the user opted in by signing up)
- Build an email template library — one transactional email, kept simple

### Files I'd touch
- `supabase/functions/check-deadlines/index.ts` — add Resend send after notification_log insert
- That's it

### Before I build
Confirm path 1 (test mode now), or tell me you'd rather wait (path 2) or use Lovable's built-in email when you get a domain (path 3).

