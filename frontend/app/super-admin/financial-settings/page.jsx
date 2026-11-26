'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, Shield, ArrowLeft, RefreshCw, CheckCircle2, 
  AlertTriangle, Lock, Save, Landmark, Coins, HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';
import ReAuthModal from '../../components/ReAuthModal';

export default function SuperAdminFinancialSettingsPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [settings, setSettings] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Re-Auth Modal
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
      setSettings(list);

      // Map to key-value state
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

        const payloadSettings = Object.entries(formData).map(([key, value]) => ({
          key,
          value,
        }));

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
    <div className="min-h-screen bg-canvas-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-400" />
                {isBn ? 'মানবাধিকার আইনি প্রতিরক্ষা তহবিল কনফিগারেশন' : 'Legal Defense Trust & Financial Settings'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'জনগণের অনুদান, আইনি লড়াইয়ের বাজেট এবং ট্রাস্ট ফান্ড গভর্ন্যান্স (Re-Auth সুরক্ষিত)।' 
                  : 'Manage citizen trust defense funds, merchant channels, and reserve caps (Re-Auth protected).'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchFinancialSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {alertMsg.text && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            alertMsg.type === 'error'
              ? 'bg-rose-950/40 border-rose-900/50 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
          }`}>
            {alertMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Financial Settings Form */}
        <form onSubmit={handleSaveClick} className="space-y-6">
          {/* MFS Merchant Channels */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-400" />
              {isBn ? 'মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS) মার্চেন্ট অ্যাকাউন্ট' : 'MFS Merchant Gateways'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'বিকাশ (bKash) মার্চেন্ট নম্বর' : 'bKash Merchant Number'}</label>
                <input
                  type="text"
                  value={formData.bkash_merchant_number || ''}
                  onChange={(e) => setFormData({ ...formData, bkash_merchant_number: e.target.value })}
                  placeholder="01700000000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'নগদ (Nagad) মার্চেন্ট নম্বর' : 'Nagad Merchant Number'}</label>
                <input
                  type="text"
                  value={formData.nagad_merchant_number || ''}
                  onChange={(e) => setFormData({ ...formData, nagad_merchant_number: e.target.value })}
                  placeholder="01800000000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Donation Rules & Reserve Caps */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
              {isBn ? 'নাগরিক অনুদান ও আইনি লড়াই বাজেট পলিসি' : 'Donation Rules & Defense Allocations'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'সর্বনিম্ন অনুদানের পরিমাণ (টাকা)' : 'Minimum Donation (BDT)'}</label>
                <input
                  type="number"
                  value={formData.min_donation_bdt || 50}
                  onChange={(e) => setFormData({ ...formData, min_donation_bdt: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'নাগরিক অনুদান গ্রহণ স্ট্যাটাস' : 'Citizen Donation Portal Status'}</label>
                <select
                  value={formData.donation_enabled !== false ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, donation_enabled: e.target.value === 'true' })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="true">{isBn ? 'সক্রিয় (Donations Accepted)' : 'Active (Donations Accepted)'}</option>
                  <option value="false">{isBn ? 'সাময়িক বন্ধ (Paused)' : 'Paused'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isBn ? 'যাচাই ও আর্থিক সেটিংস সংরক্ষণ' : 'Re-Auth & Save Settings'}
            </button>
          </div>
        </form>

        {/* ReAuth Modal */}
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
