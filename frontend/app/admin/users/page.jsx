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
      if (!res.ok) throw new Error(isBn ? 'ব্যবহারকারী তালিকা লোড করতে ব্যর্থ হয়েছে' : 'Failed to load citizen accounts');
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
      if (!res.ok) throw new Error(data.message || (isBn ? 'ব্যবহারকারীর স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' : 'Failed to update user status'));

      setAlertMsg({ type: 'success', text: isBn ? 'ব্যবহারকারীর স্থিতি সফলভাবে হালনাগাদ করা হয়েছে' : 'User status updated successfully' });
      setStatusModal({ open: false, user: null, status: 'active', reason: '' });
      fetchUsers();
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
              <Users className="w-6 h-6 text-brand-blue" />
              <span>{isBn ? 'ব্যবহারকারী পরিচালনা' : 'User Management'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isBn ? 'নিবন্ধিত ব্যবহারকারীদের অ্যাকাউন্টের অবস্থা ও অ্যাক্সেস নিয়ন্ত্রণ পর্যবেক্ষণ করুন।' : 'Manage user accounts, view verification status, and manage access controls.'}
            </p>
          </div>

          <button onClick={fetchUsers} className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 self-start sm:self-auto">
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

        <div className="dossier-card p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                placeholder={isBn ? 'নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name, email, or phone...'}
                className="editorial-input pl-9 pr-3 py-2"
              />
            </div>
            <button onClick={() => { setPage(1); fetchUsers(); }} className="px-5 py-2 bg-brand-blue hover:bg-brand-blueDark text-white font-bold rounded-full">
              {isBn ? 'অনুসন্ধান' : 'Search'}
            </button>
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="editorial-input px-3 py-2">
            <option value="">{isBn ? 'সকল অ্যাকাউন্ট স্ট্যাটাস' : 'All Account Statuses'}</option>
            <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
            <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
            <option value="blocked">{isBn ? 'নিষিদ্ধ (Blocked)' : 'Blocked'}</option>
          </select>
        </div>

        <div className="dossier-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">{isBn ? 'ব্যবহারকারীর তথ্য' : 'User Information'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'যোগাযোগ' : 'Contact'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'নিবন্ধন তারিখ' : 'Joined Date'}</th>
                  <th className="px-4 py-3.5 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400">{isBn ? 'কোনো ব্যবহারকারী পাওয়া যায়নি' : 'No users found'}</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-brand-navy dark:text-white">{u.fullName || (isBn ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous')}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {u._id.slice(-8)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-brand-navy dark:text-slate-200">{u.email}</div>
                        <div className="text-[10px] font-mono text-slate-400">{u.mobile || (isBn ? 'মোবাইল নেই' : 'No mobile')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                          (u.status || u.accountStatus || 'active') === 'active'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : (u.status || u.accountStatus) === 'suspended'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          {(u.status || u.accountStatus || 'active') === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {u.status || u.accountStatus || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US') : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setStatusModal({ open: true, user: u, status: u.status || u.accountStatus || 'active', reason: '' })}
                          className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-brand-blue bg-white dark:bg-slate-900 text-brand-navy dark:text-white font-semibold transition"
                        >
                          {isBn ? 'স্ট্যাটাস বদলান' : 'Change Status'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {statusModal.open && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="dossier-card-elevated rounded-3xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{isBn ? 'অ্যাকাউন্ট স্থিতি পরিবর্তন' : 'Change Account Status'}</span>
              </h3>
              <p className="text-xs font-mono text-slate-500">{statusModal.user?.fullName} ({statusModal.user?.email})</p>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    {isBn ? 'নতুন স্ট্যাটাস নির্ধারণ করুন' : 'Select New Status'}
                  </label>
                  <select value={statusModal.status} onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })} className="editorial-input px-3 py-2">
                    <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
                    <option value="blocked">{isBn ? 'নিষিদ্ধ (Blocked)' : 'Blocked'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    {isBn ? 'অডিট কারণ *' : 'Audit Reason *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={statusModal.reason}
                    onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                    className="editorial-input px-3 py-2"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setStatusModal({ open: false, user: null, status: 'active', reason: '' })} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-full bg-brand-blue text-white font-bold">
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
