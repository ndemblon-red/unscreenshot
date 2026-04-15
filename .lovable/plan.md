

## Updated Plan: Move Logout Button to Account Page + Google Picker API (Future)

### Now: Move Logout Button

**`src/pages/Index.tsx`**:
- Remove `LogOut` from Lucide imports
- Remove the logout button from the header

**`src/pages/Account.tsx`**:
- Keep existing logout in header
- Add a prominent "Sign out" button at the bottom of the page body below ChangePasswordForm, styled as a destructive outline button

### Future: Google Picker API Integration (Not implementing now)

When ready, integrate the Google Picker API to let users browse and select images directly from their Google Photos/Drive:

1. **Google Cloud Console setup**: Create OAuth 2.0 credentials and enable the Google Picker API
2. **Frontend**: Load the Google Picker JS library, display a "Import from Google Photos" button on the Upload page
3. **OAuth flow**: Use existing Google auth or a scoped picker-only token to authenticate
4. **Picker config**: Configure the picker to show only the user's Photos library, filtered to images
5. **Selected images**: Download selected images client-side, convert to the existing `QueuedFile` format, and feed into the current upload/review flow

This is a medium-effort feature that can be added later without changing the current upload architecture — it just adds an additional image source alongside drag-and-drop.

