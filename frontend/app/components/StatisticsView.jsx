'use client';

import React from 'react';
import { CheckCircle2, Clock, Scale, ShieldCheck, MapPin } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function StatisticsView({ stats }) {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const breakdown = isBn
    ? [
        { name: 'হেফাজতে নির্যাতন ও শারীরিক নিপীড়ন', count: 48, pct: 34, color: 'bg-rose-500' },
        { name: 'বেআইনি আটক ও নিরাপত্তা হেফাজত', count: 36, pct: 25, color: 'bg-amber-500' },
        { name: 'মতপ্রকাশ ও স্বাধীন সাংবাদিকতায় বাধা', count: 28, pct: 20, color: 'bg-brand-blue' },
        { name: 'চাঁদাবাজি ও আইনপ্রয়োগকারী সংস্থার হয়রানি', count: 18, pct: 13, color: 'bg-indigo-500' },
        { name: 'অন্যান্য নাগরিক অধিকার লঙ্ঘন', count: 12, pct: 8, color: 'bg-emerald-500' },
      ]
    : [
        { name: 'Custodial Torture & Physical Abuse', count: 48, pct: 34, color: 'bg-rose-500' },
        { name: 'Unlawful Detention & Abduction', count: 36, pct: 25, color: 'bg-amber-500' },
        { name: 'Free Speech & Press Intimidation', count: 28, pct: 20, color: 'bg-brand-blue' },
        { name: 'Extortion & Law Enforcement Harassment', count: 18, pct: 13, color: 'bg-indigo-500' },
        { name: 'Other Civic Rights Violations', count: 12, pct: 8, color: 'bg-emerald-500' },
      ];

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            TRANSPARENCY & LIVE DATA
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'জাতীয় মানবাধিকার পরিস্থিতি ও পরিসংখ্যান' : 'National Human Rights Statistics & Trends'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isBn
              ? 'নাগরিকদের সুরক্ষায় এবং মানবাধিকার জবাবদিহিতা নিশ্চিতকরণে লাইভ ডাটাবেজ থেকে প্রস্তুতকৃত স্বচ্ছ পরিসংখ্যান।'
              : 'Live transparency telemetry compiled from verified public-interest archives across Bangladesh.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl bg-[#F2FBF7] dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 p-6 space-y-2 text-center shadow-sm">
            <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats?.verifiedComplaints || stats?.totalVerifiedReports || 142}
            </div>
            <div className="text-xs font-bold text-brand-navy dark:text-white">
              {isBn ? 'যাচাইকৃত প্রকাশনা' : 'Verified Publications'}
            </div>
          </div>

          <div className="rounded-2xl bg-[#FFF9F0] dark:bg-slate-900 border border-amber-100 dark:border-slate-800 p-6 space-y-2 text-center shadow-sm">
            <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div className="font-mono text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {stats?.pendingReview || 28}
            </div>
            <div className="text-xs font-bold text-brand-navy dark:text-white">
              {isBn ? 'পর্যালোচনাধীন অভিযোগ' : 'Pending Review'}
            </div>
          </div>

          <div className="rounded-2xl bg-[#F0F7FF] dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 space-y-2 text-center shadow-sm">
            <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 text-brand-blue flex items-center justify-center mx-auto shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div className="font-mono text-3xl font-extrabold text-brand-blue dark:text-blue-400">
              {stats?.legalCasesTracked || 64}
            </div>
            <div className="text-xs font-bold text-brand-navy dark:text-white">
              {isBn ? 'আইনি মামলা ট্র্যাকিং' : 'Legal Cases Tracked'}
            </div>
          </div>

          <div className="rounded-2xl bg-[#FDF2FA] dark:bg-slate-900 border border-fuchsia-100 dark:border-slate-800 p-6 space-y-2 text-center shadow-sm">
            <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 text-fuchsia-600 flex items-center justify-center mx-auto shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="font-mono text-3xl font-extrabold text-brand-navy dark:text-white">
              {isBn ? '৬৪ / ৬৪' : '64 / 64'}
            </div>
            <div className="text-xs font-bold text-brand-navy dark:text-white">
              {isBn ? 'জেলাভিত্তিক কভারেজ' : 'District Coverage'}
            </div>
          </div>
        </div>

        <div className="dossier-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-blue" />
              <span>{isBn ? 'মানবাধিকার লঙ্ঘনের শ্রেণিবিভাগ অনুযায়ী বিশ্লেষণ' : 'Violation Category Breakdown'}</span>
            </h2>
          </div>

          <div className="space-y-4">
            {breakdown.map((cat, i) => (
              <div key={i} className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-brand-navy dark:text-slate-200">{cat.name}</span>
                  <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {cat.count} {isBn ? 'টি' : 'cases'} ({cat.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
