# PLANNING.md — Unscreenshot Desktop

---

## Screens and Navigation

---

### Screen 1: Task List (Home)
**URL path:** `/`

**Elements on this screen:**
- App logo + wordmark "Unscreenshot" — top left
- "Upload Screenshots" button — top right, primary action, always visible
- Tab bar: Next | Done | Archive — below header, full width
- Category filter pills: Everything | Restaurants | Shopping | To Do | Events | Reading | Home | Travel | Wishlist — horizontal scrollable row below tabs
- Sort control: "Sort by date" toggle (newest first / oldest first) — right side above task list
- Task list — scrollable, fills remaining screen
- Each task card contains:
  - Screenshot thumbnail (left side, fixed size)
  - Title (bold, one line)
  - Category tag pill (coloured, matches filter pills)
  - Deadline label with clock icon (e.g. "Next week", "14 June")
  - "Mark as Done" button (Next tab only)
  - Delete icon (all tabs)
- Empty state — when no items exist in current tab/filter: illustration + message + "Upload your first screenshot" CTA

**Does NOT include:**
- No search bar
- No user account / profile / avatar
- No settings panel
- No notifications or badges
- No drag and drop handles
- No bulk select or bulk actions
- No dark mode toggle

**Navigation:**
- Clicking "Upload Screenshots" opens the Upload flow (Screen 2)
- Clicking a task card opens the Reminder Detail view (Screen 3)
- Clicking delete icon triggers the Delete Confirmation overlay (Screen 5)
- Tabs switch between Next / Done / Archive views in place
- Category pills and sort filter update the list in place

---

### Screen 2: Upload Flow
**URL path:** `/upload` (or modal overlay on `/`)

**Elements on this screen:**
- Full-screen overlay or dedicated page
- Large drag-and-drop zone: "Drop screenshots here or click to browse"
- File picker support (click to open OS file browser)
- Accepted file types note: "JPG, PNG, WEBP — max 10MB each"
- Thumbnail grid: shows selected images queued for upload
- Remove button (×) on each thumbnail to deselect before submitting
- "Analyse Screenshots" CTA button — disabled until at least 1 image selected
- Cancel / back link — returns to Task List without saving

**Does NOT include:**
- No camera capture
- No URL or cloud import
- No Google Photos connection
- No folder watching or auto-import

**Navigation:**
- Submitting triggers AI analysis — transitions to Review Panel (Screen 3 in bulk mode)
- Cancel returns to Task List (Screen 1)

---

### Screen 3: Review Panel
**URL path:** `/review`

**Elements on this screen:**
- Header: "Review your screenshots" + count (e.g. "3 of 5")
- Progress indicator — shows how many reviewed vs remaining
- Large screenshot preview — centre or left panel
- AI suggestion fields (all editable):
  - Title text input — pre-filled by AI
  - Category selector — pill/toggle group, one selected by AI: Restaurants | Shopping | To Do | Events | Reading | Home | Travel | Wishlist
  - Deadline selector — options: Tomorrow | Next Week | Next Month | Custom date
- "Save Reminder" button — primary CTA
- "Discard" button — skips this screenshot, moves to next
- Previous / Next navigation if multiple screenshots in queue

**Does NOT include:**
- No ability to re-upload or replace the image at this step
- No notes or description field
- No priority levels
- No assignee or sharing options

**Navigation:**
- "Save Reminder" saves item to database, advances to next screenshot in queue
- After final screenshot is reviewed, returns to Task List (Screen 1)
- "Discard" advances without saving
- Cancel returns to Task List, unsaved items are lost (no confirmation needed — nothing has been saved yet)

---

### Screen 4: Reminder Detail
**URL path:** `/reminder/:id`

**Elements on this screen:**
- Back arrow — returns to Task List
- Full-size screenshot image — prominent, top of screen or left panel
- Title (large, editable inline)
- Category tag pill (editable — click to change)
- Deadline (editable — click to change)
- "Mark as Done" button (if status = Next)
- "Delete Reminder" button — triggers confirmation overlay
- Created date — small muted text

**Does NOT include:**
- No comments or notes field
- No activity log
- No sharing options
- No related reminders

**Navigation:**
- Back arrow returns to Task List
- "Mark as Done" updates status, returns to Task List
- "Delete Reminder" triggers Delete Confirmation overlay (Screen 5)

---

### Screen 5: Delete Confirmation (Overlay)
**URL path:** Overlay on current screen

**Elements on this screen:**
- Modal overlay with backdrop
- Title: "Delete this reminder?"
- Body text: "This can't be undone."
- Thumbnail of the screenshot being deleted — so user knows what they're deleting
- "Delete" button — destructive, red
- "Cancel" button — dismisses overlay, no action taken

**Does NOT include:**
- No "move to archive" alternative
- No undo option after deletion

**Navigation:**
- "Delete" removes item, closes overlay, returns to Task List
- "Cancel" closes overlay, stays on current screen

---

### Overlay State: Loading / Processing
**Triggered:** After "Analyse Screenshots" is clicked, while AI processes each image

**Elements:**
- Per-image progress indicator in the thumbnail grid
- Status label: "Analysing..." per image
- Spinner or animated progress bar
- "Please wait" message — discourage navigation away
- Overall progress: "Analysing 2 of 5..."

---

### Overlay State: Error
**Triggered:** Network failure, unreadable file, or API error

**Elements:**
- Inline error per failed image: "We couldn't analyse this screenshot"
- Two options per failed item: "Try again" | "Add details manually"
- "Add details manually" opens the Review Panel pre-filled with empty fields
- Non-failed images in the batch are unaffected and continue to Review Panel

---

## System Prompt Structure

The following is the system prompt used when the app sends a screenshot image to the AI API.

```
You are a personal task assistant that reads screenshots and turns them into short, actionable reminders.

Your job is to look at an image and return exactly three things:
1. A title — a short action trigger (under 8 words) that tells the user what to do
2. A category — one of: Restaurants, Shopping, To Do, Events, Reading, Home, Travel, Wishlist
3. A deadline — one of: Tomorrow, Next Week, Next Month, or a specific date string (YYYY-MM-DD) if a date is visible in the image

TITLE RULES:
- Always start with a verb (Buy, Try, Book, Read, Watch, Visit, Check, etc.)
- Be specific — include names, places, or products if visible
- Under 8 words
- The image will be shown alongside the title, so you don't need to describe everything — just trigger the action
- Never use rude, lewd, suggestive, or alarming language
- Never use technical labels like "OCR_FAIL", "UNKNOWN", or "ERROR"
- If you cannot determine intent, use "Review this item"

CATEGORY RULES:
- Choose exactly one category
- Restaurants: any food, drink, or dining recommendation
- Shopping: any product, item, or thing to buy
- Events: concerts, shows, exhibitions, sports — anything with a date
- Reading: articles, books, newsletters, blog posts
- Home: anything related to home improvement, décor, or household tasks
- Travel: trips, flights, hotels, destinations, or travel inspiration
- Wishlist: things to save for later that aren't an immediate purchase
- To Do: anything that doesn't fit the above

DEADLINE RULES:
- If a specific date is visible in the image and it's in the future, use it (YYYY-MM-DD format)
- If the image suggests urgency (e.g. "limited time", "selling fast"), use Tomorrow or Next Week
- If no urgency signal is present, default to Next Week
- Never return a date in the past

SAFETY:
- If the image contains sensitive, adult, or unreadable content, return: title = "Review this item", category = "To Do", deadline = "Next Week"
- Always return all three fields — never return null or empty values

OUTPUT FORMAT:
Return only valid JSON. No explanation, no markdown, no extra text.

{
  "title": "string",
  "category": "Restaurants | Shopping | To Do | Events | Reading | Home | Travel | Wishlist",
  "deadline": "Tomorrow | Next Week | Next Month | YYYY-MM-DD"
}

EXAMPLES:

Input: [Concert poster for Massive Attack at Brixton Academy, Saturday 14 June]
Output: {"title": "Buy tickets for Massive Attack", "category": "Events", "deadline": "2025-06-07"}

Input: [Screenshot of Nike Air Max trainers on a shopping website]
Output: {"title": "Buy Nike Air Max trainers", "category": "Shopping", "deadline": "Next Week"}

Input: [WhatsApp message: "You have to try Bancone in Covent Garden, best pasta in London"]
Output: {"title": "Try Bancone in Covent Garden", "category": "Restaurants", "deadline": "Next Month"}

Input: [Blurry unreadable image]
Output: {"title": "Review this item", "category": "To Do", "deadline": "Next Week"}
```

---

## Design Direction

**Feel:** Clean utility — lots of whitespace, functional over decorative, calm and organised. Matches the existing Unscreenshot mobile app. Think Apple Reminders meets Linear — structured but not cold.

**Colors:**

| Role | Hex | Usage |
|---|---|---|
| Background | `#F5F5F7` | Page and card backgrounds |
| Surface | `#FFFFFF` | Cards, panels, modals |
| Text primary | `#1D1D1F` | Headings, titles |
| Text muted | `#6E6E73` | Deadlines, metadata, labels |
| Accent | `#000000` | Primary buttons, active tabs |
| Border | `#E5E5EA` | Card borders, dividers |
| Error | `#FF3B30` | Delete button, error states |
| Tag: Events | `#5856D6` | Purple — Events category pill |
| Tag: Shopping | `#FF9500` | Orange — Shopping category pill |
| Tag: Restaurants | `#34C759` | Green — Restaurants category pill |
| Tag: To Do | `#007AFF` | Blue — To Do category pill |
| Tag: Reading | `#AF52DE` | Lilac — Reading category pill |
| Tag: Home | `#FF6B35` | Coral — Home category pill |
| Tag: Travel | `#32ADE6` | Sky blue — Travel category pill |
| Tag: Wishlist | `#FF2D55` | Pink — Wishlist category pill |

**Typography:**
- Font family: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif`
- Body: 15px / 1.5 line height
- Headings: 24px bold (page titles), 17px semibold (card titles)
- Labels/metadata: 13px / muted colour
- Category pills: 12px semibold, uppercase tracking

**Spacing:**
- Page padding: 32px horizontal, 24px vertical
- Card padding: 16px
- Gap between cards: 12px
- Gap between elements within a card: 8px
- Border radius: 12px (cards), 20px (pills), 8px (buttons)

**Reference apps:** Apple Reminders, Linear, Notion (but simpler)

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast to build, works well in Lovable, component-based |
| Styling | Tailwind CSS | Utility-first, fast to iterate, consistent spacing |
| Database | Supabase | Simple hosted Postgres, built-in file storage for images, no backend needed |
| Image storage | Supabase Storage | Images stored alongside reminder data, easy to retrieve |
| AI / API | Anthropic Claude API (claude-sonnet-4-20250514) | Strong vision capabilities, reliable JSON output, cost-effective |
| Hosting | Lovable built-in / Vercel | Zero-config deployment |

---

## Data Flow

1. User selects image files in the Upload screen
2. Images are held in browser memory — not yet uploaded to storage
3. User clicks "Analyse Screenshots"
4. Each image is sent as base64 to the Anthropic API with the system prompt
5. API returns JSON: `{ title, category, deadline }` for each image
6. Review Panel displays AI suggestions — user edits or confirms
7. On "Save Reminder": image is uploaded to Supabase Storage, reminder record is written to Supabase database with fields: `id, title, category, deadline, image_url, status (next/done/archive), created_at`
8. On "Discard": image is dropped from memory, no data is written anywhere
9. On "Delete Reminder": image is deleted from Supabase Storage, reminder record is deleted from database
10. Archive tab is populated by a query filtering reminders where `deadline < today AND status = 'next'` — these are auto-moved to archive on load
11. No user authentication in v1 — all data is stored in a single shared instance (suitable for personal/demo use)

**Privacy note:** Images are only uploaded to storage when a reminder is explicitly saved. Discarded images never leave the browser.
