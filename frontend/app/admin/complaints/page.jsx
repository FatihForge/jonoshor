'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';

export default function AdminComplaintsListPage() {
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
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6 text-xs">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>অ্যাডমিন ড্যাশবোর্ডে ফিরুন</span>
        </Link>
      </div>

      <div className="editorial-rule-top pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-ochre font-semibold block">
            Verification Queue
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text mt-1">
            অভিযোগ যাচাই কিউ
          </h1>
          <p className="text-brand-slate mt-0.5">সকল জমা হওয়া ও পর্যালোচনাধীন অভিযোগের কেন্দ্রীয় তালিকা</p>
        </div>

        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="editorial-input px-3 py-2 text-xs font-semibold"
          >
            <option value="">সকল স্ট্যাটাস</option>
            <option value="submitted">নতুন জমা (Submitted)</option>
            <option value="screening">স্ক্রিনিং (Screening)</option>
            <option value="verification">যাচাই চলমান (Verification)</option>
            <option value="verified">যাচাইকৃত (Verified)</option>
            <option value="published">প্রকাশিত (Published)</option>
            <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
            <option value="withdrawn">প্রত্যাহারকৃত (Withdrawn)</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="dossier-card rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-subtle text-brand-text font-bold border-b border-canvas-border uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Ref ID & Status</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3">Location & Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-border">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-brand-muted">
                    তথ্য লোড হচ্ছে...
                  </td>
                </tr>
              ) : complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-canvas-hover transition-colors">
                    <td className="px-4 py-3.5 align-top">
                      <span className="inline-block px-2 py-0.5 rounded-sm font-mono font-bold uppercase text-[10px] bg-amber-50 text-brand-ochre border border-amber-200 mb-1">
                        {c.status || 'SUBMITTED'}
                      </span>
                      <div className="font-mono text-[11px] text-brand-muted">
                        #{c._id?.slice(-8)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top max-w-md">
                      <div className="font-semibold text-brand-text line-clamp-2 leading-relaxed">
                        {c.incident?.description || 'অভিযোগ বিস্তারিত'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top font-mono text-[11px] text-brand-slate">
                      <div>{c.location?.districtId || 'ঢাকা'}</div>
                      <div className="text-brand-muted">{new Date(c.createdAt).toLocaleDateString('bn-BD')}</div>
                    </td>
                    <td className="px-4 py-3.5 align-top text-right">
                      <Link
                        href={`/admin/complaints/${c._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-text bg-canvas-card hover:bg-brand-text hover:text-white text-brand-text font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>রিভিউ</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-brand-muted">
                    কোনো অভিযোগ পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
