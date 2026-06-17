/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { brand, code, container, footer, h1, logo, main, text } from './styles.ts'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ marginBottom: '24px' }}>
          <Img src={brand.logoUrl} alt="Unscreenshot" width="28" height="28" style={logo} />
        </Section>
        <Heading style={h1}>Confirm it's you</Heading>
        <Text style={text}>Enter the code below to confirm your identity:</Text>
        <Text style={code}>{token}</Text>
        <Text style={footer}>
          This code expires shortly. If you didn't request it, ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
