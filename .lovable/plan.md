# Revised Plan: Landing Page, Route Restructure, and Stripe Integration

## Changes from Previous Plan

- **Mobile support added** — the landing page is now responsive (was desktop-only)
- **Hero visual** — placeholder image sits right of headline on desktop, below on mobile
- **Route changed** — app lives at `/app` instead of `/dashboard`

---

## What Gets Built

### 1. Landing Page (`src/pages/Landing.tsx`)

**Hero (full viewport height, two-column on desktop):**

- Left column: headline, subheadline, CTA button
  - Headline: "You screenshot everything. You action nothing. Let's fix that."
  - Subheadline: "Upload your saved screenshots. Get reminders you'll actually use — and an email nudge before anything expires."
  - CTA: "Turn my screenshots into reminders" → Stripe payment link or `/auth`
- Right column: hero image (placeholder — e.g. `/public/hero-placeholder.svg` or a screenshot mockup). *You'll need to provide the image URL or confirm using a placeholder.*
- On mobile (<768px): stack vertically (text above image), headline drops to 32px

**Pain statement (below hero):**

- "Your camera roll is full of good intentions…" paragraph, centered

**How It Works (3 cards):**

- Desktop: 3 cards in a row (`grid-cols-3`)
- Mobile (<768px): stacked vertically (`grid-cols-1`)
- Cards: step number, title, description

**Second CTA** at bottom repeating the button

**Design:** White background, black accent, no nav bar, no footer links, no buzzwords, dry tone

### 2. Route Restructure (`src/App.tsx`)


| Route             | Component        | Auth    |
| ----------------- | ---------------- | ------- |
| `/`               | `Landing`        | public  |
| `/auth`           | `Auth`           | public  |
| `/app`            | `Index`          | guarded |
| `/upload`         | `Upload`         | guarded |
| `/review`         | `Review`         | guarded |
| `/reminder/:id`   | `ReminderDetail` | guarded |
| `/account`        | `Account`        | guarded |
| `/reset-password` | `ResetPassword`  | public  |


**Update all `navigate("/")` → `navigate("/app")` in 6 files:**

- `Auth.tsx` (post-login redirect)
- `Account.tsx` (back button)
- `Upload.tsx` (back button, cancel)
- `Review.tsx` (back button, after save)
- `ReminderDetail.tsx` (back button, after done/delete, error fallback)
- `ResetPassword.tsx` (after password update)

### 3. Stripe Integration

- Enable Stripe via the Lovable Stripe tool
- Wire CTA on landing page to Stripe checkout
- Implementation details determined after enabling Stripe

## Execution Order

1. Enable Stripe (tool call)
2. Create `Landing.tsx` with responsive layout
3. Update `App.tsx` routes (`/` → Landing, `/app` → Index)
4. Find-and-replace all `navigate("/")` → `navigate("/app")` across 6 files
5. Wire Stripe checkout into CTA

## Open Question

You mentioned "paste image URL" for the hero visual — what image should be used? Options:

- A screenshot/mockup of the app in action