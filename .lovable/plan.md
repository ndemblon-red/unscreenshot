

## Move Logout Button to Account Page

**What**: Remove the logout button from the main app header (Index page) and keep it only on the Account page. The Account page already has a logout button in its header — we'll enhance it by also adding a more prominent logout option in the page body.

### Changes

**`src/pages/Index.tsx`**:
- Remove `LogOut` from imports
- Remove the logout button from the header (keep Upload, NotificationBell, User/Account button)

**`src/pages/Account.tsx`**:
- Keep the existing logout button in the header
- Add a second, more prominent "Sign out" button at the bottom of the page in a dedicated section below ChangePasswordForm, styled as a secondary/destructive action with label text for clarity

This keeps logout accessible from the Account page (both in the header quick-access and the main body), while cleaning up the main app header to focus on core actions: Upload, Notifications, and Account navigation.

