import React from 'react';
import Link from 'next/link';
import { Search, Filter, FileText, ArrowRight, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'যাচাইকৃত রিপোর্ট ডিরেক্টরি',
  description: 'জনস্বার্থে অনুমোদিত ও সত্যতা যাচাইকৃত মানবাধিকার লঙ্ঘন ও নাগরিক অভিযোগের সরকারি/নিরপেক্ষ আর্কাইভ।',
};

async function fetchReports(searchParams) {
  const query = new URLSearchParams(searchParams).toString();
  try {
    const res = await fetch(`http://localhost:5000/api/v1/public/reports?${query}`, {
      cache: 'no-store',
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
    const res = await fetch('http://localhost:5000/api/v1/public/districts', { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function ReportsDirectoryPage({ searchParams }) {
  const { data: reports, pagination } = await fetchReports(searchParams);
  const districts = await fetchDistricts();

  const currentCategory = searchParams?.category || '';
  const currentDistrict = searchParams?.districtId || '';
  const currentSearch = searchParams?.search || '';

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>পাবলিক রেকর্ড আর্কাইভ (Verified Reports)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text">
          যাচাইকৃত মানবাধিকার লঙ্ঘন ও নাগরিক অভিযোগ
        </h1>
        <p className="text-sm text-brand-slate max-w-2xl leading-relaxed">
          প্রতিটি প্রকাশনা স্বাধীন তদন্তকারী ও পর্যবেক্ষক দ্বারা বহুস্তরীয় যাচাই ও নিরপেক্ষ আইনি নিরীক্ষার পর জনস্বার্থে উন্মুক্ত করা হয়েছে।
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form method="GET" action="/reports" className="glass-panel p-4 rounded-2xl border border-canvas-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              defaultValue={currentSearch}
              placeholder="কি-ওয়ার্ড বা বিষয় খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-xs text-brand-text placeholder-brand-slate/60 focus:outline-none focus:border-brand-emerald"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              name="category"
              defaultValue={currentCategory}
              className="w-full px-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-emerald"
            >
              <option value="">সকল ক্যাটাগরি</option>
              <option value="torture_and_custodial_abuse">হেফাজতে নির্যাতন ও নিপীড়ন</option>
              <option value="unlawful_detention">বেআইনি আটক ও গুমের চেষ্টা</option>
              <option value="freedom_of_speech_suppression">মতপ্রকাশের স্বাধীনতা দমন</option>
              <option value="extortion_and_police_harassment">চাঁদাবাজি ও পুলিশি হয়রানি</option>
              <option value="land_grabbing_and_eviction">জমি দখল ও উচ্ছেদ</option>
              <option value="other">অন্যান্য মানবাধিকার লঙ্ঘন</option>
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <select
              name="districtId"
              defaultValue={currentDistrict}
              className="w-full px-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-emerald"
            >
              <option value="">সকল জেলা</option>
              {districts.map((d) => (
                <option key={d.districtId || d._id || d.name} value={d.districtId || d.name}>
                  {d.nameBn || d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-brand-emerald/10 transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>ফিল্টার প্রয়োগ করুন</span>
            </button>
          </div>
        </div>
      </form>

      {/* Reports Listing Grid */}
      <div className="space-y-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report._id}
              className="glass-panel p-6 rounded-2xl border border-canvas-border hover:border-brand-emerald/40 transition-all space-y-4"
            >
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 text-xs font-semibold">
                    ✓ সত্যতা যাচাইকৃত
                  </span>
                  <span className="text-xs text-brand-slate font-medium px-2 py-0.5 rounded bg-canvas-card border border-canvas-border">
                    {report.category?.primary || 'মানবাধিকার লঙ্ঘন'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-brand-slate">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
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
                <h2 className="text-lg sm:text-xl font-bold text-brand-text hover:text-brand-emerald transition-colors">
                  <Link href={`/reports/${report._id}`}>
                    {report.bn?.title || report.en?.title || 'যাচাইকৃত ঘটনা প্রতিবেদন'}
                  </Link>
                </h2>
                <p className="text-xs sm:text-sm text-brand-slate mt-2 leading-relaxed line-clamp-3">
                  {report.bn?.summary || report.en?.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-canvas-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-brand-slate">
                  <span>মামলার অবস্থা:</span>
                  <span className="px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue font-semibold border border-brand-blue/20">
                    {report.caseStatus || 'তদন্তাধীন'}
                  </span>
                </div>

                <Link
                  href={`/reports/${report._id}`}
                  className="flex items-center gap-1 text-brand-emerald hover:underline font-bold text-xs"
                >
                  <span>সম্পূর্ণ প্রতিবেদন ও প্রমাণক দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 glass-panel rounded-2xl border border-canvas-border space-y-3">
            <FileText className="w-10 h-10 text-brand-slate mx-auto opacity-50" />
            <p className="text-base font-bold text-brand-text">কোনো রিপোর্ট পাওয়া যায়নি</p>
            <p className="text-xs text-brand-slate max-w-sm mx-auto">
              আপনার ফিল্টার মান পরিবর্তন করে আবার চেষ্টা করুন অথবা সম্পূর্ণ ডিরেক্টরি ব্রাউজ করুন।
            </p>
            <Link
              href="/reports"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-canvas-card border border-canvas-border text-xs text-brand-emerald font-semibold"
            >
              ফিল্টার রিসেট করুন
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
