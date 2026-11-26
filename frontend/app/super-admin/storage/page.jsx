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
      if (!res.ok) throw new Error(isBn ? 'স্টোরেজ স্থিতি লোড করা যায়নি' : 'Failed to load storage status');
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
      if (!res.ok) throw new Error(data.message || (isBn ? 'ফোল্ডার ইনিশিয়ালাইজেশন ব্যর্থ হয়েছে' : 'Folder initialization failed'));

      setAlertMsg({ type: 'success', text: isBn ? 'গুগল ড্রাইভ অ্যাপ্লিকেশন ফোল্ডারসমূহ সফলভাবে কনফিগার হয়েছে' : 'Storage folders provisioned successfully' });
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
        throw new Error(isBn ? 'গুগল ড্রাইভ অথোরাইজেশন ইউআরএল পাওয়া যায়নি' : 'Authorization URL not found');
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
      setActionLoading(false);
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
              <HardDrive className="w-6 h-6 text-brand-blue" />
              <span>{isBn ? 'গুগল ড্রাইভ এনক্রিপ্টেড এভিডেন্স স্টোরেজ' : 'Google Drive Evidence Storage Vault'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isBn
                ? 'মানবাধিকার ডিজিটাল আলামত, প্রমাণপত্র ও ভিডিও আর্কাইভের ক্লাউড রিপোজিটরি স্থিতি।'
                : 'Cloud repository telemetry for digital evidence, documents, and archived footage.'}
            </p>
          </div>

          <button onClick={fetchStorageStatus} className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 self-start sm:self-auto">
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

        <div className="dossier-card-elevated p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                {isBn ? 'প্রোভাইডার সংযোগ' : 'Provider Connection'}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold text-brand-navy dark:text-white capitalize">
                  {storageStatus?.provider || 'Google Drive API'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                  storageStatus?.isConfigured
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  {storageStatus?.isConfigured
                    ? (isBn ? 'সংযুক্ত ও সচল' : 'CONFIGURED & ONLINE')
                    : (isBn ? 'অথোরাইজেশন বাকি' : 'PENDING AUTHORIZATION')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAuthorizeDrive}
                disabled={actionLoading}
                className="px-4 py-2 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isBn ? 'ড্রাইভ একাউন্ট অথোরাইজ করুন' : 'Authorize Drive Account'}</span>
              </button>
              <button
                onClick={handleInitFolders}
                disabled={actionLoading}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-navy dark:text-white font-semibold flex items-center gap-1.5 transition"
              >
                <FolderCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? 'ফোল্ডার ইনিশিয়ালাইজ' : 'Initialize Folders'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-brand-blue" />
              <span>{isBn ? 'এনক্রিপ্টেড ফোল্ডার ভল্ট ম্যাপিং' : 'Encrypted Folder Vault Mapping'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-brand-navy dark:text-white font-sans font-bold block mb-1">
                  {isBn ? 'রুট ফোল্ডার (Root Folder ID)' : 'Root Folder ID'}
                </span>
                <span className="text-slate-500 break-all">{storageStatus?.folders?.root || 'None'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <span className="text-amber-700 dark:text-amber-400 font-sans font-bold block mb-1">
                  {isBn ? 'কোয়ারেন্টাইন ভল্ট (Quarantine)' : 'Quarantine Vault'}
                </span>
                <span className="text-slate-500 break-all">{storageStatus?.folders?.quarantine || 'None'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <span className="text-emerald-700 dark:text-emerald-400 font-sans font-bold block mb-1">
                  {isBn ? 'ভেরিফাইড ক্লিন ভল্ট (Clean)' : 'Verified Clean Vault'}
                </span>
                <span className="text-slate-500 break-all">{storageStatus?.folders?.clean || 'None'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <span className="text-brand-blue dark:text-blue-400 font-sans font-bold block mb-1">
                  {isBn ? 'পাবলিক ডিসক্লোজার ভল্ট (Public)' : 'Public Disclosure Vault'}
                </span>
                <span className="text-slate-500 break-all">{storageStatus?.folders?.public || 'None'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F4F8FF] dark:bg-slate-900 border border-blue-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-bold block text-brand-navy dark:text-white">
              {isBn ? 'সুরক্ষা ও নিরাপত্তা আর্কিটেকচার:' : 'Storage Security Architecture:'}
            </span>
            <p className="leading-relaxed">
              {isBn
                ? 'নাগরিকদের আপলোড করা প্রতিটি ফাইল সরাসরি কোয়ারেন্টাইন ফোল্ডারে যায় এবং স্বয়ংক্রিয় ম্যালওয়্যার ও SHA-256 চেকার পাস করার পর ক্লিন ভোল্টে স্থানান্তরিত হয়।'
                : 'Every uploaded file enters quarantine first and is moved to the clean vault only after automated malware and SHA-256 integrity checks pass.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
