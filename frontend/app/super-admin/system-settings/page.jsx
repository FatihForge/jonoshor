'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, Shield, ArrowLeft, RefreshCw, CheckCircle2, 
  AlertTriangle, Lock, Save, Edit3, ToggleLeft, ToggleRight
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

  // Re-Auth Modal
  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/super-admin/system-settings', { credentials: 'include' });
      if (!res.ok) throw new Error('সিস্টেম সেটিংস লোড করা যায়নি');
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
          body: JSON.stringify({
            value: valToSave,
            category: setting.category,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে');

        setAlertMsg({ type: 'success', text: isBn ? 'সিস্টেম সেটিংস সফলভাবে আপডেট হয়েছে' : 'Setting updated successfully' });
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

  const filteredSettings = activeCategory === 'all' 
    ? settings 
    : settings.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
                <Settings className="w-6 h-6 text-amber-400" />
                {isBn ? 'সিস্টেম ও প্ল্যাটফর্ম কনফিগারেশন' : 'System & Platform Configuration'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'প্ল্যাটফর্মের গ্লোবাল অপারেশনাল ভেরিয়েবল ও নিরাপত্তা নীতি পরিবর্তন করুন (Re-Auth সুরক্ষিত)।' 
                  : 'Manage operational parameters, rate limiting, and registration controls (Re-Auth protected).'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchSettings}
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

        {/* Categories Bar */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {['all', 'general', 'security', 'complaint'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                activeCategory === cat
                  ? 'bg-amber-600 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? (isBn ? 'সকল সেটিংস' : 'All Settings') : cat}
            </button>
          ))}
        </div>

        {/* Settings Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">{isBn ? 'সেটিংস কী (Key)' : 'Setting Key'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'বর্তমান মান (Value)' : 'Current Value'}</th>
                  <th className="px-4 py-3.5 text-right">{isBn ? 'সম্পাদনা' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500 font-sans">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      {isBn ? 'সেটিংস লোড হচ্ছে...' : 'Loading system variables...'}
                    </td>
                  </tr>
                ) : filteredSettings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500 font-sans">
                      {isBn ? 'কোনো সেটিংস পাওয়া যায়নি' : 'No settings matching criteria'}
                    </td>
                  </tr>
                ) : (
                  filteredSettings.map((s) => (
                    <tr key={s.key} className="hover:bg-slate-850/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{s.key}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-[10px] uppercase font-sans">
                          {s.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {typeof s.value === 'boolean' ? (
                          <button
                            onClick={() => handleSaveClick(s, !s.value)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-semibold border transition ${
                              s.value
                                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                                : 'bg-rose-950/80 border-rose-800 text-rose-300'
                            }`}
                          >
                            {s.value ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {s.value ? 'Enabled' : 'Disabled'}
                          </button>
                        ) : typeof s.value === 'object' ? (
                          <span className="text-[10px] text-slate-400">[Structured Array/Object]</span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px] truncate max-w-xs block">
                            {String(s.value)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-sans">
                        {typeof s.value !== 'boolean' && (
                          <button
                            onClick={() => startEdit(s)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-medium transition"
                          >
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

        {/* Edit Setting Modal */}
        {editingSetting && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                {isBn ? 'মান সম্পাদনা করুন' : 'Edit Setting Value'}
              </h3>
              <p className="text-xs font-mono text-amber-300">
                {editingSetting.key}
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'নতুন মান নির্ধারণ করুন *' : 'New Value *'}</label>
                <input
                  type="text"
                  required
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSetting(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveClick(editingSetting)}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isBn ? 'যাচাই ও সংরক্ষণ' : 'Re-Auth & Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ReAuth Modal */}
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
