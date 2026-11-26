'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, UserPlus, Shield, KeyRound, ArrowLeft, RefreshCw, 
  CheckCircle2, XCircle, AlertTriangle, Lock, Edit3, CheckSquare, Square
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

  // Create Admin Modal State
  const [createModal, setCreateModal] = useState({
    open: false,
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    permissions: [],
  });

  // Edit Permissions Modal State
  const [permModal, setPermModal] = useState({
    open: false,
    admin: null,
    selectedPermissions: [],
  });

  // Edit Status Modal State
  const [statusModal, setStatusModal] = useState({
    open: false,
    admin: null,
    accountStatus: 'active',
  });

  // Re-Auth Modal State
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

      if (!adminRes.ok) throw new Error('অ্যাডমিন তালিকা লোড করা যায়নি');
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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(createModal),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'অ্যাডমিন অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'নতুন অ্যাডমিন সফলভাবে তৈরি হয়েছে' : 'New admin onboarded' });
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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ accountStatus: statusModal.accountStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');

      setAlertMsg({ type: 'success', text: isBn ? 'অ্যাডমিন স্ট্যাটাস হালনাগাদ করা হয়েছে' : 'Admin status updated' });
      setStatusModal({ open: false, admin: null, accountStatus: 'active' });
      fetchAdminsAndPermissions();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Re-Auth protected permission update
  const initiatePermissionUpdate = (admin) => {
    setPermModal({
      open: true,
      admin,
      selectedPermissions: admin.permissions || [],
    });
  };

  const handlePermissionsSaveRequest = () => {
    setPendingAction(() => async (reAuthToken) => {
      try {
        setActionLoading(true);
        const csrfToken = await getCsrfToken();
        const res = await fetch(`/api/v1/super-admin/admins/${permModal.admin._id}/permissions`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'X-Reauth-Token': reAuthToken,
          },
          credentials: 'include',
          body: JSON.stringify({ permissions: permModal.selectedPermissions }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'অনুমতি আপডেট ব্যর্থ হয়েছে');

        setAlertMsg({ type: 'success', text: isBn ? 'অ্যাডমিনের বিশেষাধিকার অনুমতি হালনাগাদ হয়েছে' : 'Permissions updated successfully' });
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
        permissions: exists 
          ? createModal.permissions.filter(p => p !== perm) 
          : [...createModal.permissions, perm],
      });
    } else {
      const exists = permModal.selectedPermissions.includes(perm);
      setPermModal({
        ...permModal,
        selectedPermissions: exists 
          ? permModal.selectedPermissions.filter(p => p !== perm) 
          : [...permModal.selectedPermissions, perm],
      });
    }
  };

  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-400" />
                {isBn ? 'অ্যাডমিন অ্যাকাউন্ট ও বিশেষাধিকার গভর্ন্যান্স' : 'Admin Identity & RBAC Governance'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'তদন্তকারী ও কেইস-ওয়ার্কারদের অ্যাক্সেস পলিসি ও অধিকার নিয়ন্ত্রণ করুন।' 
                  : 'Manage caseworker identities, lifecycle status, and granual permission matrices.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateModal({ ...createModal, open: true })}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-950/40"
            >
              <UserPlus className="w-4 h-4" />
              {isBn ? 'নতুন অ্যাডমিন নিয়োগ' : 'Onboard Admin'}
            </button>
            <button
              onClick={fetchAdminsAndPermissions}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
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

        {/* Admins Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">{isBn ? 'অ্যাডমিনের তথ্য' : 'Admin Profile'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'যোগাযোগ' : 'Contact'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'অনুমতির সংখ্যা' : 'Permissions'}</th>
                  <th className="px-4 py-3.5">{isBn ? 'অ্যাকাউন্ট স্থিতি' : 'Status'}</th>
                  <th className="px-4 py-3.5 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      {isBn ? 'অ্যাডমিন তথ্য লোড হচ্ছে...' : 'Loading admin identities...'}
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      {isBn ? 'কোনো অ্যাডমিন পাওয়া যায়নি' : 'No admin accounts registered'}
                    </td>
                  </tr>
                ) : (
                  admins.map((adm) => (
                    <tr key={adm._id} className="hover:bg-slate-850/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100">{adm.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {adm._id.slice(-8)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-300">{adm.email}</div>
                        <div className="text-[10px] text-slate-500">{adm.mobile || 'No mobile recorded'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-300 font-mono text-[10px]">
                          {(adm.permissions || []).length} {isBn ? 'অনুমোদন' : 'Grants'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          adm.accountStatus === 'active'
                            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                            : adm.accountStatus === 'suspended'
                            ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                            : 'bg-rose-950/80 border-rose-800 text-rose-300'
                        }`}>
                          {adm.accountStatus || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => initiatePermissionUpdate(adm)}
                            className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/80 text-amber-300 text-[11px] font-medium transition"
                          >
                            {isBn ? 'অনুমতি সম্পাদনা' : 'Permissions'}
                          </button>
                          <button
                            onClick={() => setStatusModal({ open: true, admin: adm, accountStatus: adm.accountStatus || 'active' })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
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

        {/* Create Admin Modal */}
        {createModal.open && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                {isBn ? 'নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করুন' : 'Onboard New Admin Identity'}
              </h3>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'পূর্ণ নাম *' : 'Full Name *'}</label>
                    <input
                      type="text"
                      required
                      value={createModal.fullName}
                      onChange={(e) => setCreateModal({ ...createModal, fullName: e.target.value })}
                      placeholder={isBn ? 'উদা: জনাব রফিকুল ইসলাম' : 'e.g., John Doe'}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}</label>
                    <input
                      type="email"
                      required
                      value={createModal.email}
                      onChange={(e) => setCreateModal({ ...createModal, email: e.target.value })}
                      placeholder="admin@jonoshor.org"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'প্রাথমিক পাসওয়ার্ড *' : 'Initial Password *'}</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={createModal.password}
                      onChange={(e) => setCreateModal({ ...createModal, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}</label>
                    <input
                      type="text"
                      value={createModal.mobile}
                      onChange={(e) => setCreateModal({ ...createModal, mobile: e.target.value })}
                      placeholder="+8801700000000"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                </div>

                {/* Permissions Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    {isBn ? 'অনুমতিসমূহ নির্ধারণ করুন (RBAC Grants):' : 'Select Permissions (RBAC Grants):'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-950 rounded-xl border border-slate-800">
                    {permissionsList.map((perm) => {
                      const checked = createModal.permissions.includes(perm);
                      return (
                        <div
                          key={perm}
                          onClick={() => togglePerm(perm, true)}
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900 transition"
                        >
                          {checked ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                          <span className="text-[11px] font-mono text-slate-300">{perm}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCreateModal({ open: false, fullName: '', email: '', password: '', mobile: '', permissions: [] })}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5"
                  >
                    {actionLoading && <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
                    {isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Permissions Modal */}
        {permModal.open && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                {isBn ? 'অ্যাডমিন অনুমতি আপডেট (Re-Auth সুরক্ষিত)' : 'Update Admin Permissions (Re-Auth Protected)'}
              </h3>
              <p className="text-xs text-slate-400">
                {permModal.admin?.fullName} ({permModal.admin?.email})
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-3 bg-slate-950 rounded-xl border border-slate-800">
                {permissionsList.map((perm) => {
                  const checked = permModal.selectedPermissions.includes(perm);
                  return (
                    <div
                      key={perm}
                      onClick={() => togglePerm(perm, false)}
                      className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900 transition"
                    >
                      {checked ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                      <span className="text-[11px] font-mono text-slate-300">{perm}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPermModal({ open: false, admin: null, selectedPermissions: [] })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handlePermissionsSaveRequest}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isBn ? 'যাচাই ও সংরক্ষণ করুন' : 'Authenticate & Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Status Modal */}
        {statusModal.open && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                {isBn ? 'অ্যাডমিন স্ট্যাটাস পরিবর্তন' : 'Update Admin Status'}
              </h3>
              <p className="text-xs text-slate-400">
                {statusModal.admin?.fullName}
              </p>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{isBn ? 'স্ট্যাটাস নির্বাচন করুন' : 'Select Status'}</label>
                  <select
                    value={statusModal.accountStatus}
                    onChange={(e) => setStatusModal({ ...statusModal, accountStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
                    <option value="blocked">{isBn ? 'নিষিদ্ধ (Blocked)' : 'Blocked'}</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStatusModal({ open: false, admin: null, accountStatus: 'active' })}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5"
                  >
                    {actionLoading && <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
                    {isBn ? 'নিশ্চিত করুন' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Elevated Re-Authentication Trigger Modal */}
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
