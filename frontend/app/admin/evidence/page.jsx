'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck, Shield, AlertTriangle, Eye, EyeOff, Download,
  CheckCircle2, RefreshCw, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminEvidencePage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [complaintIdFilter, setComplaintIdFilter] = useState('');

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

      const res = await fetch(`/api/v1/admin/evidence?${query.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error(isBn ? 'প্রমাণ তালিকা লোড করতে ব্যর্থ হয়েছে' : 'Failed to load evidence list');
      const data = await res.json();
      setEvidenceList(data.data || []);
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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({
          status: reviewModal.status,
          reviewNotes: reviewModal.reviewNotes,
          flaggedReason: reviewModal.flaggedReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (isBn ? 'পর্যালোচনা সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save review'));

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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({
          publicStatus: publishModal.publicStatus,
          redactionNotes: publishModal.redactionNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (isBn ? 'প্রকাশনা অবস্থা পরিবর্তন ব্যর্থ হয়েছে' : 'Publication status update failed'));

      setAlertMsg({ type: 'success', text: isBn ? 'প্রকাশনা অনুমোদন হালনাগাদ করা হয়েছে' : 'Publication clearance updated' });
      setPublishModal({ open: false, item: null, publicStatus: 'approved_public', redactionNotes: '' });
      fetchEvidence();
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
              <FileCheck className="w-6 h-6 text-brand-blue" />
              <span>{isBn ? 'প্রমাণ ও ডিজিটাল আলামত ব্যবস্থাপনা' : 'Digital Evidence & Forensics Management'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isBn
                ? 'ম্যালওয়্যার স্ক্যানকৃত প্রমাণসমূহের আইনি সত্যতা ও সর্বজনীন প্রকাশনা পর্যালোচনা করুন।'
                : 'Review malware-scanned evidentiary documents and public disclosure clearance.'}
            </p>
          </div>

          <button
            onClick={fetchEvidence}
            className="self-start sm:self-auto px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-navy dark:text-white font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </button>
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
              {isBn ? 'পর্যালোচনা স্ট্যাটাস' : 'Review Status'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="editorial-input px-3 py-2"
            >
              <option value="">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="pending">{isBn ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
              <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
              <option value="rejected">{isBn ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</option>
              <option value="flagged">{isBn ? 'চিহ্নিত (Flagged)' : 'Flagged'}</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
              {isBn ? 'অভিযোগ আইডি দিয়ে ফিল্টার' : 'Filter by Complaint ID'}
            </label>
            <input
              type="text"
              value={complaintIdFilter}
              onChange={(e) => { setComplaintIdFilter(e.target.value); setPage(1); }}
              placeholder={isBn ? 'অভিযোগ আইডি...' : 'Complaint ID...'}
              className="editorial-input px-3 py-2 font-mono"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStatusFilter(''); setComplaintIdFilter(''); setPage(1); }}
              className="w-full py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-navy dark:text-white font-semibold rounded-full transition"
            >
              {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear Filters'}
            </button>
          </div>
        </div>

        <div className="dossier-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">{isBn ? 'ফাইল ও ধরন' : 'File & Type'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'অভিযোগ রেফারেন্স' : 'Complaint Ref'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'ম্যালওয়্যার স্ক্যান' : 'Scan'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'পাবলিক অবস্থা' : 'Disclosure'}</th>
                  <th className="px-4 py-3.5 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      {isBn ? 'প্রমাণ তথ্য লোড হচ্ছে...' : 'Loading evidence...'}
                    </td>
                  </tr>
                ) : evidenceList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      {isBn ? 'কোনো প্রমাণ পাওয়া যায়নি' : 'No evidence found'}
                    </td>
                  </tr>
                ) : (
                  evidenceList.map((item) => (
                    <tr key={item._id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-brand-navy dark:text-white">{item.originalFilename || item.type || 'Unnamed Evidence'}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.mimeType || 'unknown'} • {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/complaints/${item.complaintId?._id || item.complaintId}`} className="font-mono text-brand-blue dark:text-blue-400 hover:underline font-semibold">
                          {item.complaintId?.trackingNumber || (typeof item.complaintId === 'string' ? item.complaintId.slice(-8) : 'Complaint')}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                          item.malwareScanStatus === 'clean'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : item.malwareScanStatus === 'quarantined'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {item.malwareScanStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                          item.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {item.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                          item.publicStatus === 'approved_public'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}>
                          {item.publicStatus === 'approved_public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {item.publicStatus || 'private'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/api/v1/admin/evidence/${item._id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-navy dark:text-white"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setReviewModal({
                              open: true, item, status: item.status || 'approved',
                              reviewNotes: item.reviewNotes || '', flaggedReason: item.flaggedReason || '',
                            })}
                            className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-navy dark:text-white font-semibold transition"
                          >
                            {isBn ? 'রিভিউ' : 'Review'}
                          </button>
                          <button
                            onClick={() => setPublishModal({
                              open: true, item,
                              publicStatus: item.publicStatus === 'approved_public' ? 'private' : 'approved_public',
                              redactionNotes: item.redactionNotes || '',
                            })}
                            className="px-3 py-1 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-semibold transition"
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

        {reviewModal.open && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="dossier-card-elevated rounded-3xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-blue" />
                <span>{isBn ? 'ডিজিটাল আলামত আইনি রিভিউ' : 'Forensic Evidence Legal Review'}</span>
              </h3>
              <p className="text-xs font-mono text-slate-500">{reviewModal.item?.originalFilename || 'Evidence'}</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    {isBn ? 'পর্যালোচনা সিদ্ধান্ত *' : 'Review Decision *'}
                  </label>
                  <select
                    value={reviewModal.status}
                    onChange={(e) => setReviewModal({ ...reviewModal, status: e.target.value })}
                    className="editorial-input px-3 py-2"
                  >
                    <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
                    <option value="rejected">{isBn ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</option>
                    <option value="flagged">{isBn ? 'চিহ্নিত (Flagged)' : 'Flagged'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    {isBn ? 'অভ্যন্তরীণ মন্তব্য' : 'Internal Review Notes'}
                  </label>
                  <textarea
                    rows={3}
                    value={reviewModal.reviewNotes}
                    onChange={(e) => setReviewModal({ ...reviewModal, reviewNotes: e.target.value })}
                    className="editorial-input px-3 py-2"
                  />
                </div>
                {reviewModal.status === 'flagged' && (
                  <div>
                    <label className="block font-semibold text-rose-600 mb-1">
                      {isBn ? 'চিহ্নিত করার কারণ *' : 'Flagged Reason *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewModal.flaggedReason}
                      onChange={(e) => setReviewModal({ ...reviewModal, flaggedReason: e.target.value })}
                      className="editorial-input px-3 py-2"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setReviewModal({ open: false, item: null })} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-full bg-brand-blue text-white font-bold">
                    {isBn ? 'সংরক্ষণ' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {publishModal.open && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="dossier-card-elevated rounded-3xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-blue" />
                <span>{isBn ? 'সর্বজনীন প্রকাশনা অনুমোদন' : 'Public Disclosure Clearance'}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isBn
                  ? 'জনসমক্ষে প্রকাশের পূর্বে ব্যক্তিগত ও সংবেদনশীল তথ্য গোপন করা বাধ্যতামূলক।'
                  : 'All sensitive personal data must be redacted prior to public release.'}
              </p>
              <form onSubmit={handlePublishSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    {isBn ? 'পাবলিক স্ট্যাটাস' : 'Public Status'}
                  </label>
                  <select
                    value={publishModal.publicStatus}
                    onChange={(e) => setPublishModal({ ...publishModal, publicStatus: e.target.value })}
                    className="editorial-input px-3 py-2"
                  >
                    <option value="approved_public">{isBn ? 'পাবলিক রিপোর্টে দৃশ্যমান (Approved Public)' : 'Approved Public'}</option>
                    <option value="private">{isBn ? 'অভ্যন্তরীণ (Private)' : 'Private'}</option>
                    <option value="redacted_public">{isBn ? 'সম্পাদিত আকারে প্রকাশযোগ্য (Redacted Public)' : 'Redacted Public'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    {isBn ? 'রেডাকশন নোট' : 'Redaction Notes'}
                  </label>
                  <textarea
                    rows={3}
                    value={publishModal.redactionNotes}
                    onChange={(e) => setPublishModal({ ...publishModal, redactionNotes: e.target.value })}
                    className="editorial-input px-3 py-2"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setPublishModal({ open: false, item: null })} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-full bg-brand-blue text-white font-bold">
                    {isBn ? 'অনুমোদন প্রয়োগ করুন' : 'Apply Clearance'}
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
