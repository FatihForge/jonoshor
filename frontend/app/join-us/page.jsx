'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

export default function JoinUsPage() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    primaryProfession: 'Lawyer',
    primaryContributionRole: '',
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
        setError(isBn ? 'একবারে সর্বোচ্চ ৫টি ফাইল আপলোড করা যাবে।' : 'Maximum 5 files can be uploaded at once.');
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
      body.append(
        'primaryContributionRole',
        formData.primaryContributionRole || (isBn ? 'আইনি পরামর্শ ও নাগরিক সহায়তা' : 'Legal Advocacy & Citizen Assistance')
      );
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
      if (!res.ok) throw new Error(resData?.error?.message || (isBn ? 'আবেদন জমা দেওয়া সম্ভব হয়নি।' : 'Could not submit application.'));
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
            {isBn ? 'আইনজীবী ও স্বেচ্ছাসেবী টাস্কফোর্স' : 'LEGAL & VOLUNTEER TASKFORCE'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
            {isBn ? 'মানবাধিকার ও আইনি সুরক্ষা প্যানেলে যুক্ত হোন' : 'Join the Human Rights & Legal Aid Panel'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {isBn
              ? 'আইনজীবী, সাংবাদিক, চিকিৎসক বা স্বেচ্ছাসেবী হিসেবে আপনি ভুক্তভোগী সাধারণ নাগরিকদের আইনি সহায়তা ও সত্য অনুসন্ধানে অবদান রাখতে পারেন।'
              : 'Contribute as a lawyer, investigative journalist, medical doctor, or volunteer to assist victims and uphold fact-finding.'}
          </p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-brand-navy dark:text-white">
                {isBn ? 'আপনার আবেদন সফলভাবে গৃহীত হয়েছে' : 'Application Received Successfully'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {isBn
                  ? 'আপনার প্রদত্ত নথিপত্র ক্লাউড কোয়ারেন্টাইনে নিরাপত্তা যাচাইয়ের পর আমাদের জ্যেষ্ঠ পর্যালোচক প্যানেল আপনার সাথে যোগাযোগ করবেন।'
                  : 'After your submitted documents pass cloud quarantine security checks, our senior review panel will contact you.'}
              </p>
              <div className="pt-4">
                <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md">
                  <span>{isBn ? 'হোম পেজে ফিরুন' : 'Return Home'}</span>
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
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                    {isBn ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={isBn ? 'যেমন: অ্যাডভোকেট শাহরিয়ার কবির' : 'e.g. Advocate Shahriar Kabir'}
                    className="editorial-input px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                    {isBn ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="editorial-input px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                    {isBn ? 'পেশা *' : 'Profession *'}
                  </label>
                  <select
                    value={formData.primaryProfession}
                    onChange={(e) => setFormData({ ...formData, primaryProfession: e.target.value })}
                    className="editorial-input px-3.5 py-2.5"
                  >
                    <option value="Lawyer">{isBn ? 'আইনজীবী (Lawyer)' : 'Lawyer'}</option>
                    <option value="Journalist">{isBn ? 'সাংবাদিক / অনুসন্ধানী প্রতিবেদক' : 'Investigative Journalist'}</option>
                    <option value="Human Rights Activist">{isBn ? 'মানবাধিকার কর্মী' : 'Human Rights Activist'}</option>
                    <option value="Medical Doctor">{isBn ? 'চিকিৎসক (Medical Doctor)' : 'Medical Doctor'}</option>
                    <option value="Student / Researcher">{isBn ? 'শিক্ষার্থী / গবেষক' : 'Student / Researcher'}</option>
                    <option value="Other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                    {isBn ? 'যোগাযোগের মোবাইল নম্বর' : 'Contact Mobile Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder={isBn ? 'যেমন: 01711000000' : 'e.g. +8801711000000'}
                    className="editorial-input px-3.5 py-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                  {isBn ? 'কী ধরনের ভূমিকা রাখতে চান? *' : 'Preferred Contribution Role *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.primaryContributionRole}
                  onChange={(e) => setFormData({ ...formData, primaryContributionRole: e.target.value })}
                  placeholder={isBn ? 'যেমন: আইনি পরামর্শ ও আদালতে জামিন শুনানি' : 'e.g. Legal counseling and court bail hearings'}
                  className="editorial-input px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                  {isBn ? 'আপনার অভিজ্ঞতা ও আগ্রহের বিস্তারিত *' : 'Experience & Statement of Interest *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.contributionDetails}
                  onChange={(e) => setFormData({ ...formData, contributionDetails: e.target.value })}
                  placeholder={isBn ? 'আপনার প্রাসঙ্গিক অভিজ্ঞতা সম্পর্কে লিখুন...' : 'Describe your relevant experience...'}
                  className="editorial-input px-3.5 py-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                    {isBn ? 'LinkedIn প্রোফাইল লিঙ্ক' : 'LinkedIn Profile URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="editorial-input px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">
                    {isBn ? 'ওয়েবসাইট / পোর্টফোলিও লিঙ্ক' : 'Website / Portfolio URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="https://yourwebsite.org"
                    className="editorial-input px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F2F7FF] dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-2">
                <label className="block text-brand-navy dark:text-slate-200 font-semibold">
                  {isBn ? 'সিভি, বার কাউন্সিল সনদ বা প্রশংসাপত্র আপলোড (সর্বোচ্চ ৫টি ফাইল)' : 'Upload CV, Bar Certificate, or Credentials (Max 5 files)'}
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-blue file:text-white hover:file:bg-brand-blueDark"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'ফাইলগুলো স্বয়ংক্রিয় ক্লাউড কোয়ারেন্টাইনে আপলোড হয়ে নিরাপত্তা স্ক্যান সম্পন্ন করবে।'
                    : 'Files are uploaded to automated cloud quarantine for security scanning.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                {loading ? <span>{isBn ? 'আবেদন যাচাই হচ্ছে...' : 'Submitting application...'}</span> : <span>{isBn ? 'আবেদন দাখিল করুন' : 'Submit Application'}</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
