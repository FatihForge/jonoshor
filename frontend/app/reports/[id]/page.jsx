import React from 'react';
import { notFound } from 'next/navigation';
import ReportDetailView from '../../components/ReportDetailView';

async function fetchReportById(id) {
  try {
    const res = await fetch(`http://localhost:5000/api/v1/public/reports/${id}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportSchema) }}
      />
      <ReportDetailView report={report} />
    </>
  );
}
