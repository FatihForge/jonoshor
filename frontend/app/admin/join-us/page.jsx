'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, ArrowLeft, Download, CheckCircle2, AlertTriangle, FileText, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminJoinUsPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

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

      const res = await fetch(`/api/v1/admin/join-us?${query.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error(isBn ? 'আবেদন তালিকা লোড করতে ব্যর্থ হয়েছে' : 'Failed to load applications');
      const data = await res.json();
      setApplications(data.data || []);
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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (isBn ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' : 'Status update failed'));

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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ note: noteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (isBn ? 'নোট সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save note'));

      setAlertMsg({ type: 'success', text: isBn ? 'অ্যাডমিন নোট যুক্ত করা হয়েছে' : 'Admin note added' });
      setNoteText('');
      fetchApplications();
      setSelectedApp((prev) => ({
        ...prev,
        adminNotes: [...(prev.adminNotes || []), { note: noteText, createdAt: new Date().toISOString() }],
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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ status: statusFilter, role: roleFilter }),
      });
      if (!res.ok) throw new Error(isBn ? 'CSV এক্সপোর্ট করতে ব্যর্থ হয়েছে' : 'CSV export failed');
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
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-semibold hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-blue" />
              <span>{isBn ? 'স্বেচ্ছাসেবক ও আইনজীবী আবেদন পর্যালোচনা' : 'Volunteer & Legal Panel Applications'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isBn
                ? 'মানবাধিকার পর্যবেক্ষণ ও আইনি সহায়তা প্যানেলে যুক্ত হতে ইচ্ছুকদের আবেদন পরিচালনা করুন।'
                : 'Manage applications for the human rights observation and legal aid taskforce.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={actionLoading}
              className="px-4 py-2 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
            </button>
            <button
              onClick={fetchApplications}
              className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {alertMsg.text && (
          <div className={`p-3.5 rounded-xl border flex items-center gap-2 ${
            alertMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}>
            {alertMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        <div className="dossier-card p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
              {isBn ? 'আবেদনের স্ট্যাটাস' : 'Application Status'}
            </label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="editorial-input px-3 py-2">
              <option value="">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="pending">{isBn ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
              <option value="under_review">{isBn ? 'পর্যালোচনাধীন (Under Review)' : 'Under Review'}</option>
              <option value="interview_scheduled">{isBn ? 'ইন্টারভিউ নির্ধারিত' : 'Interview Scheduled'}</option>
              <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
              <option value="rejected">{isBn ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
              {isBn ? 'আবেদনের ভূমিকা / পদ' : 'Applied Role'}
            </label>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="editorial-input px-3 py-2">
              <option value="">{isBn ? 'সকল ভূমিকা' : 'All Roles'}</option>
              <option value="volunteer">{isBn ? 'স্বেচ্ছাসেবক (Volunteer)' : 'Volunteer'}</option>
              <option value="lawyer">{isBn ? 'আইনজীবী (Lawyer)' : 'Lawyer'}</option>
              <option value="doctor">{isBn ? 'চিকিৎসক (Medical)' : 'Medical Doctor'}</option>
              <option value="researcher">{isBn ? 'গবেষক (Researcher)' : 'Researcher'}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setStatusFilter(''); setRoleFilter(''); setPage(1); }} className="w-full py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold rounded-full">
              {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear Filters'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 dossier-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">{isBn ? 'আবেদনকারী' : 'Applicant'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'ভূমিকা' : 'Role'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'জেলা' : 'District'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="px-4 py-3.5 text-right">{isBn ? 'বিবরণ' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan="5" className="py-12 text-center text-slate-400">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan="5" className="py-12 text-center text-slate-400">{isBn ? 'কোনো আবেদন পাওয়া যায়নি' : 'No applications found'}</td></tr>
                  ) : (
                    applications.map((app) => (
                      <tr
                        key={app._id}
                        onClick={() => setSelectedApp(app)}
                        className={`cursor-pointer transition ${
                          selectedApp?._id === app._id ? 'bg-blue-50/70 dark:bg-slate-800 border-l-4 border-l-brand-blue' : 'hover:bg-blue-50/30 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-brand-navy dark:text-white">{app.fullName || 'Anonymous'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{app.email}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">{app.roleApplied || app.primaryProfession || 'volunteer'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{app.district || 'Dhaka'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                            app.status === 'approved'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : app.status === 'rejected'
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {app.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }} className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold">
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

          <div className="dossier-card p-5 rounded-2xl space-y-4">
            {selectedApp ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white">{selectedApp.fullName}</h3>
                  <p className="text-xs font-mono text-slate-500">{selectedApp.email}</p>
                </div>

                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    {isBn ? 'স্ট্যাটাস পরিবর্তন করুন' : 'Update Status'}
                  </label>
                  <select
                    value={selectedApp.status || 'pending'}
                    onChange={(e) => handleStatusChange(selectedApp._id, e.target.value)}
                    disabled={actionLoading}
                    className="editorial-input px-3 py-2"
                  >
                    <option value="pending">{isBn ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
                    <option value="under_review">{isBn ? 'পর্যালোচনাধীন (Under Review)' : 'Under Review'}</option>
                    <option value="interview_scheduled">{isBn ? 'ইন্টারভিউ নির্ধারিত' : 'Interview Scheduled'}</option>
                    <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
                    <option value="rejected">{isBn ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F4F8FF] dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-brand-navy dark:text-white block">
                    {isBn ? 'অভিজ্ঞতা ও প্রেরণা:' : 'Experience & Motivation:'}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.contributionDetails || selectedApp.motivation || (isBn ? 'তথ্য দেওয়া হয়নি' : 'Not provided')}
                  </p>
                </div>

                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-brand-navy dark:text-white block">
                      {isBn ? 'সংযুক্ত নথিপত্র:' : 'Attached Documents:'}
                    </span>
                    {selectedApp.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={`/api/v1/admin/join-us/${selectedApp._id}/documents/${doc._id || idx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-blue"
                      >
                        <span className="truncate flex items-center gap-1.5 font-semibold">
                          <FileText className="w-3.5 h-3.5 text-brand-blue" />
                          {doc.title || doc.filename || `Document #${idx + 1}`}
                        </span>
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <span className="font-bold text-brand-navy dark:text-white block">
                    {isBn ? 'অভ্যন্তরীণ অ্যাডমিন নোট:' : 'Internal Admin Notes:'}
                  </span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedApp.adminNotes && selectedApp.adminNotes.length > 0 ? (
                      selectedApp.adminNotes.map((n, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px]">
                          <p className="text-brand-navy dark:text-slate-200">{n.note}</p>
                          <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400">{isBn ? 'কোনো নোট নেই' : 'No notes yet'}</p>
                    )}
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={isBn ? 'নতুন অ্যাডমিন নোট লিখুন...' : 'Write an internal note...'}
                      className="editorial-input px-3 py-2"
                    />
                    <button
                      type="submit"
                      disabled={actionLoading || !noteText.trim()}
                      className="w-full py-2.5 bg-brand-blue hover:bg-brand-blueDark disabled:opacity-50 text-white font-bold rounded-full transition"
                    >
                      {isBn ? 'নোট সংরক্ষণ করুন' : 'Save Note'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                {isBn ? 'তালিকা থেকে কোনো আবেদনে ক্লিক করে বিস্তারিত দেখুন' : 'Select an application from the list to inspect'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
