'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserProfilePage() {
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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'প্রোফাইল আপডেট করা যায়নি।');

      setMsg('প্রোফাইল সফলভাবে আপডেট হয়েছে।');
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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify(passwords),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি।');

      setMsg('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। অন্যান্য সব ডিভাইসের সেশন বাতিল করা হয়েছে।');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6 text-xs">
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ড্যাশবোর্ডে ফিরুন</span>
        </Link>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Edit Profile */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-canvas-border space-y-4">
        <h2 className="text-base font-bold text-brand-text flex items-center gap-2 pb-2 border-b border-canvas-border">
          <User className="w-4 h-4 text-brand-emerald" />
          <span>ব্যক্তিগত তথ্য আপডেট</span>
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-brand-text font-medium mb-1">পূর্ণ নাম</label>
            <input
              type="text"
              value={profile.fullName || ''}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1">মোবাইল নম্বর</label>
            <input
              type="text"
              value={profile.mobile || ''}
              onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              className="w-full px-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-brand-emerald text-white font-bold"
          >
            প্রোফাইল সেভ করুন
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-canvas-border space-y-4">
        <h2 className="text-base font-bold text-brand-text flex items-center gap-2 pb-2 border-b border-canvas-border">
          <Lock className="w-4 h-4 text-brand-amber" />
          <span>পাসওয়ার্ড পরিবর্তন (সিকিউরিটি লকআউট)</span>
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-brand-text font-medium mb-1">বর্তমান পাসওয়ার্ড</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full px-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-amber"
            />
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1">নতুন পাসওয়ার্ড (৮+ অক্ষর)</label>
            <input
              type="password"
              required
              minLength={8}
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full px-3 py-2 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-amber"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-brand-amber text-canvas font-bold"
          >
            পাসওয়ার্ড পরিবর্তন করুন
          </button>
        </form>
      </div>
    </div>
  );
}
