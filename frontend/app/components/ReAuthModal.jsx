'use client';

import { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function ReAuthModal({ isOpen, onClose, onSuccess, title }) {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
    if (!password || !totpCode) {
      setError(isBn ? 'পাসওয়ার্ড এবং ৬-ডিজিটের ২এফএ কোড আবশ্যক' : 'Password and 6-digit 2FA code are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const csrfToken = await getCsrfToken();

      const res = await fetch('/api/v1/auth/re-authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ password, totpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error?.message || (isBn ? 'পুনঃপ্রমাণীকরণ ব্যর্থ হয়েছে' : 'Re-authentication failed'));
      }

      const token = data.data?.reAuthToken || data.reAuthToken || data.token;
      if (!token) {
        throw new Error('Re-Auth token not found in response');
      }

      setPassword('');
      setTotpCode('');
      onSuccess(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="dossier-card-elevated rounded-2xl max-w-md w-full p-6 border-t-4 border-t-brand-blue relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-navy dark:text-white">
              {title || (isBn ? 'সংবেদনশীল অ্যাকশন: পুনঃপ্রমাণীকরণ' : 'Critical Action: Re-Authentication')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
                ? 'সিস্টেমের গুরুত্বপূর্ণ নিরাপত্তা পরিবর্তন নিশ্চিত করতে আপনার ক্রেডেনশিয়াল প্রদান করুন।'
                : 'Confirm elevated super-admin privileges to execute this mutation.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1">
              {isBn ? 'সুপার অ্যাডমিন পাসওয়ার্ড *' : 'Super Admin Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="editorial-input pl-9 pr-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1">
              {isBn ? '৬-ডিজিটের ২এফএ অথেনটিকেটর কোড *' : '6-Digit TOTP 2FA Code *'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="editorial-input pl-9 pr-3 py-2 text-xs font-mono tracking-widest"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isBn ? 'যাচাই ও অনুমতি প্রদান' : 'Verify & Elevate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
