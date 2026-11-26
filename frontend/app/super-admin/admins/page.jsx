'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, UserPlus, Shield, ArrowLeft, RefreshCw,
  CheckCircle2, AlertTriangle, Lock, CheckSquare, Square
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';
import ReAuthModal from '../../components/ReAuthModal';

export default function SuperAdminAdminsPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [admins, setAdmins] = useState([]);
  const [permissionsList, setPermissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const [createModal, setCreateModal] = useState({
    open: false, fullName: '', email: '', password: '', mobile: '', permissions: [],
  });
  const [permModal, setPermModal] = useState({ open: false, admin: null, selectedPermissions: [] });
  const [statusModal, setStatusModal] = useState({ open: false, admin: null, accountStatus: 'active' });

  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchAdminsAndPermissions();
  }, []);

  const fetchAdminsAndPermissions = async () => {
    try {
      setLoading(true);
      const [adminRes, permRes] = await Promise.all([
        fetch('/api/v1/super-admin/admins', { credentials: 'include' }),
        fetch('/api/v1/super-admin/permissions', { credentials: 'include' }),
      ]);
      if (!adminRes.ok) throw new Error(isBn ? 'অ্যাডমিন তালিকা লোড করা যায়নি' : 'Failed to load admin roster');
      const adminData = await adminRes.json();
      setAdmins(adminData.data || []);

      if (permRes.ok) {
        const permData = await permRes.json();
        setPermissionsList(permData.data || []);
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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch('/api/v1/super-admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify(createModal),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (isBn ? 'অ্যাডমিন অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে' : 'Failed to create admin account'));

      setAlertMsg({ type: 'success', text: isBn ? 'নতুন অ্যাডমিন সফলভাবে তৈরি হয়েছে' : 'New admin onboarded successfully' });
      setCreateModal({ open: false, fullName: '', email: '', password: '', mobile: '', permissions: [] });
      fetchAdminsAndPermissions();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/v1/super-admin/admins/${statusModal.admin._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ accountStatus: statusModal.accountStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (isBn ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' : 'Status update failed'));

      setAlertMsg({ type: 'success', text: isBn ? 'অ্যাডমিন স্ট্যাটাস হালনাগাদ করা হয়েছে' : 'Admin status updated' });
      setStatusModal({ open: false, admin: null, accountStatus: 'active' });
      fetchAdminsAndPermissions();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const initiatePermissionUpdate = (admin) => {
    setPermModal({ open: true, admin, selectedPermissions: admin.permissions || [] });
  };

  const handlePermissionsSaveRequest = () => {
    setPendingAction(() => async (reAuthToken) => {
      try {
        setActionLoading(true);
        const csrfToken = await getCsrfToken();
        const res = await fetch(`/api/v1/super-admin/admins/${permModal.admin._id}/permissions`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken, 'X-Reauth-Token': reAuthToken },
          credentials: 'include',
          body: JSON.stringify({ permissions: permModal.selectedPermissions }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || (isBn ? 'অনুমতি আপডেট ব্যর্থ হয়েছে' : 'Failed to update permissions'));

        setAlertMsg({ type: 'success', text: isBn ? 'অ্যাডমিনের বিশেষাধিকার অনুমতি হালনাগাদ হয়েছে' : 'Admin permissions updated successfully' });
        setPermModal({ open: false, admin: null, selectedPermissions: [] });
        fetchAdminsAndPermissions();
      } catch (err) {
        setAlertMsg({ type: 'error', text: err.message });
      } finally {
        setActionLoading(false);
      }
    });
    setReAuthOpen(true);
  };

  const onReAuthSuccess = (token) => {
    setReAuthOpen(false);
    if (pendingAction) {
      pendingAction(token);
      setPendingAction(null);
    }
  };

  const togglePerm = (perm, isCreate = false) => {
    if (isCreate) {
      const exists = createModal.permissions.includes(perm);
      setCreateModal({
        ...createModal,
        permissions: exists ? createModal.permissions.filter((p) => p !== perm) : [...createModal.permissions, perm],
      });
    } else {
      const exists = permModal.selectedPermissions.includes(perm);
      setPermModal({
        ...permModal,
        selectedPermissions: exists ? permModal.selectedPermissions.filter((p) => p !== perm) : [...permModal.selectedPermissions, perm],
      });
    }
  };

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <Link href="/super-admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-semibold hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'কমান্ড সেন্টারে ফিরুন' : 'Back to Command Center'}</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-blue" />
              <span>{isBn ? 'অ্যাডমিন অ্যাকাউন্ট ও বিশেষাধিকার গভর্ন্যান্স' : 'Admin Identity & RBAC Governance'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isBn
                ? 'তদন্তকারী ও কেইস-ওয়ার্কারদের অ্যাক্সেস পলিসি ও অধিকার নিয়ন্ত্রণ করুন।'
                : 'Control access policies and RBAC privileges for investigators and caseworkers.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateModal({ ...createModal, open: true })}
              className="px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isBn ? 'নতুন অ্যাডমিন নিয়োগ' : 'Onboard Admin'}</span>
            </button>
            <button onClick={fetchAdminsAndPermissions} className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
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

        <div className="dossier-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">{isBn ? 'অ্যাডমিনের তথ্য' : 'Admin Info'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'যোগাযোগ' : 'Contact'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'অনুমোদন সংখ্যা' : 'Grants'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'অ্যাকাউন্ট স্থিতি' : 'Status'}</th>
                  <th className="px-4 py-3.5 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</td></tr>
                ) : admins.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400">{isBn ? 'কোনো অ্যাডমিন পাওয়া যায়নি' : 'No admins found'}</td></tr>
                ) : (
                  admins.map((adm) => (
                    <tr key={adm._id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-brand-navy dark:text-white">{adm.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-400">ID: {adm._id.slice(-8)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-brand-navy dark:text-slate-200">{adm.email}</div>
                        <div className="text-[10px] font-mono text-slate-400">{adm.mobile || (isBn ? 'মোবাইল নেই' : 'No mobile')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-brand-blue font-mono text-[10px] font-bold">
                          {(adm.permissions || []).length} {isBn ? 'অনুমতি' : 'Grants'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                          adm.accountStatus === 'active'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : adm.accountStatus === 'suspended'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          {adm.accountStatus || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => initiatePermissionUpdate(adm)}
                            className="px-3 py-1 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold transition"
                          >
                            {isBn ? 'অনুমতি সম্পাদনা' : 'Edit Permissions'}
                          </button>
                          <button
                            onClick={() => setStatusModal({ open: true, admin: adm, accountStatus: adm.accountStatus || 'active' })}
                            className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-navy dark:text-white font-semibold transition"
                          >
                            {isBn ? 'স্ট্যাটাস' : 'Status'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {createModal.open && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="dossier-card-elevated rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-brand-navy dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-blue" />
                <span>{isBn ? 'নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করুন' : 'Create New Admin Account'}</span>
              </h3>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                      {isBn ? 'পূর্ণ নাম *' : 'Full Name *'}
                    </label>
                    <input type="text" required value={createModal.fullName} onChange={(e) => setCreateModal({ ...createModal, fullName: e.target.value })} className="editorial-input px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                      {isBn ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
                    </label>
                    <input type="email" required value={createModal.email} onChange={(e) => setCreateModal({ ...createModal, email: e.target.value })} className="editorial-input px-3 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                      {isBn ? 'প্রাথমিক পাসওয়ার্ড *' : 'Initial Password *'}
                    </label>
                    <input type="password" required minLength={8} value={createModal.password} onChange={(e) => setCreateModal({ ...createModal, password: e.target.value })} className="editorial-input px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                      {isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}
                    </label>
                    <input type="text" value={createModal.mobile} onChange={(e) => setCreateModal({ ...createModal, mobile: e.target.value })} className="editorial-input px-3 py-2 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-2">
                    {isBn ? 'অনুমতিসমূহ নির্ধারণ করুন (RBAC Grants):' : 'Assign Permissions (RBAC Grants):'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {permissionsList.map((perm) => {
                      const checked = createModal.permissions.includes(perm);
                      return (
                        <div key={perm} onClick={() => togglePerm(perm, true)} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800">
                          {checked ? <CheckSquare className="w-4 h-4 text-brand-blue" /> : <Square className="w-4 h-4 text-slate-400" />}
                          <span className="text-[11px] font-mono text-brand-navy dark:text-slate-200">{perm}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setCreateModal({ open: false, fullName: '', email: '', password: '', mobile: '', permissions: [] })} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-full bg-brand-blue text-white font-bold">
                    {isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {permModal.open && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="dossier-card-elevated rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-brand-navy dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-blue" />
                <span>{isBn ? 'অ্যাডমিন অনুমতি আপডেট (Re-Auth সুরক্ষিত)' : 'Update Admin Permissions (Re-Auth Protected)'}</span>
              </h3>
              <p className="font-mono text-xs text-slate-500">{permModal.admin?.fullName} ({permModal.admin?.email})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                {permissionsList.map((perm) => {
                  const checked = permModal.selectedPermissions.includes(perm);
                  return (
                    <div key={perm} onClick={() => togglePerm(perm, false)} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800">
                      {checked ? <CheckSquare className="w-4 h-4 text-brand-blue" /> : <Square className="w-4 h-4 text-slate-400" />}
                      <span className="text-[11px] font-mono text-brand-navy dark:text-slate-200">{perm}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setPermModal({ open: false, admin: null, selectedPermissions: [] })} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="button" onClick={handlePermissionsSaveRequest} className="px-5 py-2 rounded-full bg-brand-blue text-white font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isBn ? 'যাচাই ও সংরক্ষণ করুন' : 'Authorize & Save'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {statusModal.open && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="dossier-card-elevated rounded-3xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-brand-navy dark:text-white">
                {isBn ? 'অ্যাডমিন স্ট্যাটাস পরিবর্তন' : 'Change Admin Account Status'}
              </h3>
              <p className="font-mono text-xs text-slate-500">{statusModal.admin?.fullName}</p>
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <select value={statusModal.accountStatus} onChange={(e) => setStatusModal({ ...statusModal, accountStatus: e.target.value })} className="editorial-input px-3 py-2">
                  <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
                  <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
                  <option value="blocked">{isBn ? 'নিষিদ্ধ (Blocked)' : 'Blocked'}</option>
                </select>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setStatusModal({ open: false, admin: null, accountStatus: 'active' })} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
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

        <ReAuthModal
          isOpen={reAuthOpen}
          onClose={() => setReAuthOpen(false)}
          onSuccess={onReAuthSuccess}
          title={isBn ? 'অনুমতি পরিবর্তন অনুমোদন' : 'Authorize Permission Mutation'}
        />
      </div>
    </div>
  );
}
