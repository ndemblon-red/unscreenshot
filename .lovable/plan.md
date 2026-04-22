

## Update beta pill copy

Replace the current beta pill text on the landing page with the shorter, deduped version.

### Change

In `src/pages/Landing.tsx`, update the beta pill span:

- **From:** `Now in beta — free during beta, 30 screenshot reminders per account`
- **To:** `Now in beta — 30 free reminders, no card`

The bold treatment on "Now in beta" stays.

### Also update the matching CTA subtext for consistency

The line below the hero button currently reads: `Free during beta · No credit card · 30 screenshot reminders per account`

To avoid sounding like the same sentence stamped twice, change it to a slight variation:
- **To:** `Free while in beta · 30 reminders included`

### Files

- `src/pages/Landing.tsx` — two small text edits, no structural changes.

