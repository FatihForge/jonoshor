'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign, ArrowLeft, RefreshCw, CheckCircle2,
  AlertTriangle, Lock, Landmark, HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';
import ReAuthModal from '../../components/ReAuthModal';

export default function SuperAdminFinancialSettingsPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchFinancialSettings();
  }, []);

  const fetchFinancialSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/super-admin/financial-settings', { credentials: 'include' });
      if (!res.ok) throw new Error('আর্থিক কনফিগারেশন লোড করা যায়নি');
      const data = await res.json();
      const list = data.data || [];

      const initialMap = {};
      list.forEach((item) => {
        initialMap[item.key] = item.value;
      });
      setFormData(initialMap);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getCsrfToken = async () => {
    try {
      const res = await fetch('/api/v1/csrf-token', { credentials: 'include' });
      const data = await res.json();
      return data.csrfToken;
    } catch {
      return '';
    }
  };

  const handleSaveClick = (e) => {
    e.preventDefault();

    setPendingAction(() => async (reAuthToken) => {
      try {
        setActionLoading(true);
        const csrfToken = await getCsrfToken();

        const payloadSettings = Object.entries(formData).map(([key, value]) => ({ key, value }));

        const res = await fetch('/api/v1/super-admin/financial-settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'X-Reauth-Token': reAuthToken,
          },
          credentials: 'include',
          body: JSON.stringify({ settings: payloadSettings }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'আর্থিক সেটিংস আপডেট ব্যর্থ হয়েছে');

        setAlertMsg({ type: 'success', text: isBn ? 'মানবাধিকার তহবিল ও আর্থিক সেটিংস হালনাগাদ হয়েছে' : 'Financial settings updated' });
        fetchFinancialSettings();
      } catch (err) {
        setAlertMsg({ type: 'error', text: err.message });
      } finally {
        setActionLoading(false);
      }
    });

    setReAuthOpen(true);
  };

  const onReAuthSuccess = (token) => {
    setReAuthOpen(false);
    if (pendingAction) {
      pendingAction(token);
      setPendingAction(null);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl space-y-6 text-xs">
      <div className="editorial-rule-top pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/super-admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text font-semibold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>কমান্ড সেন্টারে ফিরুন</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-brand-pine" />
            <span>{isBn ? 'মানবাধিকার আইনি প্রতিরক্ষা তহবিল কনফিগারেশন' : 'Legal Defense Trust & Financial Settings'}</span>
          </h1>
          <p className="text-brand-slate">জনগণের অনুদান, আইনি লড়াইয়ের বাজেট এবং ট্রাস্ট ফান্ড গভর্ন্যান্স (Re-Auth সুরক্ষিত)।</p>
        </div>

        <button onClick={fetchFinancialSettings} className="p-2 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {alertMsg.text && (
        <div className={`p-3.5 rounded-md border flex items-center gap-2 ${
          alertMsg.type === 'error'
            ? 'bg-red-50 border-red-200 text-brand-crimson'
            : 'bg-emerald-50 border-emerald-200 text-brand-pine'
        }`}>
          {alertMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveClick} className="space-y-6">
        <div className="dossier-card p-6 rounded-md space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-text flex items-center gap-2 border-b border-canvas-border pb-2">
            <Landmark className="w-4 h-4 text-brand-pine" />
            <span>মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS) মার্চেন্ট অ্যাকাউন্ট</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-brand-text mb-1">বিকাশ (bKash) মার্চেন্ট নম্বর</label>
              <input
                type="text"
                value={formData.bkash_merchant_number || ''}
                onChange={(e) => setFormData({ ...formData, bkash_merchant_number: e.target.value })}
                placeholder="01700000000"
                className="editorial-input px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-brand-text mb-1">নগদ (Nagad) মার্চেন্ট নম্বর</label>
              <input
                type="text"
                value={formData.nagad_merchant_number || ''}
                onChange={(e) => setFormData({ ...formData, nagad_merchant_number: e.target.value })}
                placeholder="01800000000"
                className="editorial-input px-3 py-2 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="dossier-card p-6 rounded-md space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-text flex items-center gap-2 border-b border-canvas-border pb-2">
            <HeartHandshake className="w-4 h-4 text-brand-pine" />
            <span>নাগরিক অনুদান ও আইনি লড়াই বাজেট পলিসি</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-brand-text mb-1">সর্বনিম্ন অনুদানের পরিমাণ (টাকা)</label>
              <input
                type="number"
                value={formData.min_donation_bdt || 50}
                onChange={(e) => setFormData({ ...formData, min_donation_bdt: Number(e.target.value) })}
                className="editorial-input px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-brand-text mb-1">নাগরিক অনুদান গ্রহণ স্ট্যাটাস</label>
              <select
                value={formData.donation_enabled !== false ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, donation_enabled: e.target.value === 'true' })}
                className="editorial-input px-3 py-2"
              >
                <option value="true">সক্রিয় (Donations Accepted)</option>
                <option value="false">সাময়িক বন্ধ (Paused)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={actionLoading}
            className="px-6 py-2.5 rounded-md bg-brand-pine hover:bg-brand-pineDark text-white font-bold flex items-center gap-2 transition disabled:opacity-50"
          >
            {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>যাচাই ও আর্থিক সেটিংস সংরক্ষণ</span>
          </button>
        </div>
      </form>

      <ReAuthModal
        isOpen={reAuthOpen}
        onClose={() => setReAuthOpen(false)}
        onSuccess={onReAuthSuccess}
        title={isBn ? 'আর্থিক সেটিংস পরিবর্তন অনুমোদন' : 'Authorize Financial Settings Mutation'}
      />
    </div>
  );
}
