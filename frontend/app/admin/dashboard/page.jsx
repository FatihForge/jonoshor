'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  UploadCloud,
  Users,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/admin/dashboard', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setMetrics(d.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-8 text-xs">
      <div className="flex justify-between items-center border-b border-canvas-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-brand-amber/10 text-brand-amber border border-brand-amber/30 text-[10px] font-bold uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>অ্যাডমিন রিভিউ কনসোল</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-text">অভিযোগ যাচাই ও কেস ম্যানেজমেন্ট</h1>
        </div>

        <Link
          href="/admin/complaints"
          className="px-4 py-2 rounded-xl bg-brand-amber hover:bg-amber-600 text-canvas font-bold text-xs"
        >
          রিভিউ কিউ খুলুন
        </Link>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          href="/admin/complaints"
          className="glass-panel p-6 rounded-2xl border border-canvas-border hover:border-brand-amber/50 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-brand-text">অভিযোগ যাচাই পাইপলাইন</h2>
          <p className="text-brand-slate leading-relaxed">
            নাগরিকদের দাখিলকৃত নতুন অভিযোগ পর্যালোচনা, স্বার্থের সংঘাত ঘোষণা ও সত্যতা যাচাই প্রতিবেদন তৈরি।
          </p>
        </Link>

        <Link
          href="/admin/join-us"
          className="glass-panel p-6 rounded-2xl border border-canvas-border hover:border-brand-emerald/50 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-brand-text">Join Us আবেদনসমূহ</h2>
          <p className="text-brand-slate leading-relaxed">
            স্বেচ্ছাসেবী আইনজীবী, সাংবাদিক ও চিকিৎসকদের আবেদন পর্যালোচনা, নোট সংযোজন ও অনুমোদন।
          </p>
        </Link>

        <Link
          href="/admin/contact"
          className="glass-panel p-6 rounded-2xl border border-canvas-border hover:border-brand-blue/50 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-brand-text">যোগাযোগ ইনবক্স</h2>
          <p className="text-brand-slate leading-relaxed">
            নাগরিকদের পাঠানো অনুসন্ধান বার্তা, ফিডব্যাক ও সহায়তা অনুরোধ ব্যবস্থাপনা।
          </p>
        </Link>
      </div>
    </div>
  );
}
