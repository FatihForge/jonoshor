'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, Users, Database, Settings, DollarSign,
  HardDrive, Activity, ArrowRight, RefreshCw, KeyRound, AlertTriangle
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
      const res = await fetch('/api/v1/super-admin/dashboard', { credentials: 'include' });
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
      code: '01 / IDENTITY',
      title: isBn ? 'অ্যাডমিন অ্যাকাউন্ট ব্যবস্থাপনা' : 'Admin Governance',
      desc: isBn ? 'নতুন অ্যাডমিন নিয়োগ, স্ট্যাটাস নিয়ন্ত্রণ ও বিশেষাধিকার অনুমতি অনুমোদন' : 'Onboard admins and manage RBAC permissions',
      icon: Users,
      href: '/super-admin/admins',
      badge: `${metrics?.totalAdmins || 0} ${isBn ? 'অ্যাডমিন' : 'Admins'}`,
    },
    {
      code: '02 / TELEMETRY',
      title: isBn ? 'মাস্টার অডিট ও সিকিউরিটি লগ' : 'Master Audit & Security Logs',
      desc: isBn ? 'সিস্টেমের সকল মিউটেশন ও নিরাপত্তা লঙ্ঘনের অপরিবর্তনযোগ্য লগ রেকর্ড' : 'Immutable logs of platform mutations & threats',
      icon: ShieldAlert,
      href: '/super-admin/audit-logs',
      badge: `${metrics?.totalAuditLogs || 0} ${isBn ? 'অডিট লগ' : 'Logs'}`,
    },
    {
      code: '03 / CONFIG',
      title: isBn ? 'সিস্টেম ও প্ল্যাটফর্ম সেটিংস' : 'System Configuration',
      desc: isBn ? 'রুট কনফিগারেশন, মেইনটেন্যান্স মোড এবং পাবলিক সাবমিশন নিয়ন্ত্রণ' : 'Global operational flags and rate limits',
      icon: Settings,
      href: '/super-admin/system-settings',
      badge: isBn ? 'রুট কনফিগ' : 'Root Config',
    },
    {
      code: '04 / TRUST',
      title: isBn ? 'মানবাধিকার আইনি তহবিল ও অর্থায়ন' : 'Human Rights Defense Fund',
      desc: isBn ? 'আইনি সহায়তা তহবিল, মার্চেন্ট গেটওয়ে ও ন্যূনতম অনুদান নীতিমালা' : 'Legal defense allocations and trust governance',
      icon: DollarSign,
      href: '/super-admin/financial-settings',
      badge: isBn ? 'ফান্ড ট্রাস্ট' : 'Trust Fund',
    },
    {
      code: '05 / VAULT',
      title: isBn ? 'গুগল ড্রাইভ এভিডেন্স স্টোরেজ' : 'Evidence Cloud Storage',
      desc: isBn ? 'ডেডিকেটেড এভিডেন্স ক্লাউড ড্রাইভার স্থিতি ও সুরক্ষিত ফোল্ডার সিঙ্ক' : 'Dedicated secure Google Drive evidence repository',
      icon: HardDrive,
      href: '/super-admin/storage',
      badge: isBn ? 'ক্লাউড ভল্ট' : 'Vault Storage',
    },
  ];

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-7xl space-y-8 text-xs">
        <div className="bg-gradient-to-r from-[#1456D1] via-[#1A62E8] to-[#0F44A8] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-blue-100 font-bold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isBn ? 'সর্বোচ্চ সার্বভৌম গভর্ন্যান্স' : 'Root Sovereign Governance'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'জনস্বর — সুপার অ্যাডমিন কমান্ড সেন্টার' : 'JonoShor — Super Admin Command Center'}
            </h1>
            <p className="text-blue-100 max-w-2xl leading-relaxed">
              মানবাধিকার প্ল্যাটফর্মের অখণ্ডতা, অ্যাক্সেস পলিসি, এনক্রিপ্টেড প্রমাণাগার এবং শীর্ষ পর্যায়ের নিরাপত্তা নিয়ন্ত্রণ।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button onClick={fetchDashboard} className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold flex items-center gap-1.5 transition">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>
            <Link href="/admin/dashboard" className="px-5 py-2 rounded-full bg-white text-brand-blue hover:bg-blue-50 font-bold transition shadow-md">
              {isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="dossier-card p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>{isBn ? 'মোট অ্যাডমিন' : 'Total Admins'}</span>
              <Users className="w-4 h-4 text-brand-blue" />
            </div>
            <div className="font-mono text-2xl font-extrabold text-brand-navy dark:text-white">{loading ? '—' : (metrics?.totalAdmins ?? 0)}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">{metrics?.activeAdmins ?? 0} সক্রিয়</div>
          </div>

          <div className="dossier-card p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>{isBn ? 'স্থগিত / নিষিদ্ধ' : 'Suspended / Blocked'}</span>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-mono text-2xl font-extrabold text-brand-navy dark:text-white">{loading ? '—' : ((metrics?.suspendedAdmins ?? 0) + (metrics?.blockedAdmins ?? 0))}</div>
            <div className="text-[11px] text-rose-600 font-semibold">{metrics?.blockedAdmins ?? 0} ব্লকড</div>
          </div>

          <div className="dossier-card p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>{isBn ? 'নিরাপত্তা লগ' : 'Security Logs'}</span>
              <Activity className="w-4 h-4 text-rose-600" />
            </div>
            <div className="font-mono text-2xl font-extrabold text-brand-navy dark:text-white">{loading ? '—' : (metrics?.totalSecurityLogs ?? 0)}</div>
            <div className="text-[11px] text-slate-500">সক্রিয় অনুপ্রবেশ মনিটরিং</div>
          </div>

          <div className="dossier-card p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>{isBn ? 'মাস্টার অডিট' : 'Audit Logs'}</span>
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-mono text-2xl font-extrabold text-brand-navy dark:text-white">{loading ? '—' : (metrics?.totalAuditLogs ?? 0)}</div>
            <div className="text-[11px] text-slate-500">অপরিবর্তনযোগ্য ইতিহাস</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {navCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link key={idx} href={card.href} className="dossier-card p-6 rounded-2xl hover:border-brand-blue transition flex flex-col justify-between space-y-4 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-brand-blue dark:text-blue-400 font-bold">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">{card.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-blue dark:text-blue-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{isBn ? 'কনসোল পরিচালনা করুন' : 'Manage Console'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
