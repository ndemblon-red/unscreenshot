import { Helmet } from "react-helmet-async";
import LegalLayout from "@/components/LegalLayout";

const CONTACT_EMAIL = "hello@unscreenshot.ai";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="May 2026">
      <Helmet>
        <title>Privacy Policy — Unscreenshot</title>
        <meta name="description" content="Unscreenshot privacy policy. What we collect, where your data lives, your rights, and how to contact us." />
        <link rel="canonical" href="/legal/privacy" />
      </Helmet>
      <p>
        Unscreenshot is a beta service that turns screenshots into reminders.
        This page explains what we collect, where it goes, and what you control.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> your email address and a hashed password (or Google sign-in identifier).</li>
        <li><strong>Screenshots you upload:</strong> the image file itself, plus the AI-extracted title, category, and deadline.</li>
        <li><strong>Reminder metadata:</strong> when you created, edited, completed, archived, or deleted a reminder.</li>
        <li><strong>Notification settings:</strong> your timezone and email-toggle preferences.</li>
        <li><strong>Sharing data:</strong> if you share a reminder, the recipient email addresses you entered.</li>
        <li><strong>Operational logs:</strong> standard server logs (IP, user-agent, error traces) kept for debugging and abuse prevention.</li>
      </ul>
      <p>We do not run analytics trackers, advertising pixels, or session-replay tools.</p>

      <h2>Where your data lives</h2>
      <ul>
        <li><strong>Database and authentication:</strong> Supabase (EU region), with row-level security so each account can only read its own data.</li>
        <li><strong>Image storage:</strong> Supabase Storage. <strong>See "About screenshot storage" below.</strong></li>
        <li><strong>AI analysis:</strong> screenshot images are sent to Anthropic (Claude) to extract title, category, and deadline. Anthropic processes the image to generate a response and does not use it to train their models on the API plan we use.</li>
        <li><strong>Email delivery:</strong> reminder and share emails are sent via Resend.</li>
        <li><strong>AI observability:</strong> request and response metadata (not the image itself) is logged to Langfuse so we can debug and improve the AI prompts.</li>
      </ul>

      <h2>About screenshot storage</h2>
      <p>
        Screenshots are stored in a <strong>publicly-readable storage bucket</strong>.
        That means anyone who has the exact URL of an image can view it without
        signing in. The URLs are random UUIDs and effectively unguessable, but
        they are not access-controlled.
      </p>
      <p>
        We made this choice so that deadline-reminder emails sent to non-account
        recipients (people you share reminders with) can render the image inline
        in their inbox. It's a deliberate trade-off between convenience and
        strict access control.
      </p>
      <p>
        <strong>Practical implication:</strong> please do not upload screenshots
        containing passwords, API keys, financial details, government IDs, or
        anything else you would not be comfortable sharing if the URL leaked.
        If you delete a reminder, the image is removed from storage.
      </p>

      <h2>Sharing reminders</h2>
      <p>
        When you share a reminder with someone by email, we store their email
        address on our servers and email them the reminder details (including
        the screenshot). Recipients will receive a follow-up email when the
        deadline approaches. They can ask you to stop sharing by replying or
        using the "Unsubscribe" option in their email client — that triggers an
        email back to you, the sharer.
      </p>

      <h2>How we use your data</h2>
      <ul>
        <li>To run the service: store your reminders, send notifications, render the app.</li>
        <li>To debug and improve: error logs, AI prompt traces.</li>
        <li>To enforce limits and prevent abuse (for example, the per-account analysis cap).</li>
        <li>To contact you about your account when necessary (security, service changes).</li>
      </ul>
      <p>We do not sell your data. We do not share it with advertisers.</p>

      <h2>Cookies and local storage</h2>
      <p>
        We do not use tracking, advertising, or analytics cookies. We do not
        run a third-party analytics tracker. The app uses only what is
        strictly necessary to function:
      </p>
      <ul>
        <li><strong>Authentication tokens:</strong> stored in your browser's local storage so you stay signed in.</li>
        <li><strong>UI state:</strong> a small cookie remembers whether the sidebar is collapsed.</li>
        <li><strong>Offline queue:</strong> if you upload while offline, screenshots are held in local storage until you reconnect.</li>
      </ul>
      <p>
        Because none of this is used for tracking or advertising, no cookie
        consent banner is required.
      </p>

      <h2>Your rights</h2>
      <ul>
        <li><strong>Access and export:</strong> use "Export my data (JSON)" on the Account page to download all your reminders and metadata. For anything that button doesn't cover, email us.</li>
        <li><strong>Deletion:</strong> use "Delete account" on the Account page. This permanently removes your account, all reminders, all uploaded images, and all share records.</li>
        <li><strong>Correction:</strong> edit any reminder field directly in the app.</li>
        <li><strong>Email opt-out:</strong> turn off deadline emails on the Account page. Account-related emails (password reset, security) still send.</li>
      </ul>

      <h2>Retention</h2>
      <p>
        Reminders and images are kept until you delete them or your account.
        Server logs are retained for up to 90 days. Suppression records (for
        bounced or unsubscribed emails) are kept indefinitely so we don't email
        people who don't want to hear from us.
      </p>

      <h2>Children</h2>
      <p>Unscreenshot is not intended for users under 16.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy in a way that materially affects your data,
        we'll email account holders before the change takes effect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, deletion requests, or anything else: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalLayout>
  );
}
