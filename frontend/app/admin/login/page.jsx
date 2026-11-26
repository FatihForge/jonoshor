'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email/Password, 2: 2FA TOTP code
  const [formData, setFormData] = useState({ email: '', password: '', totpCode: '' });
  const [temp2FAToken, setTemp2FAToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'অ্যাডমিন ক্রিডেনশিয়াল সঠিক নয়।');
      }

      setTemp2FAToken(data.data?.temp2FAToken);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/auth/admin/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ temp2FAToken, totpCode: formData.totpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || '২-এফ-এ কোড সঠিক নয়।');
      }

      if (data.data?.account) {
        localStorage.setItem('jonoshor_user', JSON.stringify(data.data.account));
      }

      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-brand-text">অ্যাডমিন রিভিউ কনসোল</h1>
        <p className="text-xs text-brand-slate">তদন্ত কর্মকর্তা ও পর্যবেক্ষকদের জন্য দ্বি-স্তরীয় ২-এফ-এ ভেরিফিকেশন</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-canvas-border space-y-5 text-xs">
        {error && (
          <div className="p-3.5 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="block text-brand-text font-medium mb-1.5">অ্যাডমিন ইমেইল</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@jonoshor.org"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-amber"
                />
              </div>
            </div>

            <div>
              <label className="block text-brand-text font-medium mb-1.5">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="অ্যাডমিন পাসওয়ার্ড"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-amber"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-amber hover:bg-amber-600 text-canvas font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-amber/20 transition-all disabled:opacity-50"
            >
              {loading ? <span>যাচাই হচ্ছে...</span> : <span>পরবর্তী ধাপ: ২-এফ-এ (TOTP)</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="space-y-4">
            <div className="p-3 rounded-xl bg-canvas-card border border-canvas-border text-brand-slate text-[11px] leading-relaxed">
              আপনার Authenticator App (Google Authenticator / Authy)-এ প্রদর্শিত ৬-সংখ্যার সাময়িক কোডটি লিখুন।
            </div>

            <div>
              <label className="block text-brand-text font-medium mb-1.5">TOTP কোড (৬-সংখ্যা)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.totpCode}
                  onChange={(e) => setFormData({ ...formData, totpCode: e.target.value.trim() })}
                  placeholder="123456"
                  className="w-full pl-9 pr-3.5 py-2.5 text-center tracking-widest text-lg font-bold bg-canvas-card border border-canvas-border rounded-xl text-brand-amber focus:outline-none focus:border-brand-amber"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-amber hover:bg-amber-600 text-canvas font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-amber/20 transition-all disabled:opacity-50"
            >
              {loading ? <span>যাচাই হচ্ছে...</span> : <span>২-এফ-এ যাচাই ও সেশন শুরু</span>}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-[11px] text-brand-slate">
          <Link href="/login" className="hover:text-brand-text">
            সাধারণ নাগরিক লগইনে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
