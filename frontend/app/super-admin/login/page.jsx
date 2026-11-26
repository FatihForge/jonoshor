'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Lock, Mail, KeyRound, AlertCircle } from 'lucide-react';

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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'সুপার অ্যাডমিন ক্রিডেনশিয়াল সঠিক নয়।');
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

      const res = await fetch('/api/v1/auth/super-admin/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ temp2FAToken, totpCode: formData.totpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'সুপার অ্যাডমিন ২-এফ-এ কোড সঠিক নয়।');
      }

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
    <div className="container mx-auto px-4 py-16 max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-brand-text">রুট সুপার অ্যাডমিন কনসোল</h1>
        <p className="text-xs text-brand-slate">প্ল্যাটফর্ম সর্বোচ্চ নির্বাহী ও নিরাপত্তা প্রবেশদ্বার</p>
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
              <label className="block text-brand-text font-medium mb-1.5">সুপার অ্যাডমিন ইমেইল</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="superadmin@jonoshor.org"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-brand-text font-medium mb-1.5">মাস্টার পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="মাস্টার পাসওয়ার্ড"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              {loading ? <span>যাচাই হচ্ছে...</span> : <span>পরবর্তী ধাপ: রুট ২-এফ-এ</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="space-y-4">
            <div>
              <label className="block text-brand-text font-medium mb-1.5">Super Admin TOTP Authenticator কোড</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.totpCode}
                  onChange={(e) => setFormData({ ...formData, totpCode: e.target.value.trim() })}
                  placeholder="123456"
                  className="w-full pl-9 pr-3.5 py-2.5 text-center tracking-widest text-lg font-bold bg-canvas-card border border-canvas-border rounded-xl text-purple-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              {loading ? <span>যাচাই হচ্ছে...</span> : <span>এক্সিকিউটিভ কনসোলে প্রবেশ</span>}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-[11px] text-brand-slate">
          <Link href="/login" className="hover:text-brand-text">
            সাধারণ লগইনে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
