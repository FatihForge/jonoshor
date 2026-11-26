'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

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
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6 text-xs">
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ড্যাশবোর্ডে ফিরুন</span>
        </Link>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-canvas-border space-y-4">
        <h1 className="text-xl font-bold text-brand-text flex items-center gap-2 pb-3 border-b border-canvas-border">
          <Bell className="w-5 h-5 text-brand-amber" />
          <span>নোটিফিকেশন সেন্টার</span>
        </h1>

        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n._id} className="p-4 rounded-xl bg-canvas-card border border-canvas-border space-y-1">
                <div className="font-bold text-brand-text">{n.title}</div>
                <div className="text-brand-slate leading-relaxed">{n.message}</div>
                <div className="text-[10px] text-brand-slate/80 mt-1">
                  {new Date(n.createdAt).toLocaleDateString('bn-BD')}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-brand-slate">কোনো নতুন নোটিফিকেশন নেই</div>
          )}
        </div>
      </div>
    </div>
  );
}
