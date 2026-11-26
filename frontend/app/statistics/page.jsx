import React from 'react';
import StatisticsView from '../components/StatisticsView';

export const metadata = {
  title: 'লাইভ পরিসংখ্যান ও প্রবণতা',
  description: 'বাংলাদেশের মানবাধিকার পরিস্থিতি ও জনস্বর প্ল্যাটফর্মের যাচাইকৃত অভিযোগের স্বচ্ছ লাইভ ডেটা।',
};

async function getStats() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/public/statistics', {
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

export default async function StatisticsPage() {
  const stats = await getStats();
  return <StatisticsView stats={stats} />;
}
