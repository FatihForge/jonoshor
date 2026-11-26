'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { ShieldCheck, Lock, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-canvas-subtle border-t border-canvas-border mt-24 text-brand-slate text-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-emerald/20 border border-brand-emerald/40 flex items-center justify-center text-brand-emerald font-bold">
                জন
              </div>
              <span className="font-bold text-lg text-brand-text">{t.siteTitle}</span>
            </div>
            <p className="text-xs text-brand-slate leading-relaxed">
              স্বাধীন নাগরিক উদ্যোগ — বাংলাদেশের মানবাধিকার লঙ্ঘন, নির্যাতন ও নিপীড়নের তথ্য সংরক্ষণ ও জনস্বার্থে উন্মুক্ত করার নিরপেক্ষ প্ল্যাটফর্ম।
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-emerald font-medium pt-1">
              <Lock className="w-3.5 h-3.5" />
              <span>জিরো-নলেজ পরিচয় নিরাপত্তা ব্যবস্থা</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-brand-text text-xs uppercase tracking-wider mb-3">জনস্বার্থ সেবা</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/reports" className="hover:text-brand-emerald transition-colors">
                  যাচাইকৃত রিপোর্ট ডিরেক্টরি
                </Link>
              </li>
              <li>
                <Link href="/complaints/new" className="hover:text-brand-emerald transition-colors">
                  নাগরিক অভিযোগ দাখিল
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="hover:text-brand-emerald transition-colors">
                  লাইভ পরিসংখ্যান ও প্রবণতা
                </Link>
              </li>
              <li>
                <Link href="/join-us" className="hover:text-brand-emerald transition-colors">
                  আইনজীবী ও স্বেচ্ছাসেবক নিবন্ধন
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Safety */}
          <div>
            <h4 className="font-semibold text-brand-text text-xs uppercase tracking-wider mb-3">নীতিমালা ও সুরক্ষা</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/safety" className="hover:text-brand-emerald transition-colors">
                  হুইসেলব্লোয়ার ও তথ্যদাতার নিরাপত্তা
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-brand-emerald transition-colors">
                  ৫-ধাপের নিরপেক্ষ যাচাই পদ্ধতি
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-emerald transition-colors">
                  গোপনীয়তা ও ডেটা সংরক্ষণ পলিসি
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-emerald transition-colors">
                  ব্যবহারের শর্তাবলী ও আইনি দায়মুক্তি
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Integrity & Swagger */}
          <div>
            <h4 className="font-semibold text-brand-text text-xs uppercase tracking-wider mb-3">স্বচ্ছতা ও ওপেন ডাটা</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-brand-emerald transition-colors">
                  আমাদের লক্ষ্য ও মূলনীতি
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-emerald transition-colors">
                  যোগাযোগ ও তথ্য অনুসন্ধান
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:5000/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-emerald hover:underline"
                >
                  <span>ইন্টারেক্টিভ Swagger API</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="pt-2 text-[11px] text-brand-slate">
                API Base: <code className="text-brand-emerald">/api/v1</code>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Notice */}
        <div className="border-t border-canvas-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="text-center md:text-left text-brand-slate">
            © ২০২৬ জনস্বর নাগরিক উদ্যোগ (JonoShor Platform). All rights reserved. <br />
            <span className="text-brand-slate/80 text-[11px]">
              জনস্বর কোনো বিচারিক আদালত বা তদন্তকারী সংস্থা নয়। প্রকাশিত তথ্য শুধুমাত্র মানবাধিকার পরিস্থিতি উন্নয়ন ও নাগরিক সচেতনতার উদ্দেশ্যে সংকলিত।
            </span>
          </div>
          <div className="flex items-center gap-2 text-brand-slate/60 text-xs">
            <span>নির্মিত মানবাধিকার সুরক্ষার দৃঢ় অঙ্গীকারে</span>
            <Heart className="w-3.5 h-3.5 text-brand-crimson fill-brand-crimson" />
          </div>
        </div>
      </div>
    </footer>
  );
}
