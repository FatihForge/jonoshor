import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Scale,
  Users,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Printer,
  CheckCircle2,
  Lock,
} from 'lucide-react';

async function fetchReportById(id) {
  try {
    const res = await fetch(`http://localhost:5000/api/v1/public/reports/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

// Dynamic SEO Metadata for Each Public Report
export async function generateMetadata({ params }) {
  const report = await fetchReportById(params.id);
  if (!report) {
    return { title: 'রিপোর্ট পাওয়া যায়নি' };
  }

  const title = report.bn?.title || report.en?.title || 'মানবাধিকার যাচাইকৃত প্রতিবেদন';
  const description = report.bn?.summary || report.en?.summary || 'জনস্বার্থে যাচাইকৃত ঘটনা প্রতিবেদন';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://jonoshor.org/reports/${params.id}`,
      publishedTime: report.publishedAt || report.createdAt,
      authors: ['JonoShor Independent Citizen Voice'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ReportDetailPage({ params }) {
  const report = await fetchReportById(params.id);

  if (!report) {
    notFound();
  }

  // JSON-LD structured data for search engine indexing
  const reportSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: report.bn?.title || report.en?.title,
    datePublished: report.publishedAt || report.createdAt,
    description: report.bn?.summary || report.en?.summary,
    author: {
      '@type': 'Organization',
      name: 'জনস্বর (JonoShor)',
    },
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportSchema) }}
      />

      {/* Back and Action Navigation */}
      <div className="flex flex-wrap justify-between items-center gap-4 text-xs">
        <Link
          href="/reports"
          className="flex items-center gap-1.5 text-brand-slate hover:text-brand-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>যাচাইকৃত রিপোর্ট ডিরেক্টরিতে ফিরুন</span>
        </Link>
      </div>

      {/* Main Report Container */}
      <article className="glass-panel p-6 sm:p-10 rounded-3xl border border-canvas-border space-y-8">
        {/* Verification Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border pb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>সত্যতা যাচাইকৃত জনস্বার্থ প্রতিবেদন</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-brand-slate">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>প্রকাশের তারিখ: {new Date(report.publishedAt || report.createdAt).toLocaleDateString('bn-BD')}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
              <span>{report.location?.districtId || 'বাংলাদেশ'}</span>
            </span>
          </div>
        </div>

        {/* Report Title */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-text tracking-tight leading-snug">
            {report.bn?.title || report.en?.title}
          </h1>

          <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border text-xs sm:text-sm text-brand-text font-medium leading-relaxed">
            <strong className="text-brand-emerald block mb-1">সারসংক্ষেপ:</strong>
            {report.bn?.summary || report.en?.summary}
          </div>
        </div>

        {/* Incident Narrative */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-brand-text border-b border-canvas-border pb-2">
            ঘটনার নিরপেক্ষ বিবরণ ও সত্যতা যাচাইয়ের ফলাফল
          </h2>
          <div className="text-sm text-brand-slate leading-relaxed whitespace-pre-line space-y-4">
            {report.bn?.incidentStory || report.en?.incidentStory}
          </div>
        </div>

        {/* Anonymized Victims Protection Section */}
        {report.publicVictims && report.publicVictims.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-canvas-border">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-text">
              <Lock className="w-4 h-4 text-brand-emerald" />
              <span>ভুক্তভোগীদের তথ্য সুরক্ষা ও ক্যাটাগরি</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.publicVictims.map((v, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-canvas-card border border-canvas-border text-xs">
                  <div className="font-semibold text-brand-text">{v.name || 'পরিচয় গোপনীয়'}</div>
                  <div className="text-brand-slate text-[11px] mt-0.5">সম্পৃক্ততা: {v.category || 'ভুক্তভোগী'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accused Individuals/Entities Section (Neutral Legal Terms) */}
        {report.publicAccused && report.publicAccused.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-canvas-border">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-text">
              <AlertTriangle className="w-4 h-4 text-brand-amber" />
              <span>অভিযুক্ত ব্যক্তি বা সংস্থার তালিকা (আইনি নিরপেক্ষ পরিভাষা)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.publicAccused.map((acc, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-canvas-card border border-canvas-border text-xs">
                  <div className="font-semibold text-brand-text">{acc.name || 'অজ্ঞাত অভিযুক্ত'}</div>
                  <div className="text-brand-slate text-[11px] mt-0.5">পদবী/ভূমিকা: {acc.role || 'অভিযুক্ত'}</div>
                  {acc.organization && (
                    <div className="text-brand-slate/80 text-[11px]">প্রতিষ্ঠান: {acc.organization}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal & Authority Action Status */}
        <div className="p-5 rounded-2xl bg-canvas-subtle border border-canvas-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-blue">
            <Scale className="w-4 h-4" />
            <span>আইনি অগ্রগতি ও কর্তৃপক্ষের পদক্ষেপের বিবরণ</span>
          </div>
          <div className="text-xs text-brand-slate space-y-1.5 leading-relaxed">
            <div>
              <strong>মামলার বর্তমান অবস্থা:</strong>{' '}
              <span className="text-brand-text font-semibold">{report.caseStatus || 'তদন্তাধীন'}</span>
            </div>
            {report.authorityActionSummary && (
              <div>
                <strong>কর্তৃপক্ষের অ্যাকশন:</strong> {report.authorityActionSummary}
              </div>
            )}
            {report.legalOutcome && (
              <div>
                <strong>আইনি রায় বা অন্তর্বর্তী আদেশ:</strong> {report.legalOutcome}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-4 rounded-xl bg-canvas-card/50 border border-canvas-border text-[11px] text-brand-slate leading-relaxed">
          <strong>আইনি দায়মুক্তি ও মূলনীতি:</strong> এই প্রতিবেদনটি জনস্বর প্ল্যাটফর্মের স্বাধীন মানবাধিকার পর্যবেক্ষকদের দ্বারা সংগৃহীত তথ্যের ভিত্তিতে প্রণীত। প্রতিবেদনটি কোনো বিচারিক আদালত বা ট্রাইব্যুনালের চূড়ান্ত রায় হিসেবে গণ্য হবে না।
        </div>
      </article>
    </div>
  );
}
