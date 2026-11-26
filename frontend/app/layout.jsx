import './globals.css';
import { LanguageProvider } from './components/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export const metadata = {
  metadataBase: new URL('https://jonoshor.org'),
  title: {
    default: 'জনস্বর (JonoShor) — মানবাধিকার ও নাগরিক অভিযোগ প্ল্যাটফর্ম',
    template: '%s | জনস্বর (JonoShor)',
  },
  description:
    'বাংলাদেশের মানবাধিকার লঙ্ঘন, নির্যাতন ও নাগরিক অভিযোগ নিরাপদে নথিভুক্ত, যাচাই ও জনস্বার্থে উন্মুক্ত করার নিরপেক্ষ স্বাধীন নাগরিক প্ল্যাটফর্ম।',
  keywords: [
    'JonoShor',
    'জনস্বর',
    'Human Rights Bangladesh',
    'মানবাধিকার বাংলাদেশ',
    'Citizen Complaints',
    'নির্যাতন ও বৈষম্য',
    'Verified Reports',
    'Whistleblower Protection',
    'Legal Documentation',
  ],
  authors: [{ name: 'JonoShor Human Rights Initiative', url: 'https://jonoshor.org' }],
  creator: 'JonoShor Citizens Taskforce',
  openGraph: {
    title: 'জনস্বর (JonoShor) — মানবাধিকার ও নাগরিক অভিযোগ প্ল্যাটফর্ম',
    description:
      'নথিভুক্ত করুন। যাচাই করুন। সুরক্ষা দিন। প্রকাশ করুন। অভিযোগকারীর পরিচয় সর্বদা সম্পূর্ণ সুরক্ষিত।',
    url: 'https://jonoshor.org',
    siteName: 'জনস্বর (JonoShor)',
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'জনস্বর (JonoShor) — Human Rights Platform',
    description: 'Document. Verify. Protect. Inform.',
    creator: '@jonoshor',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  // JSON-LD Structured Data Schema for Search Engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'জনস্বর (JonoShor)',
    alternateName: 'JonoShor Human Rights Platform',
    url: 'https://jonoshor.org',
    logo: 'https://jonoshor.org/icon.png',
    description:
      'Independent Bangladeshi human rights documentation, evidence preservation, and verified public voice platform.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@jonoshor.org',
      contactType: 'Whistleblower Support & Public Inquiries',
      areaServed: 'BD',
      availableLanguage: ['Bengali', 'English'],
    },
  };

  return (
    <html lang="bn" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-brand-text flex flex-col antialiased">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
