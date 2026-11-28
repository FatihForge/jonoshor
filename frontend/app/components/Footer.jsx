'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { ShieldCheck, ExternalLink, Globe, Mail } from 'lucide-react';

export default function Footer() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <footer className="bg-[#F4F8FF] dark:bg-[#070B14] border-t border-blue-100 dark:border-slate-800/80 mt-20 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="container mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-200/80 dark:border-slate-800">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-blue text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xl text-brand-navy dark:text-white block leading-none">
                  {t.siteTitle}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-blue dark:text-blue-400">
                  JonoShor Human Rights Portal
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              {isBn
                ? 'বাংলাদেশের নাগরিকদের মৌলিক অধিকার লঙ্ঘন, নির্যাতন ও প্রাতিষ্ঠানিক অনিয়মের তথ্য নির্ভরযোগ্যভাবে সংরক্ষণ, যাচাই এবং জনস্বার্থে উন্মুক্ত করার স্বাধীন নাগরিক প্ল্যাটফর্ম।'
                : 'An independent platform helping Bangladeshi citizens securely document, verify, and preserve human rights records with zero-leakage privacy.'}
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://github.com/FatihForge"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://fatihforge.pages.dev/"
                target="_blank"
                rel="noopener noreferrer"
                title="Portfolio"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="mailto:sfnaim.work@gmail.com"
                title="Email"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-brand-navy dark:text-white text-xs uppercase tracking-wider">
              {isBn ? 'সেবাসমূহ' : 'Services'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/reports" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? 'যাচাইকৃত রিপোর্ট' : 'Verified Reports'}
                </Link>
              </li>
              <li>
                <Link href="/complaints/new" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? 'অভিযোগ দাখিল' : 'Submit Complaint'}
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? 'পরিসংখ্যান ও বিশ্লেষণ' : 'Live Statistics'}
                </Link>
              </li>
              <li>
                <Link href="/join-us" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? 'আইনজীবী ও স্বেচ্ছাসেবক' : 'Join Legal Panel'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-brand-navy dark:text-white text-xs uppercase tracking-wider">
              {isBn ? 'নিরাপত্তা ও নীতিমালা' : 'Safety & Policy'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/safety" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? 'তথ্যদাতার নিরাপত্তা গাইড' : 'Whistleblower Safety'}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? '৫-ধাপের যাচাই পদ্ধতি' : 'Verification Method'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? 'গোপনীয়তা নীতিমালা' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? 'শর্তাবলী ও দায়মুক্তি' : 'Terms & Disclaimers'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-brand-navy dark:text-white text-xs uppercase tracking-wider">
              {isBn ? 'স্বচ্ছতা ও লিংক' : 'Transparency & Links'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? 'আমাদের লক্ষ্য' : 'Our Mission'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                  {isBn ? 'যোগাযোগ' : 'Contact Us'}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/FatihForge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
                >
                  <span>Devoloper Info</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>

            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div className="text-center md:text-left">
            © ২০২৬{' '}
            <a
              href="https://fatihforge.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-navy dark:text-slate-300 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
            >
              FatihForge
            </a>
            . All rights reserved.{' '}
            <span className="hidden sm:inline">
              • জনস্বর কোনো বিচারিক আদালত নয়; যাচাইকৃত প্রতিবেদন মানবাধিকার সচেতনতার দলিল।
            </span>
          </div>
          <div className="font-mono text-[11px] font-semibold text-brand-blue dark:text-blue-400">
            64 DISTRICTS • BANGLADESH
          </div>
        </div>
      </div>
    </footer>
  );
}
