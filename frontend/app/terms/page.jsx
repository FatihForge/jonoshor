import React from 'react';
import { TermsView } from '../components/InfoPagesViews';

export const metadata = {
  title: 'Terms of Service & Legal Disclaimer',
  description:
    'Legal terms, verification criteria, evidence archiving policies, and user agreements for the JonoShor civic platform.',
  openGraph: {
    title: 'Terms of Service & Legal Disclaimer | JonoShor',
    description:
      'Legal terms, verification criteria, evidence archiving policies, and user agreements for the JonoShor civic platform.',
  },
};

export default function TermsPage() {
  return <TermsView />;
}
