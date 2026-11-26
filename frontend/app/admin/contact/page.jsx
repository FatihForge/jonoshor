'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, MessageSquare, ArrowLeft, RefreshCw, AlertTriangle, 
  CheckCircle2, Clock, CheckCheck, Trash2
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminContactInboxPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  // Selected message detail view
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

      const res = await fetch(`/api/v1/admin/contact?${query.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('বার্তা লোড করতে ব্যর্থ হয়েছে');
      const data = await res.json();
      setMessages(data.data || []);
      if (data.meta) {
        setTotal(data.meta.total || 0);
      }
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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes || selectedMsg?.adminNotes,
        }),
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
    <div className="min-h-screen bg-canvas-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Mail className="w-6 h-6 text-emerald-400" />
                {isBn ? 'যোগাযোগ ও নাগরিক অনুসন্ধান ইনবক্স' : 'Public Contact Inquiries Inbox'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'জনসাধারণের সাধারণ প্রশ্ন, ফিডব্যাক ও অনুসন্ধানের উত্তর পর্যালোচনা করুন।' 
                  : 'Review public inquiries, feedback, and support communications.'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchMessages}
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

        {/* Filter */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-wrap gap-4 items-center">
          <div className="w-full sm:w-64">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">{isBn ? 'সকল ইনবক্স বার্তা' : 'All Messages'}</option>
              <option value="unread">{isBn ? 'অপঠিত (Unread)' : 'Unread'}</option>
              <option value="in_progress">{isBn ? 'প্রক্রিয়াধীন (In Progress)' : 'In Progress'}</option>
              <option value="resolved">{isBn ? 'নিষ্পন্ন (Resolved)' : 'Resolved'}</option>
              <option value="spam">{isBn ? 'স্প্যাম (Spam)' : 'Spam'}</option>
            </select>
          </div>
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
          >
            {isBn ? 'ফিল্টার পরিষ্কার' : 'Clear'}
          </button>
        </div>

        {/* Table & Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">{isBn ? 'প্রেরক' : 'Sender'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'বিষয়' : 'Subject'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="px-4 py-3.5">{isBn ? 'তারিখ' : 'Date'}</th>
                    <th className="px-4 py-3.5 text-right">{isBn ? 'বিবরণ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        {isBn ? 'বার্তা লোড হচ্ছে...' : 'Loading inquiries...'}
                      </td>
                    </tr>
                  ) : messages.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        {isBn ? 'কোনো বার্তা নেই' : 'Inbox is empty'}
                      </td>
                    </tr>
                  ) : (
                    messages.map((m) => (
                      <tr
                        key={m._id}
                        onClick={() => { setSelectedMsg(m); setAdminNotes(m.adminNotes || ''); }}
                        className={`cursor-pointer transition ${
                          selectedMsg?._id === m._id ? 'bg-slate-800/70 border-l-2 border-emerald-500' : 'hover:bg-slate-850/40'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-100">{m.name || 'Anonymous'}</div>
                          <div className="text-[10px] text-slate-500">{m.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-200 truncate max-w-[200px]">{m.subject || 'No Subject'}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{m.message}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            m.status === 'resolved'
                              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                              : m.status === 'in_progress'
                              ? 'bg-teal-950/80 border-teal-800 text-teal-300'
                              : m.status === 'unread'
                              ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                              : 'bg-rose-950/80 border-rose-800 text-rose-300'
                          }`}>
                            {m.status || 'unread'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedMsg(m); setAdminNotes(m.adminNotes || ''); }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-medium"
                          >
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

          {/* Message Inspector Pane */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
            {selectedMsg ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-semibold text-slate-100">{selectedMsg.subject}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    <span>{selectedMsg.name}</span> &lt;{selectedMsg.email}&gt;
                    {selectedMsg.phone && <span> • {selectedMsg.phone}</span>}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {new Date(selectedMsg.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Message Body */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>

                {/* Status Switcher */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'ইনবক্স স্থিতি পরিবর্তন' : 'Update Status'}</label>
                  <select
                    value={selectedMsg.status || 'unread'}
                    onChange={(e) => handleStatusChange(selectedMsg._id, e.target.value)}
                    disabled={actionLoading}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="unread">{isBn ? 'অপঠিত (Unread)' : 'Unread'}</option>
                    <option value="in_progress">{isBn ? 'প্রক্রিয়াধীন (In Progress)' : 'In Progress'}</option>
                    <option value="resolved">{isBn ? 'নিষ্পন্ন (Resolved)' : 'Resolved'}</option>
                    <option value="spam">{isBn ? 'স্প্যাম (Spam)' : 'Spam'}</option>
                  </select>
                </div>

                {/* Internal Admin Note */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">{isBn ? 'অভ্যন্তরীণ সমাধান নোট' : 'Resolution / Internal Notes'}</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={isBn ? 'প্রদত্ত জবাব বা পদক্ষেপের বিবরণ লিখুন...' : 'Add notes on response or resolution...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleStatusChange(selectedMsg._id, selectedMsg.status || 'resolved')}
                    disabled={actionLoading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition"
                  >
                    {isBn ? 'নোট সংরক্ষণ করুন' : 'Save Notes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                {isBn ? 'কোনো বার্তা নির্বাচন করে বিস্তারিত দেখুন' : 'Select a message to view content'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
