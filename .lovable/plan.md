

## Simple App Icon for Unscreenshot

Inspired by iOS Reminders' clean aesthetic — a bold, recognizable shape on a colored background that works at all sizes (favicon, header, PWA icon).

### Concept

A rounded square with the primary color as background, containing a minimal white icon that combines a "screenshot" frame (corner brackets) with a checkmark or bell — conveying "screenshots turned into actions." Think iOS system app quality: flat color, single glyph, no text.

### Deliverables

1. **Create `public/icon.svg`** — a clean vector icon (rounded rect + glyph), using the app's primary blue or the events purple as the fill
2. **Update `index.html`** — replace the default favicon with the new icon
3. **Delete `public/favicon.ico`** if present, so browsers don't override
4. **Update the Landing page header** — optionally display the icon mark next to "Unscreenshot"

### Technical details

- Hand-coded SVG (no AI generation needed — cleaner results for geometric icons)
- Viewbox: 512×512 for crisp rendering at all sizes
- Single-color glyph on solid background — scales down to 16×16 favicon cleanly
- Two concept options to choose from: screenshot-frame + checkmark, or screenshot-frame + bell

