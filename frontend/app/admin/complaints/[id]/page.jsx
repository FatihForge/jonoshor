'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, FileCheck, FileText, ShieldAlert } from 'lucide-react';

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

      const endpoint =
        decision === 'more_info_needed'
          ? `/api/v1/admin/complaints/${params.id}/request-information`
          : `/api/v1/admin/complaints/${params.id}/verify`;

      const payload =
        decision === 'more_info_needed'
          ? { message: reason }
          : { decision, reason };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'সিদ্ধান্ত সংরক্ষণ করা যায়নি।');

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
        credentials: 'include',
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>অভিযোগ তালিকায় ফিরুন</span>
        </Link>

        <Link
          href={`/admin/complaints/${params.id}/public-report`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-pine hover:bg-brand-pineDark text-white font-bold transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>পাবলিক রিপোর্ট বিল্ডার খুলুন</span>
        </Link>
      </div>

      {msg && (
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-brand-pine flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-brand-crimson flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Case File Sheet */}
      <div className="dossier-card-elevated p-6 sm:p-8 rounded-md border-t-4 border-t-brand-text space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-canvas-border">
          <div>
            <span className="font-mono text-[10px] uppercase text-brand-muted block">Case Reference</span>
            <span className="font-mono font-bold text-sm text-brand-text">{params.id}</span>
          </div>
          <button
            onClick={() => setCoiModal(true)}
            className="px-3 py-1.5 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-brand-ochre font-bold flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>স্বার্থের সংঘাত (COI) ঘোষণা</span>
          </button>
        </div>

        <div className="space-y-2">
          <span className="font-serif font-bold text-base text-brand-text block">ঘটনার বিবরণ:</span>
          <p className="text-brand-slate text-sm leading-relaxed bg-canvas p-4 rounded-md border border-canvas-border whitespace-pre-line">
            {complaint?.incident?.description || 'লোড হচ্ছে...'}
          </p>
        </div>
      </div>

      {/* Verification Decision Sheet */}
      <div className="dossier-card p-6 sm:p-8 rounded-md border-t-4 border-t-brand-pine space-y-4">
        <h2 className="font-serif text-lg font-bold text-brand-text flex items-center gap-2 pb-2 border-b border-canvas-border">
          <FileCheck className="w-4 h-4 text-brand-pine" />
          <span>তদন্ত কর্মকর্তার সত্যতা যাচাই সিদ্ধান্ত (Verification Decision)</span>
        </h2>

        <form onSubmit={handleDecision} className="space-y-4">
          <div>
            <label className="block text-brand-text font-semibold mb-1.5">যাচাইয়ের ফলাফল *</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="editorial-input px-3 py-2"
            >
              <option value="verified">সত্যতা নিশ্চিত (Verified)</option>
              <option value="rejected">প্রত্যাখ্যাত / ভিত্তিহীন (Rejected)</option>
              <option value="more_info_needed">অতিরিক্ত তথ্য প্রয়োজন (More Info Needed)</option>
            </select>
          </div>

          <div>
            <label className="block text-brand-text font-semibold mb-1.5">সিদ্ধান্তের যৌক্তিক কারণ ও নোট *</label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="প্রমাণের সত্যতা, সিসিটিভি ফুটেজ বা সাক্ষ্য কীভাবে যাচাই করা হয়েছে তা লিখুন..."
              className="editorial-input px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-md bg-brand-pine hover:bg-brand-pineDark text-white font-bold transition-colors"
          >
            {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত চূড়ান্ত করুন'}
          </button>
        </form>
      </div>

      {/* COI Modal */}
      {coiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="dossier-card-elevated w-full max-w-md p-6 rounded-md border-t-4 border-t-brand-ochre space-y-4">
            <h3 className="font-serif font-bold text-base text-brand-text">স্বার্থের সংঘাত (Conflict of Interest) ঘোষণা</h3>
            <p className="text-brand-slate text-xs leading-relaxed">
              অভিযুক্ত বা ভুক্তভোগী কোনো পক্ষ আপনার পরিচিত বা আত্মীয় হলে নিরপেক্ষতার স্বার্থে কারণ উল্লেখ করে কেসটি ফিরিয়ে দিন।
            </p>
            <textarea
              rows={3}
              value={coiReason}
              onChange={(e) => setCoiReason(e.target.value)}
              placeholder="সংঘাতের সুনির্দিষ্ট কারণ লিখুন..."
              className="editorial-input p-2.5 text-xs"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
              <button
                type="button"
                onClick={() => setCoiModal(false)}
                className="px-4 py-2 rounded-md border border-canvas-border bg-canvas hover:bg-canvas-subtle text-brand-text font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleCoi}
                className="px-4 py-2 rounded-md bg-brand-ochre hover:bg-amber-800 text-white font-bold"
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
