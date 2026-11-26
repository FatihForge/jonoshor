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
      if (!res.ok) throw new Error('লগ লোড করতে ব্যর্থ হয়েছে');
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
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
      <div className="editorial-rule-top pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/super-admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text font-semibold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>কমান্ড সেন্টারে ফিরুন</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text flex items-center gap-2">
            <Database className="w-6 h-6 text-brand-ochre" />
            <span>{isBn ? 'মাস্টার অপরিবর্তনযোগ্য অডিট ও সিকিউরিটি লগ' : 'Master Immutable Audit & Intrusion Telemetry'}</span>
          </h1>
          <p className="text-brand-slate">সকল প্রশাসনিক পরিবর্তন ও নিরাপত্তা ইভেন্টের ট্রেইসযোগ্য হিস্ট্রি পর্যবেক্ষণ করুন।</p>
        </div>

        <button onClick={fetchLogs} className="p-2 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-canvas-border pb-3">
        <button
          onClick={() => { setActiveTab('audit'); setPage(1); }}
          className={`px-4 py-2 rounded-md text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-brand-text text-white'
              : 'bg-canvas-card border border-canvas-border text-brand-slate hover:text-brand-text'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>সিস্টেম অডিট ট্রেইল (Audit Logs)</span>
        </button>
        <button
          onClick={() => { setActiveTab('security'); setPage(1); }}
          className={`px-4 py-2 rounded-md text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-brand-crimson text-white'
              : 'bg-canvas-card border border-canvas-border text-brand-slate hover:text-brand-text'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>নিরাপত্তা ও ঝুঁকি লগ (Security Logs)</span>
        </button>
      </div>

      {/* Table */}
      <div className="dossier-card rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'audit' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas-subtle text-brand-text font-bold border-b border-canvas-border uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Actor</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Entity</th>
                  <th className="px-4 py-3.5">IP</th>
                  <th className="px-4 py-3.5 text-right">JSON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-border font-mono">
                {loading ? (
                  <tr><td colSpan="6" className="py-12 text-center font-sans text-brand-muted">লোড হচ্ছে...</td></tr>
                ) : auditLogs.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 text-center font-sans text-brand-muted">কোনো অডিট লগ রেকর্ড নেই</td></tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-canvas-hover transition">
                      <td className="px-4 py-3 text-brand-slate text-[11px]">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-brand-ochre">{log.actorType || 'system'}</span>
                        <span className="text-[10px] text-brand-muted block">{log.actorId ? log.actorId.toString().slice(-8) : 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-50 border border-emerald-200 text-brand-pine text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-text">{log.entity || 'Resource'}</td>
                      <td className="px-4 py-3 text-brand-muted text-[10px]">{log.ip || log.ipAddress || '127.0.0.1'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setInspectedLog(log)} className="p-1.5 rounded-md border border-canvas-border bg-canvas hover:bg-canvas-subtle text-brand-text">
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
              <thead className="bg-canvas-subtle text-brand-text font-bold border-b border-canvas-border uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Event Type</th>
                  <th className="px-4 py-3.5">Severity</th>
                  <th className="px-4 py-3.5">Origin</th>
                  <th className="px-4 py-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-border font-mono">
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center font-sans text-brand-muted">লোড হচ্ছে...</td></tr>
                ) : securityLogs.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center font-sans text-brand-muted">কোনো নিরাপত্তা সতর্কতা নেই</td></tr>
                ) : (
                  securityLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-canvas-hover transition">
                      <td className="px-4 py-3 text-brand-slate text-[11px]">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-brand-crimson">{log.eventType}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${
                          log.severity === 'critical' || log.severity === 'high'
                            ? 'bg-red-50 border-red-200 text-brand-crimson'
                            : 'bg-amber-50 border-amber-200 text-brand-ochre'
                        }`}>
                          {log.severity || 'medium'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-muted text-[10px]">
                        <div>{log.ipAddress || log.ip}</div>
                        <div className="truncate max-w-xs">{log.userAgent}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setInspectedLog(log)} className="p-1.5 rounded-md border border-canvas-border bg-canvas hover:bg-canvas-subtle text-brand-text">
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

      {/* JSON Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dossier-card-elevated rounded-md max-w-2xl w-full p-6 border-t-4 border-t-brand-text relative space-y-4">
            <button onClick={() => setInspectedLog(null)} className="absolute top-4 right-4 text-brand-muted hover:text-brand-text">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 font-serif text-base font-bold text-brand-text">
              <Terminal className="w-4 h-4 text-brand-ochre" />
              <span>লগ ইভেন্ট বিস্তারিত (JSON Telemetry)</span>
            </div>
            <div className="bg-canvas-dark p-4 rounded-md text-xs font-mono text-emerald-300 overflow-x-auto max-h-[60vh]">
              <pre>{JSON.stringify(inspectedLog, null, 2)}</pre>
            </div>
            <div className="flex justify-end pt-2 border-t border-canvas-border">
              <button onClick={() => setInspectedLog(null)} className="px-4 py-2 rounded-md border border-canvas-border bg-canvas font-semibold">
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
