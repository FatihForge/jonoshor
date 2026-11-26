'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Upload,
  AlertCircle,
  FileMinus,
  Edit3,
  Scale,
} from 'lucide-react';

export default function UserComplaintDetailPage({ params }) {
  const router = useRouter();
  const [complaint, setComplaint] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/user/complaints/${params.id}`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/v1/user/complaints/${params.id}/evidence`, { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([compRes, evRes]) => {
        if (compRes.data) setComplaint(compRes.data);
        if (evRes.data) setEvidenceList(evRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionMsg(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch(`/api/v1/user/complaints/${params.id}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ reason: withdrawReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'প্রত্যাহারের আবেদন সম্পন্ন হয়নি।');

      setActionMsg('প্রত্যাহারের আবেদন সফলভাবে পর্যালোচকদের কাছে পাঠানো হয়েছে।');
      setWithdrawModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-xs text-brand-slate">
        অভিযোগের তথ্য লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 text-xs">
      {/* Back button */}
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ড্যাশবোর্ডে ফিরুন</span>
        </Link>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-canvas-border space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-canvas-border pb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-brand-text">অভিযোগ আইডি: {params.id}</span>
            <span className="px-2.5 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald font-bold border border-brand-emerald/20 text-[10px] uppercase">
              {complaint?.status || 'SUBMITTED'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWithdrawModal(true)}
              className="px-3 py-1.5 rounded-lg border border-brand-crimson/30 hover:bg-brand-crimson/10 text-brand-crimson font-medium text-[11px] flex items-center gap-1"
            >
              <FileMinus className="w-3.5 h-3.5" />
              <span>প্রত্যাহারের আবেদন (Withdraw)</span>
            </button>
          </div>
        </div>

        {/* Narrative */}
        <div className="space-y-2">
          <h3 className="font-bold text-brand-text text-sm">ঘটনার বিবরণ</h3>
          <p className="text-brand-slate leading-relaxed whitespace-pre-line bg-canvas-card p-4 rounded-xl border border-canvas-border">
            {complaint?.incident?.description}
          </p>
        </div>

        {/* Location & Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-canvas-card border border-canvas-border">
            <span className="text-brand-slate text-[11px] block">স্থান</span>
            <span className="font-semibold text-brand-text">
              {complaint?.location?.freeTextLocation || complaint?.location?.districtId}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-canvas-card border border-canvas-border">
            <span className="text-brand-slate text-[11px] block">তারিখ</span>
            <span className="font-semibold text-brand-text">
              {complaint?.incident?.startDate
                ? new Date(complaint.incident.startDate).toLocaleDateString('bn-BD')
                : 'অজানা'}
            </span>
          </div>
        </div>

        {/* Evidence Section */}
        <div className="space-y-3 pt-4 border-t border-canvas-border">
          <h3 className="font-bold text-brand-text text-sm flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-brand-emerald" />
            <span>সংযুক্ত ডিজিটাল প্রমাণাদি ({evidenceList.length})</span>
          </h3>

          {evidenceList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evidenceList.map((ev) => (
                <div key={ev._id} className="p-3.5 rounded-xl bg-canvas-card border border-canvas-border space-y-1">
                  <div className="font-semibold text-brand-text truncate">{ev.originalFilename || 'প্রমাণক ফাইল'}</div>
                  <div className="text-[11px] text-brand-slate flex justify-between">
                    <span>স্ট্যাটাস: {ev.malwareScanStatus || 'clean'}</span>
                    <span>{(ev.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border text-brand-slate text-center">
              কোনো ফাইল সংযুক্ত নেই।
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-canvas-border space-y-4">
            <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brand-amber" />
              <span>অভিযোগ প্রত্যাহারের আবেদন</span>
            </h3>
            <p className="text-xs text-brand-slate">
              অভিযোগটি সরাসরি ডাটাবেজ থেকে মুছে ফেলা হবে না; নিরপেক্ষ পর্যবেক্ষক পর্যালোচনা করে প্রত্যাহারের সিদ্ধান্ত রেকর্ড করবেন।
            </p>

            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="block text-brand-text font-medium mb-1">প্রত্যাহারের কারণ লিখুন *</label>
                <textarea
                  required
                  rows={4}
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  placeholder="যেমন: আমরা双方 আপোষ মীমাংসায় উপনীত হয়েছি..."
                  className="w-full p-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModal(false)}
                  className="px-4 py-2 rounded-xl border border-canvas-border text-brand-slate hover:text-brand-text"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-brand-crimson hover:bg-rose-700 text-white font-bold"
                >
                  {actionLoading ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
