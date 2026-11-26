'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminComplaintsListPage() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/v1/admin/complaints${q}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setComplaints(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-6 text-xs">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? 'অ্যাডমিন ড্যাশবোর্ডে ফিরুন' : 'Back to Admin Dashboard'}</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
              {isBn ? 'যাচাইকরণ কিউ' : 'VERIFICATION QUEUE'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white mt-1">
              {isBn ? 'অভিযোগ যাচাই কিউ' : 'Complaint Verification Queue'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              {isBn ? 'সকল জমা হওয়া ও পর্যালোচনাধীন অভিযোগের কেন্দ্রীয় তালিকা' : 'Central intake directory of all submitted and active review complaints'}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="editorial-input px-3.5 py-2.5 text-xs font-semibold"
            >
              <option value="">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="submitted">{isBn ? 'নতুন জমা (Submitted)' : 'Submitted'}</option>
              <option value="screening">{isBn ? 'স্ক্রিনিং (Screening)' : 'Screening'}</option>
              <option value="verification">{isBn ? 'যাচাই চলমান (Verification)' : 'In Verification'}</option>
              <option value="verified">{isBn ? 'যাচাইকৃত (Verified)' : 'Verified'}</option>
              <option value="published">{isBn ? 'প্রকাশিত (Published)' : 'Published'}</option>
              <option value="rejected">{isBn ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</option>
              <option value="withdrawn">{isBn ? 'প্রত্যাহারকৃত (Withdrawn)' : 'Withdrawn'}</option>
            </select>
          </div>
        </div>

        <div className="dossier-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{isBn ? 'আইডি ও স্ট্যাটাস' : 'Ref ID & Status'}</th>
                  <th className="px-4 py-3">{isBn ? 'সারসংক্ষেপ' : 'Summary'}</th>
                  <th className="px-4 py-3">{isBn ? 'স্থান ও তারিখ' : 'Location & Date'}</th>
                  <th className="px-4 py-3 text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      {isBn ? 'তথ্য লোড হচ্ছে...' : 'Loading complaints...'}
                    </td>
                  </tr>
                ) : complaints.length > 0 ? (
                  complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-mono font-bold uppercase text-[10px] bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 border border-blue-200 dark:border-blue-800 mb-1">
                          {c.status || 'SUBMITTED'}
                        </span>
                        <div className="font-mono text-[11px] text-slate-400">
                          #{c._id?.slice(-8)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top max-w-md">
                        <div className="font-semibold text-brand-navy dark:text-white line-clamp-2 leading-relaxed">
                          {c.incident?.description || (isBn ? 'অভিযোগ বিস্তারিত' : 'Complaint summary')}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <div>{c.location?.districtId || (isBn ? 'ঢাকা' : 'Dhaka')}</div>
                        <div className="text-slate-400">{new Date(c.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}</div>
                      </td>
                      <td className="px-4 py-3.5 align-top text-right">
                        <Link
                          href={`/admin/complaints/${c._id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isBn ? 'রিভিউ' : 'Review'}</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      {isBn ? 'কোনো অভিযোগ পাওয়া যায়নি' : 'No complaints found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
