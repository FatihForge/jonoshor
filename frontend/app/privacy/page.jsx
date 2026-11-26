import React from 'react';
import { PrivacyView } from '../components/InfoPagesViews';

export const metadata = {
  title: 'Privacy Policy & Zero-Knowledge Data Protection',
  description:
    'Our commitment to informant confidentiality, metadata stripping, end-to-end cryptographic protection, and zero-tracking analytics.',
  openGraph: {
    title: 'Privacy Policy & Data Protection | JonoShor',
    description:
      'Our commitment to informant confidentiality, metadata stripping, end-to-end cryptographic protection, and zero-tracking analytics.',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyView />;
}
