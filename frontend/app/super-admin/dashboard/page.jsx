'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, ShieldAlert, Users, Database, Settings, DollarSign, 
  HardDrive, Activity, ArrowRight, RefreshCw, KeyRound, Lock, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function SuperAdminDashboardPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/v1/super-admin/dashboard', {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/super-admin/login';
          return;
        }
        throw new Error('সুপার অ্যাডমিন ড্যাশবোর্ড তথ্য লোড করা যায়নি');
      }
      const data = await res.json();
      setMetrics(data.data?.counts || data.counts || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const navCards = [
    {
      title: isBn ? 'অ্যাডমিন অ্যাকাউন্ট ব্যবস্থাপনা' : 'Admin Governance',
      desc: isBn ? 'নতুন অ্যাডমিন নিয়োগ, স্ট্যাটাস নিয়ন্ত্রণ ও বিশেষাধিকার অনুমতি অনুমোদন' : 'Onboard admins, manage account status, and configure granular permissions',
      icon: Users,
      href: '/super-admin/admins',
      color: 'from-blue-600/20 to-indigo-600/20 border-blue-800/40 text-blue-400',
      badge: `${metrics?.totalAdmins || 0} ${isBn ? 'মোট অ্যাডমিন' : 'Total Admins'}`,
    },
    {
      title: isBn ? 'মাস্টার অডিট ও সিকিউরিটি লগ' : 'Master Audit & Security Logs',
      desc: isBn ? 'সিস্টেমের সকল মিউটেশন ও নিরাপত্তা লঙ্ঘনের অপরিবর্তনযোগ্য লগ রেকর্ড' : 'Tamper-evident chronological logs of every platform mutation and intrusion attempt',
      icon: ShieldAlert,
      href: '/super-admin/audit-logs',
      color: 'from-amber-600/20 to-orange-600/20 border-amber-800/40 text-amber-400',
      badge: `${metrics?.totalAuditLogs || 0} ${isBn ? 'অডিট লগ' : 'Audit Logs'}`,
    },
    {
      title: isBn ? 'সিস্টেম ও প্ল্যাটফর্ম সেটিংস' : 'System Configuration',
      desc: isBn ? 'রুট কনফিগারেশন, মেইনটেন্যান্স মোড এবং পাবলিক সাবমিশন নিয়ন্ত্রণ' : 'Platform-wide operational flags, rate limits, and registration controls',
      icon: Settings,
      href: '/super-admin/system-settings',
      color: 'from-slate-600/20 to-slate-800/20 border-slate-700/60 text-slate-300',
      badge: isBn ? 'রুট কনফিগ' : 'Root Config',
    },
    {
      title: isBn ? 'মানবাধিকার আইনি তহবিল ও অর্থায়ন' : 'Human Rights Defense Fund',
      desc: isBn ? 'আইনি সহায়তা তহবিল অনুপাত, জরুরি সহায়তা রিজার্ভ ও মাসিক বাজেট সীমা' : 'Legal defense allocations, emergency relief thresholds, and trust governance',
      icon: DollarSign,
      href: '/super-admin/financial-settings',
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-800/40 text-emerald-400',
      badge: isBn ? 'ফান্ড ট্রাস্ট' : 'Trust Fund',
    },
    {
      title: isBn ? 'গুগল ড্রাইভ এভিডেন্স স্টোরেজ' : 'Evidence Cloud Storage',
      desc: isBn ? 'ডেডিকেটেড এভিডেন্স ক্লাউড ড্রাইভার স্থিতি ও সুরক্ষিত ফোল্ডার সিঙ্ক' : 'Dedicated secure Google Drive evidence repository, quarantine & public vaults',
      icon: HardDrive,
      href: '/super-admin/storage',
      color: 'from-cyan-600/20 to-sky-600/20 border-cyan-800/40 text-cyan-400',
      badge: isBn ? 'ক্লাউড স্টোরেজ' : 'Vault Storage',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <KeyRound className="w-6 h-6" />
                </span>
                <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300">
                  {isBn ? 'সর্বোচ্চ সার্বভৌম গভর্ন্যান্স' : 'Root Sovereign Governance'}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                {isBn ? 'জনস্বর — সুপার অ্যাডমিন কমান্ড সেন্টার' : 'JonoShor — Super Admin Command Center'}
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl mt-2">
                {isBn 
                  ? 'মানবাধিকার প্ল্যাটফর্মের অখণ্ডতা, অ্যাক্সেস পলিসি, এনক্রিপ্টেড প্রমাণাগার এবং শীর্ষ পর্যায়ের নিরাপত্তা নিয়ন্ত্রণ।' 
                  : 'Platform sovereign oversight, privileged identity lifecycle, evidence vault telemetry, and immutable compliance.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboard}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {isBn ? 'রিফ্রেশ' : 'Refresh'}
              </button>
              <Link
                href="/admin/dashboard"
                className="px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-xs text-emerald-300 font-medium transition"
              >
                {isBn ? 'সাধারণ অ্যাডমিন পোর্টাল' : 'Caseworker Portal'}
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* High-Level Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{isBn ? 'মোট অ্যাডমিন' : 'Total Admins'}</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {loading ? '...' : (metrics?.totalAdmins ?? 0)}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              {metrics?.activeAdmins ?? 0} {isBn ? 'সক্রিয় অ্যাকাউন্ট' : 'Active accounts'}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{isBn ? 'স্থগিত / নিষিদ্ধ' : 'Suspended / Blocked'}</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {loading ? '...' : ((metrics?.suspendedAdmins ?? 0) + (metrics?.blockedAdmins ?? 0))}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {metrics?.blockedAdmins ?? 0} {isBn ? 'ব্লকড' : 'Blocked'}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{isBn ? 'নিরাপত্তা অ্যালার্ট লগ' : 'Security Logs'}</span>
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {loading ? '...' : (metrics?.totalSecurityLogs ?? 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isBn ? 'প্রহরী সক্রিয়' : 'Active intrusion telemetry'}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{isBn ? 'মাস্টার অডিট রেকর্ড' : 'Audit Logs'}</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {loading ? '...' : (metrics?.totalAuditLogs ?? 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isBn ? 'অপরিবর্তনযোগ্য ইতিহাস' : 'Immutable history'}
            </div>
          </div>
        </div>

        {/* Governance Navigation Cards */}
        <div>
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            {isBn ? 'সার্বভৌম গভর্ন্যান্স মডিউলসমূহ' : 'Sovereign Governance Modules'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {navCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  href={card.href}
                  className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70 transition group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`p-3 rounded-xl border bg-gradient-to-br ${card.color}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-400 transition">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 pt-2 border-t border-slate-800/80">
                    <span>{isBn ? 'কনসোল পরিচালনা করুন' : 'Manage Console'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
