

# Plan: Replace Stripe CTA with Auth Redirect

## What Changes

The CTA buttons on the landing page currently link to a Stripe payment URL. Since you can't log in through that flow yet, we'll change both CTAs to navigate to `/auth` instead — keeping the same button text.

## Steps

### 1. Update `src/pages/Landing.tsx`

- Remove the `PAYMENT_LINK` constant
- Change both `<a href={PAYMENT_LINK}>` elements to `<a href="/auth">` (or use `react-router-dom`'s `Link` component for client-side navigation)
- No other changes to layout, copy, or styling

That's it — one file, two link swaps.

