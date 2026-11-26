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
      if (!res.ok) throw new Error('প্রমাণ তালিকা লোড করতে ব্যর্থ হয়েছে');
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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
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
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
      <div className="editorial-rule-top pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text font-semibold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ড্যাশবোর্ডে ফিরুন</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-brand-pine" />
            <span>{isBn ? 'প্রমাণ ও ডিজিটাল আলামত ব্যবস্থাপনা' : 'Digital Evidence & Forensics Management'}</span>
          </h1>
          <p className="text-brand-slate">
            {isBn ? 'ম্যালওয়্যার স্ক্যানকৃত প্রমাণসমূহের আইনি সত্যতা ও সর্বজনীন প্রকাশনা পর্যালোচনা করুন।' : 'Review malware-scanned evidentiary documents and public disclosure status.'}
          </p>
        </div>

        <button
          onClick={fetchEvidence}
          className="self-start sm:self-auto px-4 py-2 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle text-brand-text font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
        </button>
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
          <label className="block font-semibold text-brand-text mb-1">{isBn ? 'পর্যালোচনা স্ট্যাটাস' : 'Review Status'}</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="editorial-input px-3 py-2"
          >
            <option value="">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
            <option value="pending">অপেক্ষমান (Pending)</option>
            <option value="approved">অনুমোদিত (Approved)</option>
            <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
            <option value="flagged">চিহ্নিত (Flagged)</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-brand-text mb-1">{isBn ? 'অভিযোগ আইডি দিয়ে ফিল্টার' : 'Filter by Complaint ID'}</label>
          <input
            type="text"
            value={complaintIdFilter}
            onChange={(e) => { setComplaintIdFilter(e.target.value); setPage(1); }}
            placeholder="Complaint ID..."
            className="editorial-input px-3 py-2 font-mono"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setStatusFilter(''); setComplaintIdFilter(''); setPage(1); }}
            className="w-full py-2 border border-canvas-border bg-canvas hover:bg-canvas-subtle text-brand-text font-semibold rounded-md transition"
          >
            {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear Filters'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="dossier-card rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-subtle text-brand-text font-bold border-b border-canvas-border uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">{isBn ? 'ফাইল ও ধরন' : 'File & Type'}</th>
                <th className="px-4 py-3.5">{isBn ? 'অভিযোগ রেফারেন্স' : 'Complaint Ref'}</th>
                <th className="px-4 py-3.5">{isBn ? 'ম্যালওয়্যার স্ক্যান' : 'Scan'}</th>
                <th className="px-4 py-3.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="px-4 py-3.5">{isBn ? 'পাবলিক অবস্থা' : 'Disclosure'}</th>
                <th className="px-4 py-3.5 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-brand-muted">প্রমাণ তথ্য লোড হচ্ছে...</td>
                </tr>
              ) : evidenceList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-brand-muted">কোনো প্রমাণ পাওয়া যায়নি</td>
                </tr>
              ) : (
                evidenceList.map((item) => (
                  <tr key={item._id} className="hover:bg-canvas-hover transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-brand-text">{item.originalFilename || item.type || 'Unnamed Evidence'}</div>
                      <div className="text-[10px] text-brand-muted font-mono mt-0.5">
                        {item.mimeType || 'unknown'} • {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/complaints/${item.complaintId?._id || item.complaintId}`} className="font-mono text-brand-cobalt hover:underline font-semibold">
                        {item.complaintId?.trackingNumber || (typeof item.complaintId === 'string' ? item.complaintId.slice(-8) : 'Complaint')}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                        item.malwareScanStatus === 'clean'
                          ? 'bg-emerald-50 border-emerald-200 text-brand-pine'
                          : item.malwareScanStatus === 'quarantined'
                          ? 'bg-red-50 border-red-200 text-brand-crimson'
                          : 'bg-amber-50 border-amber-200 text-brand-ochre'
                      }`}>
                        {item.malwareScanStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-brand-pine border-emerald-200'
                          : item.status === 'rejected'
                          ? 'bg-red-50 text-brand-crimson border-red-200'
                          : 'bg-amber-50 text-brand-ochre border-amber-200'
                      }`}>
                        {item.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-mono text-[10px] font-semibold border ${
                        item.publicStatus === 'approved_public'
                          ? 'bg-emerald-50 border-emerald-200 text-brand-pine'
                          : 'bg-canvas-subtle border-canvas-border text-brand-muted'
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
                          className="p-1.5 rounded-md border border-canvas-border bg-canvas hover:bg-canvas-subtle text-brand-text"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setReviewModal({
                            open: true, item, status: item.status || 'approved',
                            reviewNotes: item.reviewNotes || '', flaggedReason: item.flaggedReason || '',
                          })}
                          className="px-2.5 py-1 rounded-md border border-brand-text bg-canvas-card hover:bg-brand-text hover:text-white text-brand-text font-semibold transition"
                        >
                          রিভিউ
                        </button>
                        <button
                          onClick={() => setPublishModal({
                            open: true, item,
                            publicStatus: item.publicStatus === 'approved_public' ? 'private' : 'approved_public',
                            redactionNotes: item.redactionNotes || '',
                          })}
                          className="px-2.5 py-1 rounded-md bg-brand-pine hover:bg-brand-pineDark text-white font-semibold transition"
                        >
                          পাবলিক
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

      {/* Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dossier-card-elevated rounded-md max-w-md w-full p-6 border-t-4 border-t-brand-text space-y-4">
            <h3 className="font-serif text-base font-bold text-brand-text flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-pine" />
              <span>ডিজিটাল আলামত আইনি রিভিউ</span>
            </h3>
            <p className="text-xs font-mono text-brand-muted">{reviewModal.item?.originalFilename || 'Evidence'}</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-brand-text mb-1">পর্যালোচনা সিদ্ধান্ত *</label>
                <select
                  value={reviewModal.status}
                  onChange={(e) => setReviewModal({ ...reviewModal, status: e.target.value })}
                  className="editorial-input px-3 py-2"
                >
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
                  <option value="flagged">চিহ্নিত (Flagged)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-text mb-1">অভ্যন্তরীণ মন্তব্য</label>
                <textarea
                  rows={3}
                  value={reviewModal.reviewNotes}
                  onChange={(e) => setReviewModal({ ...reviewModal, reviewNotes: e.target.value })}
                  className="editorial-input px-3 py-2"
                />
              </div>
              {reviewModal.status === 'flagged' && (
                <div>
                  <label className="block font-semibold text-brand-crimson mb-1">চিহ্নিত করার কারণ *</label>
                  <input
                    type="text"
                    required
                    value={reviewModal.flaggedReason}
                    onChange={(e) => setReviewModal({ ...reviewModal, flaggedReason: e.target.value })}
                    className="editorial-input px-3 py-2"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
                <button type="button" onClick={() => setReviewModal({ open: false, item: null })} className="px-4 py-2 rounded-md border border-canvas-border bg-canvas font-semibold">
                  বাতিল
                </button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-md bg-brand-pine text-white font-bold">
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publication Modal */}
      {publishModal.open && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dossier-card-elevated rounded-md max-w-md w-full p-6 border-t-4 border-t-brand-pine space-y-4">
            <h3 className="font-serif text-base font-bold text-brand-text flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-pine" />
              <span>সর্বজনীন প্রকাশনা অনুমোদন</span>
            </h3>
            <p className="text-xs text-brand-slate">জনসমক্ষে প্রকাশের পূর্বে ব্যক্তিগত ও সংবেদনশীল তথ্য গোপন করা বাধ্যতামূলক।</p>
            <form onSubmit={handlePublishSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-brand-text mb-1">পাবলিক স্ট্যাটাস</label>
                <select
                  value={publishModal.publicStatus}
                  onChange={(e) => setPublishModal({ ...publishModal, publicStatus: e.target.value })}
                  className="editorial-input px-3 py-2"
                >
                  <option value="approved_public">পাবলিক রিপোর্টে দৃশ্যমান (Approved Public)</option>
                  <option value="private">অভ্যন্তরীণ (Private)</option>
                  <option value="redacted_public">সম্পাদিত আকারে প্রকাশযোগ্য (Redacted Public)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-text mb-1">রেডাকশন নোট</label>
                <textarea
                  rows={3}
                  value={publishModal.redactionNotes}
                  onChange={(e) => setPublishModal({ ...publishModal, redactionNotes: e.target.value })}
                  className="editorial-input px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
                <button type="button" onClick={() => setPublishModal({ open: false, item: null })} className="px-4 py-2 rounded-md border border-canvas-border bg-canvas font-semibold">
                  বাতিল
                </button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-md bg-brand-text text-white font-bold">
                  অনুমোদন প্রয়োগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
