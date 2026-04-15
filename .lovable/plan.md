

## Route Sign-Up Link Through Pricing

On the Auth page, the "Don't have an account? Sign up" link currently just toggles the form to sign-up mode. Instead, it should navigate to `/pricing` so new users see the plan and discount code option before creating an account.

### Changes

1. **Edit `src/pages/Auth.tsx`** — Change the "Sign up" button (shown when `isLogin` is true) from toggling `setIsLogin(false)` to navigating to `/pricing` via a `<Link>` or `navigate("/pricing")`. The "Sign in" link (shown on the sign-up form or forgot-password state) stays as-is.

