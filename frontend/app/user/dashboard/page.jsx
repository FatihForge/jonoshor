'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Bell,
  User,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default function UserDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/v1/user/complaints', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('অভিযোগ তালিকা লোড করা যায়নি। অনুগ্রহ করে লগইন করুন।');
        return r.json();
      })
      .then((d) => setComplaints(d.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-canvas-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">নাগরিক ড্যাশবোর্ড</h1>
          <p className="text-xs text-brand-slate">আপনার জমাকৃত অভিযোগের লাইভ স্ট্যাটাস ও ট্র্যাকিং</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/user/messages"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-canvas-border text-xs text-brand-slate hover:text-brand-text hover:bg-canvas-card"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-blue" />
            <span>বার্তা বিনিময়</span>
          </Link>
          <Link
            href="/user/notifications"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-canvas-border text-xs text-brand-slate hover:text-brand-text hover:bg-canvas-card"
          >
            <Bell className="w-3.5 h-3.5 text-brand-amber" />
            <span>নোটিফিকেশন</span>
          </Link>
          <Link
            href="/user/profile"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-canvas-border text-xs text-brand-slate hover:text-brand-text hover:bg-canvas-card"
          >
            <User className="w-3.5 h-3.5 text-brand-emerald" />
            <span>প্রোফাইল ও নিরাপত্তা</span>
          </Link>
          <Link
            href="/complaints/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white text-xs font-bold shadow-md shadow-brand-emerald/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন অভিযোগ দাখিল</span>
          </Link>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-brand-text flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-emerald" />
          <span>আমার জমাকৃত অভিযোগ তালিকা ({complaints.length})</span>
        </h2>

        {loading ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-canvas-border text-xs text-brand-slate">
            তথ্য লোড হচ্ছে...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : complaints.length > 0 ? (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="glass-panel p-5 rounded-2xl border border-canvas-border hover:border-brand-emerald/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                        c.status === 'verified'
                          ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20'
                          : c.status === 'under_review'
                          ? 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20'
                          : c.status === 'withdrawn'
                          ? 'bg-canvas-card text-brand-slate border border-canvas-border'
                          : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                      }`}
                    >
                      {c.status || 'submitted'}
                    </span>
                    <span className="text-brand-slate text-[11px]">
                      জমা: {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-brand-text line-clamp-1">
                    {c.incident?.description?.substring(0, 80) || 'অভিযোগ বিস্তারিত'}...
                  </div>

                  <div className="text-brand-slate text-[11px]">
                    ক্যাটাগরি: {c.category?.primary || 'মানবাধিকার'} • স্থান: {c.location?.districtId || 'ঢাকা'}
                  </div>
                </div>

                <Link
                  href={`/user/complaints/${c._id}`}
                  className="px-4 py-2 rounded-xl bg-canvas-card border border-canvas-border hover:border-brand-emerald/50 text-brand-text text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>ট্র্যাক ও পরিচালনা</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-panel rounded-2xl border border-canvas-border space-y-4">
            <Clock className="w-10 h-10 text-brand-slate mx-auto opacity-40" />
            <div className="space-y-1">
              <h3 className="font-bold text-brand-text text-sm">কোনো অভিযোগ জমা দেওয়া হয়নি</h3>
              <p className="text-xs text-brand-slate">
                আপনি এখনও কোনো অভিযোগ দাখিল করেননি। আপনার বা পরিচিত কারও অধিকার ক্ষুণ্ণ হলে নিরাপদ অভিযোগ জমা দিন।
              </p>
            </div>
            <Link
              href="/complaints/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>প্রথম অভিযোগ দাখিল করুন</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
