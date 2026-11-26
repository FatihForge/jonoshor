'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Filter, FileText, ArrowRight, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function ReportsView({ reports, districts, currentCategory, currentDistrict, currentSearch }) {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            VERIFIED PUBLIC ARCHIVE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'যাচাইকৃত মানবাধিকার ও নাগরিক অভিযোগ ডিরেক্টরি' : 'Verified Human Rights & Citizen Reports Directory'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isBn
              ? 'স্বাধীন পর্যবেক্ষক দ্বারা বহুস্তরীয় যাচাই ও নিরপেক্ষ আইনি নিরীক্ষার পর জনস্বার্থে উন্মুক্ত করা দলিলসমূহ।'
              : 'Public-interest dossiers independently verified through multi-stage review and legal scrutiny.'}
          </p>
        </div>

        <form method="GET" action="/reports" className="dossier-card p-5 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="search"
                defaultValue={currentSearch}
                placeholder={isBn ? 'বিষয় বা কি-ওয়ার্ড...' : 'Keyword or topic...'}
                className="editorial-input pl-9 pr-3 py-2.5 text-xs"
              />
            </div>

            <select name="category" defaultValue={currentCategory} className="editorial-input px-3 py-2.5 text-xs">
              <option value="">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
              <option value="torture_and_custodial_abuse">{isBn ? 'হেফাজতে নির্যাতন ও নিপীড়ন' : 'Custodial Torture & Abuse'}</option>
              <option value="unlawful_detention">{isBn ? 'বেআইনি আটক ও গুম' : 'Unlawful Detention'}</option>
              <option value="freedom_of_speech_suppression">{isBn ? 'মতপ্রকাশের স্বাধীনতা দমন' : 'Free Speech Suppression'}</option>
              <option value="extortion_and_police_harassment">{isBn ? 'চাঁদাবাজি ও পুলিশি হয়রানি' : 'Extortion & Harassment'}</option>
              <option value="land_grabbing_and_eviction">{isBn ? 'জমি দখল ও উচ্ছেদ' : 'Land Grabbing & Eviction'}</option>
              <option value="other">{isBn ? 'অন্যান্য' : 'Other'}</option>
            </select>

            <select name="districtId" defaultValue={currentDistrict} className="editorial-input px-3 py-2.5 text-xs">
              <option value="">{isBn ? 'সকল জেলা (৬৪ জেলা)' : 'All Districts (64)'}</option>
              {districts.map((d) => (
                <option key={d.districtId || d._id || d.name} value={d.districtId || d.name}>
                  {isBn ? (d.nameBn || d.name) : (d.name || d.nameBn)}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full py-2.5 px-5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isBn ? 'আর্কাইভ খুঁজুন' : 'Apply Filter'}</span>
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <article key={report._id} className="dossier-card p-6 rounded-2xl hover:border-brand-blue transition-all space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-[11px] font-bold">
                      ✓ {isBn ? 'যাচাইকৃত' : 'Verified'}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-[11px]">
                      {report.category?.primary || (isBn ? 'মানবাধিকার লঙ্ঘন' : 'Human Rights Violation')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                      <span>{report.location?.districtId || (isBn ? 'ঢাকা' : 'Dhaka')}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(report.publishedAt || report.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-brand-navy dark:text-white hover:text-brand-blue transition-colors">
                    <Link href={`/reports/${report._id}`}>
                      {isBn
                        ? (report.bn?.title || report.en?.title || 'যাচাইকৃত ঘটনা প্রতিবেদন')
                        : (report.en?.title || report.bn?.title || 'Verified Incident Report')}
                    </Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {isBn ? (report.bn?.summary || report.en?.summary) : (report.en?.summary || report.bn?.summary)}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span>{isBn ? 'মামলার অবস্থা:' : 'Case Status:'}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                      {report.caseStatus || (isBn ? 'তদন্তাধীন' : 'Under Review')}
                    </span>
                  </div>

                  <Link href={`/reports/${report._id}`} className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 hover:underline font-bold">
                    <span>{isBn ? 'সম্পূর্ণ প্রতিবেদন দেখুন' : 'Read Full Dossier'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="dossier-card p-14 rounded-2xl text-center space-y-3">
              <FileText className="w-10 h-10 text-brand-blue/50 mx-auto" />
              <p className="text-lg font-bold text-brand-navy dark:text-white">
                {isBn ? 'কোনো প্রতিবেদন পাওয়া যায়নি' : 'No Verified Reports Found'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isBn ? 'আপনার অনুসন্ধানের শর্ত পরিবর্তন করে আবার চেষ্টা করুন।' : 'Adjust your search filters or browse the full public directory.'}
              </p>
              <Link href="/reports" className="inline-block mt-2 px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold">
                {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
