import React from 'react';
import HomeView from './components/HomeView';

export const metadata = {
  title: 'JonoShor — Independent Human Rights & Citizen Grievance Documentation Platform',
  description:
    'Securely document, independently verify, and archive human rights violations, abuse, and citizen grievances in Bangladesh with complete whistleblower protection.',
  openGraph: {
    title: 'JonoShor — Citizen Human Rights Documentation & Verification',
    description:
      'Securely document, independently verify, and archive human rights violations, abuse, and citizen grievances in Bangladesh.',
  },
};

async function getLiveStats() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/public/statistics', {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

async function getRecentReports() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/public/reports?limit=4', {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const stats = await getLiveStats();
  const recentReports = await getRecentReports();

  return <HomeView stats={stats} recentReports={recentReports} />;
}
