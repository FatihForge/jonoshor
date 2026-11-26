'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Lock, Mail, User, AlertCircle, Phone } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    languagePreference: 'bn',
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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।');
      }

      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-brand-text">নাগরিক অ্যাকাউন্ট তৈরি করুন</h1>
        <p className="text-xs text-brand-slate">নিরাপদ ড্যাশবোর্ড ও অভিযোগ ট্র্যাক করতে অ্যাকাউন্ট খুলুন</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-canvas-border space-y-5 text-xs">
        {error && (
          <div className="p-3.5 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-brand-text font-medium mb-1.5">আপনার পূর্ণ নাম *</label>
            <div className="relative">
              <User className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="যেমন: আব্দুল করিম"
                className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1.5">ইমেইল ঠিকানা *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com (টেম্পোরারি মেইল নিষিদ্ধ)"
                className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1.5">পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="মজবুত পাসওয়ার্ড ব্যবহার করুন"
                className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1.5">মোবাইল নম্বর (ঐচ্ছিক)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="যেমন: 01700000000"
                className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-emerald/20 transition-all disabled:opacity-50"
          >
            {loading ? <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span> : <span>নিবন্ধন সম্পন্ন করুন</span>}
          </button>
        </form>

        <div className="pt-2 text-center text-brand-slate text-xs">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <Link href="/login" className="text-brand-emerald font-semibold hover:underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
