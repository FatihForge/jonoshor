'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, UserX, UserCheck, ShieldAlert, Search,
  ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminUsersPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [statusModal, setStatusModal] = useState({ open: false, user: null, status: 'active', reason: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search }),
      });

      const res = await fetch(`/api/v1/admin/users?${query.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('ব্যবহারকারী তালিকা লোড করতে ব্যর্থ হয়েছে');
      const data = await res.json();
      setUsers(data.data || []);
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

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/v1/admin/users/${statusModal.user._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ status: statusModal.status, reason: statusModal.reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ব্যবহারকারীর স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'ব্যবহারকারীর স্থিতি সফলভাবে হালনাগাদ করা হয়েছে' : 'User status updated' });
      setStatusModal({ open: false, user: null, status: 'active', reason: '' });
      fetchUsers();
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
            <Users className="w-6 h-6 text-brand-pine" />
            <span>{isBn ? 'নাগরিক ব্যবহারকারী অ্যাকাউন্ট পরিচালনা' : 'Citizen User Account Management'}</span>
          </h1>
          <p className="text-brand-slate">নিবন্ধিত নাগরিক অ্যাকাউন্টের নিরাপত্তা স্থিতি ও অধিকার পর্যবেক্ষণ করুন।</p>
        </div>

        <button onClick={fetchUsers} className="p-2 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle self-start sm:self-auto">
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

      {/* Search & Filters */}
      <div className="dossier-card p-4 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-brand-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              placeholder="নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন..."
              className="editorial-input pl-9 pr-3 py-2"
            />
          </div>
          <button onClick={() => { setPage(1); fetchUsers(); }} className="px-4 py-2 bg-brand-text hover:bg-black text-white font-bold rounded-md">
            অনুসন্ধান
          </button>
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="editorial-input px-3 py-2">
          <option value="">সকল অ্যাকাউন্ট স্ট্যাটাস</option>
          <option value="active">সক্রিয় (Active)</option>
          <option value="suspended">স্থগিত (Suspended)</option>
          <option value="blocked">নিষিদ্ধ (Blocked)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="dossier-card rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-subtle text-brand-text font-bold border-b border-canvas-border uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">নাগরিকের তথ্য</th>
                <th className="px-4 py-3.5">যোগাযোগ</th>
                <th className="px-4 py-3.5">স্ট্যাটাস</th>
                <th className="px-4 py-3.5">নিবন্ধন তারিখ</th>
                <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-border">
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-brand-muted">লোড হচ্ছে...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="py-12 text-center text-brand-muted">কোনো ব্যবহারকারী পাওয়া যায়নি</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-canvas-hover transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-brand-text">{u.fullName || 'Anonymous Citizen'}</div>
                      <div className="text-[10px] text-brand-muted font-mono">ID: {u._id.slice(-8)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-brand-text">{u.email}</div>
                      <div className="text-[10px] font-mono text-brand-muted">{u.mobile || 'No mobile'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                        (u.status || u.accountStatus || 'active') === 'active'
                          ? 'bg-emerald-50 border-emerald-200 text-brand-pine'
                          : (u.status || u.accountStatus) === 'suspended'
                          ? 'bg-amber-50 border-amber-200 text-brand-ochre'
                          : 'bg-red-50 border-red-200 text-brand-crimson'
                      }`}>
                        {(u.status || u.accountStatus || 'active') === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {u.status || u.accountStatus || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-brand-muted">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setStatusModal({ open: true, user: u, status: u.status || u.accountStatus || 'active', reason: '' })}
                        className="px-3 py-1 rounded-md border border-brand-text bg-canvas-card hover:bg-brand-text hover:text-white text-brand-text font-semibold transition"
                      >
                        স্ট্যাটাস বদলান
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dossier-card-elevated rounded-md max-w-md w-full p-6 border-t-4 border-t-brand-ochre space-y-4">
            <h3 className="font-serif text-base font-bold text-brand-text flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-ochre" />
              <span>অ্যাকাউন্ট স্থিতি পরিবর্তন</span>
            </h3>
            <p className="text-xs font-mono text-brand-muted">{statusModal.user?.fullName} ({statusModal.user?.email})</p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-brand-text mb-1">নতুন স্ট্যাটাস নির্ধারণ করুন</label>
                <select value={statusModal.status} onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })} className="editorial-input px-3 py-2">
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="suspended">স্থগিত (Suspended)</option>
                  <option value="blocked">নিষিদ্ধ (Blocked)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-text mb-1">অডিট কারণ *</label>
                <textarea
                  rows={3}
                  required
                  value={statusModal.reason}
                  onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                  className="editorial-input px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
                <button type="button" onClick={() => setStatusModal({ open: false, user: null, status: 'active', reason: '' })} className="px-4 py-2 rounded-md border border-canvas-border bg-canvas font-semibold">
                  বাতিল
                </button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-md bg-brand-text text-white font-bold">
                  নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
