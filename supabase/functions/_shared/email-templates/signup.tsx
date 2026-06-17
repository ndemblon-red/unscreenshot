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
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { brand, button, container, footer, h1, link, logo, main, text } from './styles.ts'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email to start using {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ marginBottom: '24px' }}>
          <Img src={brand.logoUrl} alt={siteName} width="28" height="28" style={logo} />
        </Section>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          You signed up for{' '}
          <Link href={siteUrl} style={link}>{siteName}</Link>{' '}
          with {recipient}. Confirm the address to finish setting up your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm email
        </Button>
        <Text style={footer}>
          If you didn't sign up, ignore this email — no account will be created.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
