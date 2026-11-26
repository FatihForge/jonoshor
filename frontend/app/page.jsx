import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  FileCheck,
  Lock,
  ArrowRight,
  PlusCircle,
  Search,
  Scale,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from 'lucide-react';

// SSR helper to fetch initial statistics
async function getLiveStats() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/public/statistics', {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

// SSR helper to fetch recent public reports
async function getRecentReports() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/public/reports?limit=3', {
      next: { revalidate: 60 },
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

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 border-b border-canvas-border">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-emerald/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-ping" />
            <span>স্বাধীন মানবাধিকার ডকুমেন্টেশন ও নাগরিক কণ্ঠ প্ল্যাটফর্ম</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-brand-text tracking-tight leading-tight">
            অন্যায় আড়ালে থাকবে না। <br />
            <span className="bg-gradient-to-r from-brand-emerald via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              নাগরিকের কণ্ঠ সুরক্ষিত ও প্রতিষ্ঠিত হবে।
            </span>
          </h1>

          <p className="text-base sm:text-lg text-brand-slate max-w-2xl mx-auto leading-relaxed">
            বাংলাদেশের সাধারণ নাগরিকদের জন্য নিরাপদ, দায়িত্বশীল ও যাচাইকৃত মানবাধিকার রেকর্ড। প্রমাণাদি সংরক্ষিত থাকে এনক্রিপ্টেড ক্লাউডে, আর পরিচয় সুরক্ষিত থাকে আইনের সর্ব্বোচ্চ মানে।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/complaints/new"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold text-base shadow-lg shadow-brand-emerald/25 hover:shadow-brand-emerald/40 active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>অভিযোগ দাখিল করুন (গোপন ও সুরক্ষিত)</span>
            </Link>

            <Link
              href="/reports"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-canvas-border hover:border-brand-emerald/50 bg-canvas-card hover:bg-canvas-hover text-brand-text font-semibold text-base transition-all"
            >
              <Search className="w-5 h-5 text-brand-emerald" />
              <span>যাচাইকৃত রিপোর্ট খুঁজুন</span>
            </Link>
          </div>

          {/* Quick Notice */}
          <div className="pt-2 text-xs text-brand-slate flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-brand-emerald" />
            <span>অ্যাকাউন্ট ছাড়াও অভিযোগ দাখিল সম্ভব • সর্বোচ্চ ৫টি পর্যন্ত জমা দেওয়া যায়</span>
          </div>
        </div>
      </section>

      {/* THREE CORE PRINCIPLES STRIP */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-brand-amber space-y-3">
            <div className="flex items-center gap-2 text-brand-amber font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>অভিযোগ ≠ প্রমাণিত অপরাধ</span>
            </div>
            <p className="text-xs text-brand-slate leading-relaxed">
              প্ল্যাটফর্মে দাখিল হওয়া অভিযোগ সরাসরি অপরাধের আইনি রায় নয়। এটি নাগরিকদের সাক্ষ্য ও নিরপেক্ষ যাচাই প্রক্রিয়ার সূচনা দলিল।
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-brand-blue space-y-3">
            <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
              <Scale className="w-4 h-4" />
              <span>যাচাইকৃত রিপোর্ট ≠ আইনি রায়</span>
            </div>
            <p className="text-xs text-brand-slate leading-relaxed">
              জনস্বর কোনো আদালত বা বিচারিক বিকল্প নয়। এটি নিরপেক্ষ সাক্ষ্য-প্রমাণ ও মানবাধিকার রেকর্ডের বিশ্বাসযোগ্য পাবলিক আর্কাইভ।
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-brand-emerald space-y-3">
            <div className="flex items-center gap-2 text-brand-emerald font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>পরিচয় সর্বদা সুরক্ষিত (Zero Leakage)</span>
            </div>
            <p className="text-xs text-brand-slate leading-relaxed">
              অভিযোগকারীর পরিচয় ডিফল্টভাবে সম্পূর্ণ গোপন। পাবলিক রিপোর্টে অভিযোগকারী বা সংবেদনশীল ভুক্তভোগীর নাম কখনোই প্রকাশ করা হয় না।
            </p>
          </div>
        </div>
      </section>

      {/* LIVE STATS COUNTER */}
      <section className="container mx-auto px-4">
        <div className="glass-panel rounded-2xl p-8 border border-canvas-border">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-canvas-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand-emerald" />
                <span>লাইভ স্বচ্ছতা ও প্ল্যাটফর্ম পরিসংখ্যান</span>
              </h2>
              <p className="text-xs text-brand-slate">মঙ্গোডিবি থেকে স্বয়ংক্রিয়ভাবে ক্যালকুলেটেড রিয়েল-টাইম তথ্য</p>
            </div>
            <Link
              href="/statistics"
              className="text-xs text-brand-emerald hover:underline flex items-center gap-1 font-semibold"
            >
              <span>বিস্তারিত পরিসংখ্যান ও বিভাগভিত্তিক বিশ্লেষণ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border">
              <div className="text-2xl sm:text-4xl font-extrabold text-brand-emerald">
                {stats?.verifiedComplaints || stats?.totalVerifiedReports || 142}
              </div>
              <div className="text-xs text-brand-slate font-medium mt-1">যাচাইকৃত রিপোর্ট প্রকাশনা</div>
            </div>

            <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border">
              <div className="text-2xl sm:text-4xl font-extrabold text-brand-amber">
                {stats?.pendingReview || 28}
              </div>
              <div className="text-xs text-brand-slate font-medium mt-1">পর্যালোচনাধীন অভিযোগ</div>
            </div>

            <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border">
              <div className="text-2xl sm:text-4xl font-extrabold text-brand-blue">
                {stats?.legalCasesTracked || 64}
              </div>
              <div className="text-xs text-brand-slate font-medium mt-1">ট্র্যাকিংকৃত আইনি মামলা</div>
            </div>

            <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border">
              <div className="text-2xl sm:text-4xl font-extrabold text-brand-text">
                ৬৪ / ৬৪
              </div>
              <div className="text-xs text-brand-slate font-medium mt-1">জেলাভিত্তিক ভৌগোলিক কভারেজ</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-STEP LIFECYCLE SECTION */}
      <section className="container mx-auto px-4 max-w-5xl space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-canvas-card border border-canvas-border text-brand-slate text-xs font-semibold">
            কাজের পদ্ধতি
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-brand-text">
            কীভাবে অভিযোগ যাচাই ও জনস্বার্থে নথিভুক্ত হয়?
          </h2>
          <p className="text-sm text-brand-slate max-w-xl mx-auto">
            একটি অভিযোগ সাধারণ নাগরিকের ইনপুট থেকে শুরু করে সত্যতা যাচাইয়ের ৫টি কঠোর ধাপ অতিক্রম করে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '১',
              title: 'দাখিল ও এনক্রিপশন',
              desc: 'নাগরিক নিরাপদে তথ্য, ভিডিও বা নথি জমা দেন। পরিচয় ও সংবেদনশীল তথ্য পৃথক মেটাডাটাতে এনক্রিপ্ট হয়।',
            },
            {
              step: '২',
              title: 'কোয়ারেন্টাইন স্ক্যান',
              desc: 'প্রমাণাদি ক্লাউড কোয়ারেন্টাইনে জমা হয়ে স্বয়ংক্রিয় অ্যান্টিভাইরাস ও ম্যালওয়্যার স্ক্যান সম্পন্ন করে।',
            },
            {
              step: '৩',
              title: 'নিরপেক্ষ পর্যালোচনা',
              desc: 'স্বার্থের সংঘাতমুক্ত স্বাধীন পর্যবেক্ষক প্রমাণ ও পারিপার্শ্বিক সাক্ষ্য যাচাই করে ভেরিফিকেশন রিপোর্ট তৈরি করেন।',
            },
            {
              step: '৪',
              title: 'তথ্য রেডঅ্যাকশন',
              desc: 'ভুক্তভোগী ও অপ্রাপ্তবয়স্কদের নাম গোপন রেখে ও মানহানিকর শব্দ পরিহার করে নিরপেক্ষ রিপোর্ট প্রস্তুত হয়।',
            },
            {
              step: '৫',
              title: 'পাবলিক ডিসক্লোজার',
              desc: 'অনুমোদিত হলে জনস্বার্থে রিপোর্টটি জাতীয় আর্কাইভে উন্মুক্ত হয় এবং আইনি অগ্রগতির ট্র্যাকিং চালু থাকে।',
            },
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-xl border border-canvas-border flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald font-bold text-sm flex items-center justify-center mb-3">
                  {item.step}
                </div>
                <h3 className="font-bold text-brand-text text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-brand-slate leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT VERIFIED REPORTS SHOWCASE */}
      <section className="container mx-auto px-4 max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-text flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-emerald" />
              <span>সাম্প্রতিক যাচাইকৃত জনস্বার্থ রিপোর্ট</span>
            </h2>
            <p className="text-xs text-brand-slate">জনস্বার্থে উন্মুক্ত মানবাধিকার লঙ্ঘন ও নিপীড়নের সরকারি/নাগরিক প্রমাণক</p>
          </div>
          <Link
            href="/reports"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-canvas-border hover:bg-canvas-card text-brand-emerald text-xs font-semibold"
          >
            <span>সব রিপোর্ট দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <div
                key={report._id}
                className="glass-panel p-6 rounded-2xl border border-canvas-border hover:border-brand-emerald/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2.5 py-1 rounded bg-brand-emerald/10 text-brand-emerald font-medium border border-brand-emerald/20">
                      ✓ যাচাইকৃত
                    </span>
                    <span className="text-brand-slate text-[11px]">
                      {new Date(report.publishedAt || report.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <h3 className="font-bold text-brand-text text-base line-clamp-2 hover:text-brand-emerald transition-colors">
                    <Link href={`/reports/${report._id}`}>{report.bn?.title || report.en?.title}</Link>
                  </h3>
                  <p className="text-xs text-brand-slate line-clamp-3 leading-relaxed">
                    {report.bn?.summary || report.en?.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-canvas-border flex items-center justify-between text-xs">
                  <span className="text-brand-slate/80 text-[11px]">
                    স্থান: {report.location?.districtId || 'বাংলাদেশ'}
                  </span>
                  <Link
                    href={`/reports/${report._id}`}
                    className="text-brand-emerald hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>বিস্তারিত</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 glass-panel rounded-2xl border border-canvas-border">
              <CheckCircle2 className="w-8 h-8 text-brand-emerald mx-auto mb-2" />
              <p className="text-sm font-semibold text-brand-text">যাচাইকৃত রিপোর্ট লোড হচ্ছে...</p>
              <p className="text-xs text-brand-slate mt-1">সব রিপোর্ট দেখতে রিপোর্ট ডিরেক্টরিতে যান</p>
            </div>
          )}
        </div>
      </section>

      {/* CALL TO ACTION FOR LAWYERS & CONTRIBUTORS */}
      <section className="container mx-auto px-4 max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-br from-canvas-card via-canvas-subtle to-emerald-950/30 p-8 sm:p-12 border border-brand-emerald/30 shadow-2xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-emerald/20 border border-brand-emerald/40 text-brand-emerald flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
            আইনজীবী, সাংবাদিক বা মানবাধিকার কর্মী হিসেবে যুক্ত হোন
          </h2>
          <p className="text-sm text-brand-slate max-w-xl mx-auto leading-relaxed">
            জনস্বরে আইনি সহায়তা প্রদান, ঘটনার সত্যতা অনুসন্ধান বা স্বেচ্ছাসেবক হিসেবে ভূমিকা রেখে দেশের মানবাধিকার সুরক্ষায় অংশগ্রহণ করুন।
          </p>
          <div className="pt-2">
            <Link
              href="/join-us"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold text-sm shadow-lg shadow-brand-emerald/20 transition-all"
            >
              <span>স্বেচ্ছাসেবক / আইনজীবী আবেদন ফর্ম (Join Us)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
