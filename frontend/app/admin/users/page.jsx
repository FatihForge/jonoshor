'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, UserX, UserCheck, ShieldAlert, Search, Filter, 
  ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, Lock
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminUsersPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status Change Modal
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

      const res = await fetch(`/api/v1/admin/users?${query.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('ব্যবহারকারী তালিকা লোড করতে ব্যর্থ হয়েছে');
      const data = await res.json();
      setUsers(data.data || []);
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

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/v1/admin/users/${statusModal.user._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          status: statusModal.status,
          reason: statusModal.reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ব্যবহারকারীর স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'ব্যবহারকারীর স্থিতি সফলভাবে হালনাগাদ করা হয়েছে' : 'User account status updated' });
      setStatusModal({ open: false, user: null, status: 'active', reason: '' });
      fetchUsers();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
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
                <Users className="w-6 h-6 text-emerald-400" />
                {isBn ? 'নাগরিক ব্যবহারকারী অ্যাকাউন্ট পরিচালনা' : 'Citizen User Account Management'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'নিবন্ধিত নাগরিক অ্যাকাউন্টের নিরাপত্তা স্থিতি ও অধিকার পর্যবেক্ষণ করুন।' 
                  : 'Manage registered citizen accounts, security status, and suspension governance.'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchUsers}
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

        {/* Filters & Search */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                placeholder={isBn ? 'নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name, email or phone...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => { setPage(1); fetchUsers(); }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
            >
              {isBn ? 'অনুসন্ধান' : 'Search'}
            </button>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">{isBn ? 'সকল অ্যাকাউন্ট স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
              <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
              <option value="blocked">{isBn ? 'নিষিদ্ধ (Blocked)' : 'Blocked'}</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">{isBn ? 'নাগরিকের তথ্য' : 'Citizen User'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'ইমেইল ও মোবাইল' : 'Contact'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'অ্যাকাউন্ট স্ট্যাটাস' : 'Status'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'নিবন্ধন তারিখ' : 'Registered At'}</th>
                  <th className="px-4 py-3.5 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      {isBn ? 'ব্যবহারকারীদের তথ্য লোড হচ্ছে...' : 'Loading users...'}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      {isBn ? 'কোনো ব্যবহারকারী পাওয়া যায়নি' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-850/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-100">{u.fullName || 'Anonymous Citizen'}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {u._id.slice(-8)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-300">{u.email}</div>
                        <div className="text-[10px] text-slate-500">{u.mobile || 'No mobile'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          u.status === 'active' || u.accountStatus === 'active'
                            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                            : u.status === 'suspended' || u.accountStatus === 'suspended'
                            ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                            : 'bg-rose-950/80 border-rose-800 text-rose-300'
                        }`}>
                          {u.status === 'active' || u.accountStatus === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {u.status || u.accountStatus || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setStatusModal({
                            open: true,
                            user: u,
                            status: u.status || u.accountStatus || 'active',
                            reason: '',
                          })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 text-[11px] font-medium transition"
                        >
                          {isBn ? 'স্ট্যাটাস বদলান' : 'Manage Status'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Change Modal */}
        {statusModal.open && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                {isBn ? 'ব্যবহারকারীর অ্যাকাউন্ট স্থিতি পরিবর্তন' : 'Update User Account Status'}
              </h3>
              <p className="text-xs text-slate-400">
                {statusModal.user?.fullName} ({statusModal.user?.email})
              </p>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">{isBn ? 'নতুন স্ট্যাটাস নির্ধারণ করুন' : 'New Account Status'}</label>
                  <select
                    value={statusModal.status}
                    onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="active">{isBn ? 'সক্রিয় (Active - Regular Access)' : 'Active'}</option>
                    <option value="suspended">{isBn ? 'স্থগিত (Suspended - Temporary Hold)' : 'Suspended'}</option>
                    <option value="blocked">{isBn ? 'নিষিদ্ধ (Blocked - Permanent Security Ban)' : 'Blocked'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{isBn ? 'পরিবর্তনের কারণ বা অডিট নোট *' : 'Reason / Audit Note *'}</label>
                  <textarea
                    rows={3}
                    required
                    value={statusModal.reason}
                    onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                    placeholder={isBn ? 'অডিট ট্রেইলের জন্য সুনির্দিষ্ট কারণ লিখুন...' : 'Specify reason for immutable audit trail...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStatusModal({ open: false, user: null, status: 'active', reason: '' })}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    {actionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {isBn ? 'নিশ্চিত করুন' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
