'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

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

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 text-xs text-brand-blue dark:text-blue-400 font-semibold shadow-sm">
              <Lock className="w-3.5 h-3.5" />
              <span>{isBn ? 'অভিযোগ ≠ অপরাধ | পরিচয় সর্বদা সুরক্ষিত' : 'Identity Always Protected'}</span>
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
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://fatihforge.pages.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
                >
                  <span>Portfolio</span>
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
