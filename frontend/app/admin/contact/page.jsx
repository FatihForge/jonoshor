'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminContactInboxPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedMsg, setSelectedMsg] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/v1/admin/contact?${query.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('বার্তা লোড করতে ব্যর্থ হয়েছে');
      const data = await res.json();
      setMessages(data.data || []);
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

  const handleStatusChange = async (msgId, newStatus) => {
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/v1/admin/contact/${msgId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, adminNotes: adminNotes || selectedMsg?.adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'বার্তার স্ট্যাটাস পরিবর্তিত হয়েছে' : 'Message status updated' });
      fetchMessages();
      if (selectedMsg && selectedMsg._id === msgId) {
        setSelectedMsg({ ...selectedMsg, status: newStatus });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
      <div className="editorial-rule-top pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text font-semibold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ড্যাশবোর্ডে ফিরুন</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text flex items-center gap-2">
            <Mail className="w-6 h-6 text-brand-cobalt" />
            <span>{isBn ? 'যোগাযোগ ও নাগরিক অনুসন্ধান ইনবক্স' : 'Public Contact Inquiries Inbox'}</span>
          </h1>
          <p className="text-brand-slate">জনসাধারণের সাধারণ প্রশ্ন, ফিডব্যাক ও অনুসন্ধানের উত্তর পর্যালোচনা করুন।</p>
        </div>

        <button onClick={fetchMessages} className="p-2 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle self-start sm:self-auto">
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

      {/* Filter */}
      <div className="dossier-card p-4 rounded-md flex flex-wrap gap-3 items-center">
        <div className="w-full sm:w-64">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="editorial-input px-3 py-2">
            <option value="">সকল ইনবক্স বার্তা</option>
            <option value="unread">অপঠিত (Unread)</option>
            <option value="in_progress">প্রক্রিয়াধীন (In Progress)</option>
            <option value="resolved">নিষ্পন্ন (Resolved)</option>
            <option value="spam">স্প্যাম (Spam)</option>
          </select>
        </div>
        <button onClick={() => { setStatusFilter(''); setPage(1); }} className="px-4 py-2 border border-canvas-border bg-canvas hover:bg-canvas-subtle font-semibold rounded-md">
          ফিল্টার পরিষ্কার
        </button>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dossier-card rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas-subtle text-brand-text font-bold border-b border-canvas-border uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">প্রেরক</th>
                  <th className="px-4 py-3.5">বিষয়</th>
                  <th className="px-4 py-3.5">স্ট্যাটাস</th>
                  <th className="px-4 py-3.5">তারিখ</th>
                  <th className="px-4 py-3.5 text-right">বিবরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-border">
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center text-brand-muted">লোড হচ্ছে...</td></tr>
                ) : messages.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-brand-muted">কোনো বার্তা নেই</td></tr>
                ) : (
                  messages.map((m) => (
                    <tr
                      key={m._id}
                      onClick={() => { setSelectedMsg(m); setAdminNotes(m.adminNotes || ''); }}
                      className={`cursor-pointer transition ${
                        selectedMsg?._id === m._id ? 'bg-canvas-subtle border-l-4 border-l-brand-text' : 'hover:bg-canvas-hover'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-brand-text">{m.name || 'Anonymous'}</div>
                        <div className="text-[10px] font-mono text-brand-muted">{m.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-brand-text truncate max-w-[200px]">{m.subject || 'No Subject'}</div>
                        <div className="text-[11px] text-brand-slate truncate max-w-[200px]">{m.message}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                          m.status === 'resolved'
                            ? 'bg-emerald-50 border-emerald-200 text-brand-pine'
                            : m.status === 'in_progress'
                            ? 'bg-blue-50 border-blue-200 text-brand-cobalt'
                            : m.status === 'unread'
                            ? 'bg-amber-50 border-amber-200 text-brand-ochre'
                            : 'bg-red-50 border-red-200 text-brand-crimson'
                        }`}>
                          {m.status || 'unread'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-brand-muted">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedMsg(m); setAdminNotes(m.adminNotes || ''); }} className="px-2.5 py-1 rounded-md border border-canvas-border bg-canvas-card font-semibold">
                          পড়ুন
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dossier-card p-5 rounded-md space-y-4">
          {selectedMsg ? (
            <div className="space-y-4">
              <div className="border-b border-canvas-border pb-3">
                <h3 className="font-serif text-base font-bold text-brand-text">{selectedMsg.subject}</h3>
                <div className="text-xs font-mono text-brand-muted mt-1">
                  {selectedMsg.name} &lt;{selectedMsg.email}&gt;
                </div>
                <span className="text-[10px] font-mono text-brand-muted block mt-1">
                  {new Date(selectedMsg.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-canvas-border text-brand-text leading-relaxed whitespace-pre-wrap">
                {selectedMsg.message}
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">ইনবক্স স্থিতি পরিবর্তন</label>
                <select
                  value={selectedMsg.status || 'unread'}
                  onChange={(e) => handleStatusChange(selectedMsg._id, e.target.value)}
                  disabled={actionLoading}
                  className="editorial-input px-3 py-2"
                >
                  <option value="unread">অপঠিত (Unread)</option>
                  <option value="in_progress">প্রক্রিয়াধীন (In Progress)</option>
                  <option value="resolved">নিষ্পন্ন (Resolved)</option>
                  <option value="spam">স্প্যাম (Spam)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-brand-text">অভ্যন্তরীণ সমাধান নোট</label>
                <textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="editorial-input px-3 py-2" />
                <button
                  onClick={() => handleStatusChange(selectedMsg._id, selectedMsg.status || 'resolved')}
                  disabled={actionLoading}
                  className="w-full py-2 bg-brand-pine hover:bg-brand-pineDark text-white font-bold rounded-md transition"
                >
                  নোট সংরক্ষণ করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-brand-muted">
              কোনো বার্তা নির্বাচন করে বিস্তারিত দেখুন
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
