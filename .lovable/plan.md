

# Plan: Landing Page + Route Restructure

## Summary

Build a responsive landing page at `/`, move the app to `/app`, and use the Stripe payment link `https://buy.stripe.com/test_28E3cv9LBbnV8Hw2QjfAc00` as the CTA.

## Steps

### 1. Create `src/pages/Landing.tsx`

- **Full-height hero**: two-column on desktop (text left, placeholder SVG right), stacked on mobile
  - Headline: "You screenshot everything. You action nothing. Let's fix that." (32px mobile, ~48px desktop)
  - Subheadline about email nudges
  - CTA: "Turn my screenshots into reminders" → `https://buy.stripe.com/test_28E3cv9LBbnV8Hw2QjfAc00`
- **Pain statement**: centered paragraph below hero
- **How It Works**: 3 cards, `grid-cols-3` desktop, `grid-cols-1` mobile
- **Bottom CTA** repeating the payment link
- White background, black accent, no nav, no footer links, dry tone

### 2. Update `src/App.tsx`

- `/` → `Landing` (public)
- `/app` → `AuthGuard > Index`
- All other protected routes unchanged

### 3. Update `navigate("/")` → `navigate("/app")` in 6 files

`Auth.tsx`, `Account.tsx`, `Upload.tsx`, `Review.tsx`, `ReminderDetail.tsx`, `ResetPassword.tsx`

### 4. No backend changes

Pure frontend — a payment link and routing update.

