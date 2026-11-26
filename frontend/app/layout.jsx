import './globals.css';
import { LanguageProvider } from './components/LanguageContext';
import { ThemeProvider } from './components/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export const metadata = {
  metadataBase: new URL('https://jonoshor.org'),
  title: {
    default: 'জনস্বর (JonoShor) — স্বাধীন মানবাধিকার ও নাগরিক অভিযোগ প্ল্যাটফর্ম',
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
    'Verified Reports',
    'Whistleblower Protection',
  ],
  authors: [{ name: 'JonoShor Human Rights Initiative', url: 'https://jonoshor.org' }],
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
    title: 'জনস্বর (JonoShor) — Human Rights Archive',
    description: 'Document. Verify. Protect. Inform.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'জনস্বর (JonoShor)',
    alternateName: 'JonoShor Human Rights Archive',
    url: 'https://jonoshor.org',
    description:
      'Independent Bangladeshi human rights documentation, evidence preservation, and verified public archive.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@jonoshor.org',
      contactType: 'Whistleblower Support & Public Inquiries',
      areaServed: 'BD',
      availableLanguage: ['Bengali', 'English'],
    },
  };

  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-canvas-dark text-brand-navy dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-brand-blue/15 selection:text-brand-blue">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
