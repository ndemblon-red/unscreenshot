

## Move Logout Button to Account Page ✅

**Status**: Complete

Removed the logout button from the main app header (Index page) and kept it only on the Account page — both in the header and as a prominent sign-out button at the bottom of the page body.

---

## Google Picker API Integration (Future)

**Status**: Not started — planned for later

Integrate the Google Picker API to let users browse and select images directly from their Google Photos/Drive on the Upload page.

### Steps

1. **Google Cloud Console setup**: Create OAuth 2.0 credentials and enable the Google Picker API
2. **Frontend**: Load the Google Picker JS library, add an "Import from Google Photos" button on the Upload page
3. **OAuth flow**: Use existing Google auth or a scoped picker-only token to authenticate
4. **Picker config**: Configure the picker to show only the user's Photos library, filtered to images
5. **Selected images**: Download selected images client-side, convert to the existing `QueuedFile` format, and feed into the current upload/review flow

This is a medium-effort feature that adds an additional image source alongside drag-and-drop without changing the current upload architecture.
