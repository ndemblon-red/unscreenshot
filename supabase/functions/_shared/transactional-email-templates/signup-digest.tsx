/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL =
  'https://eialbbgpkyjjzcfkxbgc.supabase.co/storage/v1/object/public/public-assets/icon-128.png'
const APP_URL = 'https://unscreenshot.ai'

interface Signup {
  email: string
  createdAt: string
}

interface Props {
  signups?: Signup[]
  totalUsers?: number
  periodLabel?: string
}

function fmt(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

const Email = ({ signups = [], totalUsers, periodLabel = 'last 24 hours' }: Props) => {
  const count = signups.length
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`${count} new signup${count === 1 ? '' : 's'} on Unscreenshot`}</Preview>
      <Body style={main}>
        <Container style={card}>
          <Section style={{ marginBottom: '12px' }}>
            <Img src={LOGO_URL} alt="Unscreenshot" width="28" height="28" style={logo} />
          </Section>
          <Text style={eyebrow}>Daily signup digest</Text>
          <Heading style={h1}>
            {count} new signup{count === 1 ? '' : 's'} in the {periodLabel}
          </Heading>
          {typeof totalUsers === 'number' && (
            <Text style={text}>Total users to date: <strong>{totalUsers}</strong></Text>
          )}
          <Hr style={hr} />
          {signups.map((s) => (
            <Section key={s.email + s.createdAt} style={row}>
              <Text style={rowEmail}>{s.email}</Text>
              <Text style={rowTime}>{fmt(s.createdAt)}</Text>
            </Section>
          ))}
          <Hr style={hr} />
          <Text style={footer}>
            Sent from Unscreenshot ·{' '}
            <a href={`${APP_URL}/admin`} style={footerLink}>admin stats</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => {
    const n = Array.isArray(data?.signups) ? data.signups.length : 0
    return `Unscreenshot: ${n} new signup${n === 1 ? '' : 's'} in the last 24h`
  },
  displayName: 'Signup digest',
  previewData: {
    totalUsers: 142,
    periodLabel: 'last 24 hours',
    signups: [
      { email: 'jane@example.com', createdAt: new Date().toISOString() },
      { email: 'alex@example.com', createdAt: new Date(Date.now() - 3600_000).toISOString() },
    ],
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
const text = { fontSize: '15px', color: '#1d1d1f', lineHeight: 1.5, margin: '0 0 12px' }
const row = {
  padding: '8px 0',
  borderBottom: '1px solid #f0f0f2',
}
const rowEmail = { fontSize: '14px', color: '#1d1d1f', margin: 0, fontWeight: 500 as const }
const rowTime = { fontSize: '12px', color: '#6e6e73', margin: '2px 0 0' }
const hr = { borderColor: '#e5e5ea', margin: '20px 0 12px' }
const footer = { fontSize: '12px', color: '#6e6e73', lineHeight: 1.5, margin: 0 }
const footerLink = { color: '#6e6e73', textDecoration: 'underline' }
