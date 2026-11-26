import React from 'react';
import ReportsView from '../components/ReportsView';

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

  return (
    <ReportsView
      reports={reports}
      districts={districts}
      currentCategory={searchParams?.category || ''}
      currentDistrict={searchParams?.districtId || ''}
      currentSearch={searchParams?.search || ''}
    />
  );
}
