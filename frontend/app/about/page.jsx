import React from 'react';
import { AboutView } from '../components/InfoPagesViews';

export const metadata = {
  title: 'About Us — Mission, Principles & Governance',
  description: 'Learn about JonoShor, an independent civic initiative dedicated to documenting human rights violations and supporting victims in Bangladesh.',
  openGraph: {
    title: 'About Us — Mission & Core Principles | JonoShor',
    description: 'Learn about JonoShor, an independent civic initiative dedicated to documenting human rights violations and supporting victims in Bangladesh.',
  },
};

export default function AboutPage() {
  return <AboutView />;
}
