

## ~~Add Upload Batch Limit (10 Screenshots)~~ ✅ Done

**What**: Cap the number of screenshots per upload to 10, with clear feedback when the limit is reached.

### Changes (completed)

**`src/pages/Upload.tsx`**:
- Added `const MAX_FILES = 10` constant
- `addFiles()` truncates incoming files when adding would exceed 10, with toast: "Maximum 10 screenshots per batch. Only the first N were added."
- Drop zone disabled (greyed out, `cursor-not-allowed`) when 10 files queued
- Helper text updated: "JPG, PNG, WEBP — max 10MB each, up to 10 per batch"

---

## Future: Google Picker API Integration

**What**: Let users import screenshots directly from Google Photos via the Google Picker API.

### Steps (not yet started)
1. Register app in Google Cloud Console; enable Google Picker API
2. Add a "Google Photos" button alongside existing drag-and-drop on Upload page
3. Use existing Google auth or a scoped picker-only token to authenticate
4. Configure picker to show only the user's Photos library, filtered to images
5. Download selected images client-side, convert to existing `QueuedFile` format, feed into current upload/review flow

### Details
- Medium-effort feature; no changes to current upload architecture
- Adds an additional image source alongside drag-and-drop
