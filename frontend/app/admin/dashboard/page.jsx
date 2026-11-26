'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, FileCheck, Users, Mail, ArrowRight, UserCheck,
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminDashboardPage() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/admin/dashboard', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setCounts(d.data?.counts || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const modules = [
    {
      href: '/admin/complaints',
      icon: FileText,
      code: '01 / TRIAGE',
      title: isBn ? 'অভিযোগ যাচাই পাইপলাইন' : 'Complaint Triage Pipeline',
      desc: isBn
        ? 'নাগরিকদের দাখিলকৃত অভিযোগ পর্যালোচনা, স্বার্থের সংঘাত (COI) ঘোষণা, সত্যতা যাচাই ও পাবলিক রিপোর্ট প্রকাশনা।'
        : 'Review citizen complaints, declare Conflict of Interest (COI), verify evidence, and publish public reports.',
    },
    {
      href: '/admin/evidence',
      icon: FileCheck,
      code: '02 / FORENSICS',
      title: isBn ? 'ডিজিটাল আলামত ও প্রমাণপত্র' : 'Digital Evidence & Forensics',
      desc: isBn
        ? 'ম্যালওয়্যার স্ক্যানকৃত ফাইলসমূহের ফরেনসিক পর্যালোচনা, রেডঅ্যাকশন নোট এবং পাবলিক ডিসক্লোজার অনুমোদন।'
        : 'Forensic inspection of malware-scanned uploads, redaction notes, and public disclosure clearance.',
    },
    {
      href: '/admin/join-us',
      icon: UserCheck,
      code: '03 / PANEL',
      title: isBn ? 'স্বেচ্ছাসেবক ও আইনজীবী আবেদন' : 'Volunteer & Lawyer Applications',
      desc: isBn
        ? 'আইনজীবী, সাংবাদিক ও চিকিৎসকদের আবেদন যাচাই, অভ্যন্তরীণ নোট সংযোজন ও CSV এক্সপোর্ট।'
        : 'Screen applications from lawyers, journalists, and doctors, add internal notes, and export CSVs.',
    },
    {
      href: '/admin/users',
      icon: Users,
      code: '04 / CITIZENS',
      title: isBn ? 'ব্যবহারকারী পরিচালনা' : 'User Management',
      desc: isBn
        ? 'নিবন্ধিত ব্যবহারকারীদের অ্যাকাউন্টের স্থিতি ও অ্যাক্সেস নিয়ন্ত্রণ।'
        : 'Manage registered user accounts, security status, and access controls.',
    },
    {
      href: '/admin/contact',
      icon: Mail,
      code: '05 / INBOX',
      title: isBn ? 'যোগাযোগ ও অনুসন্ধান ইনবক্স' : 'Contact & Inquiry Inbox',
      desc: isBn
        ? 'জনসাধারণ ও গণমাধ্যমের পাঠানো প্রশ্ন, ফিডব্যাক ও সহায়তা অনুরোধ ব্যবস্থাপনা।'
        : 'Manage public inquiries, media correspondence, feedback, and support tickets.',
    },
  ];

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl space-y-8 text-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
              {isBn ? 'কেসওয়ার্ক রিভিউ ওয়ার্কবেঞ্চ' : 'CASEWORKER REVIEW WORKBENCH'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white mt-1">
              {isBn ? 'অ্যাডমিন যাচাই ও কেস ম্যানেজমেন্ট কনসোল' : 'Admin Verification & Case Management Console'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {isBn
                ? 'মানবাধিকার অভিযোগের সত্যতা নিরীক্ষা, আলামত অনুমোদন ও জনস্বার্থ রিপোর্ট প্রকাশনা কেন্দ্র।'
                : 'Central workspace for verifying human rights complaints, approving evidence, and publishing public interest reports.'}
            </p>
          </div>

          <Link href="/admin/complaints" className="px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20">
            <span>{isBn ? 'রিভিউ কিউ খুলুন' : 'Open Review Queue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="dossier-card p-4 rounded-2xl space-y-1">
            <span className="font-mono text-[10px] uppercase text-slate-400 block">Total Filed</span>
            <div className="font-mono text-2xl font-extrabold text-brand-navy dark:text-white">{loading ? '—' : (counts?.total ?? 0)}</div>
            <span className="text-[11px] text-slate-500">{isBn ? 'মোট অভিযোগ' : 'Total Complaints'}</span>
          </div>
          <div className="dossier-card p-4 rounded-2xl space-y-1">
            <span className="font-mono text-[10px] uppercase text-amber-600 block">Submitted</span>
            <div className="font-mono text-2xl font-extrabold text-amber-600">{loading ? '—' : (counts?.submitted ?? 0)}</div>
            <span className="text-[11px] text-slate-500">{isBn ? 'নতুন জমা' : 'Newly Submitted'}</span>
          </div>
          <div className="dossier-card p-4 rounded-2xl space-y-1">
            <span className="font-mono text-[10px] uppercase text-brand-blue block">In Review</span>
            <div className="font-mono text-2xl font-extrabold text-brand-blue">{loading ? '—' : (counts?.pendingReview ?? 0)}</div>
            <span className="text-[11px] text-slate-500">{isBn ? 'পর্যালোচনাধীন' : 'Pending Review'}</span>
          </div>
          <div className="dossier-card p-4 rounded-2xl space-y-1">
            <span className="font-mono text-[10px] uppercase text-emerald-600 block">Verified</span>
            <div className="font-mono text-2xl font-extrabold text-emerald-600">{loading ? '—' : (counts?.verified ?? 0)}</div>
            <span className="text-[11px] text-slate-500">{isBn ? 'সত্যতা যাচাইকৃত' : 'Fact-Verified'}</span>
          </div>
          <div className="dossier-card p-4 rounded-2xl space-y-1 col-span-2 lg:col-span-1">
            <span className="font-mono text-[10px] uppercase text-rose-600 block">Published</span>
            <div className="font-mono text-2xl font-extrabold text-rose-600">{loading ? '—' : (counts?.published ?? 0)}</div>
            <span className="text-[11px] text-slate-500">{isBn ? 'জনস্বার্থে প্রকাশিত' : 'Publicly Published'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.href} href={m.href} className="dossier-card p-6 rounded-2xl hover:border-brand-blue transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">{m.code}</span>
                  </div>
                  <h2 className="text-base font-bold text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">{m.title}</h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">{m.desc}</p>
                </div>
                <div className="pt-2 flex items-center gap-1 font-bold text-brand-blue dark:text-blue-400 text-[11px]">
                  <span>{isBn ? 'মডিউল খুলুন' : 'Open Module'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
