'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HardDrive, ShieldCheck, ShieldAlert, ArrowLeft, RefreshCw, 
  CheckCircle2, AlertTriangle, ExternalLink, FolderCheck, Lock
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
      const res = await fetch('/api/v1/super-admin/storage/google-drive/status', {
        credentials: 'include',
      });
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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ফোল্ডার ইনিশিয়ালাইজেশন ব্যর্থ হয়েছে');

      setAlertMsg({ 
        type: 'success', 
        text: isBn ? 'গুগল ড্রাইভ অ্যাপ্লিকেশন ফোল্ডারসমূহ সফলভাবে কনফিগার হয়েছে' : 'Application storage folders successfully provisioned' 
      });
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
        headers: { 'Accept': 'application/json' }
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
                <HardDrive className="w-6 h-6 text-cyan-400" />
                {isBn ? 'গুগল ড্রাইভ এনক্রিপ্টেড এভিডেন্স স্টোরেজ' : 'Google Drive Evidence Storage Vault'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'মানবাধিকার ডিজিটাল আলামত, প্রমাণপত্র ও ভিডিও আর্কাইভের ক্লাউড রিপোজিটরি স্থিতি।' 
                  : 'Multi-vault storage architecture: quarantine, verified clean, and public disclosure.'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchStorageStatus}
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

        {/* Storage State Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/40 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                {isBn ? 'প্রোভাইডার সংযোগ' : 'Provider Connection'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-100 capitalize">
                  {storageStatus?.provider || 'Google Drive API'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  storageStatus?.isConfigured
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-800 text-amber-300'
                }`}>
                  {storageStatus?.isConfigured 
                    ? (isBn ? 'সক্রিয় ও সংযুক্ত' : 'Configured & Online') 
                    : (isBn ? 'কনফিগারেশন অপেক্ষমান' : 'Pending Authorization')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAuthorizeDrive}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isBn ? 'ড্রাইভ একাউন্ট অথোরাইজ করুন' : 'Authorize Dedicated Drive'}
              </button>
              <button
                onClick={handleInitFolders}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition"
              >
                <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isBn ? 'ফোল্ডার ইনিশিয়ালাইজ' : 'Initialize Folders'}
              </button>
            </div>
          </div>

          {/* Secure Multi-Vault Folder Architecture */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              {isBn ? 'এনক্রিপ্টেড ফোল্ডার ভল্ট ম্যাপিং' : 'Vault Folder Hierarchy'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 font-sans block mb-1 font-medium">{isBn ? 'রুট ফোল্ডার (Root Folder ID)' : 'Root Storage Folder ID'}</span>
                <span className="text-slate-200 break-all">{storageStatus?.folders?.root || 'None'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-900/30">
                <span className="text-amber-400 font-sans block mb-1 font-medium">{isBn ? 'কোয়ারেন্টাইন ভল্ট (Quarantine Vault)' : 'Quarantine Vault (Malware Scanning)'}</span>
                <span className="text-slate-200 break-all">{storageStatus?.folders?.quarantine || 'None'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-900/30">
                <span className="text-emerald-400 font-sans block mb-1 font-medium">{isBn ? 'ভেরিফাইড ক্লিন ভল্ট (Clean Vault)' : 'Verified Clean Evidence Vault'}</span>
                <span className="text-slate-200 break-all">{storageStatus?.folders?.clean || 'None'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-900/30">
                <span className="text-teal-400 font-sans block mb-1 font-medium">{isBn ? 'পাবলিক ডিসক্লোজার ভল্ট (Public Vault)' : 'Public Disclosure Evidence Vault'}</span>
                <span className="text-slate-200 break-all">{storageStatus?.folders?.public || 'None'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/30 text-cyan-300/80 text-xs space-y-1">
            <span className="font-semibold block text-cyan-300">
              {isBn ? 'সুরক্ষা ও নিরাপত্তা আর্কিটেকচার:' : 'Evidence Security Guarantee:'}
            </span>
            <p>
              {isBn 
                ? 'নাগরিকদের আপলোড করা প্রতিটি ফাইল সরাসরি কোয়ারেন্টাইন ফোল্ডারে যায় এবং স্বয়ংক্রিয় ম্যালওয়্যার ও SHA-256 চেকার পাস করার পর ক্লিন ভোল্টে স্থানান্তরিত হয়।' 
                : 'Every evidence file is initially isolated in quarantine, verified by automated malware scanning and SHA-256 hashes, before caseworkers can access it.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
