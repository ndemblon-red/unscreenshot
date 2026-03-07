# PRD.md — Unscreenshot Desktop (v2)

---

### 1. The Problem Worth Solving

**Who this is for:** Someone who habitually screenshots everything — a restaurant recommendation, a concert poster, a product they want to buy — and then never actions any of it. Their camera roll is a graveyard of good intentions. They're not disorganised people; they're just missing the tool that closes the loop.

**The pain:** The screenshots pile up silently. There's no reminder, no deadline, no nudge. The concert sells out. The restaurant recommendation gets forgotten. The thing they meant to buy goes out of stock. Every ignored screenshot is a small broken promise to themselves.

**What "better" looks like:** They sit down for 10 minutes, upload their screenshot backlog, and walk away with a clean task list they actually trust. The clutter is gone. The actions are captured. They feel in control.

---

### 2. The User Flow

1. User opens the app in their browser
2. User sees their task list (empty state on first visit)
3. User clicks "Upload Screenshots" and selects one or more image files
4. **[AI MOMENT]** AI analyses each screenshot
   - Input: image file
   - Output: suggested title, category, and deadline for each screenshot
   - Quality bar: suggestions should be specific enough that the user can confirm without editing in most cases
5. User sees a review panel for each screenshot — AI suggestions pre-filled, editable
6. User confirms, edits, or discards each item
7. Confirmed items appear in the task list under the "Next" tab
8. User can mark items as Done (moves to Done tab)
9. Items whose deadline has passed without being marked Done automatically move to Archive tab
10. User can filter the task list by category tag
11. User can sort the task list by date
12. User can delete any reminder (confirmation required before deletion)

---

### 3. Defining Output Quality

#### What the AI must always do:
- Generate a title that is a short, specific action trigger — under 8 words (e.g. "Buy tickets for Coldplay at O2" not "Concert")
- Select the single most appropriate category from the fixed list (Restaurants, Shopping, To Do, Events, Reading)
- Suggest a deadline that reflects urgency visible in the image (e.g. if a date is visible, use it)
- Default to "Next Week" when no urgency signals are present
- Trust that the image will provide context — the title is a trigger, not a full description

#### What the AI must never do:
- Generate titles that are rude, lewd, suggestive, or alarming
- Invent details not present or inferable from the image
- Assign multiple categories to a single item
- Return an empty or null title under any circumstances
- Use technical jargon or internal labels in the title (e.g. "OCR_FAIL" or "UNKNOWN_INTENT")

---

#### Detailed examples:

**Scenario 1 — Concert poster screenshot**

User input: Screenshot of a poster for "Massive Attack at Brixton Academy, Saturday 14 June"

✅ GREAT output:
- Title: "Buy tickets for Massive Attack"
- Category: Events
- Deadline: Custom — 14 June (or 1 week before if that date is far away)

Why it's great: Short action trigger — the image shows the venue and details so the title doesn't need to. Category is correct. Deadline is intelligent — read the date from the image.

❌ BAD output:
- Title: "Concert thing"
- Category: To Do
- Deadline: Next Month

Why it's bad: Vague and unhelpful even as a trigger. Wrong category. Deadline ignores the visible date on the poster.

---

**Scenario 2 — Product screenshot from an online shop**

User input: Screenshot of a pair of trainers from a shopping website, no visible deadline

✅ GREAT output:
- Title: "Buy Nike Air Max trainers"
- Category: Shopping
- Deadline: Next Week

Why it's great: Specific product name from the image. Correct category. Sensible default deadline since no urgency signal was present.

❌ BAD output:
- Title: "Image of shoes"
- Category: To Do
- Deadline: Next Month

Why it's bad: Describes the image rather than the action. Wrong category. Deadline feels arbitrary.

---

**Scenario 3 — Screenshot of a restaurant recommendation from a message thread**

User input: Screenshot of a WhatsApp message that says "You have to try Bancone in Covent Garden, best pasta in London"

✅ GREAT output:
- Title: "Try Bancone in Covent Garden"
- Category: Restaurants
- Deadline: Next Month

Why it's great: Pulls the specific restaurant name and location. Correct category. Relaxed deadline is appropriate — no urgency signal present.

❌ BAD output:
- Title: "WhatsApp message"
- Category: To Do
- Deadline: Tomorrow

Why it's bad: Describes the medium, not the action. Wrong category. Urgent deadline is inappropriate for a casual recommendation.

---

#### Edge case handling:

**Edge case 1 — Screenshot with no readable text (e.g. a blurry photo or abstract image)**
The AI should still attempt a title based on visual content (e.g. "Follow up on this item") and default to category "To Do" and deadline "Next Week." It should never crash or return blank fields. The user can edit freely.

**Edge case 2 — Screenshot contains sensitive or adult content**
The AI should return a neutral, safe title such as "Review this item" with category "To Do" and deadline "Next Week." It must not describe the content explicitly.

---

### 4. System Type and Architecture

- **System type:** Prompt + structured output (image in, JSON out with title/category/deadline fields)
- **What the system prompt must cover:**
  - Role: helpful personal task assistant that reads screenshots and turns them into short action triggers
  - Tone: practical, concise, never flowery
  - Hard constraints: safe titles only, always return all three fields, action-oriented language, titles under 8 words
  - Output format: strict JSON with three fields — title (string), category (enum), deadline (enum or date string)
  - Few-shot examples: include Scenario 1, 2, and 3 from above
  - Safety fallback: if uncertain, return safe defaults rather than guessing wildly
- **What the system does NOT need:**
  - No RAG
  - No memory between sessions
  - No user account personalisation in v1
  - No web search or link extraction

---

### 5. Constraints

| Constraint | Target | Why |
|---|---|---|
| Latency per screenshot | Under 8 seconds | Bulk sessions mean waits compound — slow analysis kills the flow |
| Cost per screenshot | Under $0.05 | Users may upload 20+ at once; costs must stay manageable |
| Input image size | Max 10MB per file | Covers all typical screenshot sizes without server strain |
| Output title length | Under 8 words | Short action trigger — the image provides the context |
| Image storage | Stored until user deletes the reminder | The image is core to the reminder — it jogs memory at action time |
| Privacy | Images stored securely, never shared or used for training | Screenshots may contain personal messages, addresses, private content |

---

### 6. Assumptions → Tests

| Assumption | Risk if wrong | How to test |
|---|---|---|
| Users will upload multiple screenshots in one session | App feels underwhelming if only used one at a time | Watch first 10 users — count average screenshots per session |
| AI can correctly identify category from image alone | Wrong categories erode trust quickly | Run all 17 test cases in Section 8, measure category accuracy |
| Users will confirm AI suggestions without heavy editing | If they edit everything, the AI adds no value | Track edit rate per field across first 50 uploads |
| "Next Week" is an acceptable default when no deadline is detectable | Users feel deadline is wrong and lose trust | Survey 5 users after first session — ask if deadlines felt right |
| The image provides enough context that short titles are sufficient | Users feel titles are too vague without seeing the image | Watch whether users consistently expand titles during the review step |

---

### 7. MVP Scope

**Building in v1:**
- Upload one or multiple screenshots at once
- AI analysis per screenshot — suggests title, category, deadline
- Review panel — user confirms, edits, or discards each suggestion
- Task list with Next / Done / Archive tabs
- Filter task list by category
- Sort task list by date
- Delete reminder with confirmation dialog

**NOT building in v1:**
- User accounts or login — adds friction, not needed to prove value
- Google Photos integration — powerful but complex, save for v2
- Auto-detection of screenshots in a folder — file system access adds complexity
- Mobile responsive layout — this is explicitly the desktop version
- Push or email reminders — notification infrastructure is a separate system
- Recurring reminders — over-complicates the deadline model
- Sharing tasks with others — this is a personal tool
- Search within task list — nice to have, not essential at this scale
- Drag and drop reordering — unnecessary before users have enough items to reorder
- Custom categories — fixed list is simpler and forces consistent AI output
- Bulk actions (mark all done) — premature at MVP stage
- Dark mode — polish feature, not a day-one need
- Undo after delete — confirmation dialog is sufficient safety net in v1

---

### 8. Test Set v1

**Must-pass cases:**

| # | Input description | What great looks like |
|---|---|---|
| 1 | Concert poster with visible date and venue | Short action title, category = Events, deadline reflects event date |
| 2 | Product screenshot from a shopping website | Product name in title, category = Shopping, deadline = Next Week |
| 3 | WhatsApp/iMessage screenshot recommending a restaurant | Restaurant name in title, category = Restaurants, deadline = Next Month |
| 4 | Screenshot of an article or blog post to read later | Title starts with "Read...", category = Reading, deadline = Next Week |
| 5 | Screenshot of a to-do note or reminder someone wrote to themselves | Title mirrors the intent, category = To Do, deadline = Tomorrow or Next Week |
| 6 | Multiple screenshots uploaded at once (5 images) | All 5 return suggestions, none are blank, review panel shows all 5 |
| 7 | User edits AI suggestion before confirming | Edited version saves correctly, appears in Next tab with user's version |

**Edge cases:**

| # | Input description | Expected behaviour |
|---|---|---|
| 1 | Blurry or unreadable screenshot | Safe default returned: generic title, To Do, Next Week — never crashes |
| 2 | Screenshot of a map or location pin | Title = "Visit [place name if readable]", category = To Do or Restaurants |
| 3 | Screenshot with a past date (event already happened) | Defaults to Next Week rather than suggesting a deadline in the past |
| 4 | Very large batch upload (15+ screenshots) | All process without error, UI handles queue gracefully |
| 5 | Screenshot containing personal/sensitive info (e.g. a bank statement) | Safe neutral title returned, no sensitive data appears in the task card |

**Must-fail-safely cases:**

| # | Input description | What safe failure looks like |
|---|---|---|
| 1 | Non-image file uploaded (e.g. a PDF or .txt file) | Clear error message: "Please upload image files only" — no crash |
| 2 | Image that could be interpreted as adult content | Neutral safe title returned ("Review this item"), no explicit description |
| 3 | Completely blank white image | Returns safe defaults, does not hang or return null fields |
| 4 | Network failure mid-analysis | Friendly error state with retry button, no data lost |
| 5 | Corrupted or unreadable image file | Item flagged as unprocessable with option to manually enter title |

---

### 9. Observability

**What to log:**

| What to log | Why |
|---|---|
| Image dimensions and file size | Understand what types of screenshots users actually upload |
| AI-suggested title, category, deadline | Baseline for measuring suggestion quality |
| Whether user edited each field (yes/no) | Measures AI accuracy without needing explicit ratings |
| Which field was edited (title / category / deadline) | Identifies which field the AI gets wrong most often |
| Time from upload to confirmation | Measures whether the review flow is fast enough |
| Items discarded without confirming | High discard rate = AI suggestions not trustworthy |
| Items deleted after saving | Understand whether users are changing their minds post-save |
| Errors (type, frequency) | Catch systemic failures early |
| Total screenshots per session | Validates the bulk-upload use case assumption |

**Alerts to set up:**
1. Average analysis latency > 8 seconds — investigate API performance
2. Field edit rate > 50% on any single field — AI prompt needs tuning
3. Discard rate > 30% — suggestions are not good enough, review prompt
4. Error rate > 5% of uploads in any 1-hour window — something is broken
