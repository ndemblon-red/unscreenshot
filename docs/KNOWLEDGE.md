# KNOWLEDGE.md — Unscreenshot Desktop

---

## Product Summary
Unscreenshot Desktop is a web app that clears screenshot backlogs. Users upload screenshots, AI suggests a title, category, and deadline for each, and the user confirms or edits before saving. Items live in a task list with Next, Done, and Archive tabs. The emotional job: chaos cleared, nothing forgotten.

---

## Tech Stack
- Frontend: React + Vite
- Styling: Tailwind CSS
- Database + Storage: Supabase (Postgres + file storage)
- AI: Anthropic Claude API — `claude-sonnet-4-20250514`
- Hosting: Lovable / Vercel

---

## Core User Flow
1. User clicks "Upload Screenshots" and selects image files
2. App sends each image to Claude API — returns title, category, deadline as JSON
3. Review Panel shows AI suggestions — user edits or confirms each one
4. Confirmed items saved to Supabase, appear in Next tab on Task List
5. User marks items Done or lets them expire to Archive

---

## Design Rules
- Background: `#F5F5F7` — Surface/cards: `#FFFFFF`
- Text: `#1D1D1F` — Muted: `#6E6E73` — Accent/buttons: `#000000`
- Border: `#E5E5EA` — Error/delete: `#FF3B30`
- Category pill colours: Events `#5856D6` · Shopping `#FF9500` · Restaurants `#34C759` · To Do `#007AFF` · Reading `#AF52DE` · Home `#FF6B35` · Travel `#32ADE6` · Wishlist `#FF2D55`
- Font: `system-ui, "SF Pro Display", "Helvetica Neue", sans-serif`
- Body 15px · Card titles 17px semibold · Page titles 24px bold · Labels 13px muted
- Card padding 16px · Gap between cards 12px · Border radius: cards 12px, pills 20px, buttons 8px
- Feel: clean utility — Apple Reminders meets Linear — calm, functional

---

## Product AI Rules
The AI always:
- Returns a short action-trigger title under 8 words starting with a verb
- Selects exactly one category from the fixed list of 8
- Uses a date visible in the image if one exists and it's in the future
- Defaults to Next Week when no urgency signal is present
- Returns safe defaults (title: "Review this item", category: To Do, deadline: Next Week) when uncertain

The AI never:
- Returns a rude, lewd, suggestive, or alarming title
- Invents details not present in the image
- Returns null or empty fields
- Uses technical error labels in the title (e.g. OCR_FAIL, UNKNOWN)
- Suggests a deadline in the past

---

## Coding Rules
Always:
- Show a loading state for every async action (upload, analyse, save, delete)
- Show a user-friendly error message for every failure — no raw error text
- Require confirmation before deleting (show thumbnail in dialog)
- Use category pill colours exactly as specified — consistent everywhere
- Store images in Supabase Storage, reminder data in Supabase database
- Parse AI response as strict JSON — handle missing fields gracefully

Never:
- Add features not in PLANNING.md or PRD.md
- Make the app mobile responsive — desktop only
- Add user authentication or accounts in v1
- Use localStorage or sessionStorage for reminder data
- Skip the delete confirmation dialog

---

## Before Every Milestone
Re-read TASKS.md, PLANNING.md, and PRD.md before starting. Use current doc versions — not memory. All docs are in `/docs`.
