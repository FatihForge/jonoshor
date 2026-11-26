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
      if (!res.ok) throw new Error('আবেদন তালিকা লোড করতে ব্যর্থ হয়েছে');
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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ note: noteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'নোট সংরক্ষণ ব্যর্থ হয়েছে');

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
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
      <div className="editorial-rule-top pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text font-semibold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ড্যাশবোর্ডে ফিরুন</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-pine" />
            <span>{isBn ? 'স্বেচ্ছাসেবক ও আইনজীবী আবেদন পর্যালোচনা' : 'Volunteer & Legal Panel Applications'}</span>
          </h1>
          <p className="text-brand-slate">
            {isBn ? 'মানবাধিকার পর্যবেক্ষণ ও আইনি সহায়তা প্যানেলে যুক্ত হতে ইচ্ছুকদের আবেদন পরিচালনা করুন।' : 'Manage volunteer and lawyer onboarding.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={actionLoading}
            className="px-4 py-2 rounded-md border border-brand-text bg-canvas-card hover:bg-brand-text hover:text-white text-brand-text font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV এক্সপোর্ট</span>
          </button>
          <button
            onClick={fetchApplications}
            className="p-2 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle text-brand-text"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`p-3.5 rounded-md border flex items-center gap-2 ${
          alertMsg.type === 'error'
            ? 'bg-red-50 border-red-200 text-brand-crimson'
            : 'bg-emerald-50 border-emerald-200 text-brand-pine'
        }`}>
          {alertMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="dossier-card p-4 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold text-brand-text mb-1">আবেদনের স্ট্যাটাস</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="editorial-input px-3 py-2">
            <option value="">সকল স্ট্যাটাস</option>
            <option value="pending">অপেক্ষমান (Pending)</option>
            <option value="under_review">পর্যালোচনাধীন (Under Review)</option>
            <option value="interview_scheduled">ইন্টারভিউ নির্ধারিত</option>
            <option value="approved">অনুমোদিত (Approved)</option>
            <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-brand-text mb-1">আবেদনের ভূমিকা / পদ</label>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="editorial-input px-3 py-2">
            <option value="">সকল ভূমিকা</option>
            <option value="volunteer">স্বেচ্ছাসেবক (Volunteer)</option>
            <option value="lawyer">আইনজীবী (Lawyer)</option>
            <option value="doctor">চিকিৎসক (Medical)</option>
            <option value="researcher">গবেষক (Researcher)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => { setStatusFilter(''); setRoleFilter(''); setPage(1); }} className="w-full py-2 border border-canvas-border bg-canvas hover:bg-canvas-subtle font-semibold rounded-md">
            ফিল্টার পরিষ্কার করুন
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dossier-card rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas-subtle text-brand-text font-bold border-b border-canvas-border uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">আবেদনকারী</th>
                  <th className="px-4 py-3.5">ভূমিকা</th>
                  <th className="px-4 py-3.5">জেলা</th>
                  <th className="px-4 py-3.5">স্ট্যাটাস</th>
                  <th className="px-4 py-3.5 text-right">বিবরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-border">
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center text-brand-muted">লোড হচ্ছে...</td></tr>
                ) : applications.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-brand-muted">কোনো আবেদন পাওয়া যায়নি</td></tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app._id}
                      onClick={() => setSelectedApp(app)}
                      className={`cursor-pointer transition ${
                        selectedApp?._id === app._id ? 'bg-canvas-subtle border-l-4 border-l-brand-text' : 'hover:bg-canvas-hover'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-brand-text">{app.fullName || 'Anonymous'}</div>
                        <div className="text-[10px] font-mono text-brand-muted">{app.email}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{app.roleApplied || app.primaryProfession || 'volunteer'}</td>
                      <td className="px-4 py-3 text-brand-slate">{app.district || 'Dhaka'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                          app.status === 'approved'
                            ? 'bg-emerald-50 border-emerald-200 text-brand-pine'
                            : app.status === 'rejected'
                            ? 'bg-red-50 border-red-200 text-brand-crimson'
                            : 'bg-amber-50 border-amber-200 text-brand-ochre'
                        }`}>
                          {app.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }} className="px-2.5 py-1 rounded-md border border-canvas-border bg-canvas-card font-semibold text-brand-text">
                          দেখুন
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspector */}
        <div className="dossier-card p-5 rounded-md space-y-4">
          {selectedApp ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-canvas-border">
                <h3 className="font-serif text-lg font-bold text-brand-text">{selectedApp.fullName}</h3>
                <p className="text-xs font-mono text-brand-muted">{selectedApp.email}</p>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">স্ট্যাটাস পরিবর্তন করুন</label>
                <select
                  value={selectedApp.status || 'pending'}
                  onChange={(e) => handleStatusChange(selectedApp._id, e.target.value)}
                  disabled={actionLoading}
                  className="editorial-input px-3 py-2"
                >
                  <option value="pending">অপেক্ষমান (Pending)</option>
                  <option value="under_review">পর্যালোচনাধীন (Under Review)</option>
                  <option value="interview_scheduled">ইন্টারভিউ নির্ধারিত</option>
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-md bg-canvas border border-canvas-border space-y-1">
                <span className="font-bold text-brand-text block">অভিজ্ঞতা ও প্রেরণা:</span>
                <p className="text-brand-slate leading-relaxed whitespace-pre-wrap">
                  {selectedApp.contributionDetails || selectedApp.motivation || 'তথ্য দেওয়া হয়নি'}
                </p>
              </div>

              {selectedApp.documents && selectedApp.documents.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-brand-text block">সংযুক্ত নথিপত্র:</span>
                  {selectedApp.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={`/api/v1/admin/join-us/${selectedApp._id}/documents/${doc._id || idx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-md bg-canvas border border-canvas-border hover:border-brand-text"
                    >
                      <span className="truncate flex items-center gap-1.5 font-semibold">
                        <FileText className="w-3.5 h-3.5 text-brand-pine" />
                        {doc.title || doc.filename || `Document #${idx + 1}`}
                      </span>
                      <Download className="w-3.5 h-3.5 text-brand-muted" />
                    </a>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-canvas-border space-y-3">
                <span className="font-bold text-brand-text block">অভ্যন্তরীণ অ্যাডমিন নোট:</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedApp.adminNotes && selectedApp.adminNotes.length > 0 ? (
                    selectedApp.adminNotes.map((n, i) => (
                      <div key={i} className="p-2.5 rounded-md bg-canvas border border-canvas-border text-[11px]">
                        <p className="text-brand-text">{n.note}</p>
                        <span className="text-[9px] font-mono text-brand-muted mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-brand-muted">কোনো নোট নেই</p>
                  )}
                </div>

                <form onSubmit={handleAddNote} className="space-y-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="নতুন অ্যাডমিন নোট লিখুন..."
                    className="editorial-input px-3 py-2"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !noteText.trim()}
                    className="w-full py-2 bg-brand-text hover:bg-black disabled:opacity-50 text-white font-bold rounded-md transition"
                  >
                    নোট সংরক্ষণ করুন
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-brand-muted">
              তালিকা থেকে কোনো আবেদনে ক্লিক করে বিস্তারিত দেখুন
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
