'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, AlertCircle, Phone } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', mobile: '', languagePreference: 'bn',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।');

      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-[85vh] py-14">
      <div className="container mx-auto px-4 max-w-md space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400">
            CITIZEN REGISTRATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white">
            নাগরিক অ্যাকাউন্ট তৈরি করুন
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            নিরাপদ ড্যাশবোর্ড ও অভিযোগ ট্র্যাক করতে অ্যাকাউন্ট নিবন্ধন করুন।
          </p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-8 rounded-3xl space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">আপনার পূর্ণ নাম *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="যেমন: আব্দুল করিম" className="editorial-input pl-9 pr-3.5 py-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">ইমেইল ঠিকানা *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@example.com" className="editorial-input pl-9 pr-3.5 py-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="password" required minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="মজবুত পাসওয়ার্ড ব্যবহার করুন" className="editorial-input pl-9 pr-3.5 py-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">মোবাইল নম্বর (ঐচ্ছিক)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="যেমন: 01700000000" className="editorial-input pl-9 pr-3.5 py-2.5 font-mono" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50">
              {loading ? <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span> : <span>নিবন্ধন সম্পন্ন করুন</span>}
            </button>
          </form>

          <div className="pt-2 text-center text-slate-600 dark:text-slate-400 text-xs border-t border-slate-100 dark:border-slate-800">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link href="/login" className="text-brand-blue dark:text-blue-400 font-bold hover:underline">
              লগইন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
