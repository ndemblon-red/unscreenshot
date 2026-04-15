

## Housekeeping: Update Documentation Files

After reviewing all three files against what's actually been built, here's what needs updating:

### 1. `docs/DECISIONS.md` — Missing 7 decisions

The file still ends with a blank template. These decisions were made during the build but never logged:

| Decision | Summary |
|----------|---------|
| Auth added to v1 | Reversed "no auth in v1" — added email/password auth + RLS after deciding to share the app |
| Landing page + route restructure | Public landing at `/`, app moved to `/app`, responsive design |
| Image compression before AI analysis | Client-side resize/quality reduction to stay under Anthropic's 5MB base64 limit |
| Langfuse observability | Added LLM tracing for latency, token usage, error tracking |
| In-app deadline notifications | Bell icon + check-deadlines cron — chose in-app first, email reminders planned for later |
| Upload batch limit (10) | Capped at 10 per batch for cost/UX reasons |
| Logout moved to Account page | Removed from main header, centralised in Account |

### 2. `docs/TASKS.md` — Several items outdated

- Milestone 5: "batch of 15+ screenshots" should reflect the 10-file cap
- Missing milestones for features built after the original plan: landing page, notifications, Langfuse, image compression
- Some Milestone 5 items (delete confirmation, loading states) may already be done but aren't checked off

### 3. `.lovable/plan.md` — Can be removed

This file was created during our conversation as a working scratchpad for the batch limit and Google Picker plans. The batch limit is done and logged in TASKS.md. The Google Picker future plan is better suited for TASKS.md or a roadmap section. This file doesn't fit the original docs structure and can be deleted.

### What I'll do

1. **Update `docs/DECISIONS.md`** — Add the 7 missing decision entries with proper context/options/rationale
2. **Update `docs/TASKS.md`** — Fix the batch-size item, add completed milestones for landing page/auth/notifications/observability/image compression, and check off any Milestone 5 items that are already implemented
3. **Delete `.lovable/plan.md`** — Move the Google Picker future plan into TASKS.md as a future milestone

