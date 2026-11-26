'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function UserProfilePage() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [profile, setProfile] = useState({ fullName: '', mobile: '', languagePreference: 'bn' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/v1/user/profile', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setProfile(d.data);
      })
      .catch(() => {});
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || (isBn ? 'প্রোফাইল আপডেট করা যায়নি।' : 'Could not update profile.'));

      setMsg(isBn ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে।' : 'Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/user/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify(passwords),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || (isBn ? 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি।' : 'Could not change password.'));

      setMsg(
        isBn
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। অন্যান্য সব ডিভাইসের সেশন বাতিল করা হয়েছে।'
          : 'Password changed successfully. Sessions on other devices have been revoked.'
      );
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-2xl space-y-6 text-xs">
        <div>
          <Link href="/user/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
          </Link>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="dossier-card p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-brand-blue" />
            <span>{isBn ? 'ব্যক্তিগত তথ্য আপডেট' : 'Update Personal Information'}</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1">
                {isBn ? 'পূর্ণ নাম' : 'Full Name'}
              </label>
              <input type="text" value={profile.fullName || ''} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="editorial-input px-3.5 py-2.5" />
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1">
                {isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}
              </label>
              <input type="text" value={profile.mobile || ''} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} className="editorial-input px-3.5 py-2.5 font-mono" />
            </div>

            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold transition-colors">
              {isBn ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="dossier-card p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন (সিকিউরিটি লকআউট)' : 'Change Password (Security Revocation)'}</span>
          </h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1">
                {isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
              </label>
              <input type="password" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="editorial-input px-3.5 py-2.5" />
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1">
                {isBn ? 'নতুন পাসওয়ার্ড (৮+ অক্ষর)' : 'New Password (8+ characters)'}
              </label>
              <input type="password" required minLength={8} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="editorial-input px-3.5 py-2.5" />
            </div>

            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-full bg-brand-navy dark:bg-brand-blue hover:opacity-90 text-white font-bold transition-colors">
              {isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
