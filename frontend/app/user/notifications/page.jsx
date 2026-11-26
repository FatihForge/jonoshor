'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, ArrowLeft } from 'lucide-react';

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/user/notifications', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setNotifications(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-3xl space-y-6 text-xs">
        <div>
          <Link href="/user/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ডে ফিরুন</span>
          </Link>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-8 rounded-3xl space-y-4">
          <h1 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-5 h-5 text-brand-blue" />
            <span>নোটিফিকেশন সেন্টার</span>
          </h1>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="text-center py-12 text-slate-400">লোড হচ্ছে...</div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n._id} className="py-4 space-y-1">
                  <div className="font-bold text-brand-navy dark:text-white text-sm">{n.title}</div>
                  <div className="text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</div>
                  <div className="text-[10px] font-mono text-slate-400 pt-1">
                    {new Date(n.createdAt).toLocaleDateString('bn-BD')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">কোনো নতুন নোটিফিকেশন নেই</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
