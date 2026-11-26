'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, FileCheck, FileText, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../../components/LanguageContext';

export default function AdminComplaintReviewDetailPage({ params }) {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [complaint, setComplaint] = useState(null);
  const [decision, setDecision] = useState('verified');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

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
      if (!res.ok) throw new Error(data?.error?.message || data?.message || (isBn ? 'সিদ্ধান্ত সংরক্ষণ করা যায়নি।' : 'Could not save decision.'));

      setMsg(isBn ? 'যাচাই সিদ্ধান্ত সফলভাবে সংরক্ষিত হয়েছে।' : 'Verification decision saved successfully.');
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

      if (!res.ok) throw new Error(isBn ? 'COI ডিক্লেয়ারেশন ব্যর্থ হয়েছে।' : 'COI declaration failed.');
      setMsg(isBn ? 'স্বার্থের সংঘাত ঘোষিত হয়েছে। কেসটি কিউতে ফেরত পাঠানো হয়েছে।' : 'Conflict of Interest declared. Case returned to the queue.');
      setCoiModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-6 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/complaints"
            className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? 'অভিযোগ তালিকায় ফিরুন' : 'Back to Complaints Queue'}</span>
          </Link>

          <Link
            href={`/admin/complaints/${params.id}/public-report`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isBn ? 'পাবলিক রিপোর্ট বিল্ডার খুলুন' : 'Open Public Report Builder'}</span>
          </Link>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="dossier-card-elevated p-6 sm:p-8 rounded-3xl space-y-5">
          <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-mono text-[10px] uppercase text-slate-400 block">
                {isBn ? 'কেস রেফারেন্স' : 'Case Reference'}
              </span>
              <span className="font-mono font-bold text-sm text-brand-navy dark:text-white">{params.id}</span>
            </div>
            <button
              onClick={() => setCoiModal(true)}
              className="px-3.5 py-1.5 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isBn ? 'স্বার্থের সংঘাত (COI) ঘোষণা' : 'Declare Conflict of Interest (COI)'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-base text-brand-navy dark:text-white block">
              {isBn ? 'ঘটনার বিবরণ:' : 'Incident Description:'}
            </span>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-[#F4F8FF] dark:bg-slate-900 p-4 rounded-2xl border border-blue-100/70 dark:border-slate-800 whitespace-pre-line">
              {complaint?.incident?.description || (isBn ? 'লোড হচ্ছে...' : 'Loading details...')}
            </p>
          </div>
        </div>

        <div className="dossier-card p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-lg font-bold text-brand-navy dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FileCheck className="w-4 h-4 text-brand-blue" />
            <span>{isBn ? 'তদন্ত কর্মকর্তার সত্যতা যাচাই সিদ্ধান্ত' : 'Caseworker Verification Decision'}</span>
          </h2>

          <form onSubmit={handleDecision} className="space-y-4">
            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                {isBn ? 'যাচাইয়ের ফলাফল *' : 'Verification Outcome *'}
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="editorial-input px-3.5 py-2.5"
              >
                <option value="verified">{isBn ? 'সত্যতা নিশ্চিত (Verified)' : 'Verified (Confirmed Authentic)'}</option>
                <option value="rejected">{isBn ? 'প্রত্যাখ্যাত / ভিত্তিহীন (Rejected)' : 'Rejected / Unsubstantiated'}</option>
                <option value="more_info_needed">{isBn ? 'অতিরিক্ত তথ্য প্রয়োজন (More Info Needed)' : 'More Information Needed'}</option>
              </select>
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                {isBn ? 'সিদ্ধান্তের যৌক্তিক কারণ ও নোট *' : 'Decision Rationale & Notes *'}
              </label>
              <textarea
                required
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isBn
                    ? 'প্রমাণের সত্যতা, সিসিটিভি ফুটেজ বা সাক্ষ্য কীভাবে যাচাই করা হয়েছে তা লিখুন...'
                    : 'Document how evidence, CCTV footage, or witness accounts were verified...'
                }
                className="editorial-input px-3.5 py-2.5"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold transition-colors shadow-md"
            >
              {submitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সিদ্ধান্ত চূড়ান্ত করুন' : 'Finalize Decision')}
            </button>
          </form>
        </div>

        {coiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="dossier-card-elevated w-full max-w-md p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-base text-brand-navy dark:text-white">
                {isBn ? 'স্বার্থের সংঘাত (Conflict of Interest) ঘোষণা' : 'Declare Conflict of Interest (COI)'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {isBn
                  ? 'অভিযুক্ত বা ভুক্তভোগী কোনো পক্ষ আপনার পরিচিত বা আত্মীয় হলে নিরপেক্ষতার স্বার্থে কারণ উল্লেখ করে কেসটি ফিরিয়ে দিন।'
                  : 'If you have any personal or institutional tie to either party, state your reason and recuse yourself.'}
              </p>
              <textarea
                rows={3}
                value={coiReason}
                onChange={(e) => setCoiReason(e.target.value)}
                placeholder={isBn ? 'সংঘাতের সুনির্দিষ্ট কারণ লিখুন...' : 'Specify your conflict of interest reason...'}
                className="editorial-input p-2.5 text-xs"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCoiModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleCoi}
                  className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {isBn ? 'ঘোষণা নিশ্চিত করুন' : 'Confirm Recusal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
