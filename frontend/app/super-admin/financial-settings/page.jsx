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
      if (!res.ok) throw new Error(isBn ? 'আর্থিক কনফিগারেশন লোড করা যায়নি' : 'Failed to load financial settings');
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
        if (!res.ok) throw new Error(data.message || (isBn ? 'আর্থিক সেটিংস আপডেট ব্যর্থ হয়েছে' : 'Financial update failed'));

        setAlertMsg({ type: 'success', text: isBn ? 'মানবাধিকার তহবিল ও আর্থিক সেটিংস হালনাগাদ হয়েছে' : 'Financial settings updated successfully' });
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
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-6 text-xs">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <Link href="/super-admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-semibold hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'কমান্ড সেন্টারে ফিরুন' : 'Back to Command Center'}</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-brand-blue" />
              <span>{isBn ? 'মানবাধিকার আইনি প্রতিরক্ষা তহবিল কনফিগারেশন' : 'Legal Defense Trust & Financial Settings'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isBn
                ? 'জনগণের অনুদান, আইনি লড়াইয়ের বাজেট এবং ট্রাস্ট ফান্ড গভর্ন্যান্স (Re-Auth সুরক্ষিত)।'
                : 'Manage citizen defense trust contributions, legal aid allocations, and MFS merchant settings (Re-Auth protected).'}
            </p>
          </div>

          <button onClick={fetchFinancialSettings} className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 self-start sm:self-auto">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {alertMsg.text && (
          <div className={`p-3.5 rounded-xl border flex items-center gap-2 ${
            alertMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}>
            {alertMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveClick} className="space-y-6">
          <div className="dossier-card p-6 rounded-3xl space-y-4">
            <h2 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Landmark className="w-4 h-4 text-brand-blue" />
              <span>{isBn ? 'মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS) মার্চেন্ট অ্যাকাউন্ট' : 'Mobile Financial Service (MFS) Merchant Accounts'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  {isBn ? 'বিকাশ (bKash) মার্চেন্ট নম্বর' : 'bKash Merchant Number'}
                </label>
                <input
                  type="text"
                  value={formData.bkash_merchant_number || ''}
                  onChange={(e) => setFormData({ ...formData, bkash_merchant_number: e.target.value })}
                  placeholder="01700000000"
                  className="editorial-input px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  {isBn ? 'নগদ (Nagad) মার্চেন্ট নম্বর' : 'Nagad Merchant Number'}
                </label>
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

          <div className="dossier-card p-6 rounded-3xl space-y-4">
            <h2 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'নাগরিক অনুদান ও আইনি লড়াই বাজেট পলিসি' : 'Citizen Contributions & Legal Aid Budget Policy'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  {isBn ? 'সর্বনিম্ন অনুদানের পরিমাণ (টাকা)' : 'Minimum Contribution (BDT)'}
                </label>
                <input
                  type="number"
                  value={formData.min_donation_bdt || 50}
                  onChange={(e) => setFormData({ ...formData, min_donation_bdt: Number(e.target.value) })}
                  className="editorial-input px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  {isBn ? 'নাগরিক অনুদান গ্রহণ স্ট্যাটাস' : 'Contribution Acceptance Status'}
                </label>
                <select
                  value={formData.donation_enabled !== false ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, donation_enabled: e.target.value === 'true' })}
                  className="editorial-input px-3 py-2"
                >
                  <option value="true">{isBn ? 'সক্রিয় (Donations Accepted)' : 'Active (Accepted)'}</option>
                  <option value="false">{isBn ? 'সাময়িক বন্ধ (Paused)' : 'Paused'}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{isBn ? 'যাচাই ও আর্থিক সেটিংস সংরক্ষণ' : 'Authorize & Save Financial Settings'}</span>
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
    </div>
  );
}
