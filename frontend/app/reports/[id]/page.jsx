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
    return {
      title: 'Report Not Found',
      description: 'The requested verified incident report does not exist or has not been published.',
    };
  }

  const title = report.en?.title || report.bn?.title || 'Verified Incident Report';
  const description =
    report.en?.summary ||
    report.bn?.summary ||
    'Independently verified human rights investigation report archived for public record.';

  return {
    title: `${title} — Verified Report`,
    description,
    openGraph: {
      title: `${title} | JonoShor Human Rights Archive`,
      description,
      type: 'article',
      url: `https://jonoshor.org/reports/${params.id}`,
      publishedTime: report.publishedAt || report.createdAt,
      authors: ['JonoShor Human Rights Editorial Desk'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | JonoShor`,
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
