'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings, ArrowLeft, RefreshCw, CheckCircle2,
  AlertTriangle, Lock, Edit3, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';
import ReAuthModal from '../../components/ReAuthModal';

export default function SuperAdminSystemSettingsPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [editingSetting, setEditingSetting] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/super-admin/system-settings', { credentials: 'include' });
      if (!res.ok) throw new Error(isBn ? 'সিস্টেম সেটিংস লোড করা যায়নি' : 'Failed to load system settings');
      const data = await res.json();
      setSettings(data.data || []);
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

  const startEdit = (setting) => {
    setEditingSetting(setting);
    setEditValue(typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : setting.value);
  };

  const handleSaveClick = (setting, directValue = null) => {
    const valToSave = directValue !== null ? directValue : (
      typeof setting.value === 'boolean' ? !setting.value :
      typeof setting.value === 'number' ? Number(editValue) :
      editValue
    );

    setPendingAction(() => async (reAuthToken) => {
      try {
        setActionLoading(true);
        const csrfToken = await getCsrfToken();
        const res = await fetch(`/api/v1/super-admin/system-settings/${setting.key}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'X-Reauth-Token': reAuthToken,
          },
          credentials: 'include',
          body: JSON.stringify({ value: valToSave, category: setting.category }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || (isBn ? 'সেটিংস আপডেট ব্যর্থ হয়েছে' : 'Failed to update setting'));

        setAlertMsg({ type: 'success', text: isBn ? 'সিস্টেম সেটিংস সফলভাবে আপডেট হয়েছে' : 'System setting updated successfully' });
        setEditingSetting(null);
        fetchSettings();
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

  const filteredSettings = activeCategory === 'all' ? settings : settings.filter((s) => s.category === activeCategory);

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <Link href="/super-admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-semibold hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'কমান্ড সেন্টারে ফিরুন' : 'Back to Command Center'}</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-brand-blue" />
              <span>{isBn ? 'সিস্টেম ও প্ল্যাটফর্ম কনফিগারেশন' : 'System & Platform Configuration'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isBn
                ? 'প্ল্যাটফর্মের গ্লোবাল অপারেশনাল ভেরিয়েবল ও নিরাপত্তা নীতি পরিবর্তন করুন (Re-Auth সুরক্ষিত)।'
                : 'Modify global operational variables and platform security policies (Re-Auth protected).'}
            </p>
          </div>

          <button onClick={fetchSettings} className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 self-start sm:self-auto">
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

        <div className="flex gap-2 pb-1 overflow-x-auto">
          {['all', 'general', 'security', 'complaint'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition ${
                activeCategory === cat
                  ? 'bg-brand-blue text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat === 'all' ? (isBn ? 'সকল সেটিংস' : 'All Settings') : cat}
            </button>
          ))}
        </div>

        <div className="dossier-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">{isBn ? 'কী (Setting Key)' : 'Setting Key'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'বর্তমান মান' : 'Current Value'}</th>
                  <th className="px-4 py-3.5 text-right">{isBn ? 'সম্পাদনা' : 'Edit'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {loading ? (
                  <tr><td colSpan="4" className="py-12 text-center font-sans text-slate-400">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</td></tr>
                ) : filteredSettings.length === 0 ? (
                  <tr><td colSpan="4" className="py-12 text-center font-sans text-slate-400">{isBn ? 'কোনো সেটিংস পাওয়া যায়নি' : 'No settings found'}</td></tr>
                ) : (
                  filteredSettings.map((s) => (
                    <tr key={s.key} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-bold text-brand-navy dark:text-white">{s.key}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 text-[10px] uppercase font-sans font-semibold">
                          {s.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {typeof s.value === 'boolean' ? (
                          <button
                            onClick={() => handleSaveClick(s, !s.value)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-bold border transition ${
                              s.value
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                          >
                            {s.value ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {s.value ? (isBn ? 'সক্রিয়' : 'Enabled') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}
                          </button>
                        ) : typeof s.value === 'object' ? (
                          <span className="text-[10px] text-slate-400">[Structured Object]</span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-xs block">{String(s.value)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-sans">
                        {typeof s.value !== 'boolean' && (
                          <button onClick={() => startEdit(s)} className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold transition">
                            {isBn ? 'সম্পাদনা' : 'Edit'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {editingSetting && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="dossier-card-elevated rounded-3xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-blue" />
                <span>{isBn ? 'মান সম্পাদনা করুন' : 'Edit Setting Value'}</span>
              </h3>
              <p className="text-xs font-mono text-brand-blue font-bold">{editingSetting.key}</p>
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  {isBn ? 'নতুন মান নির্ধারণ করুন *' : 'New Value *'}
                </label>
                <input type="text" required value={editValue} onChange={(e) => setEditValue(e.target.value)} className="editorial-input px-3 py-2 font-mono" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setEditingSetting(null)} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="button" onClick={() => handleSaveClick(editingSetting)} disabled={actionLoading} className="px-5 py-2 rounded-full bg-brand-blue text-white font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isBn ? 'যাচাই ও সংরক্ষণ' : 'Authorize & Save'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <ReAuthModal
          isOpen={reAuthOpen}
          onClose={() => setReAuthOpen(false)}
          onSuccess={onReAuthSuccess}
          title={isBn ? 'সিস্টেম কনফিগারেশন পরিবর্তন নিশ্চিতকরণ' : 'Authorize System Setting Mutation'}
        />
      </div>
    </div>
  );
}
