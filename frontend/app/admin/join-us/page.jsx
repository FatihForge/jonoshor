'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, UserCheck, ArrowLeft, Download, Filter, Search, 
  CheckCircle2, XCircle, AlertTriangle, FileText, RefreshCw, MessageSquare
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminJoinUsPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Selected item / notes modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter, roleFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { role: roleFilter }),
      });

      const res = await fetch(`/api/v1/admin/join-us?${query.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('আবেদন তালিকা লোড করতে ব্যর্থ হয়েছে');
      const data = await res.json();
      setApplications(data.data || []);
      if (data.meta) {
        setTotal(data.meta.total || 0);
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getCsrfToken = async () => {
    try {
      const res = await fetch('/api/v1/csrf-token', { credentials: 'include' });
      const data = await res.json();
      return data.csrfToken;
    } catch {
      return '';
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/v1/admin/join-us/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'আবেদনের স্ট্যাটাস পরিবর্তিত হয়েছে' : 'Application status updated' });
      fetchApplications();
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/v1/admin/join-us/${selectedApp._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ note: noteText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'নোট সংরক্ষণ ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'অ্যাডমিন নোট যুক্ত করা হয়েছে' : 'Admin note added' });
      setNoteText('');
      fetchApplications();
      // Update selectedApp notes locally
      setSelectedApp(prev => ({
        ...prev,
        adminNotes: [...(prev.adminNotes || []), { note: noteText, createdAt: new Date().toISOString() }]
      }));
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch('/api/v1/admin/join-us/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ status: statusFilter, role: roleFilter }),
      });

      if (!res.ok) throw new Error('CSV এক্সপোর্ট করতে ব্যর্থ হয়েছে');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jonoshor-join-us-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-400" />
                {isBn ? 'স্বেচ্ছাসেবক ও আইনজীবী আবেদন পর্যালোচনা' : 'Volunteer & Legal Panel Applications'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'মানবাধিকার পর্যবেক্ষণ ও আইনি সহায়তা প্যানেলে যুক্ত হতে ইচ্ছুকদের আবেদন পরিচালনা করুন।' 
                  : 'Manage volunteer and lawyer onboarding, credential verification, and interview status.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 hover:bg-slate-800 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}
            </button>
            <button
              onClick={fetchApplications}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {alertMsg.text && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            alertMsg.type === 'error'
              ? 'bg-rose-950/40 border-rose-900/50 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
          }`}>
            {alertMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">{isBn ? 'আবেদনের স্ট্যাটাস' : 'Application Status'}</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="pending">{isBn ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
              <option value="under_review">{isBn ? 'পর্যালোচনাধীন (Under Review)' : 'Under Review'}</option>
              <option value="interview_scheduled">{isBn ? 'ইন্টারভিউ নির্ধারিত (Interview Scheduled)' : 'Interview Scheduled'}</option>
              <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
              <option value="rejected">{isBn ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{isBn ? 'আবেদনের ভূমিকা / পদ' : 'Role Applied'}</label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">{isBn ? 'সকল ভূমিকা' : 'All Roles'}</option>
              <option value="volunteer">{isBn ? 'স্বেচ্ছাসেবক (Volunteer)' : 'Volunteer'}</option>
              <option value="lawyer">{isBn ? 'আইনজীবী (Lawyer)' : 'Lawyer'}</option>
              <option value="doctor">{isBn ? 'চিকিৎসক (Medical Expert)' : 'Medical Expert'}</option>
              <option value="researcher">{isBn ? 'গবেষক (Researcher)' : 'Researcher'}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStatusFilter(''); setRoleFilter(''); setPage(1); }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
            >
              {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear Filters'}
            </button>
          </div>
        </div>

        {/* Applications Table & Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">{isBn ? 'নাম ও যোগাযোগ' : 'Applicant'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'পদ / ভূমিকা' : 'Role'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'জেলা' : 'District'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="px-4 py-3.5 text-right">{isBn ? 'বিবরণ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        {isBn ? 'আবেদন তালিকা লোড হচ্ছে...' : 'Loading applications...'}
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        {isBn ? 'কোনো আবেদন পাওয়া যায়নি' : 'No applications found'}
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr 
                        key={app._id} 
                        onClick={() => setSelectedApp(app)}
                        className={`cursor-pointer transition ${
                          selectedApp?._id === app._id ? 'bg-slate-800/70 border-l-2 border-emerald-500' : 'hover:bg-slate-850/40'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-100">{app.fullName || 'Anonymous'}</div>
                          <div className="text-[10px] text-slate-500">{app.email} • {app.phone || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-slate-300 font-medium">{app.roleApplied || 'volunteer'}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {app.district || 'Dhaka'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            app.status === 'approved'
                              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                              : app.status === 'rejected'
                              ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                              : app.status === 'interview_scheduled'
                              ? 'bg-teal-950/80 border-teal-800 text-teal-300'
                              : 'bg-amber-950/80 border-amber-800 text-amber-300'
                          }`}>
                            {app.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-medium"
                          >
                            {isBn ? 'দেখুন' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Application Detail & Caseworker Notes Pane */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
            {selectedApp ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">{selectedApp.fullName}</h3>
                    <p className="text-xs text-slate-400">{selectedApp.email} • {selectedApp.phone}</p>
                    <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                      {selectedApp.roleApplied}
                    </span>
                  </div>
                </div>

                {/* Status Update Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'স্ট্যাটাস পরিবর্তন করুন' : 'Change Status'}</label>
                  <select
                    value={selectedApp.status || 'pending'}
                    onChange={(e) => handleStatusChange(selectedApp._id, e.target.value)}
                    disabled={actionLoading}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pending">{isBn ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
                    <option value="under_review">{isBn ? 'পর্যালোচনাধীন (Under Review)' : 'Under Review'}</option>
                    <option value="interview_scheduled">{isBn ? 'ইন্টারভিউ নির্ধারিত (Interview Scheduled)' : 'Interview Scheduled'}</option>
                    <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
                    <option value="rejected">{isBn ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</option>
                  </select>
                </div>

                {/* Motivation / Experience */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                  <span className="text-slate-400 block font-medium">{isBn ? 'অভিজ্ঞতা ও প্রেরণা:' : 'Motivation / Background:'}</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{selectedApp.motivation || selectedApp.experience || 'তথ্য দেওয়া হয়নি'}</p>
                </div>

                {/* Attached Documents */}
                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-400 block font-medium mb-1.5">{isBn ? 'সংযুক্ত সনদ / নথিপত্র:' : 'Attached Documents:'}</span>
                    <div className="space-y-1.5">
                      {selectedApp.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={`/api/v1/admin/join-us/${selectedApp._id}/documents/${doc._id || idx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-emerald-400 transition"
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            {doc.title || doc.filename || `Document #${idx + 1}`}
                          </span>
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes Thread */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <span className="text-xs text-slate-400 block font-medium">{isBn ? 'অভ্যন্তরীণ অ্যাডমিন নোট:' : 'Internal Review Notes:'}</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedApp.adminNotes && selectedApp.adminNotes.length > 0 ? (
                      selectedApp.adminNotes.map((n, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px]">
                          <p className="text-slate-300">{n.note}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-600">{isBn ? 'কোনো নোট নেই' : 'No notes recorded'}</p>
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={isBn ? 'নতুন অ্যাডমিন নোট যোগ করুন...' : 'Add admin note...'}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={actionLoading || !noteText.trim()}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition"
                    >
                      {isBn ? 'নোট সংরক্ষণ করুন' : 'Add Note'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                {isBn ? 'তালিকা থেকে কোনো আবেদনে ক্লিক করে বিবরণ দেখুন' : 'Select an application from the table to view details'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
