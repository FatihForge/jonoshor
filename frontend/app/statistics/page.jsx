import React from 'react';
import StatisticsView from '../components/StatisticsView';

export const metadata = {
  title: 'National Telemetry & Human Rights Statistics Dashboard',
  description:
    'Real-time national telemetry and aggregated analytics on reported human rights violations, geographic hotspots, and legal case outcomes across Bangladesh.',
  openGraph: {
    title: 'National Human Rights Telemetry & Statistics | JonoShor',
    description:
      'Real-time national telemetry and aggregated analytics on reported human rights violations, geographic hotspots, and legal case outcomes across Bangladesh.',
  },
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
