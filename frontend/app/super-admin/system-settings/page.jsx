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
          body: JSON.stringify({ value: valToSave, category: setting.category }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে');

        setAlertMsg({ type: 'success', text: isBn ? 'সিস্টেম সেটিংস সফলভাবে আপডেট হয়েছে' : 'Setting updated' });
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
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
      <div className="editorial-rule-top pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/super-admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text font-semibold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>কমান্ড সেন্টারে ফিরুন</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-ochre" />
            <span>{isBn ? 'সিস্টেম ও প্ল্যাটফর্ম কনফিগারেশন' : 'System & Platform Configuration'}</span>
          </h1>
          <p className="text-brand-slate">প্ল্যাটফর্মের গ্লোবাল অপারেশনাল ভেরিয়েবল ও নিরাপত্তা নীতি পরিবর্তন করুন (Re-Auth সুরক্ষিত)।</p>
        </div>

        <button onClick={fetchSettings} className="p-2 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle self-start sm:self-auto">
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

      {/* Categories Bar */}
      <div className="flex gap-2 border-b border-canvas-border pb-3 overflow-x-auto">
        {['all', 'general', 'security', 'complaint'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold capitalize transition ${
              activeCategory === cat
                ? 'bg-brand-text text-white'
                : 'bg-canvas-card border border-canvas-border text-brand-slate hover:text-brand-text'
            }`}
          >
            {cat === 'all' ? 'সকল সেটিংস' : cat}
          </button>
        ))}
      </div>

      {/* Settings Table */}
      <div className="dossier-card rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-subtle text-brand-text font-bold border-b border-canvas-border uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Setting Key</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Current Value</th>
                <th className="px-4 py-3.5 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-border font-mono">
              {loading ? (
                <tr><td colSpan="4" className="py-12 text-center font-sans text-brand-muted">লোড হচ্ছে...</td></tr>
              ) : filteredSettings.length === 0 ? (
                <tr><td colSpan="4" className="py-12 text-center font-sans text-brand-muted">কোনো সেটিংস পাওয়া যায়নি</td></tr>
              ) : (
                filteredSettings.map((s) => (
                  <tr key={s.key} className="hover:bg-canvas-hover transition">
                    <td className="px-4 py-3 font-bold text-brand-text">{s.key}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-sm bg-canvas border border-canvas-border text-brand-muted text-[10px] uppercase font-sans font-semibold">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {typeof s.value === 'boolean' ? (
                        <button
                          onClick={() => handleSaveClick(s, !s.value)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-sans font-bold border transition ${
                            s.value
                              ? 'bg-emerald-50 border-emerald-200 text-brand-pine'
                              : 'bg-red-50 border-red-200 text-brand-crimson'
                          }`}
                        >
                          {s.value ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          {s.value ? 'Enabled' : 'Disabled'}
                        </button>
                      ) : typeof s.value === 'object' ? (
                        <span className="text-[10px] text-brand-muted">[Structured Object]</span>
                      ) : (
                        <span className="text-brand-slate text-[11px] truncate max-w-xs block">{String(s.value)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      {typeof s.value !== 'boolean' && (
                        <button onClick={() => startEdit(s)} className="px-2.5 py-1 rounded-md border border-brand-text bg-canvas-card hover:bg-brand-text hover:text-white text-brand-text font-semibold transition">
                          সম্পাদনা
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

      {/* Edit Modal */}
      {editingSetting && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dossier-card-elevated rounded-md max-w-md w-full p-6 border-t-4 border-t-brand-ochre space-y-4">
            <h3 className="font-serif text-base font-bold text-brand-text flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-brand-ochre" />
              <span>মান সম্পাদনা করুন</span>
            </h3>
            <p className="text-xs font-mono text-brand-ochre font-bold">{editingSetting.key}</p>
            <div>
              <label className="block font-semibold text-brand-text mb-1">নতুন মান নির্ধারণ করুন *</label>
              <input type="text" required value={editValue} onChange={(e) => setEditValue(e.target.value)} className="editorial-input px-3 py-2 font-mono" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
              <button type="button" onClick={() => setEditingSetting(null)} className="px-4 py-2 rounded-md border border-canvas-border bg-canvas font-semibold">
                বাতিল
              </button>
              <button type="button" onClick={() => handleSaveClick(editingSetting)} disabled={actionLoading} className="px-5 py-2 rounded-md bg-brand-text text-white font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>যাচাই ও সংরক্ষণ</span>
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
  );
}
