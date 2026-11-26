'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

function VerifyEmailContent() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || (isBn ? 'ভেরিফিকেশন কোড সঠিক নয়।' : 'Invalid verification code.'));

      setMessage(isBn ? 'ইমেইল সফলভাবে ভেরিফাই হয়েছে! লগইন পেজে নিয়ে যাওয়া হচ্ছে...' : 'Email verified! Redirecting to sign in...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError(isBn ? 'ইমেইল ঠিকানা প্রদান করুন।' : 'Please enter your email address.');
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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || (isBn ? 'কোড পাঠানো সম্ভব হয়নি।' : 'Could not resend code.'));

      setMessage(isBn ? 'নতুন ৬-সংখ্যার কোড আপনার ইমেইলে পাঠানো হয়েছে।' : 'A new 6-digit verification code has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-[85vh] py-14">
      <div className="container mx-auto px-4 max-w-md space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400">
            {isBn ? 'পরিচয় যাচাইকরণ' : 'IDENTITY VERIFICATION'}
          </span>
          <h1 className="text-2xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'ইমেইল ভেরিফিকেশন' : 'Email Verification'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isBn
              ? 'আপনার ইনবক্সে প্রেরিত ৬-সংখ্যার ভেরিফিকেশন কোডটি প্রবেশ করান।'
              : 'Enter the 6-digit verification code sent to your inbox.'}
          </p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-8 rounded-3xl space-y-5 text-xs">
          {message && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="editorial-input pl-9 pr-3.5 py-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                {isBn ? '৬-সংখ্যার কোড (OTP)' : '6-Digit Code (OTP)'}
              </label>
              <input type="text" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="editorial-input px-3.5 py-2.5 text-center font-mono text-lg tracking-widest font-bold" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs shadow-md transition-all disabled:opacity-50">
              {loading ? <span>{isBn ? 'যাচাই হচ্ছে...' : 'Verifying...'}</span> : <span>{isBn ? 'ইমেইল নিশ্চিত করুন' : 'Verify Email'}</span>}
            </button>
          </form>

          <div className="pt-2 text-center text-slate-600 dark:text-slate-400 text-xs border-t border-slate-100 dark:border-slate-800">
            {isBn ? 'কোড পাননি? ' : "Didn't receive a code? "}
            <button type="button" disabled={resending} onClick={handleResend} className="text-brand-blue dark:text-blue-400 font-bold hover:underline disabled:opacity-50">
              {resending ? (isBn ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBn ? 'পুনরায় কোড পাঠান' : 'Resend Code')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 max-w-md text-center text-xs text-slate-500">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
