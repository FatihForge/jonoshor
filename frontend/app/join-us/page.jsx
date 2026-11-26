'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function JoinUsPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    primaryProfession: 'আইনজীবী (Lawyer)',
    primaryContributionRole: 'আইনি পরামর্শ ও আদালতে জামিন শুনানি',
    contributionDetails: '',
    linkedin: '',
    portfolio: '',
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (selected.length > 5) {
        setError('একবারে সর্বোচ্চ ৫টি ফাইল আপলোড করা যাবে।');
        return;
      }
      setFiles(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const body = new FormData();
      body.append('fullName', formData.fullName);
      body.append('email', formData.email);
      body.append('primaryProfession', formData.primaryProfession);
      body.append('primaryContributionRole', formData.primaryContributionRole);
      body.append('contributionDetails', formData.contributionDetails);
      if (formData.mobile) body.append('contactInformation', JSON.stringify({ mobile: formData.mobile }));
      if (formData.linkedin) body.append('linkedin', formData.linkedin);
      if (formData.portfolio) body.append('portfolio', formData.portfolio);

      for (const file of files) {
        body.append('documents', file);
      }

      const res = await fetch('/api/v1/public/join-us', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfData.csrfToken || '' },
        body,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.error?.message || 'আবেদন জমা দেওয়া সম্ভব হয়নি।');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        <div className="text-center space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            LEGAL & VOLUNTEER TASKFORCE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
            মানবাধিকার ও আইনি সুরক্ষা প্যানেলে যুক্ত হোন
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            আইনজীবী, সাংবাদিক, চিকিৎসক বা স্বেচ্ছাসেবী হিসেবে আপনি ভুক্তভোগী সাধারণ নাগরিকদের আইনি সহায়তা ও সত্য অনুসন্ধানে অবদান রাখতে পারেন।
          </p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-brand-navy dark:text-white">আপনার আবেদন সফলভাবে গৃহীত হয়েছে</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                আপনার প্রদত্ত নথিপত্র ক্লাউড কোয়ারেন্টাইনে নিরাপত্তা যাচাইয়ের পর আমাদের জ্যেষ্ঠ পর্যালোচক প্যানেল আপনার সাথে যোগাযোগ করবেন।
              </p>
              <div className="pt-4">
                <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md">
                  <span>হোম পেজে ফিরুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">আপনার পূর্ণ নাম *</label>
                  <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="যেমন: অ্যাডভোকেট শাহরিয়ার কবির" className="editorial-input px-3.5 py-2.5" />
                </div>
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">ইমেইল ঠিকানা *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@example.com" className="editorial-input px-3.5 py-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">পেশা *</label>
                  <select value={formData.primaryProfession} onChange={(e) => setFormData({ ...formData, primaryProfession: e.target.value })} className="editorial-input px-3.5 py-2.5">
                    <option value="আইনজীবী (Lawyer)">আইনজীবী (Lawyer)</option>
                    <option value="সাংবাদিক / অনুসন্ধানী প্রতিবেদক (Journalist)">সাংবাদিক / অনুসন্ধানী প্রতিবেদক (Journalist)</option>
                    <option value="মানবাধিকার কর্মী (Human Rights Activist)">মানবাধিকার কর্মী (Human Rights Activist)</option>
                    <option value="চিকিৎসক (Medical Doctor)">চিকিৎসক (Medical Doctor)</option>
                    <option value="শিক্ষার্থী / গবেষক (Student / Researcher)">শিক্ষার্থী / গবেষক (Student / Researcher)</option>
                    <option value="অন্যান্য (Other)">অন্যান্য (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">যোগাযোগের মোবাইল নম্বর</label>
                  <input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="যেমন: 01711000000" className="editorial-input px-3.5 py-2.5 font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">কী ধরনের ভূমিকা রাখতে চান? *</label>
                <input type="text" required value={formData.primaryContributionRole} onChange={(e) => setFormData({ ...formData, primaryContributionRole: e.target.value })} className="editorial-input px-3.5 py-2.5" />
              </div>

              <div>
                <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">আপনার অভিজ্ঞতা ও আগ্রহের বিস্তারিত *</label>
                <textarea required rows={4} value={formData.contributionDetails} onChange={(e) => setFormData({ ...formData, contributionDetails: e.target.value })} className="editorial-input px-3.5 py-2.5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">LinkedIn প্রোফাইল লিঙ্ক</label>
                  <input type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" className="editorial-input px-3.5 py-2.5" />
                </div>
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">ওয়েবসাইট / পোর্টফোলিও লিঙ্ক</label>
                  <input type="url" value={formData.portfolio} onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })} placeholder="https://yourwebsite.org" className="editorial-input px-3.5 py-2.5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F2F7FF] dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-2">
                <label className="block text-brand-navy dark:text-slate-200 font-semibold">
                  সিভি, বার কাউন্সিল সনদ বা প্রশংসাপত্র আপলোড (সর্বোচ্চ ৫টি ফাইল)
                </label>
                <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-blue file:text-white hover:file:bg-brand-blueDark" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ফাইলগুলো স্বয়ংক্রিয় ক্লাউড কোয়ারেন্টাইনে আপলোড হয়ে নিরাপত্তা স্ক্যান সম্পন্ন করবে।
                </p>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 px-5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50">
                {loading ? <span>আবেদন যাচাই হচ্ছে...</span> : <span>আবেদন দাখিল করুন</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
