'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, ArrowLeft, Upload, FileMinus } from 'lucide-react';

export default function UserComplaintDetailPage({ params }) {
  const [complaint, setComplaint] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
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
    return <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-[70vh] flex items-center justify-center text-xs text-slate-500">অভিযোগের তথ্য লোড হচ্ছে...</div>;
  }

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl space-y-6 text-xs">
        <div>
          <Link href="/user/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ডে ফিরুন</span>
          </Link>
        </div>

        {actionMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-bold text-sm text-brand-navy dark:text-white">CASE ID: {params.id}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 font-mono font-bold border border-blue-200 dark:border-blue-800 text-[10px] uppercase">
                {complaint?.status || 'SUBMITTED'}
              </span>
            </div>

            <button onClick={() => setWithdrawModal(true)} className="px-3.5 py-1.5 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center gap-1.5">
              <FileMinus className="w-3.5 h-3.5" />
              <span>প্রত্যাহারের আবেদন (Withdraw)</span>
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="font-bold text-brand-navy dark:text-white text-base">ঘটনার বিবরণ</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-[#F4F8FF] dark:bg-slate-900 p-4 rounded-2xl border border-blue-100/70 dark:border-slate-800 text-sm">
              {complaint?.incident?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-mono text-[10px] uppercase block">Location</span>
              <span className="font-bold text-brand-navy dark:text-white">
                {complaint?.location?.freeTextLocation || complaint?.location?.districtId || 'অজানা'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-mono text-[10px] uppercase block">Incident Date</span>
              <span className="font-bold font-mono text-brand-navy dark:text-white">
                {complaint?.incident?.startDate ? new Date(complaint.incident.startDate).toLocaleDateString('bn-BD') : 'অজানা'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-brand-navy dark:text-white text-base flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-brand-blue" />
              <span>সংযুক্ত ডিজিটাল প্রমাণাদি ({evidenceList.length})</span>
            </h3>

            {evidenceList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidenceList.map((ev) => (
                  <div key={ev._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-brand-navy dark:text-white truncate">{ev.originalFilename || 'প্রমাণক ফাইল'}</div>
                    <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                      <span>Scan: {ev.malwareScanStatus || 'clean'}</span>
                      <span>{ev.size ? `${(ev.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 text-center">
                কোনো ফাইল সংযুক্ত নেই।
              </div>
            )}
          </div>
        </div>

        {withdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="dossier-card-elevated w-full max-w-md p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>অভিযোগ প্রত্যাহারের আবেদন</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                অভিযোগটি সরাসরি ডাটাবেজ থেকে মুছে ফেলা হবে না; নিরপেক্ষ পর্যবেক্ষক পর্যালোচনা করে প্রত্যাহারের সিদ্ধান্ত রেকর্ড করবেন।
              </p>
              <form onSubmit={handleWithdraw} className="space-y-3">
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1">প্রত্যাহারের কারণ লিখুন *</label>
                  <textarea required rows={4} value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} placeholder="প্রত্যাহারের সুনির্দিষ্ট কারণ উল্লেখ করুন..." className="editorial-input p-2.5 text-xs" />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setWithdrawModal(false)} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                    বাতিল
                  </button>
                  <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold">
                    {actionLoading ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
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
