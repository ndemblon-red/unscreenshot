---
name: Beta Analysis Cap
description: Per-user 30-analysis cap during beta, enforced server-side in analyse-screenshot edge function with waitlist mailto fallback
type: feature
---
The application enforces a beta cap of 30 successful AI screenshot analyses per user, tracked in the `analysis_usage` table (one row per success). The `analyse-screenshot` edge function validates the user's JWT (closing a previously open endpoint), counts existing rows via service-role client, and returns `403 { error: "beta_cap_reached", used, limit }` when the cap is hit. Failed analyses do not count.

Frontend: `Upload.tsx` fetches the count on mount and renders a "X / 30 analyses used" chip; clicking the chip when capped opens `WaitlistDialog`. `Review.tsx` detects the 403 from `supabase.functions.invoke` via `error.context.response` and opens the same dialog. The dialog points to `mailto:waitlist@unscreenshot.ai?subject=Unscreenshot%20waitlist`.

Cap constant `BETA_ANALYSIS_CAP = 30` is duplicated in `supabase/functions/_shared/beta-limits.ts` (server) and `src/lib/beta-limits.ts` (client). Bump both to raise the limit.

RLS: users SELECT own rows only; only service role can INSERT. No update/delete.
