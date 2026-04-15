

## Pricing Page and Payment Flow

Add a dedicated `/pricing` page and integrate it into the existing navigation, with support for discount codes instead of a free tier.

### Approach

1. **Pricing link in Landing page header** — Add "Pricing" next to "Sign in" in the header nav
2. **New `/pricing` page** — Clean, minimal page showing a single paid plan with placeholder pricing. Includes a discount code input field that unlocks a discount (or full free access). Matches the existing design language.
3. **Bottom CTA on Landing** — Add a "View pricing" secondary link near the existing CTA
4. **Route setup** — Add `/pricing` to App.tsx (public, no auth guard)

### Pricing page structure

- Header with logo + nav (same as landing)
- Single plan card (price TBD — placeholder like "$X/mo")
- Feature list (upload screenshots, AI analysis, deadline notifications, etc.)
- Discount code input with "Apply" button — validates against a stored code
- CTA button → links to `/auth` for signup
- Footer (same as landing)

### Discount code backend (later step)

For now, the page will be **UI only** with placeholder pricing and a non-functional discount code field. When you're ready to set prices and enable payments, we'll:
- Set up a payment provider (Paddle or Stripe)
- Create a `discount_codes` table to validate codes
- Wire up the checkout flow

### Technical details

- New file: `src/pages/Pricing.tsx`
- Edit: `src/App.tsx` (add route)
- Edit: `src/pages/Landing.tsx` (add "Pricing" link to header + footer)
- Edit: `src/pages/Auth.tsx` (add "Pricing" link to header if appropriate)

