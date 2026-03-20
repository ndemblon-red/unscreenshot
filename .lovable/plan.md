
What’s actually happening

- The landing page is not failing because of the screenshot file itself.
- The real crash you shared is a JavaScript runtime error in `src/pages/Landing.tsx`: `PAYMENT_LINK is not defined`.
- I inspected the current landing page code and the hero image is just a normal static import:
  - `import heroMockup from "@/assets/hero-mockup.png"`
  - `<img src={heroMockup} ... />`
- That means swapping the PNG alone should be safe.

Why it seems tied to replacing the hero image

- Each time the hero asset is replaced, the app rebuilds and reloads the landing page.
- If `Landing.tsx` still has a stale or partially-applied code change anywhere during that rebuild, the landing route crashes immediately, which makes it look like the image caused it.
- The specific error proves the crash came from landing page code, not from the PNG:
  - a bad image would usually cause a failed asset load or broken image display
  - it would not create `ReferenceError: PAYMENT_LINK is not defined`

What I found

- Current `src/pages/Landing.tsx` no longer contains `PAYMENT_LINK`.
- Current codebase search also shows no remaining Stripe/payment-link references in `src`.
- So the likely problem is one of these:
  1. a stale preview/build cache serving an older broken version of `Landing.tsx`
  2. the automated “replace hero image” step previously touched both the asset and the page file, and one of those edits was inconsistent during rebuild
  3. a hot-reload state issue making the landing page temporarily use old code

Important note

- The console warning about “Function components cannot be given refs” is separate and noisy, but it is not the reason the landing page blank-screened.

Plan to make hero replacement reliable

1. Isolate the asset swap
- Treat the screenshot replacement as an asset-only change.
- Do not touch CTA links, imports, or landing page structure in the same edit.

2. Stabilize the landing page reference
- Keep one fixed asset path for the hero image.
- Only replace the image file contents, or use a new file name like `dashboard-hero.png` and update the import once.

3. Verify the landing page code is clean
- Confirm `Landing.tsx` contains:
  - no `PAYMENT_LINK`
  - no Stripe references
  - only `Link to="/auth"` CTAs

4. Re-test after a clean rebuild
- Reload `/` and confirm the route renders with the imported screenshot.
- If it still fails, the next place to inspect is the actual served bundle/cache state, not the PNG.

Technical detail

```text
Current landing page dependency chain:

Landing.tsx
  -> imports hero-mockup.png
  -> renders <img src={heroMockup} />
  -> should not fail from a normal PNG swap

Previous crash:
Landing.tsx
  -> referenced PAYMENT_LINK
  -> ReferenceError at render time
  -> full landing page blank screen
```

Bottom line

- A simple screenshot replacement is not inherently breaking the page.
- The blank screen has been caused by landing page code/hot-reload state around the same time as the image swap, especially the old `PAYMENT_LINK` reference.
- The safest implementation is to replace only the asset and leave `Landing.tsx` untouched except for a one-time stable image import.
