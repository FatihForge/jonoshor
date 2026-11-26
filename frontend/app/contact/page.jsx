'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'মেসেজ পাঠানো সম্ভব হয়নি।');

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            CONTACT & INQUIRIES
          </span>
          <h1 className="text-3xl font-extrabold text-brand-navy dark:text-white">জনস্বর টাস্কফোর্সের সাথে যোগাযোগ</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            যেকোনো সাধারণ অনুসন্ধান, গণমাধ্যম যোগাযোগ বা প্রাতিষ্ঠানিক সহযোগিতার জন্য বার্তা পাঠান।
          </p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>আপনার বার্তা সফলভাবে গৃহীত হয়েছে। আমাদের প্রতিনিধি যথাসম্ভব দ্রুত যোগাযোগ করবেন।</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">আপনার নাম *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="যেমন: মো. কামরুল হাসান" className="editorial-input px-3.5 py-2.5" />
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">ইমেইল ঠিকানা *</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@example.com" className="editorial-input px-3.5 py-2.5" />
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">বিষয় *</label>
              <input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="বার্তার মূল বিষয় সংক্ষেপে লিখুন" className="editorial-input px-3.5 py-2.5" />
            </div>

            <div>
              <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">বার্তা / অনুসন্ধানের বিবরণ *</label>
              <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="আপনার বিস্তারিত বার্তা লিখুন..." className="editorial-input px-3.5 py-2.5" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 px-5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50">
              <Send className="w-4 h-4" />
              {loading ? <span>পাঠানো হচ্ছে...</span> : <span>বার্তা প্রেরণ করুন</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
