

## Milestone 5: Upload Resilience Polish

Code-only changes to `src/pages/Upload.tsx` — no manual testing, no backend changes.

### Changes

1. **Loading state on "Analyse Screenshots" button** — Add `compressing` state, show spinner and "Compressing…" text while files are being processed

2. **`Promise.allSettled` instead of `Promise.all`** — Handle per-file compression failures gracefully so one corrupted image doesn't block the batch

3. **Toast feedback for failures** — If any files fail compression, show a toast with the count. If all fail, stay on the page with an error message instead of navigating to `/review`

4. **Memory cleanup in `compressImage`** — Call `URL.revokeObjectURL` after the image loads to prevent leaks

### What's deliberately skipped

- Manual edge-case testing (blurry, blank, past-date, sensitive images) — deferred until test images are available
- Visual/spacing audit — can be done separately

