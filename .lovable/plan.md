# Fix: reminder emails missing from Cloud → App emails dropdown

## What's wrong
The Cloud Emails UI lists app templates by calling `preview-transactional-email`, which renders each template in the registry with its `previewData`. Both reminder templates are registered correctly with `previewData` and `displayName`, but only `password-changed` is showing. Two likely causes:

1. **Stale deploy** — `preview-transactional-email` was last deployed before the reminder templates were finalized (only one boot log today), so the Cloud UI cached an old template list.
2. **Render failure** — one or both reminder templates throw inside `renderAsync` (e.g. a missing nested field in `previewData`), so they're being returned with `status: render_failed` and the Cloud UI hides them.

## Fix
1. **Redeploy** `preview-transactional-email` so the latest registry is live.
2. **Invoke it directly** with the `LOVABLE_API_KEY` bearer and inspect the JSON. For each template, confirm `status: "ready"`. For any that comes back `render_failed`, read the `errorMessage`.
3. **If render fails:** open the failing template's `previewData` block and fill in whatever the component dereferences (titles, deadlines, URLs, sharer name, etc.) so it renders standalone. Redeploy.
4. **Re-open Cloud → Emails → App emails** and confirm the dropdown shows all three: Reminder deadline, Reminder shared, Password changed.

## Out of scope
No changes to the actual reminder-sending logic in `check-deadlines` or `share-reminder` — those keep working regardless of the preview dropdown. This is purely a Cloud UI visibility fix.

## Then back to launch checklist
Once the dropdown is correct, we resume the pre-launch list from the previous message (security scan, email smoke test, SEO/meta, lint, publish).
