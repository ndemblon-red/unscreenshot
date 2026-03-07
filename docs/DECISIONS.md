# DECISIONS.md — Unscreenshot Desktop

---

## How to use this file
After every significant decision during your build, add an entry. A "significant decision" = choosing between alternatives, changing your original plan, or cutting scope.

---

## Decision Log

### March 2026 — Build a desktop web app, not a second mobile app

**Context:** Unscreenshot already exists as a mobile app. The question was whether a second platform was worth building and what form it should take.

**Options considered:**
- Build nothing — focus only on the mobile app
- Build a React Native or Flutter version that mirrors the mobile app
- Build a desktop web app with a distinct use case

**Decision:** Build a desktop web app targeting the "bulk processing" use case — someone who wants to clear a backlog of screenshots in one sitting.

**Why:** The mobile app serves the reactive use case well (screenshot taken, action it now). The desktop version unlocks a different behaviour: proactive, batch-mode organisation. These two use cases complement each other without cannibalising each other. A web app also builds faster in tools like Lovable than a native app.

**What I'd revisit:** If analytics show that desktop users actually upload one screenshot at a time rather than in bulk, the distinct positioning of this version may need rethinking.

---

### March 2026 — AI pre-fills all three fields (title, category, deadline)

**Context:** The mobile app requires the user to manually enter a title, select a category, and choose a deadline. The question was how much of this the AI should automate in the desktop version.

**Options considered:**
- AI suggests title only — user still picks category and deadline manually
- AI suggests all three fields — user reviews and confirms
- Fully automatic — AI saves the reminder without user review

**Decision:** AI suggests all three fields. User sees a review panel with suggestions pre-filled and can confirm or edit before saving.

**Why:** The review step preserves user trust — they stay in control and can catch mistakes. Fully automatic would be faster but risks wrong suggestions being saved silently, which erodes trust. Suggesting all three fields (not just the title) is where the AI earns its value in this product.

**What I'd revisit:** If edit rates are very low (under 10% of fields are changed), consider offering a "quick confirm all" mode that skips the review panel for users who trust the AI.

---

### March 2026 — Fixed category list, not custom tags

**Context:** Deciding whether users should be able to create their own categories or work from a fixed list.

**Options considered:**
- Fully custom tags — user creates and names their own categories
- Fixed list — app ships with a defined set of categories
- Hybrid — fixed list with an "other" option that lets users add one custom tag

**Decision:** Fixed list of 8 categories: Restaurants, Shopping, To Do, Events, Reading, Home, Travel, Wishlist.

**Why:** A fixed list means the AI can be trained and tested against a known set of outputs. Custom categories would make AI classification unpredictable and harder to evaluate. The fixed list also keeps the UI simpler — filter pills, colour coding, and the review panel selector all work cleanly with a known set. The 8 categories chosen cover the vast majority of real screenshot use cases.

**What I'd revisit:** If users consistently try to create categories outside this list (visible through feedback or support requests), add a "Custom" category as a catch-all in v2.

---

### March 2026 — Images stored permanently until user deletes

**Context:** Deciding how long uploaded screenshot images should be retained after a reminder is created.

**Options considered:**
- Store image only during analysis, discard after reminder is saved (store metadata only)
- Store image for a fixed period (e.g. 30 days), then auto-delete
- Store image permanently until the user explicitly deletes the reminder

**Decision:** Images are stored permanently alongside the reminder until the user deletes it.

**Why:** The image is not just a source of data — it is the reminder. When a user sees a task card for "Buy tickets for Massive Attack," the screenshot of the concert poster is what makes it meaningful and memorable. Removing the image after saving would undermine the core product experience. The title is a short trigger; the image provides the full context.

**What I'd revisit:** If storage costs become significant at scale, introduce an optional "image compression on save" setting. Auto-deletion would only make sense if users explicitly opted in.

---

### March 2026 — No user accounts in v1

**Context:** Deciding whether to require login/authentication from day one.

**Options considered:**
- Full auth from the start — email/password or OAuth (Google, Apple)
- No auth — single shared instance, suitable for personal or demo use
- Local-only — store everything in the browser with no backend

**Decision:** No authentication in v1. All data stored in a single Supabase instance without user accounts.

**Why:** Auth adds significant build complexity and friction for early users. The goal of v1 is to validate that the AI analysis is good enough and that the core flow delivers value. A single-instance app is perfectly usable for personal use or a small test group. Adding auth in v2 is straightforward once the core product is proven.

**What I'd revisit:** The moment the app is shared with more than one person, auth becomes necessary. Add it as the first v2 feature.

---

## Future Decisions
*(Continue logging here as you build. This is where the real learning happens.)*

### [Date] — [Short title]
**Context:**
**Options considered:**
**Decision:**
**Why:**
**What I'd revisit:**
