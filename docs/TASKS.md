# TASKS.md — Unscreenshot Desktop

---

## Milestone 1: AI Core — Screenshot Analysis
**Goal:** Prove the AI can take a screenshot image and return a valid title, category, and deadline before building any UI around it.
**Test:** Upload 3 different screenshots (a concert poster, a product, a restaurant recommendation) via a simple test harness or console. Verify each returns valid JSON with all three fields populated, no nulls, no crashes.

- [ ] Set up project in Lovable (React + Vite + Tailwind)
- [ ] Add Anthropic API key to environment variables
- [ ] Write the system prompt exactly as specified in PLANNING.md
- [ ] Build a minimal API call function: takes an image file, converts to base64, sends to Claude API with system prompt, returns parsed JSON
- [ ] Test with 5 images from PRD Section 8 must-pass cases — log results to console
- [ ] Confirm safe fallback: test with a blank image and a blurry image — verify safe defaults are returned
- [ ] Confirm JSON always contains title, category, and deadline — add error handling if any field is missing

---

## Milestone 2: Static UI — All Screens Built
**Goal:** Every screen exists with the correct layout, elements, and design applied — no functionality yet, just the shell.
**Test:** Click through every screen manually. Every element listed in PLANNING.md should be visible. Nothing should be missing or invented.

- [ ] Apply design tokens: colours, typography, spacing, border radius as specified in PLANNING.md
- [ ] Build Task List screen (Screen 1): header, upload button, tab bar (Next/Done/Archive), category filter pills (all 8 + Everything), sort control, empty state
- [ ] Build task card component: thumbnail, title, category pill (correct colour per tag), deadline with clock icon, mark as done button, delete icon
- [ ] Build Upload screen (Screen 2): drag and drop zone, file picker, thumbnail grid with remove buttons, Analyse button, cancel link
- [ ] Build Review Panel screen (Screen 3): screenshot preview, title input, category selector (all 8 categories), deadline selector (Tomorrow/Next Week/Next Month/Custom), Save and Discard buttons, progress indicator
- [ ] Build Reminder Detail screen (Screen 4): full image, editable title, editable category, editable deadline, mark as done button, delete button, created date
- [ ] Build Delete Confirmation overlay (Screen 5): modal with screenshot thumbnail, Delete and Cancel buttons
- [ ] Build Loading overlay state: per-image spinner, "Analysing X of Y" progress message
- [ ] Build Error state: inline error per failed image, Try Again and Add Manually options
- [ ] Verify all category pill colours match PLANNING.md colour tokens
- [ ] Verify "Does NOT include" items from PLANNING.md are absent from every screen

---

## Milestone 3: Upload and Review Flow
**Goal:** A user can upload screenshots, the AI analyses them, and the review panel shows the AI suggestions ready to confirm or edit.
**Test:** Upload 3 screenshots. Loading state appears. Review panel opens showing AI-suggested title, category, and deadline for the first image. Edit one field. Click Save. See the item appear in the Next tab on the Task List.

- [ ] Wire up file picker and drag-and-drop to accept JPG, PNG, WEBP up to 10MB
- [ ] Show selected image thumbnails in the upload grid with working remove (×) buttons
- [ ] Disable "Analyse Screenshots" button until at least 1 image is selected
- [ ] On submit: show loading overlay, send each image to AI analysis function from Milestone 1
- [ ] Handle batch processing: analyse images sequentially, update progress indicator per image
- [ ] On completion: navigate to Review Panel with first image and AI suggestions pre-filled
- [ ] Title field is editable, pre-filled with AI suggestion
- [ ] Category selector shows all 8 categories, AI suggestion pre-selected
- [ ] Deadline selector shows Tomorrow / Next Week / Next Month / Custom date picker, AI suggestion pre-selected
- [ ] "Save Reminder" writes reminder to Supabase database + uploads image to Supabase Storage
- [ ] "Discard" skips without saving, advances to next screenshot
- [ ] After final screenshot reviewed: navigate back to Task List
- [ ] Non-image file upload shows clear error: "Please upload image files only"
- [ ] Network/API error shows inline retry option

---

## Milestone 4: Task List — View, Filter, Sort and Status
**Goal:** Saved reminders appear in the task list and the user can filter, sort, change status, and navigate to detail.
**Test:** Save 5 reminders across different categories. Filter by one category — only matching items show. Sort by date newest/oldest — order changes correctly. Mark one as Done — it moves to the Done tab. Check Archive tab shows items whose deadline has passed.

- [ ] Fetch and display all reminders from Supabase on Task List load
- [ ] Display reminders in the correct tab based on status (next/done/archive)
- [ ] Auto-move reminders to Archive where deadline < today and status = next (query-based, on load)
- [ ] Category filter pills filter the list in place — "Everything" shows all
- [ ] Sort by date toggle: newest first / oldest first — updates list order in place
- [ ] "Mark as Done" button on task card updates status in Supabase, moves card to Done tab
- [ ] Clicking a task card navigates to Reminder Detail screen (Screen 4)
- [ ] Reminder Detail: display full image, title, category, deadline, created date
- [ ] Reminder Detail: inline editing of title, category, and deadline — saves to Supabase on change
- [ ] Empty state displays correctly when a tab or filter has no results
- [ ] Delete icon on task card triggers Delete Confirmation overlay
- [ ] Delete Confirmation: shows screenshot thumbnail, confirm deletes from Supabase DB and Storage, cancel dismisses

---

## Milestone 5: Polish and Edge Cases
**Goal:** The app handles every weird input gracefully, feels smooth, and matches the design spec precisely.
**Test:** Work through every edge case and must-fail-safely case from PRD Section 8. Every one should behave as specified. The app should feel calm and considered at every step.

- [ ] Test and fix: blurry/unreadable image — safe defaults returned, no crash
- [ ] Test and fix: blank white image — safe defaults, no hang
- [ ] Test and fix: corrupted file — flagged as unprocessable, manual entry option shown
- [ ] Test and fix: screenshot with a past date — deadline defaults to Next Week, not a past date
- [ ] Test and fix: batch of 15+ screenshots — all process, UI queue handles gracefully
- [ ] Test and fix: screenshot with sensitive/personal content — safe neutral title returned
- [ ] Add confirmation behaviour: delete confirmation overlay works on both task card and detail screen
- [ ] Loading states: every async action (upload, analyse, save, delete) has a visible loading indicator
- [ ] Error states: every failure mode has a user-facing message — no silent failures, no raw error text shown to user
- [ ] Spacing, typography, and colour audit — compare every screen against PLANNING.md design spec
- [ ] Category pill colours consistent everywhere: task list, review panel, detail screen, filter bar
- [ ] Verify "Does NOT include" items are absent from every screen (final check)

---

## Milestone 6: Test Set Validation
**Goal:** Every test case from PRD Section 8 passes. The product is ready to share.
**Test:** Run through all 17 test cases from PRD Section 8 manually — 7 must-pass, 5 edge cases, 5 must-fail-safely. Document results. Fix any failures before calling this done.

- [ ] Run must-pass case 1: concert poster — verify Events category, correct deadline from image date
- [ ] Run must-pass case 2: product screenshot — verify Shopping category, Next Week deadline
- [ ] Run must-pass case 3: restaurant recommendation — verify Restaurants category, Next Month deadline
- [ ] Run must-pass case 4: article/blog post — verify Reading category, title starts with "Read"
- [ ] Run must-pass case 5: to-do note — verify To Do category, Tomorrow or Next Week deadline
- [ ] Run must-pass case 6: 5 screenshots uploaded at once — verify all 5 return suggestions, none blank
- [ ] Run must-pass case 7: user edits AI suggestion — verify edited version saves correctly
- [ ] Run edge case 1: blurry image — verify safe defaults, no crash
- [ ] Run edge case 2: map/location pin — verify sensible title and category
- [ ] Run edge case 3: past date visible — verify deadline is not set in the past
- [ ] Run edge case 4: 15+ image batch — verify all process, no UI breakdown
- [ ] Run edge case 5: sensitive/personal info — verify no sensitive content in task card
- [ ] Run must-fail-safely case 1: non-image file — verify clear error message, no crash
- [ ] Run must-fail-safely case 2: adult content image — verify safe neutral title returned
- [ ] Run must-fail-safely case 3: blank white image — verify safe defaults, no hang
- [ ] Run must-fail-safely case 4: network failure mid-analysis — verify retry button shown, no data lost
- [ ] Run must-fail-safely case 5: corrupted image — verify unprocessable flag shown, manual entry option available
- [ ] Document any failures and fix before marking Milestone 6 complete
