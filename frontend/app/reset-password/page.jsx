'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, KeyRound, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
      setStatusMsg({ type: 'error', text: isBn ? 'পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।' : 'Password must be at least 8 characters long.' });
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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || (isBn ? 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।' : 'Failed to reset password.'));
      }

      setStatusMsg({
        type: 'success',
        text: isBn 
          ? 'আপনার পাসওয়ার্ড সফলভাবে পুনঃনির্ধারণ করা হয়েছে! লগইন পৃষ্ঠায় নিয়ে যাওয়া হচ্ছে...' 
          : 'Password successfully reset! Redirecting to login...',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">
          {isBn ? 'নতুন পাসওয়ার্ড নির্ধারণ করুন' : 'Reset Your Password'}
        </h1>
        <p className="text-xs text-slate-400">
          {isBn 
            ? 'আপনার অ্যাকাউন্টের সুরক্ষার জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড তৈরি করুন।' 
            : 'Enter a strong, secure password for your citizen account.'}
        </p>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
          statusMsg.type === 'error'
            ? 'bg-rose-950/40 border-rose-900/50 text-rose-300'
            : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
        }`}>
          {statusMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isBn ? 'নতুন পাসওয়ার্ড *' : 'New Password *'}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {isBn ? 'পাসওয়ার্ড হালনাগাদ করুন' : 'Update Password'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
        <Link href="/login" className="text-emerald-400 hover:underline">
          {isBn ? 'লগইন পৃষ্ঠায় ফিরে যান' : 'Back to Login'}
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Suspense fallback={
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
            Loading...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
