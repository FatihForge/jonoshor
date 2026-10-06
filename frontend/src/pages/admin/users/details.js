import { adminUserService } from '../../../services/admin/adminUserService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';
import { getAccountStatusBadge } from '../../../components/admin/StatusBadge.js';
import { formatDateTime } from '../../../utils/formatters.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { authService } from '../../../services/auth/authService.js';

export async function renderAdminUserDetailsPage(container, userId) {
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = currentUser?.accountType === 'superAdmin';
  const hasUserReadPermission = isSuperAdmin || (Array.isArray(currentUser?.permissions) && currentUser.permissions.includes('user.read'));
  const hasUserManagePermission = isSuperAdmin || (Array.isArray(currentUser?.permissions) && currentUser.permissions.includes('user.manage'));

  const isSelf = currentUser?._id === userId || currentUser?.id === userId;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      ${renderAdminNav('users')}

      <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Breadcrumb / Back button -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <a href="#/admin/users" class="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            ব্যবহারকারী তালিকায় ফিরুন
          </a>
          <span class="text-xs text-slate-500 font-mono">আইডি: ${userId}</span>
        </div>

        <!-- Success Toast Banner -->
        <div id="user-details-success-banner" class="hidden p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between shadow-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span id="user-details-success-text">অ্যাকাউন্ট অবস্থা সফলভাবে হালনাগাদ করা হয়েছে।</span>
          </div>
          <button id="close-success-banner-btn" class="text-emerald-400 hover:text-emerald-200 text-sm font-bold ml-4">✕</button>
        </div>

        <!-- State Containers -->
        <div id="user-details-loading" class="py-20 text-center">
          <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm">ব্যবহারকারীর তথ্য লোড হচ্ছে...</p>
        </div>

        <div id="user-details-error" class="hidden py-16 text-center"></div>

        <div id="user-details-permission-denied" class="hidden max-w-lg mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-amber-900/60 text-center shadow-xl">
          <div class="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-white mb-2">অনুমতি সীমাবদ্ধ (Permission Required)</h2>
          <p class="text-xs text-slate-400 mb-4">ব্যবহারকারীর বিস্তারিত প্রোফাইল দেখার জন্য আপনার <code class="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">user.read</code> অনুমতি প্রয়োজন।</p>
          <a href="#/admin/users" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition inline-block">
            তালিকায় ফিরুন
          </a>
        </div>

        <div id="user-details-content" class="hidden space-y-6">
          <!-- Top Profile Banner -->
          <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                <span id="user-avatar-initial">?</span>
              </div>
              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h1 id="user-full-name" class="text-xl font-bold text-white leading-snug">নাম লোড হচ্ছে...</h1>
                  <span id="user-status-badge"></span>
                </div>
                <p id="user-email-line" class="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span id="user-email">—</span>
                  <span id="user-email-verified-tag"></span>
                </p>
                <div class="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                  <span>নিবন্ধন: <span id="user-created-at" class="text-slate-400">—</span></span>
                  <span>•</span>
                  <span>সর্বশেষ আপডেট: <span id="user-updated-at" class="text-slate-400">—</span></span>
                </div>
              </div>
            </div>

            <!-- Action Area -->
            <div class="flex items-center gap-3 shrink-0">
              <button id="open-status-modal-btn" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                স্ট্যাটাস পরিবর্তন করুন
              </button>
            </div>
          </div>

          <!-- Information Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Account & Contact Details -->
            <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
              <h2 class="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                যোগাযোগ ও পরিচয় তথ্য
              </h2>

              <dl class="space-y-3 text-xs">
                <div>
                  <dt class="text-slate-500">পূর্ণ নাম</dt>
                  <dd id="info-full-name" class="text-slate-200 font-medium mt-0.5">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">ইমেইল ঠিকানা</dt>
                  <dd id="info-email" class="text-slate-200 font-mono mt-0.5 flex items-center gap-2">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">মোবাইল নম্বর</dt>
                  <dd id="info-mobile" class="text-slate-200 font-mono mt-0.5 flex items-center gap-2">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">লগইন মাধ্যম (Auth Provider)</dt>
                  <dd id="info-auth-provider" class="text-slate-200 font-mono mt-0.5 capitalize">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">পছন্দের ভাষা</dt>
                  <dd id="info-language" class="text-slate-200 mt-0.5">—</dd>
                </div>
              </dl>
            </div>

            <!-- Security & Platform Status -->
            <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
              <h2 class="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                প্ল্যাটফর্ম ও অ্যাকাউন্টের অবস্থা
              </h2>

              <dl class="space-y-3 text-xs">
                <div>
                  <dt class="text-slate-500">অ্যাকাউন্ট বর্তমান অবস্থা</dt>
                  <dd id="info-account-status" class="mt-1">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">ইউজার রেফারেন্স আইডি</dt>
                  <dd id="info-user-id" class="text-slate-300 font-mono select-all bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block mt-0.5">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">নিবন্ধনের সময়কাল</dt>
                  <dd id="info-created-at" class="text-slate-200 mt-0.5">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">সর্বশেষ প্রোফাইল কার্যকলাপ</dt>
                  <dd id="info-updated-at" class="text-slate-200 mt-0.5">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">বহিঃস্থ লিঙ্কসমূহ (External Links)</dt>
                  <dd id="info-external-links" class="text-slate-400 mt-0.5">কোন লিঙ্ক নেই</dd>
                </div>
              </dl>

              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span class="font-semibold text-slate-300 block">🔒 নিরাপত্তা নির্দেশনা:</span>
                <p>পাসওয়ার্ড হ্যাশ, রিফ্রেশ টোকেন এবং অভ্যন্তরীণ সিকিউরিটি তথ্য সংবেদনশীল বিধায় প্রশাসনিক ইন্টারফেসে সম্পূর্ণ অপ্রকাশিত থাকে।</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#user-details-loading');
  const errorEl = container.querySelector('#user-details-error');
  const permDeniedEl = container.querySelector('#user-details-permission-denied');
  const contentEl = container.querySelector('#user-details-content');
  const successBanner = container.querySelector('#user-details-success-banner');
  const successText = container.querySelector('#user-details-success-text');
  const closeSuccessBtn = container.querySelector('#close-success-banner-btn');

  const avatarInitial = container.querySelector('#user-avatar-initial');
  const fullNameEl = container.querySelector('#user-full-name');
  const statusBadgeEl = container.querySelector('#user-status-badge');
  const emailEl = container.querySelector('#user-email');
  const emailVerifiedTag = container.querySelector('#user-email-verified-tag');
  const createdAtTop = container.querySelector('#user-created-at');
  const updatedAtTop = container.querySelector('#user-updated-at');
  const statusModalBtn = container.querySelector('#open-status-modal-btn');

  const infoFullName = container.querySelector('#info-full-name');
  const infoEmail = container.querySelector('#info-email');
  const infoMobile = container.querySelector('#info-mobile');
  const infoAuthProvider = container.querySelector('#info-auth-provider');
  const infoLanguage = container.querySelector('#info-language');
  const infoAccountStatus = container.querySelector('#info-account-status');
  const infoUserId = container.querySelector('#info-user-id');
  const infoCreatedAt = container.querySelector('#info-created-at');
  const infoUpdatedAt = container.querySelector('#info-updated-at');
  const infoExternalLinks = container.querySelector('#info-external-links');

  closeSuccessBtn.addEventListener('click', () => {
    successBanner.classList.add('hidden');
  });

  let loadedUserData = null;

  async function fetchUserDetails() {
    if (!hasUserReadPermission) {
      loadingEl.classList.add('hidden');
      permDeniedEl.classList.remove('hidden');
      return;
    }

    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    permDeniedEl.classList.add('hidden');
    contentEl.classList.add('hidden');

    try {
      const res = await adminUserService.getUserById(userId);
      const user = res?.data;
      if (!user) {
        throw new Error('ব্যবহারকারী পাওয়া যায়নি');
      }

      loadedUserData = user;

      // Populate UI
      avatarInitial.textContent = (user.fullName || 'U').charAt(0).toUpperCase();
      fullNameEl.textContent = user.fullName || 'নামবিহীন';
      statusBadgeEl.innerHTML = getAccountStatusBadge(user.accountStatus);
      emailEl.textContent = user.email || '—';

      if (user.emailVerified) {
        emailVerifiedTag.innerHTML = `
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
            ✓ যাচাইকৃত
          </span>
        `;
      } else {
        emailVerifiedTag.innerHTML = `
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
            অযাচাইকৃত
          </span>
        `;
      }

      createdAtTop.textContent = formatDateTime(user.createdAt);
      updatedAtTop.textContent = user.updatedAt ? formatDateTime(user.updatedAt) : '—';

      infoFullName.textContent = user.fullName || '—';
      infoEmail.innerHTML = `
        <span>${user.email || '—'}</span>
        ${user.emailVerified ? '<span class="text-emerald-400 text-xs">✓ Verified</span>' : '<span class="text-amber-400 text-xs">(Unverified)</span>'}
      `;

      infoMobile.innerHTML = user.mobile
        ? `<span>${user.mobile}</span> ${user.mobileVerified ? '<span class="text-emerald-400 text-xs">✓ Verified</span>' : '<span class="text-amber-400 text-xs">(Unverified)</span>'}`
        : '<span class="text-slate-500">প্রদত্ত নেই</span>';

      infoAuthProvider.textContent = user.authProvider || 'local';
      infoLanguage.textContent = user.languagePreference === 'bn' ? 'বাংলা (bn)' : user.languagePreference === 'en' ? 'ইংরেজি (en)' : 'স্বয়ংক্রিয় (auto)';
      infoAccountStatus.innerHTML = getAccountStatusBadge(user.accountStatus);
      infoUserId.textContent = user._id || userId;
      infoCreatedAt.textContent = formatDateTime(user.createdAt);
      infoUpdatedAt.textContent = user.updatedAt ? formatDateTime(user.updatedAt) : '—';

      if (Array.isArray(user.externalLinks) && user.externalLinks.length > 0) {
        infoExternalLinks.innerHTML = user.externalLinks
          .map((link) => `<a href="${encodeURI(link)}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline block truncate">${link}</a>`)
          .join('');
      } else {
        infoExternalLinks.textContent = 'কোন বহিঃস্থ লিঙ্ক যুক্ত নেই';
      }

      // Check manage permissions & self-modification
      if (!hasUserManagePermission) {
        statusModalBtn.disabled = true;
        statusModalBtn.classList.add('opacity-50', 'cursor-not-allowed');
        statusModalBtn.title = 'স্ট্যাটাস পরিবর্তনের জন্য user.manage অনুমতি প্রয়োজন';
      } else if (isSelf) {
        statusModalBtn.disabled = true;
        statusModalBtn.classList.add('opacity-50', 'cursor-not-allowed');
        statusModalBtn.title = 'অ্যাডমিন নিজ অ্যাকাউন্টের স্ট্যাটাস এখান থেকে পরিবর্তন করতে পারবেন না';
      } else {
        statusModalBtn.disabled = false;
        statusModalBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        statusModalBtn.title = 'অ্যাকাউন্টের অবস্থা পরিবর্তন করুন';
      }

      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      const isForbidden = err?.status === 403 || err?.message?.includes('permission') || err?.message?.includes('403');
      if (isForbidden) {
        permDeniedEl.classList.remove('hidden');
      } else {
        errorEl.classList.remove('hidden');
        errorEl.innerHTML = `
          <div class="max-w-md mx-auto p-6 rounded-xl bg-slate-900 border border-red-900/60 text-center">
            <p class="text-sm font-semibold text-red-400 mb-2">ব্যবহারকারীর তথ্য লোড করা যায়নি</p>
            <p class="text-xs text-slate-400 mb-4">${err?.message || 'অপ্রত্যাশিত ত্রুটি ঘটেছে'}</p>
            <a href="#/admin/users" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition inline-block">
              তালিকায় ফিরুন
            </a>
          </div>
        `;
      }
    }
  }

  // Handle Status Update Modal
  statusModalBtn.addEventListener('click', () => {
    if (!hasUserManagePermission) {
      return;
    }
    if (isSelf) {
      return;
    }

    const currentStatus = loadedUserData?.accountStatus || 'active';

    const contentHtml = `
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">নতুন অ্যাকাউন্ট অবস্থা (Account Status) <span class="text-rose-400">*</span></label>
          <select id="modal-status-select" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
            <option value="active" ${currentStatus === 'active' ? 'selected' : ''}>সক্রিয় (Active) — স্বাভাবিক অ্যাক্সেস চালু</option>
            <option value="suspended" ${currentStatus === 'suspended' ? 'selected' : ''}>সাময়িক স্থগিত (Suspended) — সাময়িকভাবে লগইন ও কার্যক্রম বন্ধ</option>
            <option value="blocked" ${currentStatus === 'blocked' ? 'selected' : ''}>অবরুদ্ধ (Blocked) — অ্যাকাউন্ট স্থায়ী বা কঠোরভাবে নিষিদ্ধ</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">প্রশাসনিক কারণ (Reason / Justification) <span class="text-slate-400 text-[11px]">(ঐচ্ছিক, সর্বোচ্চ ৫০০ অক্ষর)</span></label>
          <textarea id="modal-status-reason" rows="3" maxlength="500" placeholder="অ্যাকাউন্ট অবস্থা পরিবর্তনের কারণ বা বিবরণ লিখুন..." class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"></textarea>
        </div>

        <div class="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200/90 leading-relaxed">
          ⚠️ <strong>সতর্কতা:</strong> এই সিদ্ধান্তটি প্ল্যাটফর্ম অডিট লগে স্থায়ীভাবে আপনার অ্যাক্টর আইডি ও কারণসহ সংরক্ষিত হবে।
        </div>
      </div>
    `;

    showModal({
      title: 'ব্যবহারকারী অ্যাকাউন্ট অবস্থা পরিবর্তন',
      description: `${loadedUserData?.fullName || 'ব্যবহারকারী'} (#${(userId || '').slice(-6).toUpperCase()})-এর অবস্থা হালনাগাদ`,
      contentHtml,
      confirmText: 'অবস্থা হালনাগাদ নিশ্চিত করুন',
      confirmColor: 'bg-emerald-600 hover:bg-emerald-500',
      onConfirm: async (modalEl) => {
        const selectEl = modalEl.querySelector('#modal-status-select');
        const reasonEl = modalEl.querySelector('#modal-status-reason');

        const newStatus = selectEl.value;
        const reason = reasonEl.value.trim();

        const updateRes = await adminUserService.updateUserStatus(userId, {
          status: newStatus,
          reason: reason || undefined,
        });

        // Update local state and UI
        if (updateRes?.data) {
          loadedUserData = updateRes.data;
          statusBadgeEl.innerHTML = getAccountStatusBadge(updateRes.data.accountStatus);
          infoAccountStatus.innerHTML = getAccountStatusBadge(updateRes.data.accountStatus);
          if (updateRes.data.updatedAt) {
            updatedAtTop.textContent = formatDateTime(updateRes.data.updatedAt);
            infoUpdatedAt.textContent = formatDateTime(updateRes.data.updatedAt);
          }
        }

        successText.textContent = `ব্যবহারকারীর অবস্থা সফলভাবে '${newStatus === 'active' ? 'সক্রিয়' : newStatus === 'suspended' ? 'সাময়িক স্থগিত' : 'অবরুদ্ধ'}' করা হয়েছে।`;
        successBanner.classList.remove('hidden');
      },
    });
  });

  await fetchUserDetails();
}
