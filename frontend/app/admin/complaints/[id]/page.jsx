'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, FileCheck, ShieldAlert } from 'lucide-react';

export default function AdminComplaintReviewDetailPage({ params }) {
  const [complaint, setComplaint] = useState(null);
  const [decision, setDecision] = useState('verified');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  // COI
  const [coiReason, setCoiReason] = useState('');
  const [coiModal, setCoiModal] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/admin/complaints/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setComplaint(d.data || null))
      .catch(() => {});
  }, [params.id]);

  const handleDecision = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch(`/api/v1/admin/complaints/${params.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ decision, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'সিদ্ধান্ত সংরক্ষণ করা যায়নি।');

      setMsg('যাচাই সিদ্ধান্ত সফলভাবে সংরক্ষিত হয়েছে।');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoi = async () => {
    if (!coiReason.trim()) return;
    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch(`/api/v1/admin/complaints/${params.id}/conflict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ reason: coiReason }),
      });

      if (!res.ok) throw new Error('COI ডিক্লেয়ারেশন ব্যর্থ হয়েছে।');
      setMsg('স্বার্থের সংঘাত ঘোষিত হয়েছে। কেসটি কিউতে ফেরত পাঠানো হয়েছে।');
      setCoiModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6 text-xs">
      <div>
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>অভিযোগ তালিকায় ফিরুন</span>
        </Link>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaint Info Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-canvas-border space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-canvas-border">
          <span className="font-bold text-sm text-brand-text">আইডি: {params.id}</span>
          <button
            onClick={() => setCoiModal(true)}
            className="px-3 py-1.5 rounded-lg border border-brand-amber/40 text-brand-amber hover:bg-brand-amber/10 font-medium"
          >
            স্বার্থের সংঘাত (COI) ঘোষণা
          </button>
        </div>

        <div className="space-y-1">
          <span className="font-bold text-brand-text">ঘটনার বিবরণ:</span>
          <p className="text-brand-slate leading-relaxed bg-canvas-card p-3 rounded-xl border border-canvas-border">
            {complaint?.incident?.description}
          </p>
        </div>
      </div>

      {/* Review Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-canvas-border space-y-4">
        <h2 className="text-sm font-bold text-brand-text flex items-center gap-1.5 pb-2 border-b border-canvas-border">
          <FileCheck className="w-4 h-4 text-brand-emerald" />
          <span>তদন্ত কর্মকর্তার সত্যতা যাচাই সিদ্ধান্ত (Verification Decision)</span>
        </h2>

        <form onSubmit={handleDecision} className="space-y-4">
          <div>
            <label className="block text-brand-text font-medium mb-1">যাচাইয়ের ফলাফল *</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full px-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
            >
              <option value="verified">সত্যতা নিশ্চিত (Verified)</option>
              <option value="rejected">প্রত্যাখ্যাত / ভিত্তিহীন (Rejected)</option>
              <option value="more_info_needed">অতিরিক্ত তথ্য প্রয়োজন (More Info Needed)</option>
            </select>
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1">সিদ্ধান্তের যৌক্তিক কারণ ও নোট *</label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="প্রমাণের সত্যতা, সিসিটিভি ফুটেজ বা সাক্ষ্য কীভাবে যাচাই করা হয়েছে তা লিখুন..."
              className="w-full px-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold"
          >
            {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত চূড়ান্ত করুন'}
          </button>
        </form>
      </div>

      {/* COI Modal */}
      {coiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-canvas-border space-y-4">
            <h3 className="font-bold text-sm text-brand-text">স্বার্থের সংঘাত ঘোষণা</h3>
            <p className="text-brand-slate text-xs">
              অভিযুক্ত বা ভুক্তভোগী কোনো পক্ষ আপনার পরিচিত বা আত্মীয় হলে নিরপেক্ষতার স্বার্থে কারণ উল্লেখ করে কেসটি ফিরিয়ে দিন।
            </p>
            <textarea
              rows={3}
              value={coiReason}
              onChange={(e) => setCoiReason(e.target.value)}
              placeholder="সংঘাতের সুনির্দিষ্ট কারণ লিখুন..."
              className="w-full p-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCoiModal(false)}
                className="px-4 py-2 rounded-xl border border-canvas-border text-brand-slate"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleCoi}
                className="px-4 py-2 rounded-xl bg-brand-amber text-canvas font-bold"
              >
                ঘোষণা নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
