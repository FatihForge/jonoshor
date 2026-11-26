'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Upload, CheckCircle2, AlertCircle, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

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
      // 1. Fetch CSRF token
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      // 2. Prepare FormData payload
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

      // 3. Submit
      const res = await fetch('/api/v1/public/join-us', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error?.message || 'আবেদন জমা দেওয়া সম্ভব হয়নি।');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-semibold">
          <Users className="w-3.5 h-3.5" />
          <span>নাগরিক সম্পৃক্ততা ও স্বেচ্ছাসেবক ফোরাম</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text">
          মানবাধিকার ও আইনি সুরক্ষা টাস্কফোর্সে যুক্ত হোন
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate max-w-xl mx-auto leading-relaxed">
          আইনজীবী, সাংবাদিক, চিকিৎসক বা স্বেচ্ছাসেবী হিসেবে আপনি ভুক্তভোগী সাধারণ নাগরিকদের আইনি সহায়তা ও সত্য অনুসন্ধানে সরাসরি অবদান রাখতে পারেন।
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-canvas-border space-y-6">
        {success ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-emerald/20 border border-brand-emerald/40 text-brand-emerald flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-brand-text">আপনার আবেদন সফলভাবে গৃহীত হয়েছে!</h2>
            <p className="text-xs sm:text-sm text-brand-slate max-w-md mx-auto leading-relaxed">
              আপনার দেওয়া ইমেইলে একটি নিশ্চিতকরণ বার্তা পাঠানো হয়েছে। নথিগুলো কোয়ারেন্টাইনে নিরাপত্তা যাচাইয়ের পর আমাদের জ্যেষ্ঠ প্যানেল আপনার সাথে যোগাযোগ করবেন।
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold"
              >
                <span>হোম পেজে ফিরুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {error && (
              <div className="p-4 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-brand-text font-medium mb-1.5">আপনার পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="যেমন: অ্যাডভোকেট শাহরিয়ার কবির"
                  className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="block text-brand-text font-medium mb-1.5">ইমেইল ঠিকানা *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com (টেম্পোরারি মেইল নিষিদ্ধ)"
                  className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-brand-text font-medium mb-1.5">পেশা *</label>
                <select
                  value={formData.primaryProfession}
                  onChange={(e) => setFormData({ ...formData, primaryProfession: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                >
                  <option value="আইনজীবী (Lawyer)">আইনজীবী (Lawyer)</option>
                  <option value="সাংবাদিক / অনুসন্ধানী প্রতিবেদক (Journalist)">সাংবাদিক / অনুসন্ধানী প্রতিবেদক (Journalist)</option>
                  <option value="মানবাধিকার কর্মী (Human Rights Activist)">মানবাধিকার কর্মী (Human Rights Activist)</option>
                  <option value="চিকিৎসক (Medical Doctor)">চিকিৎসক (Medical Doctor)</option>
                  <option value="শিক্ষার্থী / গবেষক (Student / Researcher)">শিক্ষার্থী / গবেষক (Student / Researcher)</option>
                  <option value="অন্যান্য (Other)">অন্যান্য (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-text font-medium mb-1.5">যোগাযোগের মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="যেমন: 01711000000"
                  className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>

            <div>
              <label className="block text-brand-text font-medium mb-1.5">কী ধরনের ভূমিকা রাখতে চান? *</label>
              <input
                type="text"
                required
                value={formData.primaryContributionRole}
                onChange={(e) => setFormData({ ...formData, primaryContributionRole: e.target.value })}
                placeholder="যেমন: ভুক্তভোগীদের বিনামূল্যে আইনি পরামর্শ ও মামলা সহায়তা প্রদান"
                className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-brand-text font-medium mb-1.5">আপনার অভিজ্ঞতা ও আগ্রহের বিস্তারিত *</label>
              <textarea
                required
                rows={4}
                value={formData.contributionDetails}
                onChange={(e) => setFormData({ ...formData, contributionDetails: e.target.value })}
                placeholder="আপনার পূর্ব অভিজ্ঞতা বা কীভাবে জনস্বরে সময় দিতে পারবেন লিখুন..."
                className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-brand-text font-medium mb-1.5">LinkedIn প্রোফাইল লিঙ্ক</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="block text-brand-text font-medium mb-1.5">ওয়েবসাইট / পোর্টফোলিও লিঙ্ক</label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://yourwebsite.org"
                  className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>

            {/* Document Upload */}
            <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border space-y-2">
              <label className="block text-brand-text font-medium">
                সিভি, বার কাউন্সিল সনদ বা প্রশংসাপত্র আপলোড (সর্বোচ্চ ৫টি ফাইল)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="block w-full text-xs text-brand-slate file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-emerald/10 file:text-brand-emerald hover:file:bg-brand-emerald/20"
              />
              <p className="text-[11px] text-brand-slate">
                ফাইলগুলো স্বয়ংক্রিয় ক্লাউড কোয়ারেন্টাইনে আপলোড হয়ে নিরাপত্তা স্ক্যান সম্পন্ন করবে।
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-emerald/20 transition-all disabled:opacity-50"
            >
              {loading ? <span>আবেদন যাচাই হচ্ছে...</span> : <span>আবেদন সাবমিট করুন</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
