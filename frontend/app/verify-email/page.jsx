'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ভেরিফিকেশন কোড সঠিক নয়।');
      }

      setMessage('ইমেইল সফলভাবে ভেরিফাই হয়েছে! লগইন পেজে নিয়ে যাওয়া হচ্ছে...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('ইমেইল ঠিকানা প্রদান করুন।');
      return;
    }
    setResending(true);
    setError(null);
    setMessage(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'কোড পাঠানো সম্ভব হয়নি।');
      }

      setMessage('নতুন ৬-সংখ্যার কোড আপনার ইমেইলে পাঠানো হয়েছে।');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center mx-auto mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-brand-text">ইমেইল ভেরিফিকেশন</h1>
        <p className="text-xs text-brand-slate">
          আপনার ইনবক্সে প্রেরিত ৬-সংখ্যার ভেরিফিকেশন কোডটি প্রবেশ করান
        </p>
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

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-brand-text font-medium mb-1.5">ইমেইল ঠিকানা</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1.5">৬-সংখ্যার কোড</label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              placeholder="যেমন: 492815"
              className="w-full text-center tracking-widest text-lg font-bold py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-emerald focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-emerald/20 transition-all disabled:opacity-50"
          >
            {loading ? <span>যাচাই হচ্ছে...</span> : <span>ইমেইল নিশ্চিত করুন</span>}
          </button>
        </form>

        <div className="pt-2 text-center text-brand-slate text-xs">
          কোড পাননি?{' '}
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="text-brand-emerald font-semibold hover:underline disabled:opacity-50"
          >
            {resending ? 'পাঠানো হচ্ছে...' : 'পুনরায় কোড পাঠান (Resend)'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 max-w-md text-center text-slate-400 text-xs">
        Loading...
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
