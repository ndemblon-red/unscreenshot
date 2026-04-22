

## Beta Analysis Cap (30 per user)

Limit each user to 30 successful AI screenshot analyses during beta. When they hit the cap, show a "join the waitlist" message pointing to `waitlist@unscreenshot.ai`. No effect on creating, editing, sharing, or viewing reminders manually.

### How it works

1. Every successful `analyse-screenshot` call records one row in a new `analysis_usage` table tagged with the user's ID.
2. Before calling Claude, the function counts the user's existing rows. If `count >= 30`, it returns `403 { error: "beta_cap_reached" }` instead.
3. The Upload page catches that error and shows a "Join the waitlist" modal with a `mailto:waitlist@unscreenshot.ai` button.
4. A small "12 / 30 analyses used" chip on the Upload page shows current usage.

```text
Upload page  ──►  analyse-screenshot edge fn  ──►  Anthropic
     │                    │
     │                    ├─ validate user's login token
     │                    ├─ count rows in analysis_usage WHERE user_id = X
     │                    ├─ if >= 30: return 403 beta_cap_reached
     │                    └─ on success: insert row into analysis_usage
     │
     └─ on 403: show WaitlistDialog
     └─ on mount: fetch usage count, render "X / 30 used" chip
```

### Waitlist dialog content

- Title: "You've reached the beta limit"
- Body: "Thanks for trying Unscreenshot. The beta is capped at 30 analyses per person while we finalise pricing. Join the waitlist for early access to paid plans."
- Primary action: "Join waitlist" → `mailto:waitlist@unscreenshot.ai?subject=Unscreenshot%20waitlist`
- Secondary action: "Back to reminders" → `/app`

### Database changes

New `analysis_usage` table:
- `id uuid pk`
- `user_id uuid not null` (no FK to `auth.users`, per project convention)
- `created_at timestamptz default now()`
- Index on `user_id`
- RLS: users can `SELECT` own rows; only service role can `INSERT`. No update/delete.

Constant `BETA_ANALYSIS_CAP = 30` in a new shared file `supabase/functions/_shared/beta-limits.ts`.

### Edge function changes (`analyse-screenshot`)

- Validate the caller's login token (closes the open-endpoint hole — anyone with the URL could currently burn Anthropic credits).
- Service-role client counts rows, then inserts one row after a successful Claude response. Failed analyses don't count.
- Return `403 { error: "beta_cap_reached", used, limit }` when exceeded.

### Frontend changes

- **`src/pages/Upload.tsx`**: fetch usage count on mount; show "X / 30 analyses used" chip; if `X >= 30`, disable the Analyse button and show the waitlist dialog directly.
- **`src/pages/Review.tsx`**: when `analyse-screenshot` returns 403, surface the waitlist dialog instead of the generic retry banner.
- **New `src/components/WaitlistDialog.tsx`**: dialog with the message and `mailto:` button.

### Tests

- New `src/test/beta-cap.test.ts` for pure cap logic (`isOverCap(used, limit)`, edge cases at 0/29/30/31).
- Render test for `WaitlistDialog`.

### Out of scope

- No proper waitlist database table or admin UI (mailto for now).
- No retroactive count of past analyses — counter starts at 0 from deploy time.
- No per-user cap overrides; bump `BETA_ANALYSIS_CAP` or delete rows manually if needed.

