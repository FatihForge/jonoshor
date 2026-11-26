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
      if (!res.ok) throw new Error(isBn ? 'বার্তা লোড করতে ব্যর্থ হয়েছে' : 'Failed to load messages');
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
      if (!res.ok) throw new Error(data.message || (isBn ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' : 'Status update failed'));

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
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-semibold hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-brand-blue" />
              <span>{isBn ? 'যোগাযোগ ও নাগরিক অনুসন্ধান ইনবক্স' : 'Public Contact Inquiries Inbox'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isBn ? 'জনসাধারণের সাধারণ প্রশ্ন, ফিডব্যাক ও অনুসন্ধানের উত্তর পর্যালোচনা করুন।' : 'Review and respond to public questions, feedback, and inquiries.'}
            </p>
          </div>

          <button onClick={fetchMessages} className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 self-start sm:self-auto">
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

        <div className="dossier-card p-4 rounded-2xl flex flex-wrap gap-3 items-center">
          <div className="w-full sm:w-64">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="editorial-input px-3 py-2">
              <option value="">{isBn ? 'সকল ইনবক্স বার্তা' : 'All Inbox Messages'}</option>
              <option value="unread">{isBn ? 'অপঠিত (Unread)' : 'Unread'}</option>
              <option value="in_progress">{isBn ? 'প্রক্রিয়াধীন (In Progress)' : 'In Progress'}</option>
              <option value="resolved">{isBn ? 'নিষ্পন্ন (Resolved)' : 'Resolved'}</option>
              <option value="spam">{isBn ? 'স্প্যাম (Spam)' : 'Spam'}</option>
            </select>
          </div>
          <button onClick={() => { setStatusFilter(''); setPage(1); }} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold rounded-full">
            {isBn ? 'ফিল্টার পরিষ্কার' : 'Clear Filter'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 dossier-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">{isBn ? 'প্রেরক' : 'Sender'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'বিষয়' : 'Subject'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'তারিখ' : 'Date'}</th>
                    <th className="px-4 py-3.5 text-right">{isBn ? 'বিবরণ' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan="5" className="py-12 text-center text-slate-400">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</td></tr>
                  ) : messages.length === 0 ? (
                    <tr><td colSpan="5" className="py-12 text-center text-slate-400">{isBn ? 'কোনো বার্তা নেই' : 'No messages found'}</td></tr>
                  ) : (
                    messages.map((m) => (
                      <tr
                        key={m._id}
                        onClick={() => { setSelectedMsg(m); setAdminNotes(m.adminNotes || ''); }}
                        className={`cursor-pointer transition ${
                          selectedMsg?._id === m._id ? 'bg-blue-50/70 dark:bg-slate-800 border-l-4 border-l-brand-blue' : 'hover:bg-blue-50/30 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-brand-navy dark:text-white">{m.name || 'Anonymous'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{m.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-brand-navy dark:text-white truncate max-w-[200px]">{m.subject || (isBn ? 'বিষয় নেই' : 'No Subject')}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{m.message}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                            m.status === 'resolved'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : m.status === 'in_progress'
                              ? 'bg-blue-50 border-blue-200 text-brand-blue'
                              : m.status === 'unread'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}>
                            {m.status || 'unread'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US') : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedMsg(m); setAdminNotes(m.adminNotes || ''); }} className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold">
                            {isBn ? 'পড়ুন' : 'Read'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dossier-card p-5 rounded-2xl space-y-4">
            {selectedMsg ? (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-brand-navy dark:text-white">{selectedMsg.subject}</h3>
                  <div className="text-xs font-mono text-slate-500 mt-1">
                    {selectedMsg.name} &lt;{selectedMsg.email}&gt;
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block mt-1">
                    {new Date(selectedMsg.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F4F8FF] dark:bg-slate-900 border border-blue-100 dark:border-slate-800 text-brand-navy dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>

                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    {isBn ? 'ইনবক্স স্থিতি পরিবর্তন' : 'Update Inbox Status'}
                  </label>
                  <select
                    value={selectedMsg.status || 'unread'}
                    onChange={(e) => handleStatusChange(selectedMsg._id, e.target.value)}
                    disabled={actionLoading}
                    className="editorial-input px-3 py-2"
                  >
                    <option value="unread">{isBn ? 'অপঠিত (Unread)' : 'Unread'}</option>
                    <option value="in_progress">{isBn ? 'প্রক্রিয়াধীন (In Progress)' : 'In Progress'}</option>
                    <option value="resolved">{isBn ? 'নিষ্পন্ন (Resolved)' : 'Resolved'}</option>
                    <option value="spam">{isBn ? 'স্প্যাম (Spam)' : 'Spam'}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-brand-navy dark:text-slate-200">
                    {isBn ? 'অভ্যন্তরীণ সমাধান নোট' : 'Internal Resolution Notes'}
                  </label>
                  <textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="editorial-input px-3 py-2" />
                  <button
                    onClick={() => handleStatusChange(selectedMsg._id, selectedMsg.status || 'resolved')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-brand-blue hover:bg-brand-blueDark text-white font-bold rounded-full transition"
                  >
                    {isBn ? 'নোট সংরক্ষণ করুন' : 'Save Notes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                {isBn ? 'কোনো বার্তা নির্বাচন করে বিস্তারিত দেখুন' : 'Select a message to read details'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
