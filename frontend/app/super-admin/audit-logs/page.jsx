'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database, ShieldAlert, ArrowLeft, RefreshCw, Terminal, FileCode, Eye, X
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function SuperAdminAuditLogsPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState('audit');
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [inspectedLog, setInspectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [activeTab, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = activeTab === 'audit'
        ? `/api/v1/super-admin/audit-logs?page=${page}&limit=20`
        : `/api/v1/super-admin/security/logs?page=${page}&limit=20`;

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(isBn ? 'লগ লোড করতে ব্যর্থ হয়েছে' : 'Failed to load logs');
      const data = await res.json();

      if (activeTab === 'audit') setAuditLogs(data.data || []);
      else setSecurityLogs(data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <Link href="/super-admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-semibold hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'কমান্ড সেন্টারে ফিরুন' : 'Back to Command Center'}</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-brand-blue" />
              <span>{isBn ? 'মাস্টার অপরিবর্তনযোগ্য অডিট ও সিকিউরিটি লগ' : 'Master Immutable Audit & Intrusion Telemetry'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isBn
                ? 'সকল প্রশাসনিক পরিবর্তন ও নিরাপত্তা ইভেন্টের ট্রেইসযোগ্য হিস্ট্রি পর্যবেক্ষণ করুন।'
                : 'Inspect full immutable history of administrative mutations and security alerts.'}
            </p>
          </div>

          <button onClick={fetchLogs} className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 self-start sm:self-auto">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2 pb-1">
          <button
            onClick={() => { setActiveTab('audit'); setPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isBn ? 'সিস্টেম অডিট ট্রেইল (Audit Logs)' : 'System Audit Trail (Audit Logs)'}</span>
          </button>
          <button
            onClick={() => { setActiveTab('security'); setPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isBn ? 'নিরাপত্তা ও ঝুঁকি লগ (Security Logs)' : 'Security & Threat Logs'}</span>
          </button>
        </div>

        <div className="dossier-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'audit' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">{isBn ? 'সময়' : 'Timestamp'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'অভিনেতা' : 'Actor'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'এনটিটি' : 'Entity'}</th>
                    <th className="px-4 py-3.5">IP</th>
                    <th className="px-4 py-3.5 text-right">JSON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {loading ? (
                    <tr><td colSpan="6" className="py-12 text-center font-sans text-slate-400">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</td></tr>
                  ) : auditLogs.length === 0 ? (
                    <tr><td colSpan="6" className="py-12 text-center font-sans text-slate-400">{isBn ? 'কোনো অডিট লগ রেকর্ড নেই' : 'No audit log records'}</td></tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 text-slate-500 text-[11px]">{new Date(log.timestamp || log.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-brand-blue dark:text-blue-400">{log.actorType || 'system'}</span>
                          <span className="text-[10px] text-slate-400 block">{log.actorId ? log.actorId.toString().slice(-8) : 'N/A'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-brand-navy dark:text-slate-200">{log.entity || 'Resource'}</td>
                        <td className="px-4 py-3 text-slate-400 text-[10px]">{log.ip || log.ipAddress || '127.0.0.1'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setInspectedLog(log)} className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <FileCode className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">{isBn ? 'সময়' : 'Timestamp'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'ইভেন্ট ধরন' : 'Event Type'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'গুরুত্ব' : 'Severity'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'উৎস' : 'Origin'}</th>
                    <th className="px-4 py-3.5 text-right">{isBn ? 'দেখুন' : 'Inspect'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {loading ? (
                    <tr><td colSpan="5" className="py-12 text-center font-sans text-slate-400">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</td></tr>
                  ) : securityLogs.length === 0 ? (
                    <tr><td colSpan="5" className="py-12 text-center font-sans text-slate-400">{isBn ? 'কোনো নিরাপত্তা সতর্কতা নেই' : 'No security alerts recorded'}</td></tr>
                  ) : (
                    securityLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 text-slate-500 text-[11px]">{new Date(log.timestamp || log.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}</td>
                        <td className="px-4 py-3 font-bold text-rose-600">{log.eventType}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            log.severity === 'critical' || log.severity === 'high'
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {log.severity || 'medium'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-[10px]">
                          <div>{log.ipAddress || log.ip}</div>
                          <div className="truncate max-w-xs">{log.userAgent}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setInspectedLog(log)} className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {inspectedLog && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="dossier-card-elevated rounded-3xl max-w-2xl w-full p-6 relative space-y-4">
              <button onClick={() => setInspectedLog(null)} className="absolute top-4 right-4 text-slate-400 hover:text-brand-navy">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-base font-bold text-brand-navy dark:text-white">
                <Terminal className="w-4 h-4 text-brand-blue" />
                <span>{isBn ? 'লগ ইভেন্ট বিস্তারিত (JSON Telemetry)' : 'Log Event Telemetry (JSON)'}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-[60vh]">
                <pre>{JSON.stringify(inspectedLog, null, 2)}</pre>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setInspectedLog(null)} className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                  {isBn ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
