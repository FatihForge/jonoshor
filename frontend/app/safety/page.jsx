import React from 'react';
import { SafetyView } from '../components/InfoPagesViews';

export const metadata = {
  title: 'Whistleblower Safety & Operational Security Guide',
  description:
    'Crucial operational security protocols, digital privacy guidelines, and risk mitigation tips for citizens reporting human rights abuses in Bangladesh.',
  openGraph: {
    title: 'Whistleblower Safety & Security Guide | JonoShor',
    description:
      'Crucial operational security protocols, digital privacy guidelines, and risk mitigation tips for citizens reporting human rights abuses in Bangladesh.',
  },
};

export default function SafetyPage() {
  return <SafetyView />;
}
