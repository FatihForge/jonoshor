'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.error?.code === 'EMAIL_NOT_VERIFIED') {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          return;
        }
        throw new Error(data?.error?.message || 'লগইন ব্যর্থ হয়েছে।');
      }

      // Save user session client hint
      if (data.data?.account) {
        localStorage.setItem('jonoshor_user', JSON.stringify(data.data.account));
      }

      router.push('/user/dashboard');
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
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-brand-text">নাগরিক অ্যাকাউন্টে লগইন</h1>
        <p className="text-xs text-brand-slate">আপনার জমাকৃত অভিযোগ ও অগ্রগতি ট্র্যাক করতে লগইন করুন</p>
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
            <label className="block text-brand-text font-medium mb-1.5">ইমেইল ঠিকানা</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-brand-text font-medium">পাসওয়ার্ড</label>
              <Link href="/forgot-password" className="text-brand-emerald hover:underline text-[11px]">
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="আপনার পাসওয়ার্ড"
                className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-emerald/20 transition-all disabled:opacity-50"
          >
            {loading ? <span>যাচাই হচ্ছে...</span> : <span>লগইন করুন</span>}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-canvas-border" />
          </div>
          <div className="relative flex justify-center text-[11px] text-brand-slate uppercase">
            <span className="bg-canvas-subtle px-2">অথবা</span>
          </div>
        </div>

        {/* Google OAuth Login */}
        <a
          href="http://localhost:5000/api/v1/auth/google"
          className="w-full py-2.5 px-4 rounded-xl border border-canvas-border hover:bg-canvas-card text-brand-text font-medium text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.66-4.93H1.3v3.15C3.32 21.36 7.37 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.34 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.3C.47 8.24 0 10.06 0 12s.47 3.76 1.3 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.32 2.64 1.3 6.58l4.04 3.15c.93-2.83 3.56-4.98 6.66-4.98z"
            />
          </svg>
          <span>গুগল অ্যাকাউন্টের মাধ্যমে সাইন-ইন</span>
        </a>

        <div className="pt-2 text-center text-brand-slate text-xs space-y-2">
          <div>
            অ্যাকাউন্ট নেই?{' '}
            <Link href="/register" className="text-brand-emerald font-semibold hover:underline">
              নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>
          </div>
          <div className="pt-2 border-t border-canvas-border flex justify-between text-[11px]">
            <Link href="/admin/login" className="text-brand-slate hover:text-brand-text">
              অ্যাডমিন পোর্টাল
            </Link>
            <Link href="/super-admin/login" className="text-brand-slate hover:text-brand-text">
              সুপার অ্যাডমিন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
