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
  Calendar,
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

async function getLiveStats() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/public/statistics', {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

async function getRecentReports() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/public/reports?limit=4', {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const stats = await getLiveStats();
  const recentReports = await getRecentReports();

  const verifiedCount = stats?.verifiedComplaints || stats?.totalVerifiedReports || 142;
  const pendingCount = stats?.pendingReview || 28;
  const legalCount = stats?.legalCasesTracked || 64;

  const categories = [
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
  ];

  return (
    <div className="overflow-hidden">
      {/* 1. DREAMHUB-INSPIRED ICE-BLUE HERO SECTION */}
      <section className="dream-hero-bg relative py-14 md:py-24 border-b border-blue-100/70 dark:border-slate-800">
        {/* Subtle decorative geometric accents matching Dreamhub */}
        <div className="hidden md:block absolute top-14 left-[44%] w-3 h-3 border-2 border-brand-blue/40 rotate-45 pointer-events-none" />
        <div className="hidden md:block absolute bottom-16 left-[12%] w-3.5 h-3.5 border-2 border-cyan-500/40 rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Far-Left Vertical Quick Rail + Hero Text (7 Cols) */}
            <div className="lg:col-span-6 flex items-start gap-6">
              {/* Vertical Rail (Desktop) */}
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

              {/* Hero Copy */}
              <div className="space-y-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400">
                  CREATING A SAFER TOMORROW • ৬৪ জেলা কভারেজ
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-extrabold text-brand-navy dark:text-white tracking-tight leading-[1.18]">
                  নাগরিক অধিকার সুরক্ষায় নিরাপদ সাক্ষ্য ও সত্যের দলিল
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  বাংলাদেশের যেকোনো প্রান্ত থেকে মানবাধিকার লঙ্ঘন ও অন্যায়ের তথ্য সম্পূর্ণ গোপন পরিচয়ে নথিভুক্ত করুন। আমাদের স্বাধীন পর্যবেক্ষক প্যানেল বহুস্তরীয় যাচাইয়ের মাধ্যমে জনস্বার্থে সত্য প্রকাশ করে।
                </p>

                {/* Two Signature Pill Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/complaints/new"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                  >
                    <span>অভিযোগ দাখিল করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/reports"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-blue text-brand-navy dark:text-white font-bold text-sm shadow-sm transition-all"
                  >
                    <span>যাচাইকৃত রিপোর্ট</span>
                    <ArrowRight className="w-4 h-4 text-brand-blue dark:text-blue-400" />
                  </Link>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>অ্যাকাউন্ট ছাড়াই অভিযোগ দাখিল সম্ভব</span>
                  </span>
                  <span>•</span>
                  <span>পরিচয় ১০০% এনক্রিপ্টেড</span>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Circular Portrait Showcase + Floating Cards (Dreamhub Signature) */}
            <div className="lg:col-span-6 relative flex justify-center items-center py-6">
              {/* Outer Concentric Glow Ring */}
              <div className="relative w-72 h-72 sm:w-[390px] sm:h-[390px] rounded-full bg-white/70 dark:bg-slate-800/60 p-4 shadow-float border border-white dark:border-slate-700 flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#DCEAFE] dark:bg-slate-900 relative border-4 border-white dark:border-slate-800">
                  <img
                    src="/images/hero-advocate.jpg"
                    alt="JonoShor Human Rights Legal Advocate"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Floating Card 1: Top-Right Verification Rating Badge */}
                <div className="hidden sm:flex absolute -right-6 top-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-float items-center gap-3 max-w-[230px]">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-brand-navy dark:text-white">স্বাধীন যাচাই প্যানেল</div>
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
                      যাচাই পদ্ধতি →
                    </Link>
                  </div>
                </div>

                {/* Floating Card 2: Bottom-Left Live Verification Bar Chart Card */}
                <div className="absolute -left-2 sm:-left-10 bottom-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-float space-y-2.5 w-44">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">যাচাইকৃত রেকর্ড</div>
                    <div className="text-lg font-extrabold text-brand-blue dark:text-blue-400 font-mono">
                      {verifiedCount}+ দলিল
                    </div>
                  </div>
                  {/* Crisp Vertical Blue Bars */}
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

      {/* 2. "WHAT SPECIAL IN JONOSHOR" — 4-COLUMN PASTEL FEATURE CARDS */}
      <section className="py-20 bg-white dark:bg-canvas-dark">
        <div className="container mx-auto max-w-7xl px-4 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
              OUR CORE SAFEGUARDS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
              জনস্বর কেন নিরাপদ ও নির্ভরযোগ্য?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-[#F2F7FF] dark:bg-slate-900 border border-blue-100/70 dark:border-slate-800 p-7 text-center space-y-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-brand-blue dark:text-blue-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-brand-navy dark:text-white">
                অভিযোগ ≠ প্রমাণিত অপরাধ
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                দাখিলকৃত অভিযোগ সরাসরি অপরাধের প্রমাণ নয়; এটি নিরপেক্ষ যাচাই প্রক্রিয়ার প্রাথমিক দলিল।
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF4F2] dark:bg-slate-900 border border-rose-100/70 dark:border-slate-800 p-7 text-center space-y-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-brand-navy dark:text-white">
                রিপোর্ট ≠ আইনি রায়
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                জনস্বর কোনো বিচারিক আদালত নয়; প্রকাশিত প্রতিবেদন জনস্বার্থ সচেতনতার প্রামাণ্য আর্কাইভ।
              </p>
            </div>

            <div className="rounded-2xl bg-[#F2FBF7] dark:bg-slate-900 border border-emerald-100/70 dark:border-slate-800 p-7 text-center space-y-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-brand-navy dark:text-white">
                পরিচয় সর্বদা সুরক্ষিত
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                অভিযোগকারীর নাম, ফোন ও ঠিকানা আলাদা এনক্রিপ্টেড স্তরে থাকে—পাবলিক রিপোর্টে প্রকাশিত হয় না।
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF9F0] dark:bg-slate-900 border border-amber-100/70 dark:border-slate-800 p-7 text-center space-y-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-brand-navy dark:text-white">
                ফরেনসিক ও স্ক্যান সুরক্ষা
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                প্রতিটি ডিজিটাল প্রমাণ কোয়ারেন্টাইন ম্যালওয়্যার স্ক্যান এবং EXIF স্ক্রাবিং সম্পন্ন করে সংরক্ষিত হয়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISSION SPLIT SECTION ("Consult / Submit Anywhere, Anytime") */}
      <section className="py-20 bg-[#F5F8FF] dark:bg-slate-900/50 border-y border-blue-100/60 dark:border-slate-800">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Arched Image Composition */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-tl-[80px] rounded-br-[80px] rounded-tr-2xl rounded-bl-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-float border-4 border-white dark:border-slate-800 max-w-lg mx-auto">
                <img
                  src="/images/mission-team.jpg"
                  alt="JonoShor Human Rights Observers"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>

              {/* Overlapping Stat Bubble */}
              <div className="hidden sm:flex absolute -bottom-5 left-6 lg:left-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-float items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-blue text-white font-extrabold flex items-center justify-center text-sm font-mono">
                  ৬৪
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy dark:text-white">সারা বাংলাদেশ কভারেজ</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {legalCount} টি সক্রিয় আইনি মামলা ট্র্যাকিং
                  </div>
                </div>
              </div>
            </div>

            {/* Right Mission Text */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
                ABOUT OUR MISSION
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy dark:text-white leading-tight">
                দেশের যেকোনো প্রান্ত থেকে, যেকোনো সময় নিরাপদ অভিযোগ ও সহায়তা
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                ভয়ভীতি বা আইনি জটিলতার কারণে সাধারণ নাগরিকের সাক্ষ্য যেন হারিয়ে না যায়—সে লক্ষ্যেই আমাদের এই প্রযুক্তিগত আশ্রয়। আইনজীবী, সাংবাদিক ও মানবাধিকার কর্মীদের সমন্বয়ে গঠিত স্বাধীন দল প্রতিটি ঘটনা যাচাই করে।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-semibold text-brand-navy dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue dark:text-blue-400 shrink-0" />
                  <span>স্বার্থের সংঘাতমুক্ত নিরপেক্ষ রিভিউ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue dark:text-blue-400 shrink-0" />
                  <span>৫-ধাপের প্রামাণ্য যাচাই পাইপলাইন</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue dark:text-blue-400 shrink-0" />
                  <span>স্বেচ্ছাসেবী আইনজীবী সংযোগ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue dark:text-blue-400 shrink-0" />
                  <span>অপরিবর্তনযোগ্য অডিট ও প্রমাণাগার</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                >
                  <span>আমাদের ম্যান্ডেট পড়ুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/safety"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-blue text-brand-navy dark:text-white font-bold text-xs transition-all"
                >
                  <span>নিরাপত্তা গাইডলাইন</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 6-CARD PASTEL CATEGORY GRID ("Benefit For Citizen Protection") */}
      <section className="py-20 bg-white dark:bg-canvas-dark">
        <div className="container mx-auto max-w-6xl px-4 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
              DOCUMENTATION CATEGORIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
              মানবাধিকার সুরক্ষা ও অভিযোগের ক্ষেত্রসমূহ
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
                    <span>বিস্তারিত দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. VERIFIED PUBLIC DOSSIERS ("Meet Verified Reports" 4-Column Section) */}
      <section className="py-20 bg-[#F5F8FF] dark:bg-slate-900/50 border-t border-blue-100/60 dark:border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
                VERIFIED ARCHIVE DOSSIERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white">
                সাম্প্রতিক যাচাইকৃত জনস্বার্থ প্রতিবেদন
              </h2>
            </div>

            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              <span>সব রিপোর্ট দেখুন</span>
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
                        ✓ যাচাইকৃত
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(report.publishedAt || report.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-brand-navy dark:text-white line-clamp-2 hover:text-brand-blue transition-colors">
                      <Link href={`/reports/${report._id}`}>
                        {report.bn?.title || report.en?.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {report.bn?.summary || report.en?.summary}
                    </p>
                  </div>

                  <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                      {report.location?.districtId || 'বাংলাদেশ'}
                    </span>
                    <Link
                      href={`/reports/${report._id}`}
                      className="font-bold text-brand-blue dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>পড়ুন</span>
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
                যাচাইকৃত জনস্বার্থ আর্কাইভ সক্রিয় রয়েছে
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                বর্তমানে {pendingCount}টি অভিযোগ স্বাধীন পর্যবেক্ষক প্যানেলের নিরীক্ষায় রয়েছে। অনুমোদিত রিপোর্টসমূহ দেখতে ডিরেক্টরি ব্রাউজ করুন।
              </p>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold"
              >
                <span>ডিরেক্টরি খুলুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 6. INTEGRITY STATEMENT / TESTIMONY BLOCK */}
      <section className="py-20 bg-white dark:bg-canvas-dark">
        <div className="container mx-auto max-w-3xl px-4 text-center space-y-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            TRANSPARENCY & LEGAL CHARTER
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white">
            স্বচ্ছতা, নিরপেক্ষতা ও নাগরিক সুরক্ষার অঙ্গীকার
          </h2>

          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 border-4 border-white dark:border-slate-800 shadow-card flex items-center justify-center mx-auto text-brand-blue dark:text-blue-400">
            <HeartHandshake className="w-7 h-7" />
          </div>

          <blockquote className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed italic">
            “প্রতিটি নাগরিকের ন্যায়বিচার পাওয়ার ও নিরাপদে নিজের অভিজ্ঞতা নথিভুক্ত করার অধিকার রয়েছে। জনস্বর কোনো রাজনৈতিক প্রভাব ছাড়াই প্রমাণ-ভিত্তিক মানবাধিকার আর্কাইভ সংরক্ষণে প্রতিশ্রুতিবদ্ধ।”
          </blockquote>

          <div>
            <div className="font-bold text-sm text-brand-navy dark:text-white">জনস্বর স্বাধীন পর্যবেক্ষক ও আইনি প্যানেল</div>
            <div className="text-xs text-slate-400">Independent Documentation Taskforce</div>
          </div>
        </div>
      </section>

      {/* 7. ROYAL BLUE FULL-WIDTH ARCHIVE SEARCH BANNER (Dreamhub Signature) */}
      <section className="bg-gradient-to-r from-[#1456D1] via-[#1A62E8] to-[#0F44A8] py-16 px-4 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />

        <div className="container mx-auto max-w-3xl text-center space-y-5 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            যাচাইকৃত রিপোর্ট বা জেলা ভিত্তিক তথ্য খুঁজুন
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            বাংলাদেশের ৬৪ জেলার যেকোনো মানবাধিকার লঙ্ঘন প্রতিবেদন, মামলার অগ্রগতি বা বিষয়ভিত্তিক নথি সরাসরি অনুসন্ধান করুন।
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
              placeholder="কি-ওয়ার্ড বা জেলার নাম লিখুন..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-brand-navy hover:bg-slate-900 text-white text-xs font-bold shrink-0 transition-colors"
            >
              অনুসন্ধান
            </button>
          </form>
        </div>
      </section>

      {/* 8. UPDATES & METHODOLOGY (3-Column Clean Cards) */}
      <section className="py-20 bg-white dark:bg-canvas-dark">
        <div className="container mx-auto max-w-7xl px-4 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
                RESOURCES & GUIDES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white">
                নিরাপত্তা নির্দেশিকা ও কাজের পদ্ধতি
              </h2>
            </div>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold transition-all"
            >
              <span>সব নির্দেশিকা দেখুন</span>
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
                  ৫-ধাপের নিরপেক্ষ সত্যতা যাচাই পদ্ধতি
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  দাখিল, কোয়ারেন্টাইন স্ক্যান, স্বার্থের সংঘাত যাচাই ও রেডঅ্যাকশনসহ সম্পূর্ণ প্রক্রিয়া।
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
                  তথ্যদাতার ডিজিটাল নিরাপত্তা ও সতর্কতা
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  ঝুঁকিপূর্ণ পরিস্থিতিতে ভিপিএন, ইনকগনিটো এবং ছবির মেটাডাটা সুরক্ষার নির্দেশনা।
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
                  আইনজীবী, চিকিৎসক ও স্বেচ্ছাসেবক হিসেবে যোগ দিন
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  ভুক্তভোগীদের বিনামূল্যে আইনি পরামর্শ ও সত্য অনুসন্ধানে অংশগ্রহণ করুন।
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
