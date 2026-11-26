'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Fetch CSRF token first
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/v1/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'মেসেজ পাঠানো সম্ভব হয়নি।');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-semibold">
          <Mail className="w-3.5 h-3.5" />
          <span>যোগাযোগ ও বার্তা</span>
        </div>
        <h1 className="text-3xl font-extrabold text-brand-text">জনস্বর টাস্কফোর্সের সাথে যোগাযোগ</h1>
        <p className="text-xs sm:text-sm text-brand-slate">
          যেকোনো সাধারণ অনুসন্ধান, মতামত বা প্রাতিষ্ঠানিক সহযোগিতার জন্য বার্তা পাঠান।
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-canvas-border space-y-6">
        {success && (
          <div className="p-4 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>আপনার বার্তা সফলভাবে গৃহীত হয়েছে। আমাদের প্রতিনিধি যথাসম্ভব দ্রুত যোগাযোগ করবেন।</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-brand-text font-medium mb-1.5">আপনার নাম *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="যেমন: মো. কামরুল হাসান"
              className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text placeholder-brand-slate/60 focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1.5">ইমেইল ঠিকানা *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="যেমন: name@example.com"
              className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text placeholder-brand-slate/60 focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1.5">বিষয় *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="বার্তার মূল বিষয় সংক্ষেপে লিখুন"
              className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text placeholder-brand-slate/60 focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <label className="block text-brand-text font-medium mb-1.5">বার্তা / অনুসন্ধানের বিবরণ *</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="আপনার বক্তব্য বিস্তারিতভাবে লিখুন..."
              className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text placeholder-brand-slate/60 focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-emerald/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>পাঠানো হচ্ছে...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>বার্তা প্রেরণ করুন</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
