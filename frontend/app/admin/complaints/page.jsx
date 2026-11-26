'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Eye, Filter, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function AdminComplaintsListPage() {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/v1/admin/complaints${q}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setComplaints(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6 text-xs">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>অ্যাডমিন ড্যাশবোর্ডে ফিরুন</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">অভিযোগ যাচাই কিউ</h1>
          <p className="text-brand-slate">সকল জমা হওয়া ও পর্যালোচনাধীন অভিযোগের কেন্দ্রীয় তালিকা</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none"
          >
            <option value="">সকল স্ট্যাটাস</option>
            <option value="submitted">নতুন জমা (Submitted)</option>
            <option value="under_review">পর্যালোচনাধীন (Under Review)</option>
            <option value="verified">যাচাইকৃত (Verified)</option>
            <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
            <option value="withdrawn">প্রত্যাহারকৃত (Withdrawn)</option>
          </select>
        </div>
      </div>

      {/* Complaints Table/Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-canvas-border">
            তথ্য লোড হচ্ছে...
          </div>
        ) : complaints.length > 0 ? (
          complaints.map((c) => (
            <div
              key={c._id}
              className="glass-panel p-5 rounded-2xl border border-canvas-border hover:border-brand-amber/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-brand-amber/10 text-brand-amber border border-brand-amber/20">
                    {c.status || 'SUBMITTED'}
                  </span>
                  <span className="text-brand-slate text-[11px]">আইডি: {c._id}</span>
                </div>
                <div className="font-bold text-sm text-brand-text line-clamp-1">
                  {c.incident?.description?.substring(0, 70)}...
                </div>
                <div className="text-brand-slate text-[11px]">
                  জেলা: {c.location?.districtId || 'ঢাকা'} • তারিখ:{' '}
                  {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                </div>
              </div>

              <Link
                href={`/admin/complaints/${c._id}`}
                className="px-4 py-2 rounded-xl bg-canvas-card border border-canvas-border hover:border-brand-amber text-brand-text font-semibold flex items-center gap-1.5 shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-brand-amber" />
                <span>রিভিউ করুন</span>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-12 glass-panel rounded-2xl border border-canvas-border text-brand-slate">
            কোনো অভিযোগ পাওয়া যায়নি
          </div>
        )}
      </div>
    </div>
  );
}
