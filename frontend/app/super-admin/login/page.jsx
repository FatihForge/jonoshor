'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, KeyRound, AlertCircle } from 'lucide-react';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
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

      const res = await fetch('/api/v1/auth/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'সুপার অ্যাডমিন ক্রিডেনশিয়াল সঠিক নয়।');

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

      const res = await fetch('/api/v1/auth/super-admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify({ temp2FAToken, totpCode: formData.totpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'সুপার অ্যাডমিন ২-এফ-এ কোড সঠিক নয়।');

      if (data.data?.account) {
        localStorage.setItem('jonoshor_user', JSON.stringify(data.data.account));
      }

      router.push('/super-admin/dashboard');
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
            ROOT GOVERNANCE GATEWAY
          </span>
          <h1 className="text-2xl font-extrabold text-brand-navy dark:text-white">রুট সুপার অ্যাডমিন কনসোল</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">সর্বোচ্চ নির্বাহী ও নিরাপত্তা প্রবেশদ্বার।</p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-8 rounded-3xl border-t-4 border-t-brand-navy dark:border-t-blue-500 space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">সুপার অ্যাডমিন ইমেইল</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="superadmin@jonoshor.org" className="editorial-input pl-9 pr-3.5 py-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">মাস্টার পাসওয়ার্ড</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="মাস্টার পাসওয়ার্ড" className="editorial-input pl-9 pr-3.5 py-2.5" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs shadow-md transition-all disabled:opacity-50">
                {loading ? <span>যাচাই হচ্ছে...</span> : <span>পরবর্তী ধাপ: রুট ২-এফ-এ</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">Super Admin TOTP Authenticator কোড</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" required maxLength={6} value={formData.totpCode} onChange={(e) => setFormData({ ...formData, totpCode: e.target.value.trim() })} placeholder="123456" className="editorial-input pl-9 pr-3.5 py-2.5 text-center font-mono tracking-widest text-lg font-bold" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs shadow-md transition-all disabled:opacity-50">
                {loading ? <span>যাচাই হচ্ছে...</span> : <span>এক্সিকিউটিভ কনসোলে প্রবেশ</span>}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] border-t border-slate-100 dark:border-slate-800">
            <Link href="/login" className="text-brand-blue dark:text-blue-400 font-semibold hover:underline">
              সাধারণ লগইনে ফিরুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
