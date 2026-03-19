

# Plan: Add Stats Dashboard to Account Page

Add a simple analytics section to the existing Account page showing reminder statistics pulled from the database.

## What Gets Built

Three stat cards above the "Change password" section:

1. **Total Reminders** — count of all reminders for the user
2. **Completed** — count where status = 'done'
3. **Category Breakdown** — small list showing count per category with colored pills

## Steps

### 1. Update `src/pages/Account.tsx`
- Add a `useEffect` that queries `reminders` table grouped by status and category for the current user
- Render three stat cards in a grid above the password section:
  - Total count and Completed count as large numbers
  - Category breakdown as a list with `getCategoryClasses` pills and counts
- Use existing design tokens (border, rounded-btn, text-card-title) for consistency
- Show skeleton/loading state while data loads

### 2. No database or backend changes needed
- RLS already scopes queries to the authenticated user
- All data is available from the existing `reminders` table

