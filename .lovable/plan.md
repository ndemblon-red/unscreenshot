

## Add Percentage Labels to Pie Chart

**What**: Add percentage labels on each pie slice showing the proportion of reminders in that category.

**How**: Use the `label` prop on the recharts `<Pie>` component with a custom render function that calculates and displays the percentage for each slice. Labels will be positioned inside/near each slice using `recharts`' built-in label positioning.

### Changes

**`src/pages/Account.tsx`** (~10 lines added)

1. Add a custom label render function before the `return` block inside the IIFE:
   - Receives `cx`, `cy`, `midAngle`, `innerRadius`, `outerRadius`, `percent` from recharts
   - Calculates x/y position at ~60% between inner and outer radius
   - Renders `<text>` with `{Math.round(percent * 100)}%` in white, 11px font

2. Add `label={renderLabel}` and `labelLine={false}` props to the `<Pie>` component

3. Also append percentage to the legend items next to the count (e.g., "3 · 42%")

