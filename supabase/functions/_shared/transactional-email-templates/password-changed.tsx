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
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL =
  'https://eialbbgpkyjjzcfkxbgc.supabase.co/storage/v1/object/public/public-assets/icon-128.png'
const APP_URL = 'https://unscreenshot.ai'

function formatChangedAt(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

interface Props {
  changedAt?: string
}

const Email = ({ changedAt }: Props) => {
  const when = formatChangedAt(changedAt)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Unscreenshot password was changed</Preview>
      <Body style={main}>
        <Container style={card}>
          <Section style={{ marginBottom: '12px' }}>
            <Img src={LOGO_URL} alt="Unscreenshot" width="28" height="28" style={logo} />
          </Section>
          <Text style={eyebrow}>Security notice</Text>
          <Heading style={h1}>Your password was changed</Heading>
          <Text style={text}>
            The password on your Unscreenshot account was just updated{when ? ` on ${when}` : ''}.
          </Text>
          <Text style={text}>
            If this was you, no further action is needed.
          </Text>
          <Text style={text}>
            If it wasn't you, reset your password immediately and review your account.
          </Text>
          <Button style={button} href={`${APP_URL}/auth`}>
            Reset password
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            Sent by Unscreenshot. Manage your account at{' '}
            <a href={`${APP_URL}/account`} style={footerLink}>unscreenshot.ai</a>.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Your Unscreenshot password was changed',
  displayName: 'Password changed',
  previewData: { changedAt: new Date().toISOString() },
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
const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 500 as const,
  borderRadius: '8px',
  padding: '12px 22px',
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '12px',
}
const hr = { borderColor: '#e5e5ea', margin: '32px 0 16px' }
const footer = { fontSize: '12px', color: '#6e6e73', lineHeight: 1.5, margin: 0 }
const footerLink = { color: '#6e6e73', textDecoration: 'underline' }
