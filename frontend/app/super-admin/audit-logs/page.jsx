'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, ShieldAlert, ArrowLeft, RefreshCw, AlertTriangle, 
  CheckCircle2, Filter, Search, Terminal, FileCode, Clock, Eye, X
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function SuperAdminAuditLogsPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState('audit'); // 'audit' or 'security'
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Inspector modal
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

      if (activeTab === 'audit') {
        setAuditLogs(data.data || []);
      } else {
        setSecurityLogs(data.data || []);
      }

      if (data.meta) {
        setTotal(data.meta.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-6 h-6 text-amber-400" />
                {isBn ? 'মাস্টার অপরিবর্তনযোগ্য অডিট ও সিকিউরিটি লগ' : 'Master Immutable Audit & Intrusion Telemetry'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'সকল প্রশাসনিক পরিবর্তন ও নিরাপত্তা ইভেন্টের ট্রেইসযোগ্য হিস্ট্রি পর্যবেক্ষণ করুন।' 
                  : 'Tamper-evident system activity, mutation tracking, and forensic threat analysis.'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => { setActiveTab('audit'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            {isBn ? 'সিস্টেম অডিট ট্রেইল (Audit Logs)' : 'Immutable Audit Trail'}
          </button>
          <button
            onClick={() => { setActiveTab('security'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            {isBn ? 'নিরাপত্তা ও ঝুঁকি লগ (Security Logs)' : 'Intrusion & Security Logs'}
          </button>
        </div>

        {/* Table Content */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            {activeTab === 'audit' ? (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">{isBn ? 'সময়' : 'Timestamp'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'অ্যাক্টর (কর্তা)' : 'Actor'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'এনটিটি / রিসোর্স' : 'Entity'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'আইপি অ্যাড্রেস' : 'IP'}</th>
                    <th className="px-4 py-3.5 text-right">{isBn ? 'মেটাডাটা' : 'Metadata'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 font-sans">
                        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        {isBn ? 'অডিট লগ লোড হচ্ছে...' : 'Streaming immutable logs...'}
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 font-sans">
                        {isBn ? 'কোনো অডিট লগ রেকর্ড নেই' : 'No audit records found'}
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-850/40 transition">
                        <td className="px-4 py-3 text-slate-400 text-[11px]">
                          {new Date(log.timestamp || log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-amber-400">{log.actorType || 'system'}</span>
                          <span className="text-[10px] text-slate-500 block">{log.actorId ? log.actorId.toString().slice(-8) : 'N/A'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-semibold">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {log.entity || 'Resource'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[10px]">
                          {log.ip || log.ipAddress || '127.0.0.1'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setInspectedLog(log)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                            title="Inspect JSON Payload"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">{isBn ? 'সময়' : 'Timestamp'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'ইভেন্টের ধরন' : 'Event Type'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'তীব্রতা' : 'Severity'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'আইপি ও ইউজার এজেন্ট' : 'Origin'}</th>
                    <th className="px-4 py-3.5 text-right">{isBn ? 'বিবরণ' : 'Inspect'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 font-sans">
                        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        {isBn ? 'সিকিউরিটি লগ লোড হচ্ছে...' : 'Streaming security logs...'}
                      </td>
                    </tr>
                  ) : securityLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 font-sans">
                        {isBn ? 'কোনো হুমকি বা সতর্কতা নেই' : 'No threat logs recorded'}
                      </td>
                    </tr>
                  ) : (
                    securityLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-850/40 transition">
                        <td className="px-4 py-3 text-slate-400 text-[11px]">
                          {new Date(log.timestamp || log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-rose-300 font-semibold">
                          {log.eventType}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            log.severity === 'critical' || log.severity === 'high'
                              ? 'bg-rose-950 border border-rose-800 text-rose-300'
                              : 'bg-amber-950 border border-amber-800 text-amber-300'
                          }`}>
                            {log.severity || 'medium'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-[10px]">
                          <div>{log.ipAddress || log.ip}</div>
                          <div className="truncate max-w-xs text-slate-600">{log.userAgent}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setInspectedLog(log)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* JSON Inspector Modal */}
        {inspectedLog && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setInspectedLog(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {isBn ? 'লগ ইভেন্ট বিস্তারিত (JSON Telemetry)' : 'Log Event Raw Telemetry'}
                </h3>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[60vh]">
                <pre>{JSON.stringify(inspectedLog, null, 2)}</pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setInspectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
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
