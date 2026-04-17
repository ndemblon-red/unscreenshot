

## SEO Audit — Unscreenshot Home Page

Here's the audit. I've split it into **what's wrong** and **what to fix**, prioritised.

### Critical issues (fix first)

1. **Default Lovable meta tags still in `index.html`**
   - `<title>Lovable App</title>` — should be branded ("Unscreenshot — Turn screenshots into reminders")
   - `<meta name="description" content="Lovable Generated Project" />` — generic, no keywords
   - `<meta name="author" content="Lovable" />` — wrong author
   - `og:title`, `og:description`, `og:image` all still point to Lovable defaults
   - `twitter:site` is `@Lovable`
   - **Impact:** Search results and social shares will display "Lovable App" instead of your brand. Major visibility loss.

2. **No Open Graph image for your brand**
   - Currently uses Lovable's default image. When someone shares your link on Twitter/LinkedIn/iMessage, they see Lovable branding, not yours.

3. **No canonical URL**
   - Missing `<link rel="canonical" href="..." />` — risks duplicate-content issues if the site is reachable via multiple URLs (custom domain + lovable.app subdomain).

### High-priority issues

4. **No structured data (JSON-LD)**
   - No Schema.org markup. Adding `SoftwareApplication` or `Organization` schema helps Google show rich results.

5. **No `sitemap.xml`**
   - `robots.txt` exists but doesn't reference a sitemap. Search engines have to discover routes themselves.

6. **Missing `lang` precision and theme-color**
   - `<html lang="en">` is fine, but missing `<meta name="theme-color">` for mobile browser chrome.

7. **Client-side rendered content (SPA limitation)**
   - The page is a Vite/React SPA — initial HTML is empty until JS runs. Googlebot handles this OK, but Bing and social scrapers (LinkedIn, Slack) often don't. Static meta tags in `index.html` partially mitigate this; pre-rendering would fully solve it (out of scope for this audit, but worth flagging).

### Medium-priority issues

8. **Hero `<h1>` is good, but image `alt` text is thin**
   - The mockup screenshot images use generic alts like the task title. Decorative mockup images should have meaningful alt text or `alt=""` if purely decorative.

9. **External Unsplash images in mockup**
   - Loaded from `images.unsplash.com` with no `loading="lazy"`. Adds page weight and a third-party dependency. Use `loading="lazy"` at minimum.

10. **No favicon variants**
    - Only `/icon.svg`. Missing `apple-touch-icon`, no `manifest.json` for PWA/Android.

### Low-priority / nice-to-have

11. **No `<meta name="keywords">`** — actually fine, Google ignores it. Skip.
12. **`robots.txt` is permissive** — fine for a marketing site.
13. **No analytics tag** — not strictly SEO, but you'd want Plausible/GA to measure organic traffic.

---

### Proposed fixes (if you want me to implement)

I can fix items 1–6, 8–10 directly in code:

- Rewrite `index.html` `<head>` with proper title, description, OG tags, Twitter card, canonical, theme-color
- Generate a branded OG image (1200×630) and place it in `/public`
- Add JSON-LD `SoftwareApplication` schema
- Create `/public/sitemap.xml` listing `/`, `/pricing`, `/auth`
- Reference sitemap in `robots.txt`
- Add `apple-touch-icon` link and a basic `manifest.json`
- Improve `alt` text and add `loading="lazy"` to mockup images

**Out of scope without bigger changes:** SSR/pre-rendering for full social-scraper support (would require switching off Vite SPA or adding a pre-render step).

---

### What I need from you

- **Tagline for `<title>` and meta description** — I can draft one in your dry tone, or you can supply
- **OG image** — I can hand-design an SVG-to-PNG, or generate one with AI. Your call.
- **Canonical domain** — what's the production URL? (e.g. `unscreenshot.app`?) Needed for canonical + OG URLs + sitemap.

