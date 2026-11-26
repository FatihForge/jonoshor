'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'রিকুয়েস্ট সম্পন্ন করা যায়নি।');
      }

      setMessage('পাসওয়ার্ড রিসেট লিঙ্কটি আপনার ইমেইলে পাঠানো হয়েছে (যদি অ্যাকাউন্ট থাকে)। অনুগ্রহ করে ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।');
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
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-brand-text">পাসওয়ার্ড পুনরুদ্ধার</h1>
        <p className="text-xs text-brand-slate">আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল ঠিকানাটি প্রদান করুন</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-canvas-border space-y-5 text-xs">
        {message && (
          <div className="p-3.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-emerald/20 transition-all disabled:opacity-50"
          >
            {loading ? <span>পাঠানো হচ্ছে...</span> : <span>রিসেট লিঙ্ক পাঠান</span>}
          </button>
        </form>

        <div className="pt-2 text-center text-brand-slate text-xs">
          <Link href="/login" className="inline-flex items-center gap-1 text-brand-slate hover:text-brand-text">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>লগইন পেজে ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
