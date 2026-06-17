// Shared inline styles for auth email templates.
// Body background stays #ffffff per Lovable email guidance.
// Colours match the Unscreenshot design system (src/index.css).

export const brand = {
  logoUrl:
    'https://eialbbgpkyjjzcfkxbgc.supabase.co/storage/v1/object/public/public-assets/icon-128.png',
  fontStack:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', 'Segoe UI', sans-serif",
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: brand.fontStack,
  color: '#1d1d1f',
}

export const container = {
  padding: '32px 28px',
  maxWidth: '520px',
}

export const logo = {
  display: 'block',
  width: '28px',
  height: '28px',
  borderRadius: '6px',
}

export const h1 = {
  fontSize: '22px',
  fontWeight: 600 as const,
  color: '#1d1d1f',
  letterSpacing: '-0.01em',
  margin: '0 0 16px',
  lineHeight: 1.3,
}

export const text = {
  fontSize: '15px',
  color: '#1d1d1f',
  lineHeight: 1.5,
  margin: '0 0 24px',
}

export const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 500 as const,
  borderRadius: '8px',
  padding: '12px 22px',
  textDecoration: 'none',
  display: 'inline-block',
}

export const link = { color: '#1d1d1f', textDecoration: 'underline' }

export const code = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: '24px',
  fontWeight: 600 as const,
  color: '#1d1d1f',
  letterSpacing: '0.08em',
  margin: '0 0 24px',
}

export const footer = {
  fontSize: '12px',
  color: '#6e6e73',
  lineHeight: 1.5,
  margin: '32px 0 0',
}
