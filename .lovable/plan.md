
The user wants to add upcoming email work to the task list, with the immediate focus being the email format. From context, the gaps in the email system are:

1. **Email format** (current priority) — the existing HTML in `check-deadlines/index.ts` is a basic inline template (heading + title + button + footer). Needs improvement: better branding, possibly use proper React Email templates, match the app's minimalist SF Pro aesthetic.
2. **Cron schedule** — no pg_cron job yet, function only fires manually.
3. **Resend test mode** — only delivers to `ndemblon@gmail.com`; needs domain verification or switch to Lovable Emails to send to any user.
4. **Morning-of timing** — currently a "due today" email could fire at 00:05 if cron ran at midnight.
5. **Notification preferences** — no per-user toggle for email opt-in/out.

I should add these to `docs/TASKS.md` (the project's checklist file) under a clearly-marked "Email reminders" section, ordered by priority with email format first. I'll keep the entries terse and aligned with the existing TASKS.md style (`[ ]` checkboxes, short verb-led lines).

I should also check the current TASKS.md structure to slot the new section in the right place.

### Plan

Add a new "Email reminders" section to `docs/TASKS.md` with these checklist items, ordered by priority:

```
## Email reminders

- [ ] Redesign email format — match app aesthetic (SF Pro, minimal, dry copy), 
      improve subject line, body layout, and CTA button. Consider extracting 
      to a separate template file rather than inline HTML in check-deadlines.
- [ ] Schedule check-deadlines via pg_cron (suggest every 30 min)
- [ ] Add morning-of timing rule (don't fire "due today" before ~8 AM local)
- [ ] Move off Resend test mode (verify custom domain OR switch to Lovable Emails) 
      so emails reach any signed-up user, not just ndemblon@gmail.com
- [ ] Add per-user notification preference toggle in Account page
```

Insert this section in `docs/TASKS.md` near the existing notification-related milestone (likely Milestone 3e area based on the summary).

### Files touched
- `docs/TASKS.md` — add one new section, ~5 lines

### After approval
Once you approve, I'll switch to default mode, add the section, and then we can start on the first item (email format redesign). For that first task I'll come back with a separate plan covering: copy direction, layout/styling decisions, and whether to keep inline HTML or extract a template.

### Out of scope (this turn)
- Actually implementing any of the items — this is just adding them to the task list
- Reordering or rewriting unrelated TASKS.md content
