'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HardDrive, ArrowLeft, RefreshCw, CheckCircle2,
  AlertTriangle, ExternalLink, FolderCheck
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function SuperAdminStoragePage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [storageStatus, setStorageStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStorageStatus();
  }, []);

  const fetchStorageStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/super-admin/storage/google-drive/status', { credentials: 'include' });
      if (!res.ok) throw new Error('স্টোরেজ স্থিতি লোড করা যায়নি');
      const data = await res.json();
      setStorageStatus(data.data || data);
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

  const handleInitFolders = async () => {
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch('/api/v1/super-admin/storage/google-drive/init-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ফোল্ডার ইনিশিয়ালাইজেশন ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'গুগল ড্রাইভ অ্যাপ্লিকেশন ফোল্ডারসমূহ সফলভাবে কনফিগার হয়েছে' : 'Storage folders provisioned' });
      fetchStorageStatus();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuthorizeDrive = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/v1/super-admin/storage/google-drive/authorize', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      const url = data.data?.authUrl || data.authUrl;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('গুগল ড্রাইভ অথোরাইজেশন ইউআরএল পাওয়া যায়নি');
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
      setActionLoading(false);
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
            <HardDrive className="w-6 h-6 text-brand-cobalt" />
            <span>{isBn ? 'গুগল ড্রাইভ এনক্রিপ্টেড এভিডেন্স স্টোরেজ' : 'Google Drive Evidence Storage Vault'}</span>
          </h1>
          <p className="text-brand-slate">মানবাধিকার ডিজিটাল আলামত, প্রমাণপত্র ও ভিডিও আর্কাইভের ক্লাউড রিপোজিটরি স্থিতি।</p>
        </div>

        <button onClick={fetchStorageStatus} className="p-2 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle self-start sm:self-auto">
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

      {/* Storage Card */}
      <div className="dossier-card-elevated p-6 sm:p-8 rounded-md border-t-4 border-t-brand-cobalt space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-canvas-border">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-muted block mb-1">
              Provider Connection
            </span>
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-lg font-bold text-brand-text capitalize">
                {storageStatus?.provider || 'Google Drive API'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                storageStatus?.isConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-brand-pine'
                  : 'bg-amber-50 border-amber-200 text-brand-ochre'
              }`}>
                {storageStatus?.isConfigured ? 'CONFIGURED & ONLINE' : 'PENDING AUTHORIZATION'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAuthorizeDrive}
              disabled={actionLoading}
              className="px-4 py-2 rounded-md bg-brand-text hover:bg-black text-white font-bold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ড্রাইভ একাউন্ট অথোরাইজ করুন</span>
            </button>
            <button
              onClick={handleInitFolders}
              disabled={actionLoading}
              className="px-4 py-2 rounded-md border border-canvas-border bg-canvas hover:bg-canvas-subtle text-brand-text font-semibold flex items-center gap-1.5 transition"
            >
              <FolderCheck className="w-3.5 h-3.5 text-brand-pine" />
              <span>ফোল্ডার ইনিশিয়ালাইজ</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-brand-text flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-brand-cobalt" />
            <span>এনক্রিপ্টেড ফোল্ডার ভল্ট ম্যাপিং</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-md bg-canvas border border-canvas-border">
              <span className="text-brand-text font-sans font-bold block mb-1">রুট ফোল্ডার (Root Folder ID)</span>
              <span className="text-brand-slate break-all">{storageStatus?.folders?.root || 'None'}</span>
            </div>
            <div className="p-4 rounded-md bg-amber-50/60 border border-amber-200">
              <span className="text-brand-ochre font-sans font-bold block mb-1">কোয়ারেন্টাইন ভল্ট (Quarantine)</span>
              <span className="text-brand-slate break-all">{storageStatus?.folders?.quarantine || 'None'}</span>
            </div>
            <div className="p-4 rounded-md bg-emerald-50/60 border border-emerald-200">
              <span className="text-brand-pine font-sans font-bold block mb-1">ভেরিফাইড ক্লিন ভল্ট (Clean)</span>
              <span className="text-brand-slate break-all">{storageStatus?.folders?.clean || 'None'}</span>
            </div>
            <div className="p-4 rounded-md bg-blue-50/60 border border-blue-200">
              <span className="text-brand-cobalt font-sans font-bold block mb-1">পাবলিক ডিসক্লোজার ভল্ট (Public)</span>
              <span className="text-brand-slate break-all">{storageStatus?.folders?.public || 'None'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-canvas-subtle border border-canvas-border text-brand-slate space-y-1">
          <span className="font-bold block text-brand-text">সুরক্ষা ও নিরাপত্তা আর্কিটেকচার:</span>
          <p className="leading-relaxed">
            নাগরিকদের আপলোড করা প্রতিটি ফাইল সরাসরি কোয়ারেন্টাইন ফোল্ডারে যায় এবং স্বয়ংক্রিয় ম্যালওয়্যার ও SHA-256 চেকার পাস করার পর ক্লিন ভোল্টে স্থানান্তরিত হয়।
          </p>
        </div>
      </div>
    </div>
  );
}
