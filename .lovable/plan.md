

# Launch Plan — Unscreenshot Desktop

## Current State

Core product is functional: upload screenshots, AI analysis, review/edit, task list with tabs/filter/sort/search, auth with password reset, offline support. Database has RLS policies scoped to authenticated users. One security finding: leaked password protection is disabled.

Milestones 1–4 and 3b/3c are complete. Milestones 5 (polish) and 6 (test validation) are untouched.

---

## Launch Milestones

### Milestone 7: Version Control & Hosting
- Connect project to GitHub via Lovable settings (Settings → GitHub → Connect)
- Publish the app via Lovable (Share → Publish) to get a live URL
- Optionally connect a custom domain (Settings → Domains)

*No code changes needed — this is configuration only.*

---

### Milestone 8: Security Hardening
- Enable leaked password protection (auth security finding from scan)
- Audit storage bucket policies — currently public read/insert/delete on `screenshots`; tighten to authenticated users only, scoped to own files
- Confirm email verification is required before sign-in (currently the default)

---

### Milestone 9: Payments — Free vs Paid Plans
- Integrate Stripe via Lovable's built-in Stripe tooling
- Define two plans:
  - **Free**: limited to N reminders (e.g. 20) or N analyses per month
  - **Paid**: unlimited reminders and analyses
- Create a `subscriptions` table or use Stripe's customer/subscription tracking
- Add a simple pricing/upgrade page accessible from Account
- Gate the upload flow: check quota before allowing analysis
- Show current plan and usage on Account page

*Requires deciding on the free tier limit and pricing before implementation.*

---

### Milestone 10: Polish & Edge Cases (existing Milestone 5)
All unchecked items from the current Milestone 5:
- Test blurry, blank, corrupted, past-date, large-batch, and sensitive-content images
- Verify delete confirmation works on both card and detail views
- Audit loading states and error states for every async action
- Typography, spacing, and colour audit against design spec
- Verify "Does NOT include" items are absent

---

### Milestone 11: Test Set Validation (existing Milestone 6)
Run all 17 PRD Section 8 test cases manually, document results, fix failures.

---

### Milestone 12: Launch Readiness
- Set up a custom email domain so auth emails come from your brand (not default sender)
- Add a basic landing/marketing page or redirect for unauthenticated visitors
- Add `<meta>` tags (title, description, OG image) for link sharing
- Review error logging — ensure edge function errors are visible in logs
- Final end-to-end walkthrough: sign up → upload → review → manage → done → delete → account

---

## Decisions Needed Before Implementation

| Decision | Options | Impact |
|---|---|---|
| Free tier limit | 20 reminders total / 10 analyses per month / 5 active reminders | Determines DB schema and gating logic |
| Paid plan price | $5/mo, $8/mo, or annual option | Stripe product/price setup |
| AI provider | Keep Anthropic (current) or switch to Lovable AI (no API key needed) | Switching saves the user from managing their own API key; Lovable AI supports equivalent models |

---

## Suggested Order of Work

```text
1. GitHub + Publish        (config only, 5 min)
2. Security hardening      (migration + config, 30 min)
3. Stripe + plans          (new feature, needs decisions first)
4. Polish & edge cases     (existing M5 tasks)
5. Test set validation     (existing M6 tasks)
6. Email domain + meta     (launch polish)
```

