'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const getCsrfToken = async () => {
    try {
      const res = await fetch('/api/v1/csrf-token', { credentials: 'include' });
      const data = await res.json();
      return data.csrfToken;
    } catch {
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatusMsg({ type: 'error', text: isBn ? 'রিসেট টোকেন অনুপস্থিত বা অবৈধ।' : 'Reset token is missing or invalid.' });
      return;
    }
    if (password.length < 8) {
      setStatusMsg({ type: 'error', text: isBn ? 'পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।' : 'Password must be at least 8 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: isBn ? 'উভয় পাসওয়ার্ড মেলেনি।' : 'Passwords do not match.' });
      return;
    }

    try {
      setLoading(true);
      setStatusMsg({ type: '', text: '' });
      const csrfToken = await getCsrfToken();

      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error?.message || (isBn ? 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।' : 'Failed to reset password.'));

      setStatusMsg({
        type: 'success',
        text: isBn
          ? 'আপনার পাসওয়ার্ড সফলভাবে পুনঃনির্ধারণ করা হয়েছে! লগইন পৃষ্ঠায় নিয়ে যাওয়া হচ্ছে...'
          : 'Your password has been reset successfully! Redirecting to login...',
      });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400">
          {isBn ? 'নিরাপত্তা হালনাগাদ' : 'SECURITY UPDATE'}
        </span>
        <h1 className="text-2xl font-extrabold text-brand-navy dark:text-white">
          {isBn ? 'নতুন পাসওয়ার্ড নির্ধারণ করুন' : 'Reset Your Password'}
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {isBn
            ? 'আপনার অ্যাকাউন্টের সুরক্ষার জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড তৈরি করুন।'
            : 'Choose a strong new password to secure your account.'}
        </p>
      </div>

      <div className="dossier-card-elevated p-6 sm:p-8 rounded-3xl space-y-5 text-xs">
        {statusMsg.text && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 ${
              statusMsg.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {statusMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
              {isBn ? 'নতুন পাসওয়ার্ড *' : 'New Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="editorial-input pl-9 pr-3 py-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
              {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••••••" className="editorial-input pl-9 pr-3 py-2.5" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{isBn ? 'পাসওয়ার্ড হালনাগাদ করুন' : 'Update Password'}</span>
          </button>
        </form>

        <div className="text-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link href="/login" className="text-brand-blue dark:text-blue-400 font-bold hover:underline">
            {isBn ? 'লগইন পৃষ্ঠায় ফিরে যান' : 'Return to Sign In'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-[85vh] py-14">
      <div className="container mx-auto px-4 max-w-md">
        <Suspense fallback={<div className="text-center text-xs text-slate-500 py-12">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
