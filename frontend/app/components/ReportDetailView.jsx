'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Scale, AlertTriangle, ArrowLeft, Lock } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function ReportDetailView({ report }) {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const title = isBn ? (report.bn?.title || report.en?.title) : (report.en?.title || report.bn?.title);
  const summary = isBn ? (report.bn?.summary || report.en?.summary) : (report.en?.summary || report.bn?.summary);
  const story = isBn ? (report.bn?.incidentStory || report.en?.incidentStory) : (report.en?.incidentStory || report.bn?.incidentStory);

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <div className="no-print">
          <Link href="/reports" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue dark:text-blue-400 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? 'যাচাইকৃত রিপোর্ট ডিরেক্টরিতে ফিরুন' : 'Back to Verified Reports Directory'}</span>
          </Link>
        </div>

        <article className="dossier-card-elevated rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-[11px] font-bold">
                ✓ {isBn ? 'সত্যতা যাচাইকৃত প্রতিবেদন' : 'Verified Public Dossier'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                #{report._id?.slice(-8).toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(report.publishedAt || report.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                <span>{report.location?.districtId || (isBn ? 'বাংলাদেশ' : 'Bangladesh')}</span>
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight leading-snug">
              {title}
            </h1>

            <div className="p-5 rounded-2xl bg-[#F2F7FF] dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-sm text-brand-navy dark:text-slate-200 leading-relaxed">
              <span className="text-[11px] uppercase tracking-wider text-brand-blue dark:text-blue-400 font-bold block mb-1">
                {isBn ? 'সারসংক্ষেপ' : 'Executive Summary'}
              </span>
              {summary}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-brand-navy dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {isBn ? 'ঘটনার নিরপেক্ষ বিবরণ ও সত্যতা যাচাইয়ের ফলাফল' : 'Impartial Narrative & Verification Findings'}
            </h2>
            <div className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {story}
            </div>
          </div>

          {report.publicVictims && report.publicVictims.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-brand-navy dark:text-white">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? 'ভুক্তভোগীদের তথ্য সুরক্ষা ও ক্যাটাগরি' : 'Protected Victim Information'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.publicVictims.map((v, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="font-bold text-brand-navy dark:text-white">{v.name || (isBn ? 'পরিচয় গোপনীয়' : 'Identity Protected')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      {isBn ? 'সম্পৃক্ততা:' : 'Category:'} {v.category || (isBn ? 'ভুক্তভোগী' : 'Victim')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.publicAccused && report.publicAccused.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-brand-navy dark:text-white">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{isBn ? 'অভিযুক্ত ব্যক্তি বা সংস্থার তালিকা (আইনি নিরপেক্ষ পরিভাষা)' : 'Accused Parties (Neutral Legal Terminology)'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.publicAccused.map((acc, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="font-bold text-brand-navy dark:text-white">{acc.name || (isBn ? 'অজ্ঞাত অভিযুক্ত' : 'Unidentified Accused')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      {isBn ? 'পদবি:' : 'Role:'} {acc.role || (isBn ? 'অভিযুক্ত' : 'Accused')}
                    </div>
                    {acc.organization && (
                      <div className="text-slate-400 text-[11px]">
                        {isBn ? 'প্রতিষ্ঠান:' : 'Organization:'} {acc.organization}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-blue dark:text-blue-400">
              <Scale className="w-4 h-4" />
              <span>{isBn ? 'আইনি অগ্রগতি ও কর্তৃপক্ষের পদক্ষেপ' : 'Legal Tracking & Official Actions'}</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <div>
                <strong>{isBn ? 'মামলার বর্তমান অবস্থা:' : 'Current Case Status:'}</strong>{' '}
                <span className="text-brand-navy dark:text-white font-bold">{report.caseStatus || (isBn ? 'তদন্তাধীন' : 'Under Investigation')}</span>
              </div>
              {report.authorityActionSummary && (
                <div>
                  <strong>{isBn ? 'কর্তৃপক্ষের অ্যাকশন:' : 'Authority Action:'}</strong> {report.authorityActionSummary}
                </div>
              )}
              {report.legalOutcome && (
                <div>
                  <strong>{isBn ? 'আইনি রায় বা অন্তর্বর্তী আদেশ:' : 'Legal Outcome:'}</strong> {report.legalOutcome}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>{isBn ? 'আইনি দায়মুক্তি ও মূলনীতি:' : 'Legal Disclaimer:'}</strong>{' '}
            {isBn
              ? 'এই প্রতিবেদনটি জনস্বর প্ল্যাটফর্মের স্বাধীন মানবাধিকার পর্যবেক্ষকদের দ্বারা সংগৃহীত তথ্যের ভিত্তিতে প্রণীত। প্রতিবেদনটি কোনো বিচারিক আদালত বা ট্রাইব্যুনালের চূড়ান্ত রায় হিসেবে গণ্য হবে না।'
              : 'This verified report is compiled by independent observers for public accountability. It does not constitute a judicial ruling by a court of law.'}
          </div>
        </article>
      </div>
    </div>
  );
}
