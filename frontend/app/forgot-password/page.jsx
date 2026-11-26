'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

export default function ForgotPasswordPage() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || (isBn ? 'রিকুয়েস্ট সম্পন্ন করা যায়নি।' : 'Request could not be completed.'));

      setMessage(
        isBn
          ? 'পাসওয়ার্ড রিসেট লিঙ্কটি আপনার ইমেইলে পাঠানো হয়েছে (যদি অ্যাকাউন্ট থাকে)।'
          : 'A password reset link has been sent to your email (if an account exists).'
      );
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
            {isBn ? 'অ্যাকাউন্ট পুনরুদ্ধার' : 'ACCOUNT RECOVERY'}
          </span>
          <h1 className="text-2xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Password Recovery'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isBn ? 'আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল ঠিকানাটি প্রদান করুন।' : 'Enter the registered email address for your account.'}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="editorial-input pl-9 pr-3.5 py-2.5" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs shadow-md transition-all disabled:opacity-50">
              {loading ? <span>{isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span> : <span>{isBn ? 'রিসেট লিঙ্ক পাঠান' : 'Send Reset Link'}</span>}
            </button>
          </form>

          <div className="pt-2 text-center text-xs border-t border-slate-100 dark:border-slate-800">
            <Link href="/login" className="inline-flex items-center gap-1 text-brand-blue dark:text-blue-400 font-bold hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'লগইন পেজে ফিরে যান' : 'Back to Sign In'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
