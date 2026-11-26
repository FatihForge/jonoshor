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
        throw new Error(data.message || (isBn ? 'পুনঃপ্রমাণীকরণ ব্যর্থ হয়েছে' : 'Re-authentication failed'));
      }

      const token = data.data?.reAuthToken || data.reAuthToken || data.token;
      if (!token) {
        throw new Error('Re-Auth token not found in response');
      }

      // Reset and trigger callback
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-900/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              {title || (isBn ? 'সংবেদনশীল অ্যাকশন: পুনঃপ্রমাণীকরণ' : 'Critical Action: Re-Authentication')}
            </h3>
            <p className="text-xs text-slate-400">
              {isBn 
                ? 'সিস্টেমের গুরুত্বপূর্ণ নিরাপত্তা পরিবর্তন নিশ্চিত করতে আপনার ক্রেডেনশিয়াল প্রদান করুন।' 
                : 'Confirm elevated super-admin privileges to execute this mutation.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isBn ? 'সুপার অ্যাডমিন পাসওয়ার্ড *' : 'Super Admin Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isBn ? '৬-ডিজিটের ২এফএ অথেনটিকেটর কোড *' : '6-Digit TOTP 2FA Code *'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono tracking-widest text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
              {isBn ? 'যাচাই ও অনুমতি প্রদান' : 'Verify & Elevate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
