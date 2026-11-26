import './globals.css';
import { cookies } from 'next/headers';
import { LanguageProvider } from './components/LanguageContext';
import { ThemeProvider } from './components/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export const metadata = {
  metadataBase: new URL('https://jonoshor.org'),
  title: {
    default: 'JonoShor — Independent Human Rights & Citizen Grievance Documentation Platform',
    template: '%s | JonoShor',
  },
  description:
    'An independent civic platform for securely documenting, verifying, and publishing human rights violations and citizen grievances in Bangladesh.',
  keywords: [
    'JonoShor',
    'Human Rights Bangladesh',
    'Citizen Complaints',
    'Verified Reports',
    'Whistleblower Protection',
    'Human Rights Telemetry',
    'Legal Aid Bangladesh',
  ],
  authors: [{ name: 'JonoShor Human Rights Initiative', url: 'https://jonoshor.org' }],
  openGraph: {
    title: 'JonoShor — Human Rights Documentation & Verification Platform',
    description:
      'Document. Verify. Protect. Inform. Secure, confidential, and verified public archive for human rights advocacy in Bangladesh.',
    url: 'https://jonoshor.org',
    siteName: 'JonoShor',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JonoShor — Human Rights Archive',
    description: 'Document, verify, and archive human rights violations with whistleblower protection in Bangladesh.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get('jonoshor_lang')?.value;
  const initialLang = langCookie === 'en' ? 'en' : 'bn';

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
    <html lang={initialLang} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedLang = localStorage.getItem('jonoshor_lang');
                  if (savedLang && (savedLang === 'bn' || savedLang === 'en')) {
                    document.cookie = 'jonoshor_lang=' + savedLang + '; path=/; max-age=31536000; SameSite=Lax';
                  }
                  var saved = localStorage.getItem('jonoshor_theme');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = saved === 'dark' || (!saved && prefersDark);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-canvas-dark text-brand-navy dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-brand-blue/15 selection:text-brand-blue">
        <ThemeProvider>
          <LanguageProvider initialLang={initialLang}>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
