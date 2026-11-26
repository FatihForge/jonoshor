import React from 'react';
import Link from 'next/link';
import { Search, Filter, FileText, ArrowRight, MapPin, Calendar } from 'lucide-react';

export const metadata = {
  title: 'যাচাইকৃত রিপোর্ট ডিরেক্টরি',
  description: 'জনস্বার্থে অনুমোদিত ও সত্যতা যাচাইকৃত মানবাধিকার লঙ্ঘন ও নাগরিক অভিযোগের নিরপেক্ষ আর্কাইভ।',
};

async function fetchReports(searchParams) {
  const query = new URLSearchParams(searchParams).toString();
  try {
    const res = await fetch(`http://localhost:5000/api/v1/public/reports?${query}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return { data: [], pagination: {} };
    const json = await res.json();
    return { data: json.data || [], pagination: json.pagination || {} };
  } catch {
    return { data: [], pagination: {} };
  }
}

async function fetchDistricts() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/public/districts', {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function ReportsDirectoryPage({ searchParams }) {
  const { data: reports } = await fetchReports(searchParams);
  const districts = await fetchDistricts();

  const currentCategory = searchParams?.category || '';
  const currentDistrict = searchParams?.districtId || '';
  const currentSearch = searchParams?.search || '';

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            VERIFIED PUBLIC ARCHIVE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
            যাচাইকৃত মানবাধিকার ও নাগরিক অভিযোগ ডিরেক্টরি
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            স্বাধীন পর্যবেক্ষক দ্বারা বহুস্তরীয় যাচাই ও নিরপেক্ষ আইনি নিরীক্ষার পর জনস্বার্থে উন্মুক্ত করা সরকারি/নাগরিক দলিলসমূহ।
          </p>
        </div>

        {/* Filter Toolbar */}
        <form method="GET" action="/reports" className="dossier-card p-5 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="search"
                defaultValue={currentSearch}
                placeholder="বিষয় বা কি-ওয়ার্ড..."
                className="editorial-input pl-9 pr-3 py-2.5 text-xs"
              />
            </div>

            <select
              name="category"
              defaultValue={currentCategory}
              className="editorial-input px-3 py-2.5 text-xs"
            >
              <option value="">সকল ক্যাটাগরি</option>
              <option value="torture_and_custodial_abuse">হেফাজতে নির্যাতন ও নিপীড়ন</option>
              <option value="unlawful_detention">বেআইনি আটক ও গুমের চেষ্টা</option>
              <option value="freedom_of_speech_suppression">মতপ্রকাশের স্বাধীনতা দমন</option>
              <option value="extortion_and_police_harassment">চাঁদাবাজি ও পুলিশি হয়রানি</option>
              <option value="land_grabbing_and_eviction">জমি দখল ও উচ্ছেদ</option>
              <option value="other">অন্যান্য মানবাধিকার লঙ্ঘন</option>
            </select>

            <select
              name="districtId"
              defaultValue={currentDistrict}
              className="editorial-input px-3 py-2.5 text-xs"
            >
              <option value="">সকল জেলা (৬৪ জেলা)</option>
              {districts.map((d) => (
                <option key={d.districtId || d._id || d.name} value={d.districtId || d.name}>
                  {d.nameBn || d.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full py-2.5 px-5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>আর্কাইভ খুঁজুন</span>
            </button>
          </div>
        </form>

        {/* Reports Grid */}
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <article
                key={report._id}
                className="dossier-card p-6 rounded-2xl hover:border-brand-blue dark:hover:border-blue-500 transition-all space-y-4"
              >
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-[11px] font-bold">
                      ✓ যাচাইকৃত
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-[11px]">
                      {report.category?.primary || 'মানবাধিকার লঙ্ঘন'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                      <span>{report.location?.districtId || 'ঢাকা'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(report.publishedAt || report.createdAt).toLocaleDateString('bn-BD')}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-brand-navy dark:text-white hover:text-brand-blue transition-colors">
                    <Link href={`/reports/${report._id}`}>
                      {report.bn?.title || report.en?.title || 'যাচাইকৃত ঘটনা প্রতিবেদন'}
                    </Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {report.bn?.summary || report.en?.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span>মামলার অবস্থা:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                      {report.caseStatus || 'তদন্তাধীন'}
                    </span>
                  </div>

                  <Link
                    href={`/reports/${report._id}`}
                    className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 hover:underline font-bold"
                  >
                    <span>সম্পূর্ণ প্রতিবেদন দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="dossier-card p-14 rounded-2xl text-center space-y-3">
              <FileText className="w-10 h-10 text-brand-blue/50 mx-auto" />
              <p className="text-lg font-bold text-brand-navy dark:text-white">কোনো প্রতিবেদন পাওয়া যায়নি</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                আপনার অনুসন্ধানের শর্ত পরিবর্তন করে আবার চেষ্টা করুন অথবা সম্পূর্ণ ডিরেক্টরি দেখুন।
              </p>
              <Link
                href="/reports"
                className="inline-block mt-2 px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold"
              >
                ফিল্টার রিসেট করুন
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
