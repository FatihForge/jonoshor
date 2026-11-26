'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

export default function LoginPage() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.error?.code === 'EMAIL_NOT_VERIFIED') {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          return;
        }
        throw new Error(data?.error?.message || (isBn ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
      }

      const accountData = data.data?.user || data.data?.account;
      if (accountData) {
        localStorage.setItem('jonoshor_user', JSON.stringify({ ...accountData, accountType: 'user' }));
      }

      router.push('/user/dashboard');
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
            {isBn ? 'নিরাপদ সাইন ইন' : 'SECURE SIGN IN'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'অ্যাকাউন্টে সাইন ইন করুন' : 'Sign In to Your Account'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isBn
              ? 'আপনার অভিযোগের অগ্রগতি পর্যবেক্ষণ ও আপডেট দেখতে সাইন ইন করুন।'
              : 'Sign in to track your reports, view updates, and communicate securely.'}
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
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@example.com" className="editorial-input pl-9 pr-3.5 py-2.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-brand-navy dark:text-slate-200 font-semibold">
                  {isBn ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <Link href="/forgot-password" className="text-brand-blue dark:text-blue-400 hover:underline text-[11px] font-semibold">
                  {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={isBn ? 'আপনার পাসওয়ার্ড' : 'Your password'} className="editorial-input pl-9 pr-3.5 py-2.5" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50">
              {loading ? <span>{isBn ? 'যাচাই হচ্ছে...' : 'Signing in...'}</span> : <span>{isBn ? 'লগইন করুন' : 'Sign In'}</span>}
            </button>
          </form>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] font-mono text-slate-400 uppercase">
              <span className="bg-white dark:bg-[#111A2E] px-2">{isBn ? 'অথবা' : 'OR'}</span>
            </div>
          </div>

          <a
            href="http://localhost:5000/api/v1/auth/google"
            className="w-full py-2.5 px-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-brand-navy dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.66-4.93H1.3v3.15C3.32 21.36 7.37 24 12 24z" />
              <path fill="#FBBC05" d="M5.34 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.3C.47 8.24 0 10.06 0 12s.47 3.76 1.3 5.42l4.04-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.32 2.64 1.3 6.58l4.04 3.15c.93-2.83 3.56-4.98 6.66-4.98z" />
            </svg>
            <span>{isBn ? 'গুগল অ্যাকাউন্টের মাধ্যমে সাইন-ইন' : 'Continue with Google'}</span>
          </a>

          <div className="pt-2 text-center text-slate-600 dark:text-slate-400 text-xs space-y-2.5">
            <div>
              {isBn ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
              <Link href="/register" className="text-brand-blue dark:text-blue-400 font-bold hover:underline">
                {isBn ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create an Account'}
              </Link>
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] font-mono">
              <Link href="/admin/login" className="text-slate-500 hover:text-brand-blue">
                {isBn ? 'অ্যাডমিন পোর্টাল →' : 'Admin Portal →'}
              </Link>
              <Link href="/super-admin/login" className="text-slate-500 hover:text-brand-blue">
                {isBn ? 'সুপার অ্যাডমিন →' : 'Super Admin →'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
