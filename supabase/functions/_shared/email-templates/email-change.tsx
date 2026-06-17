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

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ marginBottom: '24px' }}>
          <Img src={brand.logoUrl} alt={siteName} width="28" height="28" style={logo} />
        </Section>
        <Heading style={h1}>Confirm your new email</Heading>
        <Text style={text}>
          You asked to change the email on your {siteName} account from {oldEmail} to {newEmail}. Confirm to apply the change.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm change
        </Button>
        <Text style={footer}>
          If you didn't request this, secure your account — someone else may have access.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
