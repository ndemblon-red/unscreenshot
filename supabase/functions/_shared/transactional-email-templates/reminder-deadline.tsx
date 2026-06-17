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

function formatDeadlineLabel(deadline: string, dueWhen: 'today' | 'tomorrow'): string {
  const parts = deadline.split('T')
  const timePart = parts.length > 1 && /^\d{2}:\d{2}/.test(parts[1]) ? parts[1].slice(0, 5) : '09:00'
  const [h, m] = timePart.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  const timeLabel = m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
  return `${dueWhen === 'today' ? 'Today' : 'Tomorrow'} · ${timeLabel}`
}

interface Props {
  title?: string
  category?: string
  deadline?: string
  imageUrl?: string
  link?: string
  dueWhen?: 'today' | 'tomorrow'
  isShare?: boolean
}

const Email = ({
  title = 'Untitled reminder',
  category = 'To Do',
  deadline = '',
  imageUrl = '',
  link = APP_URL,
  dueWhen = 'today',
  isShare = false,
}: Props) => {
  const heading = isShare
    ? `Shared reminder due ${dueWhen}`
    : dueWhen === 'today'
    ? 'Due today'
    : 'Due tomorrow'
  const deadlineLabel = deadline ? formatDeadlineLabel(deadline, dueWhen) : ''
  const pillBg = CATEGORY_COLORS[category] ?? '#6E6E73'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{heading}: {title}</Preview>
      <Body style={main}>
        <Container style={card}>
          <Section style={{ marginBottom: '12px' }}>
            <Img src={LOGO_URL} alt="Unscreenshot" width="28" height="28" style={logo} />
          </Section>
          <Text style={eyebrow}>{heading}</Text>
          <Heading style={h1}>{title}</Heading>
          <Section style={{ marginBottom: '20px' }}>
            <span style={{ ...pill, backgroundColor: pillBg }}>{category}</span>
            {deadlineLabel ? <span style={meta}> {deadlineLabel}</span> : null}
          </Section>
          {imageUrl ? (
            <Section style={{ marginBottom: '24px' }}>
              <Link href={link}>
                <Img src={imageUrl} alt="Reminder" width="464" style={screenshot} />
              </Link>
            </Section>
          ) : null}
          <Button style={button} href={link}>
            Open reminder
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            Sent by Unscreenshot. Manage your reminders at{' '}
            <Link href={`${APP_URL}/app`} style={footerLink}>unscreenshot.ai</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => {
    const dueWhen = data.dueWhen === 'tomorrow' ? 'tomorrow' : 'today'
    const prefix = data.isShare ? 'Shared reminder' : 'Reminder'
    return `${prefix} due ${dueWhen}: ${data.title ?? 'Untitled'}`
  },
  displayName: 'Reminder deadline',
  previewData: {
    title: 'Pick up dry cleaning',
    category: 'To Do',
    deadline: '2025-06-18T17:00',
    imageUrl: LOGO_URL,
    link: APP_URL,
    dueWhen: 'today',
    isShare: false,
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
const footerLink = { color: '#6e6e73', textDecoration: 'underline' }
