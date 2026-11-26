'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Scale,
  FileCheck,
  ShieldAlert,
  MapPin,
  Star,
  CheckCircle2,
  Users,
  Search,
  BarChart3,
  HeartHandshake,
  Gavel,
  EyeOff,
  FileText,
} from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function HomeView({ stats, recentReports }) {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const verifiedCount = stats?.verifiedComplaints || stats?.totalVerifiedReports || 142;
  const pendingCount = stats?.pendingReview || 28;
  const legalCount = stats?.legalCasesTracked || 64;

  const categories = isBn
    ? [
        {
          title: 'হেফাজতে নির্যাতন',
          desc: 'থানা, কারাগার বা নিরাপত্তা হেফাজতে শারীরিক ও মানসিক নিপীড়নের সাক্ষ্য ও প্রমাণ নথিভুক্তকরণ।',
          href: '/reports?category=torture_and_custodial_abuse',
          bg: 'bg-[#FFF4F2] dark:bg-slate-900',
          iconColor: 'text-rose-600 dark:text-rose-400',
          iconBg: 'bg-rose-100 dark:bg-rose-950/60',
          Icon: ShieldAlert,
        },
        {
          title: 'বেআইনি আটক ও গুম',
          desc: 'পরোয়ানা ছাড়া গ্রেফতার, নিখোঁজ বা গুমের চেষ্টার ঘটনা যাচাই ও আইনি ট্র্যাকিং।',
          href: '/reports?category=unlawful_detention',
          bg: 'bg-[#FDF2FA] dark:bg-slate-900',
          iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
          iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/60',
          Icon: EyeOff,
        },
        {
          title: 'মতপ্রকাশ ও সংবাদ স্বাধীনতা',
          desc: 'সাংবাদিক, লেখক ও নাগরিকদের মতপ্রকাশে বাধা, হুমকি ও ডিজিটাল হয়রানির রেকর্ড।',
          href: '/reports?category=freedom_of_speech_suppression',
          bg: 'bg-[#F0F7FF] dark:bg-slate-900',
          iconColor: 'text-brand-blue dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-950/60',
          Icon: FileText,
        },
        {
          title: 'পুলিশি হয়রানি ও চাঁদাবাজি',
          desc: 'ক্ষমতার অপব্যবহার, মিথ্যা মামলা ও জোরপূর্বক অর্থ আদায়ের অভিযোগ যাচাইকরণ।',
          href: '/reports?category=extortion_and_police_harassment',
          bg: 'bg-[#FFF5F5] dark:bg-slate-900',
          iconColor: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-950/60',
          Icon: Scale,
        },
        {
          title: 'জমি দখল ও উচ্ছেদ',
          desc: 'বিনা নোটিশে উচ্ছেদ, সংখ্যালঘু বা প্রান্তিক জনগোষ্ঠীর সম্পত্তি দখলের প্রামাণ্য দলিল।',
          href: '/reports?category=land_grabbing_and_eviction',
          bg: 'bg-[#F2FBF2] dark:bg-slate-900',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
          Icon: MapPin,
        },
        {
          title: 'আইনি সহায়তা ও মামলা ট্র্যাকিং',
          desc: 'আদালত, এফআইআর ও প্রশাসনিক তদন্তের চলমান অগ্রগতি ও ফলাফল পর্যবেক্ষণ।',
          href: '/statistics',
          bg: 'bg-[#F3F4FF] dark:bg-slate-900',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
          Icon: Gavel,
        },
      ]
    : [
        {
          title: 'Custodial Torture & Abuse',
          desc: 'Documenting physical or psychological abuse in police stations, detention centers, or custody.',
          href: '/reports?category=torture_and_custodial_abuse',
          bg: 'bg-[#FFF4F2] dark:bg-slate-900',
          iconColor: 'text-rose-600 dark:text-rose-400',
          iconBg: 'bg-rose-100 dark:bg-rose-950/60',
          Icon: ShieldAlert,
        },
        {
          title: 'Unlawful Detention & Abduction',
          desc: 'Verifying warrantless arrests, enforced disappearances, and tracking official inquiries.',
          href: '/reports?category=unlawful_detention',
          bg: 'bg-[#FDF2FA] dark:bg-slate-900',
          iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
          iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/60',
          Icon: EyeOff,
        },
        {
          title: 'Free Speech & Press Rights',
          desc: 'Recording intimidation, censorship, and digital harassment against journalists and citizens.',
          href: '/reports?category=freedom_of_speech_suppression',
          bg: 'bg-[#F0F7FF] dark:bg-slate-900',
          iconColor: 'text-brand-blue dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-950/60',
          Icon: FileText,
        },
        {
          title: 'Harassment & Extortion',
          desc: 'Evaluating claims of abuse of power, fabricated charges, and unlawful financial coercion.',
          href: '/reports?category=extortion_and_police_harassment',
          bg: 'bg-[#FFF5F5] dark:bg-slate-900',
          iconColor: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-950/60',
          Icon: Scale,
        },
        {
          title: 'Land Grabbing & Eviction',
          desc: 'Evidence records of forced evictions without due process and property dispossession.',
          href: '/reports?category=land_grabbing_and_eviction',
          bg: 'bg-[#F2FBF2] dark:bg-slate-900',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
          Icon: MapPin,
        },
        {
          title: 'Legal Aid & Case Tracking',
          desc: 'Following FIR filings, court hearings, and formal judicial remedies over time.',
          href: '/statistics',
          bg: 'bg-[#F3F4FF] dark:bg-slate-900',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
          Icon: Gavel,
        },
      ];

  return (
    <div className="overflow-hidden">
      {/* 1. DREAMHUB-INSPIRED ICE-BLUE HERO SECTION */}
      <section className="dream-hero-bg relative py-14 md:py-24 border-b border-blue-100/70 dark:border-slate-800">
        <div className="hidden md:block absolute top-14 left-[44%] w-3 h-3 border-2 border-brand-blue/40 rotate-45 pointer-events-none" />
        <div className="hidden md:block absolute bottom-16 left-[12%] w-3.5 h-3.5 border-2 border-cyan-500/40 rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 flex items-start gap-6">
              <div className="hidden xl:flex flex-col items-center gap-4 pt-3 text-slate-400 dark:text-slate-500">
                <div className="w-px h-14 bg-slate-300 dark:bg-slate-700" />
                <Link href="/reports" className="hover:text-brand-blue transition-colors" title="Verified Reports">
                  <FileCheck className="w-4 h-4" />
                </Link>
                <Link href="/statistics" className="hover:text-brand-blue transition-colors" title="Statistics">
                  <BarChart3 className="w-4 h-4" />
                </Link>
                <Link href="/safety" className="hover:text-brand-blue transition-colors" title="Safety Guide">
                  <Lock className="w-4 h-4" />
                </Link>
                <Link href="/join-us" className="hover:text-brand-blue transition-colors" title="Join Panel">
                  <Users className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400">
                  {isBn
                    ? 'CREATING A SAFER TOMORROW • ৬৪ জেলা কভারেজ'
                    : 'CREATING A SAFER TOMORROW • 64 DISTRICTS COVERED'}
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-extrabold text-brand-navy dark:text-white tracking-tight leading-[1.18]">
                  {isBn
                    ? 'নাগরিক অধিকার সুরক্ষায় নিরাপদ সাক্ষ্য ও সত্যের দলিল'
                    : 'Secure Civic Documentation & Human Rights Verification'}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  {isBn
                    ? 'বাংলাদেশের যেকোনো প্রান্ত থেকে মানবাধিকার লঙ্ঘন ও অন্যায়ের তথ্য সম্পূর্ণ গোপন পরিচয়ে নথিভুক্ত করুন। আমাদের স্বাধীন পর্যবেক্ষক প্যানেল বহুস্তরীয় যাচাইয়ের মাধ্যমে জনস্বার্থে সত্য প্রকাশ করে।'
                    : 'Safely document human rights violations anywhere in Bangladesh with strict zero-leakage identity protection. Independent observers review and publish verified public-interest dossiers.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/complaints/new"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                  >
                    <span>{isBn ? 'অভিযোগ দাখিল করুন' : 'Submit Complaint'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/reports"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-blue text-brand-navy dark:text-white font-bold text-sm shadow-sm transition-all"
                  >
                    <span>{isBn ? 'যাচাইকৃত রিপোর্ট' : 'Verified Reports'}</span>
                    <ArrowRight className="w-4 h-4 text-brand-blue dark:text-blue-400" />
                  </Link>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>{isBn ? 'অ্যাকাউন্ট ছাড়াই অভিযোগ দাখিল সম্ভব' : 'Anonymous submission without registration'}</span>
                  </span>
                  <span>•</span>
                  <span>{isBn ? 'পরিচয় ১০০% এনক্রিপ্টেড' : '100% Identity Protected'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex justify-center items-center py-6">
              <div className="relative w-72 h-72 sm:w-[390px] sm:h-[390px] rounded-full bg-white/70 dark:bg-slate-800/60 p-4 shadow-float border border-white dark:border-slate-700 flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#DCEAFE] dark:bg-slate-900 relative border-4 border-white dark:border-slate-800">
                  <img
                    src="/images/hero-advocate.jpg"
                    alt="JonoShor Human Rights Legal Advocate"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="hidden sm:flex absolute -right-6 top-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-float items-center gap-3 max-w-[230px]">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-brand-navy dark:text-white">
                      {isBn ? 'স্বাধীন যাচাই প্যানেল' : 'Independent Panel'}
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400" />
                    </div>
                    <Link
                      href="/how-it-works"
                      className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-brand-blue text-white text-[10px] font-bold hover:bg-brand-blueDark"
                    >
                      {isBn ? 'যাচাই পদ্ধতি →' : 'Methodology →'}
                    </Link>
                  </div>
                </div>

                <div className="absolute -left-2 sm:-left-10 bottom-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-float space-y-2.5 w-44">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {isBn ? 'যাচাইকৃত রেকর্ড' : 'Verified Records'}
                    </div>
                    <div className="text-lg font-extrabold text-brand-blue dark:text-blue-400 font-mono">
                      {verifiedCount}+ {isBn ? 'দলিল' : 'Cases'}
                    </div>
                  </div>
                  <div className="flex items-end gap-1.5 h-9 pt-1">
                    <span className="flex-1 bg-blue-200 dark:bg-blue-900 rounded-t h-4" />
                    <span className="flex-1 bg-brand-blue rounded-t h-7" />
                    <span className="flex-1 bg-blue-300 dark:bg-blue-700 rounded-t h-5" />
                    <span className="flex-1 bg-brand-blue rounded-t h-9" />
                    <span className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-t h-6" />
                    <span className="flex-1 bg-brand-blue rounded-t h-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE SAFEGUARDS — 4 PASTEL CARDS */}
      <section className="py-20 bg-white dark:bg-canvas-dark">
        <div className="container mx-auto max-w-7xl px-4 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
              {isBn ? 'OUR CORE SAFEGUARDS' : 'INSTITUTIONAL INTEGRITY'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
              {isBn ? 'জনস্বর কেন নিরাপদ ও নির্ভরযোগ্য?' : 'Why JonoShor Stands Apart'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-[#F2F7FF] dark:bg-slate-900 border border-blue-100/70 dark:border-slate-800 p-7 text-center space-y-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-brand-blue dark:text-blue-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-brand-navy dark:text-white">
                {isBn ? 'অভিযোগ ≠ প্রমাণিত অপরাধ' : 'Complaint ≠ Proven Crime'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'দাখিলকৃত অভিযোগ সরাসরি অপরাধের প্রমাণ নয়; এটি নিরপেক্ষ যাচাই প্রক্রিয়ার প্রাথমিক দলিল।'
                  : 'Submitted allegations initiate impartial verification rather than constituting premature guilt.'}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF4F2] dark:bg-slate-900 border border-rose-100/70 dark:border-slate-800 p-7 text-center space-y-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-brand-navy dark:text-white">
                {isBn ? 'রিপোর্ট ≠ আইনি রায়' : 'Report ≠ Judicial Verdict'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'জনস্বর কোনো বিচারিক আদালত নয়; প্রকাশিত প্রতিবেদন জনস্বার্থ সচেতনতার প্রামাণ্য আর্কাইভ।'
                  : 'JonoShor is an archival documentation initiative—not a substitute for a court of law.'}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F2FBF7] dark:bg-slate-900 border border-emerald-100/70 dark:border-slate-800 p-7 text-center space-y-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-brand-navy dark:text-white">
                {isBn ? 'পরিচয় সর্বদা সুরক্ষিত' : 'Identity Always Protected'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'অভিযোগকারীর নাম, ফোন ও ঠিকানা আলাদা এনক্রিপ্টেড স্তরে থাকে—পাবলিক রিপোর্টে প্রকাশিত হয় না।'
                  : 'Reporter and protected victim identifiers stay segregated and are never leaked publicly.'}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF9F0] dark:bg-slate-900 border border-amber-100/70 dark:border-slate-800 p-7 text-center space-y-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-brand-navy dark:text-white">
                {isBn ? 'ফরেনসিক ও স্ক্যান সুরক্ষা' : 'Forensic Quarantine Scan'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'প্রতিটি ডিজিটাল প্রমাণ কোয়ারেন্টাইন ম্যালওয়্যার স্ক্যান এবং EXIF স্ক্রাবিং সম্পন্ন করে সংরক্ষিত হয়।'
                  : 'Uploaded documents undergo automated malware quarantine and EXIF metadata scrubbing.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISSION SPLIT SECTION */}
      <section className="py-20 bg-[#F5F8FF] dark:bg-slate-900/50 border-y border-blue-100/60 dark:border-slate-800">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-tl-[80px] rounded-br-[80px] rounded-tr-2xl rounded-bl-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-float border-4 border-white dark:border-slate-800 max-w-lg mx-auto">
                <img
                  src="/images/mission-team.jpg"
                  alt="JonoShor Human Rights Observers"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>

              <div className="hidden sm:flex absolute -bottom-5 left-6 lg:left-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-float items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-blue text-white font-extrabold flex items-center justify-center text-sm font-mono">
                  {isBn ? '৬৪' : '64'}
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy dark:text-white">
                    {isBn ? 'সারা বাংলাদেশ কভারেজ' : 'Nationwide Coverage'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn ? `${legalCount} টি সক্রিয় আইনি মামলা ট্র্যাকিং` : `${legalCount} Active Legal Cases Tracked`}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
                ABOUT OUR MISSION
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy dark:text-white leading-tight">
                {isBn
                  ? 'দেশের যেকোনো প্রান্ত থেকে, যেকোনো সময় নিরাপদ অভিযোগ ও সহায়তা'
                  : 'Submit Safely Anywhere, Anytime Across Bangladesh'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn
                  ? 'ভয়ভীতি বা আইনি জটিলতার কারণে সাধারণ নাগরিকের সাক্ষ্য যেন হারিয়ে না যায়—সে লক্ষ্যেই আমাদের এই প্রযুক্তিগত আশ্রয়। আইনজীবী, সাংবাদিক ও মানবাধিকার কর্মীদের সমন্বয়ে গঠিত স্বাধীন দল প্রতিটি ঘটনা যাচাই করে।'
                  : 'Built so citizen testimonies are never silenced by fear or lack of access. Independent lawyers, journalists, and researchers review and preserve every evidentiary submission.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-semibold text-brand-navy dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue dark:text-blue-400 shrink-0" />
                  <span>{isBn ? 'স্বার্থের সংঘাতমুক্ত নিরপেক্ষ রিভিউ' : 'Conflict-of-Interest Free Review'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue dark:text-blue-400 shrink-0" />
                  <span>{isBn ? '৫-ধাপের প্রামাণ্য যাচাই পাইপলাইন' : '5-Stage Verification Pipeline'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue dark:text-blue-400 shrink-0" />
                  <span>{isBn ? 'স্বেচ্ছাসেবী আইনজীবী সংযোগ' : 'Volunteer Legal Assistance Panel'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue dark:text-blue-400 shrink-0" />
                  <span>{isBn ? 'অপরিবর্তনযোগ্য অডিট ও প্রমাণাগার' : 'Immutable Audit & Evidence Vault'}</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                >
                  <span>{isBn ? 'আমাদের ম্যান্ডেট পড়ুন' : 'Read Our Mandate'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/safety"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-blue text-brand-navy dark:text-white font-bold text-xs transition-all"
                >
                  <span>{isBn ? 'নিরাপত্তা গাইডলাইন' : 'Safety Guide'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 6-CARD PASTEL CATEGORY GRID */}
      <section className="py-20 bg-white dark:bg-canvas-dark">
        <div className="container mx-auto max-w-6xl px-4 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
              DOCUMENTATION CATEGORIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
              {isBn ? 'মানবাধিকার সুরক্ষা ও অভিযোগের ক্ষেত্রসমূহ' : 'Areas of Civic Protection & Documentation'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.Icon;
              return (
                <div
                  key={idx}
                  className={`${cat.bg} rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-card transition-all flex flex-col justify-between items-center space-y-4`}
                >
                  <div className={`w-16 h-16 rounded-2xl ${cat.iconBg} ${cat.iconColor} flex items-center justify-center`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-brand-navy dark:text-white">{cat.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{cat.desc}</p>
                  </div>
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy dark:text-blue-400 hover:text-brand-blue pt-1"
                  >
                    <span>{isBn ? 'বিস্তারিত দেখুন' : 'Explore Reports'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. VERIFIED PUBLIC DOSSIERS */}
      <section className="py-20 bg-[#F5F8FF] dark:bg-slate-900/50 border-t border-blue-100/60 dark:border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
                VERIFIED ARCHIVE DOSSIERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white">
                {isBn ? 'সাম্প্রতিক যাচাইকৃত জনস্বার্থ প্রতিবেদন' : 'Recent Verified Public Reports'}
              </h2>
            </div>

            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              <span>{isBn ? 'সব রিপোর্ট দেখুন' : 'View All Reports'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentReports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentReports.map((report) => (
                <article
                  key={report._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-all"
                >
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                        ✓ {isBn ? 'যাচাইকৃত' : 'Verified'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(report.publishedAt || report.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-brand-navy dark:text-white line-clamp-2 hover:text-brand-blue transition-colors">
                      <Link href={`/reports/${report._id}`}>
                        {isBn ? (report.bn?.title || report.en?.title) : (report.en?.title || report.bn?.title)}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {isBn ? (report.bn?.summary || report.en?.summary) : (report.en?.summary || report.bn?.summary)}
                    </p>
                  </div>

                  <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                      {report.location?.districtId || (isBn ? 'বাংলাদেশ' : 'Bangladesh')}
                    </span>
                    <Link
                      href={`/reports/${report._id}`}
                      className="font-bold text-brand-blue dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>{isBn ? 'পড়ুন' : 'Read'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-10 text-center space-y-3 shadow-card">
              <ShieldCheck className="w-8 h-8 text-brand-blue mx-auto" />
              <h3 className="font-bold text-lg text-brand-navy dark:text-white">
                {isBn ? 'যাচাইকৃত জনস্বার্থ আর্কাইভ সক্রিয় রয়েছে' : 'Verified Public Archive Operational'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {isBn
                  ? `বর্তমানে ${pendingCount}টি অভিযোগ স্বাধীন পর্যবেক্ষক প্যানেলের নিরীক্ষায় রয়েছে। অনুমোদিত রিপোর্টসমূহ দেখতে ডিরেক্টরি ব্রাউজ করুন।`
                  : `${pendingCount} submissions are currently undergoing independent observer review. Browse the directory for verified public dossiers.`}
              </p>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold"
              >
                <span>{isBn ? 'ডিরেক্টরি খুলুন' : 'Browse Directory'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 6. INTEGRITY CHARTER */}
      <section className="py-20 bg-white dark:bg-canvas-dark">
        <div className="container mx-auto max-w-3xl px-4 text-center space-y-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            TRANSPARENCY & LEGAL CHARTER
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'স্বচ্ছতা, নিরপেক্ষতা ও নাগরিক সুরক্ষার অঙ্গীকার' : 'Committed to Impartiality & Citizen Protection'}
          </h2>

          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 border-4 border-white dark:border-slate-800 shadow-card flex items-center justify-center mx-auto text-brand-blue dark:text-blue-400">
            <HeartHandshake className="w-7 h-7" />
          </div>

          <blockquote className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed italic">
            {isBn
              ? '“প্রতিটি নাগরিকের ন্যায়বিচার পাওয়ার ও নিরাপদে নিজের অভিজ্ঞতা নথিভুক্ত করার অধিকার রয়েছে। জনস্বর কোনো রাজনৈতিক প্রভাব ছাড়াই প্রমাণ-ভিত্তিক মানবাধিকার আর্কাইভ সংরক্ষণে প্রতিশ্রুতিবদ্ধ।”'
              : '“Every citizen has the right to safely record injustice and seek accountability. JonoShor remains fiercely independent, verifying evidence without bias or political influence.”'}
          </blockquote>

          <div>
            <div className="font-bold text-sm text-brand-navy dark:text-white">
              {isBn ? 'জনস্বর স্বাধীন পর্যবেক্ষক ও আইনি প্যানেল' : 'JonoShor Independent Observer & Legal Panel'}
            </div>
            <div className="text-xs text-slate-400">Independent Documentation Taskforce</div>
          </div>
        </div>
      </section>

      {/* 7. ROYAL BLUE ARCHIVE SEARCH BANNER */}
      <section className="bg-gradient-to-r from-[#1456D1] via-[#1A62E8] to-[#0F44A8] py-16 px-4 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />

        <div className="container mx-auto max-w-3xl text-center space-y-5 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isBn ? 'যাচাইকৃত রিপোর্ট বা জেলা ভিত্তিক তথ্য খুঁজুন' : 'Search Verified Reports & District Records'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            {isBn
              ? 'বাংলাদেশের ৬৪ জেলার যেকোনো মানবাধিকার লঙ্ঘন প্রতিবেদন, মামলার অগ্রগতি বা বিষয়ভিত্তিক নথি সরাসরি অনুসন্ধান করুন।'
              : 'Search verified human rights documentation, legal tracking updates, and district records across Bangladesh.'}
          </p>

          <form
            method="GET"
            action="/reports"
            className="max-w-lg mx-auto bg-white rounded-full p-1.5 flex items-center shadow-xl"
          >
            <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              name="search"
              placeholder={isBn ? 'কি-ওয়ার্ড বা জেলার নাম লিখুন...' : 'Enter keyword or district...'}
              className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-brand-navy hover:bg-slate-900 text-white text-xs font-bold shrink-0 transition-colors"
            >
              {isBn ? 'অনুসন্ধান' : 'Search'}
            </button>
          </form>
        </div>
      </section>

      {/* 8. UPDATES & METHODOLOGY */}
      <section className="py-20 bg-white dark:bg-canvas-dark">
        <div className="container mx-auto max-w-7xl px-4 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
                RESOURCES & GUIDES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white">
                {isBn ? 'নিরাপত্তা নির্দেশিকা ও কাজের পদ্ধতি' : 'Safety Guidelines & Methodology'}
              </h2>
            </div>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold transition-all"
            >
              <span>{isBn ? 'সব নির্দেশিকা দেখুন' : 'View Guides'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/how-it-works"
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden hover:-translate-y-1 transition-all group"
            >
              <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col justify-between">
                <span className="self-start px-3 py-1 rounded-full bg-brand-blue text-white text-[10px] font-bold">
                  METHODOLOGY
                </span>
                <FileCheck className="w-12 h-12 text-brand-blue dark:text-blue-400" />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-bold text-base text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                  {isBn ? '৫-ধাপের নিরপেক্ষ সত্যতা যাচাই পদ্ধতি' : '5-Stage Independent Verification Process'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isBn
                    ? 'দাখিল, কোয়ারেন্টাইন স্ক্যান, স্বার্থের সংঘাত যাচাই ও রেডঅ্যাকশনসহ সম্পূর্ণ প্রক্রিয়া।'
                    : 'From encrypted intake and quarantine scan to COI checks and neutral publication.'}
                </p>
              </div>
            </Link>

            <Link
              href="/safety"
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden hover:-translate-y-1 transition-all group"
            >
              <div className="h-44 bg-gradient-to-br from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col justify-between">
                <span className="self-start px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  DIGITAL SAFETY
                </span>
                <Lock className="w-12 h-12 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-bold text-base text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                  {isBn ? 'তথ্যদাতার ডিজিটাল নিরাপত্তা ও সতর্কতা' : 'Whistleblower Digital Safety Guide'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isBn
                    ? 'ঝুঁকিপূর্ণ পরিস্থিতিতে ভিপিএন, ইনকগনিটো এবং ছবির মেটাডাটা সুরক্ষার নির্দেশনা।'
                    : 'Protect your device, network identity, and EXIF metadata in high-risk situations.'}
                </p>
              </div>
            </Link>

            <Link
              href="/join-us"
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden hover:-translate-y-1 transition-all group"
            >
              <div className="h-44 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col justify-between">
                <span className="self-start px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  LEGAL PANEL
                </span>
                <Users className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-bold text-base text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                  {isBn ? 'আইনজীবী, চিকিৎসক ও স্বেচ্ছাসেবক হিসেবে যোগ দিন' : 'Join as a Lawyer, Doctor or Volunteer'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isBn
                    ? 'ভুক্তভোগীদের বিনামূল্যে আইনি পরামর্শ ও সত্য অনুসন্ধানে অংশগ্রহণ করুন।'
                    : 'Support victims with pro-bono legal counsel, medical forensics, and research.'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
