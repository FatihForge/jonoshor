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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
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
        if (!res.ok) throw new Error(data.message || 'অনুমতি আপডেট ব্যর্থ হয়েছে');

        setAlertMsg({ type: 'success', text: isBn ? 'অ্যাডমিনের বিশেষাধিকার অনুমতি হালনাগাদ হয়েছে' : 'Permissions updated' });
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
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 text-xs">
      <div className="editorial-rule-top pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/super-admin/dashboard" className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text font-semibold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>কমান্ড সেন্টারে ফিরুন</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-ochre" />
            <span>{isBn ? 'অ্যাডমিন অ্যাকাউন্ট ও বিশেষাধিকার গভর্ন্যান্স' : 'Admin Identity & RBAC Governance'}</span>
          </h1>
          <p className="text-brand-slate">তদন্তকারী ও কেইস-ওয়ার্কারদের অ্যাক্সেস পলিসি ও অধিকার নিয়ন্ত্রণ করুন।</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateModal({ ...createModal, open: true })}
            className="px-4 py-2 rounded-md bg-brand-text hover:bg-black text-white font-bold flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন অ্যাডমিন নিয়োগ</span>
          </button>
          <button onClick={fetchAdminsAndPermissions} className="p-2 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      {/* Table */}
      <div className="dossier-card rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-subtle text-brand-text font-bold border-b border-canvas-border uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">অ্যাডমিনের তথ্য</th>
                <th className="px-4 py-3.5">যোগাযোগ</th>
                <th className="px-4 py-3.5">অনুমোদন সংখ্যা</th>
                <th className="px-4 py-3.5">অ্যাকাউন্ট স্থিতি</th>
                <th className="px-4 py-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-border">
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-brand-muted">লোড হচ্ছে...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan="5" className="py-12 text-center text-brand-muted">কোনো অ্যাডমিন পাওয়া যায়নি</td></tr>
              ) : (
                admins.map((adm) => (
                  <tr key={adm._id} className="hover:bg-canvas-hover transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-brand-text">{adm.fullName}</div>
                      <div className="text-[10px] font-mono text-brand-muted">ID: {adm._id.slice(-8)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-brand-text">{adm.email}</div>
                      <div className="text-[10px] font-mono text-brand-muted">{adm.mobile || 'No mobile'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-sm bg-canvas border border-canvas-border text-brand-ochre font-mono text-[10px] font-bold">
                        {(adm.permissions || []).length} Grants
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                        adm.accountStatus === 'active'
                          ? 'bg-emerald-50 border-emerald-200 text-brand-pine'
                          : adm.accountStatus === 'suspended'
                          ? 'bg-amber-50 border-amber-200 text-brand-ochre'
                          : 'bg-red-50 border-red-200 text-brand-crimson'
                      }`}>
                        {adm.accountStatus || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => initiatePermissionUpdate(adm)}
                          className="px-2.5 py-1 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-brand-ochre font-bold transition"
                        >
                          অনুমতি সম্পাদনা
                        </button>
                        <button
                          onClick={() => setStatusModal({ open: true, admin: adm, accountStatus: adm.accountStatus || 'active' })}
                          className="px-2.5 py-1 rounded-md border border-canvas-border bg-canvas-card hover:bg-canvas-subtle text-brand-text font-semibold transition"
                        >
                          স্ট্যাটাস
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

      {/* Create Modal */}
      {createModal.open && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dossier-card-elevated rounded-md max-w-2xl w-full p-6 border-t-4 border-t-brand-text space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-bold text-brand-text flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-pine" />
              <span>নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করুন</span>
            </h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-text mb-1">পূর্ণ নাম *</label>
                  <input type="text" required value={createModal.fullName} onChange={(e) => setCreateModal({ ...createModal, fullName: e.target.value })} className="editorial-input px-3 py-2" />
                </div>
                <div>
                  <label className="block font-semibold text-brand-text mb-1">ইমেইল অ্যাড্রেস *</label>
                  <input type="email" required value={createModal.email} onChange={(e) => setCreateModal({ ...createModal, email: e.target.value })} className="editorial-input px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-text mb-1">প্রাথমিক পাসওয়ার্ড *</label>
                  <input type="password" required minLength={8} value={createModal.password} onChange={(e) => setCreateModal({ ...createModal, password: e.target.value })} className="editorial-input px-3 py-2" />
                </div>
                <div>
                  <label className="block font-semibold text-brand-text mb-1">মোবাইল নম্বর</label>
                  <input type="text" value={createModal.mobile} onChange={(e) => setCreateModal({ ...createModal, mobile: e.target.value })} className="editorial-input px-3 py-2 font-mono" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-brand-text mb-2">অনুমতিসমূহ নির্ধারণ করুন (RBAC Grants):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-canvas rounded-md border border-canvas-border">
                  {permissionsList.map((perm) => {
                    const checked = createModal.permissions.includes(perm);
                    return (
                      <div key={perm} onClick={() => togglePerm(perm, true)} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-canvas-subtle">
                        {checked ? <CheckSquare className="w-4 h-4 text-brand-pine" /> : <Square className="w-4 h-4 text-brand-muted" />}
                        <span className="text-[11px] font-mono text-brand-text">{perm}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
                <button type="button" onClick={() => setCreateModal({ open: false, fullName: '', email: '', password: '', mobile: '', permissions: [] })} className="px-4 py-2 rounded-md border border-canvas-border bg-canvas font-semibold">
                  বাতিল
                </button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-md bg-brand-text text-white font-bold">
                  অ্যাকাউন্ট তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {permModal.open && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dossier-card-elevated rounded-md max-w-2xl w-full p-6 border-t-4 border-t-brand-ochre space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-bold text-brand-text flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-ochre" />
              <span>অ্যাডমিন অনুমতি আপডেট (Re-Auth সুরক্ষিত)</span>
            </h3>
            <p className="font-mono text-xs text-brand-muted">{permModal.admin?.fullName} ({permModal.admin?.email})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-3 bg-canvas rounded-md border border-canvas-border">
              {permissionsList.map((perm) => {
                const checked = permModal.selectedPermissions.includes(perm);
                return (
                  <div key={perm} onClick={() => togglePerm(perm, false)} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-canvas-subtle">
                    {checked ? <CheckSquare className="w-4 h-4 text-brand-pine" /> : <Square className="w-4 h-4 text-brand-muted" />}
                    <span className="text-[11px] font-mono text-brand-text">{perm}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
              <button type="button" onClick={() => setPermModal({ open: false, admin: null, selectedPermissions: [] })} className="px-4 py-2 rounded-md border border-canvas-border bg-canvas font-semibold">
                বাতিল
              </button>
              <button type="button" onClick={handlePermissionsSaveRequest} className="px-5 py-2 rounded-md bg-brand-text text-white font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>যাচাই ও সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dossier-card-elevated rounded-md max-w-md w-full p-6 border-t-4 border-t-brand-text space-y-4">
            <h3 className="font-serif text-base font-bold text-brand-text">অ্যাডমিন স্ট্যাটাস পরিবর্তন</h3>
            <p className="font-mono text-xs text-brand-muted">{statusModal.admin?.fullName}</p>
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <select value={statusModal.accountStatus} onChange={(e) => setStatusModal({ ...statusModal, accountStatus: e.target.value })} className="editorial-input px-3 py-2">
                <option value="active">সক্রিয় (Active)</option>
                <option value="suspended">স্থগিত (Suspended)</option>
                <option value="blocked">নিষিদ্ধ (Blocked)</option>
              </select>
              <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
                <button type="button" onClick={() => setStatusModal({ open: false, admin: null, accountStatus: 'active' })} className="px-4 py-2 rounded-md border border-canvas-border bg-canvas font-semibold">
                  বাতিল
                </button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-md bg-brand-text text-white font-bold">
                  নিশ্চিত করুন
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
  );
}
