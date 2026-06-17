/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const CATEGORY_COLORS: Record<string, string> = {
  Events: '#5856D6',
  Shopping: '#FF9500',
  Restaurants: '#34C759',
  'To Do': '#007AFF',
  Reading: '#AF52DE',
  Home: '#FF6B35',
  Travel: '#32ADE6',
  Wishlist: '#FF2D55',
}

const LOGO_URL =
  'https://eialbbgpkyjjzcfkxbgc.supabase.co/storage/v1/object/public/public-assets/icon-128.png'
const APP_URL = 'https://unscreenshot.ai'

function formatDeadlineHuman(deadline: string): string {
  if (!deadline) return ''
  const [datePart, timePartRaw] = deadline.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1))
  const dateLabel = dt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  if (!timePartRaw) return dateLabel
  const [hh, mm] = timePartRaw.slice(0, 5).split(':').map(Number)
  if (isNaN(hh)) return dateLabel
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const hour12 = hh % 12 || 12
  const timeLabel = mm === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(mm).padStart(2, '0')} ${suffix}`
  return `${dateLabel} · ${timeLabel}`
}

interface Props {
  senderEmail?: string
  title?: string
  category?: string
  deadline?: string
  imageUrl?: string
  signupLink?: string
}

const Email = ({
  senderEmail = 'A friend',
  title = 'Untitled reminder',
  category = 'To Do',
  deadline = '',
  imageUrl = '',
  signupLink = `${APP_URL}/auth`,
}: Props) => {
  const deadlineLabel = formatDeadlineHuman(deadline)
  const pillBg = CATEGORY_COLORS[category] ?? '#6E6E73'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{senderEmail} shared a reminder with you</Preview>
      <Body style={main}>
        <Container style={card}>
          <Section style={{ marginBottom: '12px' }}>
            <Img src={LOGO_URL} alt="Unscreenshot" width="28" height="28" style={logo} />
          </Section>
          <Text style={eyebrow}>Shared with you</Text>
          <Heading style={h1}>{title}</Heading>
          <Text style={text}>
            <strong>{senderEmail}</strong> shared this reminder with you. We'll email you again when it's due.
          </Text>
          <Section style={{ marginBottom: '20px' }}>
            <span style={{ ...pill, backgroundColor: pillBg }}>{category}</span>
            {deadlineLabel ? <span style={meta}> Due {deadlineLabel}</span> : null}
          </Section>
          {imageUrl ? (
            <Section style={{ marginBottom: '24px' }}>
              <Img src={imageUrl} alt="Reminder" width="464" style={screenshot} />
            </Section>
          ) : null}
          <Button style={button} href={signupLink}>
            Save your own reminders
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            You received this because <strong>{senderEmail}</strong> chose to share a reminder with you. Reply to this email to ask them to stop.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `${data.senderEmail ?? 'Someone'} shared a reminder: ${data.title ?? 'Untitled'}`,
  displayName: 'Reminder shared',
  previewData: {
    senderEmail: 'jane@example.com',
    title: 'Try this brunch spot',
    category: 'Restaurants',
    deadline: '2025-06-20T11:00',
    imageUrl: LOGO_URL,
    signupLink: `${APP_URL}/auth`,
  },
} satisfies TemplateEntry

const fontStack =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', 'Segoe UI', sans-serif"

const main = { backgroundColor: '#ffffff', fontFamily: fontStack, color: '#1d1d1f' }
const card = { padding: '32px 28px', maxWidth: '520px' }
const logo = { display: 'block', width: '28px', height: '28px', borderRadius: '6px' }
const eyebrow = {
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: '#6e6e73',
  fontWeight: 600 as const,
  margin: '0 0 6px',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 600 as const,
  color: '#1d1d1f',
  letterSpacing: '-0.01em',
  margin: '0 0 14px',
  lineHeight: 1.3,
}
const text = { fontSize: '15px', color: '#1d1d1f', lineHeight: 1.5, margin: '0 0 20px' }
const pill = {
  display: 'inline-block',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 600 as const,
  padding: '4px 10px',
  borderRadius: '999px',
  marginRight: '8px',
}
const meta = { fontSize: '13px', color: '#6e6e73' }
const screenshot = {
  display: 'block',
  width: '100%',
  maxWidth: '464px',
  height: 'auto',
  borderRadius: '12px',
  border: '1px solid #e5e5ea',
}
const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 500 as const,
  borderRadius: '8px',
  padding: '12px 22px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e5e5ea', margin: '32px 0 16px' }
const footer = { fontSize: '12px', color: '#6e6e73', lineHeight: 1.5, margin: 0 }
