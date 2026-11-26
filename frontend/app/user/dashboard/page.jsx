'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Plus, Clock, AlertCircle, MessageSquare, Bell, User, Eye,
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function UserDashboardPage() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/v1/user/complaints', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error(isBn ? 'অভিযোগ তালিকা লোড করা যায়নি। অনুগ্রহ করে লগইন করুন।' : 'Could not load complaints. Please sign in.');
        return r.json();
      })
      .then((d) => setComplaints(d.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isBn]);

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
              {isBn ? 'নাগরিক কেস ট্র্যাকার' : 'CITIZEN CASE TRACKER'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white mt-1">
              {isBn ? 'নাগরিক ড্যাশবোর্ড' : 'Citizen Dashboard'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {isBn
                ? 'আপনার জমাকৃত অভিযোগের লাইভ অবস্থা, বার্তা ও আইনি অগ্রগতি পর্যবেক্ষণ করুন।'
                : 'Monitor live review status, encrypted messages, and legal progress of your filings.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/user/messages" className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-blue text-xs font-semibold text-brand-navy dark:text-slate-200">
              <MessageSquare className="w-3.5 h-3.5 text-brand-blue" />
              <span>{isBn ? 'বার্তা বিনিময়' : 'Messages'}</span>
            </Link>
            <Link href="/user/notifications" className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-blue text-xs font-semibold text-brand-navy dark:text-slate-200">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>{isBn ? 'নোটিফিকেশন' : 'Notifications'}</span>
            </Link>
            <Link href="/user/profile" className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-blue text-xs font-semibold text-brand-navy dark:text-slate-200">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? 'প্রোফাইল ও নিরাপত্তা' : 'Profile & Security'}</span>
            </Link>
            <Link href="/complaints/new" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold shadow-md shadow-blue-600/20">
              <Plus className="w-3.5 h-3.5" />
              <span>{isBn ? 'নতুন অভিযোগ' : 'New Complaint'}</span>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-navy dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-blue" />
            <span>
              {isBn
                ? `আমার জমাকৃত অভিযোগ তালিকা (${complaints.length})`
                : `My Submitted Complaints (${complaints.length})`}
            </span>
          </h2>

          {loading ? (
            <div className="dossier-card p-12 rounded-2xl text-center text-xs text-slate-500">
              {isBn ? 'তথ্য লোড হচ্ছে...' : 'Loading records...'}
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : complaints.length > 0 ? (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div key={c._id} className="dossier-card p-5 rounded-2xl hover:border-brand-blue transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold uppercase text-[10px] border ${
                        c.status === 'verified'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : c.status === 'under_review' || c.status === 'screening'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950/50 text-brand-blue dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      }`}>
                        {c.status || 'submitted'}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {isBn ? 'জমা: ' : 'Filed: '}
                        {new Date(c.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>
                    <div className="font-bold text-base text-brand-navy dark:text-white line-clamp-1">
                      {c.incident?.description?.substring(0, 90) || (isBn ? 'অভিযোগ বিস্তারিত' : 'Complaint details')}...
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                      CATEGORY: {c.category?.primary || 'N/A'} • DISTRICT: {c.location?.districtId || 'Dhaka'}
                    </div>
                  </div>

                  <Link href={`/user/complaints/${c._id}`} className="px-4 py-2 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ট্র্যাক ও পরিচালনা' : 'Track & Manage'}</span>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="dossier-card p-14 rounded-3xl text-center space-y-4">
              <Clock className="w-10 h-10 text-brand-blue/50 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-brand-navy dark:text-white text-base">
                  {isBn ? 'কোনো অভিযোগ জমা দেওয়া হয়নি' : 'No Complaints Filed Yet'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {isBn
                    ? 'আপনি এখনও কোনো অভিযোগ দাখিল করেননি। আপনার বা পরিচিত কারও অধিকার ক্ষুণ্ণ হলে নিরাপদ অভিযোগ জমা দিন।'
                    : 'You have not filed any complaints yet. Submit an encrypted report if your rights or someone else’s were violated.'}
                </p>
              </div>
              <Link href="/complaints/new" className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md">
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'প্রথম অভিযোগ দাখিল করুন' : 'Submit First Complaint'}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
