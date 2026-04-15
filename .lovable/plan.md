

## Add Upload Batch Limit (10 Screenshots)

**What**: Cap the number of screenshots per upload to 10, with clear feedback when the limit is reached.

### Changes

**`src/pages/Upload.tsx`**:
- Add `const MAX_FILES = 10` constant
- In `addFiles()`, check if adding new files would exceed 10 total. If so, take only enough to reach 10 and show an error message: "Maximum 10 screenshots per batch. Only the first N were added."
- Disable the drop zone / file input when 10 files are already queued
- Update the helper text to mention the limit: "JPG, PNG, WEBP — max 10MB each, up to 10 per batch"

### Details
- Simple, single-file change
- No backend or database changes needed
- The limit is enforced client-side in the existing `addFiles` callback

