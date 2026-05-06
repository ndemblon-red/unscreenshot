## Yes — public bucket must be disclosed

The Privacy Policy will be explicit: screenshots live in a publicly-readable bucket, URLs are random UUIDs but not access-controlled, the trade-off was made so shared-reminder emails can render images inline, and users should not upload secrets/IDs/passwords. The Terms will reference the Privacy Policy on this point.

## Files to create

1. **`src/components/LegalLayout.tsx`** — shared shell: header with logo + Unscreenshot wordmark linking back to `/`, prose container, footer with Privacy/Terms cross-links. Plain typography, dry copy, no buzzwords (per memory).

2. **`src/pages/legal/Privacy.tsx`** — Privacy Policy. Sections:
   - What we collect (account, screenshots, reminder metadata, notification settings, sharing data, operational logs; explicit "no analytics, no ad pixels")
   - Where data lives (Supabase EU + RLS, Anthropic for AI, Resend for email, Langfuse for AI traces — explicitly excluding image data)
   - **About screenshot storage** — the public-bucket disclosure, the rationale (shared-reminder emails), and the practical "don't upload secrets" warning
   - Sharing reminders (recipient emails stored, opt-out via reply / List-Unsubscribe)
   - How we use your data (no selling, no advertisers)
   - Your rights (access, deletion via Account page, correction, email opt-out)
   - Retention (reminders until deleted, logs 90d, suppression list indefinite)
   - Children (16+)
   - Changes (email account holders for material changes)
   - Contact (`hello@unscreenshot.ai`)

3. **`src/pages/legal/Terms.tsx`** — Terms of Service. Sections:
   - The service (beta caveats)
   - Your account (16+, one per person, secure password)
   - Acceptable use (no illegal/infringing content, no other people's PII without consent, no abuse/reverse-engineering, no spamming via share)
   - Your content (you keep ownership; limited licence to store/process/display; cross-link to Privacy on the public-bucket point)
   - AI output (can be wrong; not liable for missed deadlines)
   - Beta limits and changes (30-analysis cap; can change at any time)
   - No warranty (as-is)
   - Liability (capped at amount paid = £0 during beta)
   - Termination (self-serve via Account page)
   - Governing law (placeholder for operator's jurisdiction)
   - Contact

## Files to update

4. **`src/App.tsx`** — add two public routes: `/legal/privacy` → `Privacy`, `/legal/terms` → `Terms`. No AuthGuard.

5. **`src/pages/Landing.tsx`** — extend the existing footer to include Privacy and Terms links alongside Contact and Sign in.

6. **`src/pages/Auth.tsx`** — add a small line under the submit button on signup mode only: "By creating an account you agree to our Terms and Privacy Policy" with both words linked. Keep it dry, single line, muted text.

## Out of scope (not changing)

- No cookie banner — we don't set non-essential cookies (no analytics).
- No DPA, no GDPR Article 30 register — overkill for solo beta.
- Governing-law jurisdiction left as a generic placeholder; can be tightened when the legal entity is finalised.
- No DECISIONS.md update needed — the public-bucket decision is already logged there from an earlier turn.
