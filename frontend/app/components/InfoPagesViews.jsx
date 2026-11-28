'use client';

import React from 'react';
import { CheckCircle2, ShieldAlert, AlertOctagon, ExternalLink } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export function AboutView() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            CHARTER & MANDATE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight">
            {isBn ? 'জনস্বর (JonoShor) কী এবং কেন?' : 'What is JonoShor & Our Mandate'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isBn
              ? 'ন্যায়বিচার, মানবিক মর্যাদা ও নাগরিকদের নির্ভয়ে কথা বলার অধিকার সুরক্ষার লক্ষ্যে গড়ে ওঠা একটি স্বাধীন নাগরিক প্ল্যাটফর্ম।'
              : 'An independent civic initiative built to safeguard human dignity, transparency, and fearless public testimony.'}
          </p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white">
              {isBn ? '১. প্ল্যাটফর্মের প্রারম্ভিক প্রেক্ষাপট' : '1. Why JonoShor Exists'}
            </h2>
            <p>
              {isBn
                ? 'বাংলাদেশে মানবাধিকার লঙ্ঘন, নির্যাতন ও নিপীড়নের ঘটনায় বহু সাধারণ মানুষ উপযুক্ত তথ্য সংরক্ষণের অভাবে অথবা নিরাপত্তার ভয়ে কোনো প্রাতিষ্ঠানিক প্রতিকার পান না। জনস্বর হলো একটি প্রযুক্তিগত নিরাপদ আশ্রয়, যেখানে যেকোনো ভুক্তভোগী বা সাক্ষী নিরাপদে ডিজিটাল প্রমাণাদি এনক্রিপ্টেড করে সংরক্ষণ করতে পারেন।'
                : 'Many victims and witnesses of human rights violations face fear or lack secure infrastructure to preserve evidence. JonoShor offers a cryptographically protected vault where testimonies and digital evidence are verified impartially.'}
            </p>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white">
              {isBn ? '২. তিনটি অপরিবর্তনীয় মূলনীতি' : '2. Three Core Safeguard Principles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#FFF9F0] dark:bg-slate-900 border border-amber-100 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-700 dark:text-amber-400 text-xs">
                  {isBn ? 'অভিযোগ ≠ অপরাধ' : 'Complaint ≠ Proven Crime'}
                </div>
                <p className="text-xs">
                  {isBn
                    ? 'প্ল্যাটফর্মে দাখিল করা অভিযোগ সরাসরি অপরাধের প্রমাণ নয়; এটি যাচাইয়ের প্রাথমিক সাক্ষ্য।'
                    : 'Submitted complaints represent testimonies initiating review, not final proof of guilt.'}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-[#F0F7FF] dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-brand-blue dark:text-blue-400 text-xs">
                  {isBn ? 'রিপোর্ট ≠ আইনি রায়' : 'Report ≠ Judicial Verdict'}
                </div>
                <p className="text-xs">
                  {isBn
                    ? 'জনস্বর কোনো আদালত নয়। প্রকাশিত রিপোর্ট আইনি আদেশের বিকল্প নয়, বরং সত্য অনুসন্ধানের দলিল।'
                    : 'JonoShor is not a court of law; published reports serve factual public documentation.'}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-[#F2FBF7] dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                  {isBn ? 'পরিচয় সর্বদা সুরক্ষিত' : 'Identity Always Protected'}
                </div>
                <p className="text-xs">
                  {isBn
                    ? 'অভিযোগকারীর নাম বা ব্যক্তিগত তথ্য কোনো পাবলিক আর্কাইভে প্রকাশ করা সম্পূর্ণ নিষিদ্ধ।'
                    : 'Complainant and sensitive victim identities remain strictly segregated and never leaked.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white">
              {isBn ? '৩. আমরা কী করি এবং কী করি না' : '3. Our Boundaries & Commitments'}
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>{isBn ? 'আমরা নিরপেক্ষভাবে প্রমাণাদি যাচাই, ম্যালওয়্যার স্ক্যান ও জনস্বার্থে সংরক্ষণ করি।' : 'We objectively verify submitted evidence, scan files in quarantine, and preserve records.'}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>{isBn ? 'আমরা কোনো রাজনৈতিক দল বা গোষ্ঠীর হয়ে প্রোপাগান্ডা পরিচালনা করি না।' : 'We remain strictly non-partisan and independent of political influence.'}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>{isBn ? 'আমরা কোনো বিচারবহির্ভূত সামাজিক ট্রায়াল বা ক্যাঙ্গারু কোর্ট সমর্থন করি না।' : 'We reject defamation, mob trials, or extrajudicial accusations.'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white">
              {isBn ? '৪. প্রযুক্তিগত রূপরেখা ও উদ্ভাবন' : '4. Engineering & Platform Stewardship'}
            </h2>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800/80 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn
                  ? 'জনস্বর প্ল্যাটফর্মের সামগ্রিক সিস্টেম আর্কিটেকচার, ডেটাবেস ডিজাইন এবং সিকিউরিটি ইঞ্জিনিয়ারিং সম্পূর্ণ স্বাধীনভাবে উদ্ভাবিত ও বাস্তবায়ন করেছে'
                  : 'The comprehensive system architecture, database design, and security engineering of JonoShor were independently conceptualized and developed by'}{' '}
                <a
                  href="https://fatihforge.pages.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-blue dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>FatihForge</span>
                  <ExternalLink className="w-3 h-3" />
                </a>{' '}
                {isBn
                  ? '—একটি নিরপেক্ষ ও অলাভজনক সিভিক-টেক (Civic Technology) উদ্যোগ হিসেবে।'
                  : '—as an independent civic technology initiative.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                <a
                  href="https://fatihforge.pages.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
                >
                  <span>Portfolio: fatihforge.pages.dev</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a
                  href="https://github.com/FatihForge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
                >
                  <span>GitHub: @FatihForge</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowItWorksView() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const steps = isBn
    ? [
        { num: '০১', title: 'নাগরিকের অভিযোগ দাখিল (Submission & Separation)', desc: 'সাধারণ নাগরিক বা ভুক্তভোগী অনলাইনের মাধ্যমে ঘটনার স্থান, তারিখ, বিবরণ এবং প্রমাণাদি জমা দেন। কোনো অ্যাকাউন্ট ছাড়াই ৫টি অভিযোগ জমা দেওয়ার সুযোগ রয়েছে।' },
        { num: '০২', title: 'কোয়ারেন্টাইন ক্লাউড ও ম্যালওয়্যার স্ক্যান (Quarantine Scan)', desc: 'আপলোডকৃত সব ভিডিও, অডিও ও ছবি সুরক্ষিত Quarantine ফোল্ডারে জমা হয়ে স্বয়ংক্রিয়ভাবে অ্যান্টিভাইরাস ও SHA-256 হ্যাশ যাচাই সম্পন্ন করে।' },
        { num: '০৩', title: 'স্বাধীন পর্যবেক্ষক দ্বারা সত্যতা যাচাই (Independent Verification)', desc: 'স্বার্থের সংঘাতমুক্ত (Conflict-of-Interest free) মানবাধিকার পর্যবেক্ষক প্রমাণের সত্যতা ও পারিপার্শ্বিক তথ্য যাচাই করেন।' },
        { num: '০৪', title: 'নিরপেক্ষ প্রতিবেদন ও তথ্য গোপনকরণ (Sanitization & Redaction)', desc: 'ভুক্তভোগী ও অপ্রাপ্তবয়স্কদের পরিচয় সম্পূর্ণ আড়াল করে এবং নিরপেক্ষ আইনি পরিভাষা ব্যবহার করে জনস্বার্থ প্রতিবেদন প্রস্তুত করা হয়।' },
        { num: '০৫', title: 'জনস্বার্থে উন্মুক্তকরণ ও আইনি ট্র্যাকিং (Public Disclosure)', desc: 'চূড়ান্ত অনুমোদনের পর প্রতিবেদনটি পাবলিক আর্কাইভে যুক্ত হয় এবং মামলার আইনি অগ্রগতি হালনাগাদ হতে থাকে।' },
      ]
    : [
        { num: '01', title: 'Encrypted Citizen Intake & Identity Separation', desc: 'Citizens submit location, date, narrative, and supporting files. Up to 5 submissions are supported without registration while keeping personal identifiers separated.' },
        { num: '02', title: 'Cloud Quarantine & Malware Forensics', desc: 'Every uploaded file lands in isolated Quarantine storage for malware scanning and SHA-256 checksum verification before moving to the Clean vault.' },
        { num: '03', title: 'Conflict-Free Independent Observer Review', desc: 'Assigned reviewers declare any Conflict of Interest before scrutinizing testimonies and corroborating evidence.' },
        { num: '04', title: 'PII Redaction & Legal Sanitization', desc: 'Identities of minors and protected victims are masked while reports are drafted using strict neutral terminology.' },
        { num: '05', title: 'Public Disclosure & Judicial Case Tracking', desc: 'Approved dossiers enter the public archive and track ongoing FIRs, chargesheets, and court rulings.' },
      ];

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            VERIFICATION METHODOLOGY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? '৫-ধাপের নিরপেক্ষ যাচাই পদ্ধতি' : '5-Stage Independent Verification Process'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isBn ? 'প্রযুক্তি ও মানবাধিকার নীতিমালার সমন্বয়ে গড়ে ওঠা স্বচ্ছ যাচাই ও প্রকাশনা পাইপলাইন।' : 'Our transparent pipeline combining digital forensics with human rights due process.'}
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.num} className="dossier-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-brand-blue dark:text-blue-400 font-extrabold text-lg flex items-center justify-center shrink-0">
                {s.num}
              </div>
              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-brand-navy dark:text-white">{s.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SafetyView() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isBn ? 'ডিজিটাল নিরাপত্তা নির্দেশনা' : 'Operational Security Guide'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'তথ্যদাতার ব্যক্তিগত নিরাপত্তা ও সতর্কতা' : 'Whistleblower Digital Safety Protocol'}
          </h1>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isBn
                ? 'যদি আপনি কোনো প্রভাবশালী ব্যক্তি, আইনপ্রয়োগকারী সংস্থা বা অপরাধী চক্রের বিরুদ্ধে অভিযোগ দাখিল করেন, তবে আপনার ব্যক্তিগত ডিজিটাল নিরাপত্তা নিশ্চিত করা সর্বাগ্রে প্রয়োজন।'
                : 'When reporting powerful actors or state authorities, take proactive digital security precautions before submitting evidence.'}
            </p>
          </div>

          <section className="space-y-2 pt-2">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">
              {isBn ? '১. পাবলিক বা অফিসিয়াল ডিভাইস পরিহার করুন' : '1. Avoid Workplace or Monitored Devices'}
            </h2>
            <p>
              {isBn
                ? 'আপনার কর্মস্থলের কম্পিউটার, অফিস ওয়াইফাই বা কারও ব্যক্তিগত ফোন ব্যবহার করে সংবেদনশীল অভিযোগ দাখিল করবেন না।'
                : 'Never file sensitive complaints using shared office networks or monitored corporate computers.'}
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">
              {isBn ? '২. ইনকগনিটো ব্রাউজিং ও ভিপিএন ব্যবহার' : '2. Use Incognito Mode & Trusted VPN / Tor'}
            </h2>
            <p>
              {isBn
                ? 'অভিযোগ দাখিলের সময় প্রাইভেট বা ইনকগনিটো মোড অন করুন এবং বিশ্বস্ত ভিপিএন বা টর ব্রাউজার (Tor Browser) ব্যবহার করুন।'
                : 'Enable private browsing and route high-risk submissions through a reputable VPN or Tor Browser.'}
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">
              {isBn ? '৩. ছবির মেটাডাটা (EXIF Data) স্ক্রাবিং' : '3. Camera Location & EXIF Metadata Scrubbing'}
            </h2>
            <p>
              {isBn
                ? 'আমাদের ব্যাকএন্ড সিস্টেম স্বয়ংক্রিয়ভাবে EXIF মেটাডাটা স্ক্রাব করে, তবে আপনি চাইলে ছবি তোলার সময় জিপিএস লোকেশন বন্ধ রাখতে পারেন।'
                : 'Our backend automatically scrubs EXIF metadata on upload, and we recommend disabling camera GPS tagging on sensitive captures.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function PrivacyView() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            PRIVACY & PROTECTION
          </span>
          <h1 className="text-3xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'গোপনীয়তা ও ডেটা সংরক্ষণ পলিসি' : 'Privacy & Data Retention Policy'}
          </h1>
          <p className="text-xs text-slate-400">{isBn ? 'সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬' : 'Last Updated: November 2026'}</p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">
              {isBn ? '১. পরিচয় গোপনীয়তা নীতি (Strict Non-Disclosure)' : '1. Strict Non-Disclosure of Reporter Identity'}
            </h2>
            <p>
              {isBn
                ? 'জনস্বর প্ল্যাটফর্মে কোনো নাগরিক অভিযোগ দাখিল করলে তার নাম, ইমেইল, মোবাইল বা আইপি অ্যাড্রেস কখনোই পাবলিক ডিরেক্টরিতে উন্মুক্ত করা হয় না।'
                : 'Complainant names, emails, phone numbers, and IPs are segregated in backend storage and never disclosed on public pages.'}
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">
              {isBn ? '২. সংগৃহীত প্রমাণের নিরাপত্তা' : '2. Evidence Access & Proxy Streaming'}
            </h2>
            <p>
              {isBn
                ? 'ব্যবহারকারীর আপলোডকৃত নথি সুরক্ষিত ক্লাউড ভল্টে সংরক্ষিত থাকে। কোনো সরাসরি পাবলিক লিঙ্ক ইন্টারনেটে উন্মুক্ত থাকে না।'
                : 'Uploaded evidence stays inside isolated cloud storage accessible only via authenticated backend proxy routes.'}
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">
              {isBn ? '৩. ব্রাউজার কুকিজ ও ট্র্যাকার বর্জন' : '3. Zero Commercial Trackers'}
            </h2>
            <p>
              {isBn
                ? 'জনস্বর কোনো থার্ড-পার্টি অ্যাড ট্র্যাকার ব্যবহার করে না। কেবল সেশন ও CSRF সুরক্ষার জন্য প্রয়োজনীয় কুকি ব্যবহৃত হয়।'
                : 'JonoShor runs zero third-party ad trackers. Only essential HttpOnly session and CSRF cookies are used.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function TermsView() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            TERMS & DISCLAIMERS
          </span>
          <h1 className="text-3xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'ব্যবহারের শর্তাবলী ও আইনি দায়মুক্তি' : 'Terms of Service & Legal Disclaimers'}
          </h1>
          <p className="text-xs text-slate-400">{isBn ? 'সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬' : 'Last Updated: November 2026'}</p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">
              {isBn ? '১. প্ল্যাটফর্মের আইনি অবস্থান' : '1. Non-Judicial Documentation Platform'}
            </h2>
            <p>
              {isBn
                ? 'জনস্বর কোনো আদালত, ট্রাইব্যুনাল বা আইনি কর্তৃপক্ষ নয়। প্রকাশিত প্রতিবেদন কাউকে চূড়ান্ত অপরাধী হিসেবে রায় দেয় না।'
                : 'JonoShor is not a judicial court or tribunal. Verified reports document corroborated testimony without issuing legal verdicts.'}
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">
              {isBn ? '২. মিথ্যা বা বিদ্বেষমূলক তথ্যের দায়' : '2. Prohibition of Malicious Submissions'}
            </h2>
            <p>
              {isBn
                ? 'ইচ্ছাকৃত বানোয়াট তথ্য বা জাল প্রমাণ জমা দিলে অভিযোগ বাতিল হবে এবং অ্যাকাউন্টের বিরুদ্ধে ব্যবস্থা নেওয়া হবে।'
                : 'Intentional fabrication or malicious defamation leads to immediate rejection and account sanctions.'}
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">
              {isBn ? '৩. আইনি সহায়তা ও সীমাবদ্ধতা' : '3. Pro-Bono Legal Aid Scope'}
            </h2>
            <p>
              {isBn
                ? 'জনস্বর ভুক্তভোগীদের সাথে স্বেচ্ছাসেবী আইনজীবীদের যোগাযোগের সুযোগ করে দেয়, তবে কোনো বাণিজ্যিক ফলাফলের গ্যারান্টি দেয় না।'
                : 'JonoShor facilitates volunteer legal referrals without guaranteeing courtroom outcomes.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
