'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileCheck, Shield, AlertTriangle, Eye, EyeOff, Download, 
  Search, Filter, CheckCircle2, XCircle, RefreshCw, Lock, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminEvidencePage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [complaintIdFilter, setComplaintIdFilter] = useState('');

  // Modals state
  const [reviewModal, setReviewModal] = useState({ open: false, item: null, status: 'approved', reviewNotes: '', flaggedReason: '' });
  const [publishModal, setPublishModal] = useState({ open: false, item: null, publicStatus: 'approved_public', redactionNotes: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEvidence();
  }, [page, statusFilter, complaintIdFilter]);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(statusFilter && { status: statusFilter }),
        ...(complaintIdFilter && { complaintId: complaintIdFilter }),
      });

      const res = await fetch(`/api/v1/admin/evidence?${query.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('প্রমাণ তালিকা লোড করতে ব্যর্থ হয়েছে');
      const data = await res.json();
      setEvidenceList(data.data || []);
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/v1/admin/evidence/${reviewModal.item._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          status: reviewModal.status,
          reviewNotes: reviewModal.reviewNotes,
          flaggedReason: reviewModal.flaggedReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'পর্যালোচনা সংরক্ষণ ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'প্রমাণের অবস্থা সফলভাবে হালনাগাদ করা হয়েছে' : 'Evidence review updated' });
      setReviewModal({ open: false, item: null, status: 'approved', reviewNotes: '', flaggedReason: '' });
      fetchEvidence();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/v1/admin/evidence/${publishModal.item._id}/publication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          publicStatus: publishModal.publicStatus,
          redactionNotes: publishModal.redactionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'প্রকাশনা অবস্থা পরিবর্তন ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'প্রকাশনা অনুমোদন হালনাগাদ করা হয়েছে' : 'Publication status updated' });
      setPublishModal({ open: false, item: null, publicStatus: 'approved_public', redactionNotes: '' });
      fetchEvidence();
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
                <FileCheck className="w-6 h-6 text-emerald-400" />
                {isBn ? 'প্রমাণ ও ডিজিটাল আলামত ব্যবস্থাপনা' : 'Digital Evidence & Forensics Management'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'ম্যালওয়্যার স্ক্যানকৃত প্রমাণসমূহের আইনি সত্যতা ও সর্বজনীন প্রকাশনা পর্যালোচনা করুন।' 
                  : 'Review malware-scanned evidentiary documents, integrity checksums, and public disclosure status.'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchEvidence}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
          </button>
        </div>

        {/* Status Notification */}
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

        {/* Filters Panel */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">{isBn ? 'পর্যালোচনা স্ট্যাটাস' : 'Review Status'}</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="pending">{isBn ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
              <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
              <option value="rejected">{isBn ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</option>
              <option value="flagged">{isBn ? 'চিহ্নিত (Flagged)' : 'Flagged'}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{isBn ? 'অভিযোগ আইডি দিয়ে ফিল্টার' : 'Filter by Complaint ID'}</label>
            <input
              type="text"
              value={complaintIdFilter}
              onChange={(e) => { setComplaintIdFilter(e.target.value); setPage(1); }}
              placeholder={isBn ? 'অভিযোগ আইডি লিখুন...' : 'Enter Complaint ID...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStatusFilter(''); setComplaintIdFilter(''); setPage(1); }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
            >
              {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear Filters'}
            </button>
          </div>
        </div>

        {/* Evidence List Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">{isBn ? 'ফাইলের নাম ও ধরন' : 'File & Type'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'অভিযোগ রেফারেন্স' : 'Complaint Ref'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'ম্যালওয়্যার স্ক্যান' : 'Malware Scan'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'অভ্যন্তরীণ স্ট্যাটাস' : 'Review Status'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'পাবলিক ডিসক্লোজার' : 'Public Status'}</th>
                  <th className="px-4 py-3.5 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      {isBn ? 'প্রমাণ তথ্য লোড হচ্ছে...' : 'Loading evidence records...'}
                    </td>
                  </tr>
                ) : evidenceList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      {isBn ? 'কোনো প্রমাণ পাওয়া যায়নি' : 'No evidence records found'}
                    </td>
                  </tr>
                ) : (
                  evidenceList.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-850/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{item.originalFilename || item.type || 'Unnamed Evidence'}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.mimeType || 'unknown'} • {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/complaints/${item.complaintId?._id || item.complaintId}`}
                          className="font-mono text-emerald-400 hover:underline"
                        >
                          {item.complaintId?.trackingNumber || (typeof item.complaintId === 'string' ? item.complaintId.slice(-8) : 'Complaint')}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          item.malwareScanStatus === 'clean'
                            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                            : item.malwareScanStatus === 'quarantined'
                            ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                            : 'bg-amber-950/60 border-amber-800 text-amber-300'
                        }`}>
                          {item.malwareScanStatus === 'clean' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {item.malwareScanStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          item.status === 'approved'
                            ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                            : item.status === 'rejected'
                            ? 'bg-rose-900/40 text-rose-300 border border-rose-800'
                            : 'bg-amber-900/40 text-amber-300 border border-amber-800'
                        }`}>
                          {item.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          item.publicStatus === 'approved_public'
                            ? 'bg-teal-950/80 border border-teal-800 text-teal-300'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}>
                          {item.publicStatus === 'approved_public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {item.publicStatus || 'private'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Download / Stream */}
                          <a
                            href={`/api/v1/admin/evidence/${item._id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title={isBn ? 'ডাউনলোড করুন' : 'Download File'}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {/* Review Button */}
                          <button
                            onClick={() => setReviewModal({
                              open: true,
                              item,
                              status: item.status || 'approved',
                              reviewNotes: item.reviewNotes || '',
                              flaggedReason: item.flaggedReason || '',
                            })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-medium transition"
                          >
                            {isBn ? 'রিভিউ' : 'Review'}
                          </button>

                          {/* Publish Toggle */}
                          <button
                            onClick={() => setPublishModal({
                              open: true,
                              item,
                              publicStatus: item.publicStatus === 'approved_public' ? 'private' : 'approved_public',
                              redactionNotes: item.redactionNotes || '',
                            })}
                            className="px-2.5 py-1 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 border border-teal-800/80 text-teal-300 text-[11px] font-medium transition"
                          >
                            {isBn ? 'পাবলিক' : 'Public'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Evidence Modal */}
        {reviewModal.open && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                {isBn ? 'ডিজিটাল আলামত আইনি রিভিউ' : 'Evidence Forensic Review'}
              </h3>
              <p className="text-xs text-slate-400">
                {reviewModal.item?.originalFilename || 'Evidence File'}
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">{isBn ? 'পর্যালোচনা সিদ্ধান্ত *' : 'Review Decision *'}</label>
                  <select
                    value={reviewModal.status}
                    onChange={(e) => setReviewModal({ ...reviewModal, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="approved">{isBn ? 'অনুমোদিত (Approved - Valid Evidence)' : 'Approved'}</option>
                    <option value="rejected">{isBn ? 'প্রত্যাখ্যাত (Rejected - Irrelevant or Fabricated)' : 'Rejected'}</option>
                    <option value="flagged">{isBn ? 'চিহ্নিত (Flagged - Suspicious or Needs Forensics)' : 'Flagged'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{isBn ? 'অভ্যন্তরীণ মন্তব্য (Notes)' : 'Internal Review Notes'}</label>
                  <textarea
                    rows={3}
                    value={reviewModal.reviewNotes}
                    onChange={(e) => setReviewModal({ ...reviewModal, reviewNotes: e.target.value })}
                    placeholder={isBn ? 'রিভিউকারীর নোট লিখুন...' : 'Enter review notes...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                {reviewModal.status === 'flagged' && (
                  <div>
                    <label className="block text-xs text-rose-300 mb-1">{isBn ? 'চিহ্নিত করার কারণ *' : 'Flag Reason *'}</label>
                    <input
                      type="text"
                      required
                      value={reviewModal.flaggedReason}
                      onChange={(e) => setReviewModal({ ...reviewModal, flaggedReason: e.target.value })}
                      placeholder={isBn ? 'সন্দেহজনকতার কারণ লিখুন...' : 'Specify suspicion reason...'}
                      className="w-full bg-slate-950 border border-rose-900 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModal({ open: false, item: null })}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    {actionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {isBn ? 'সংরক্ষণ করুন' : 'Save Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Publication Status Modal */}
        {publishModal.open && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-400" />
                {isBn ? 'সর্বজনীন প্রকাশনা অনুমোদন' : 'Public Disclosure Authorization'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn 
                  ? 'জনসমক্ষে প্রকাশের পূর্বে ব্যক্তিগত ও সংবেদনশীল তথ্য গোপন করা (Redaction) বাধ্যতামূলক।' 
                  : 'Ensure redaction of PII before approving evidence for public viewing.'}
              </p>

              <form onSubmit={handlePublishSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">{isBn ? 'পাবলিক স্ট্যাটাস' : 'Public Status'}</label>
                  <select
                    value={publishModal.publicStatus}
                    onChange={(e) => setPublishModal({ ...publishModal, publicStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="approved_public">{isBn ? 'পাবলিক রিপোর্টে দৃশ্যমান (Approved Public)' : 'Approved Public'}</option>
                    <option value="private">{isBn ? 'শুধুমাত্র অভ্যন্তরীণ ও আইনি দলের জন্য (Private)' : 'Private'}</option>
                    <option value="redacted_public">{isBn ? 'সম্পাদিত আকারে প্রকাশযোগ্য (Redacted Public)' : 'Redacted Public'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{isBn ? 'রেডাকশন / সুরক্ষা নোট' : 'Redaction & Security Notes'}</label>
                  <textarea
                    rows={3}
                    value={publishModal.redactionNotes}
                    onChange={(e) => setPublishModal({ ...publishModal, redactionNotes: e.target.value })}
                    placeholder={isBn ? 'চেহারা, ফোন নম্বর বা ঠিকানা মোছা হয়েছে কিনা উল্লেখ করুন...' : 'Notes on blurred faces, protected IDs...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPublishModal({ open: false, item: null })}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    {actionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {isBn ? 'অনুমোদন প্রয়োগ করুন' : 'Apply Disclosure'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
