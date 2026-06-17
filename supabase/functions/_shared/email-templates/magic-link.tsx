/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { brand, button, container, footer, h1, logo, main, text } from './styles.ts'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your sign-in link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ marginBottom: '24px' }}>
          <Img src={brand.logoUrl} alt={siteName} width="28" height="28" style={logo} />
        </Section>
        <Heading style={h1}>Sign in to {siteName}</Heading>
        <Text style={text}>
          Click the button below to sign in. The link expires shortly.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Sign in
        </Button>
        <Text style={footer}>
          If you didn't request this, ignore the email — no one can sign in without the link.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
