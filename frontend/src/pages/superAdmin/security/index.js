import { superAdminService } from '../../../services/superAdmin/superAdminService.js';
import { renderSuperAdminNav } from '../../../components/superAdmin/SuperAdminNav.js';
import { formatDateTime } from '../../../utils/formatters.js';

export async function renderSuperAdminSecurityPage(container) {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  let activeTab = urlParams.get('tab') === 'audit' ? 'audit' : 'security';

  let secPage = 1;
  const secLimit = 25;
  let auditPage = 1;
  const auditLimit = 25;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      ${renderSuperAdminNav('security')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <div>
            <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>নিরাপত্তা ও অডিট ওভারভিউ</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                Security & Audit Intel
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              প্ল্যাটফর্মের সাইবার নিরাপত্তা ঘটনা, সাইন-ইন ঝুঁকি সংকেত এবং বিশেষাধিকারপ্রাপ্ত প্রশাসনিক অডিট ট্রেইল পর্যবেক্ষণ।
            </p>
          </div>
          <button id="refresh-logs-btn" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 text-xs font-semibold border border-purple-900/60 shadow-lg transition flex items-center gap-1.5 self-start sm:self-auto">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            রিফ্রেশ
          </button>
        </div>

        <!-- Distinct Tabs Bar -->
        <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
          <button id="tab-security-btn" class="px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-purple-900/90 text-white shadow-lg border border-purple-700/80'
              : 'text-slate-400 hover:text-white'
          }">
            <span>🛡️ নিরাপত্তা লগ (Security Logs)</span>
            <span id="tab-sec-badge" class="px-1.5 py-0.2 rounded text-[10px] bg-red-950 text-red-300 font-mono">0</span>
          </button>
          <button id="tab-audit-btn" class="px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-purple-900/90 text-white shadow-lg border border-purple-700/80'
              : 'text-slate-400 hover:text-white'
          }">
            <span>📜 প্রশাসনিক অডিট লগ (Audit Logs)</span>
            <span id="tab-audit-badge" class="px-1.5 py-0.2 rounded text-[10px] bg-indigo-950 text-indigo-300 font-mono">0</span>
          </button>
        </div>

        <!-- Guidance Banner -->
        <div id="logs-guidance-banner" class="p-3.5 rounded-xl border text-xs shadow-inner flex items-start gap-3 ${
          activeTab === 'security'
            ? 'bg-red-950/30 border-red-900/50 text-red-200'
            : 'bg-indigo-950/30 border-indigo-900/50 text-indigo-200'
        }">
          <span class="text-base shrink-0 mt-0.5">${activeTab === 'security' ? '🚨' : '📝'}</span>
          <div class="space-y-0.5">
            <span class="font-bold">${activeTab === 'security' ? 'নিরাপত্তা লগ নির্দেশিকা:' : 'অডিট লগ নির্দেশিকা:'}</span>
            <p class="text-slate-400">
              ${
                activeTab === 'security'
                  ? 'প্রমাণীকরণ ব্যর্থতা, রেট-লিমিট ট্রিগার এবং সন্দেহজনক ট্রাফিকের আইপি ও ডিভাইস তথ্য সংরক্ষিত থাকে। কোনো পাসওয়ার্ড বা সংবেদনশীল প্রমাণ ইন্টারফেসে প্রদর্শিত হয় না।'
                  : 'সুপার অ্যাডমিন ও অ্যাডমিনদের দ্বারা সম্পন্ন সকল নীতিগত ও প্রোফাইল পরিবর্তন অপরিবর্তনশীল (Immutable) অডিট ট্রেইলে সংরক্ষিত। অডিট লগ স্থায়ী ও মুছে ফেলা নিষিদ্ধ।'
              }
            </p>
          </div>
        </div>

        <!-- Main State Containers -->
        <div id="logs-loading" class="py-20 text-center">
          <div class="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm">লগ ডাটা লোড হচ্ছে...</p>
        </div>

        <div id="logs-error" class="hidden py-16 text-center"></div>

        <!-- Panel 1: Security Logs -->
        <div id="sec-logs-panel" class="${activeTab === 'security' ? '' : 'hidden'} space-y-4">
          <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-850/80 text-slate-400">
                  <th class="px-4 py-3 font-semibold">সময় ও তারিখ</th>
                  <th class="px-4 py-3 font-semibold">ঘটনার ধরন (Event Type)</th>
                  <th class="px-4 py-3 font-semibold">আইপি ঠিকানা</th>
                  <th class="px-4 py-3 font-semibold">ঝুঁকি সংকেত (Risk Signal)</th>
                  <th class="px-4 py-3 font-semibold">গৃহীত ব্যবস্থা (Action Taken)</th>
                  <th class="px-4 py-3 font-semibold">ডিভাইস / ইউজার এজেন্ট</th>
                </tr>
              </thead>
              <tbody id="sec-logs-tbody" class="divide-y divide-slate-800/80 text-slate-300">
                <!-- Injected dynamically -->
              </tbody>
            </table>
          </div>

          <div id="sec-logs-empty" class="hidden py-16 text-center rounded-2xl border border-slate-800 bg-slate-900">
            <p class="text-sm font-semibold text-slate-300">কোনো নিরাপত্তা লগ পাওয়া যায়নি</p>
          </div>

          <div id="sec-pagination" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
            <span id="sec-page-info">পৃষ্ঠা ১</span>
            <div class="flex items-center gap-2">
              <button id="sec-prev-btn" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← পূর্ববর্তী
              </button>
              <button id="sec-next-btn" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                পরবর্তী →
              </button>
            </div>
          </div>
        </div>

        <!-- Panel 2: Audit Logs -->
        <div id="audit-logs-panel" class="${activeTab === 'audit' ? '' : 'hidden'} space-y-4">
          <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-850/80 text-slate-400">
                  <th class="px-4 py-3 font-semibold">সময় ও তারিখ</th>
                  <th class="px-4 py-3 font-semibold">অ্যাকশন (Action)</th>
                  <th class="px-4 py-3 font-semibold">অ্যাক্টর (Actor)</th>
                  <th class="px-4 py-3 font-semibold">রিসোর্স (Resource)</th>
                  <th class="px-4 py-3 font-semibold">আইপি ঠিকানা</th>
                  <th class="px-4 py-3 font-semibold">রিকোয়েস্ট আইডি</th>
                </tr>
              </thead>
              <tbody id="audit-logs-tbody" class="divide-y divide-slate-800/80 text-slate-300">
                <!-- Injected dynamically -->
              </tbody>
            </table>
          </div>

          <div id="audit-logs-empty" class="hidden py-16 text-center rounded-2xl border border-slate-800 bg-slate-900">
            <p class="text-sm font-semibold text-slate-300">কোনো অডিট লগ পাওয়া যায়নি</p>
          </div>

          <div id="audit-pagination" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
            <span id="audit-page-info">পৃষ্ঠা ১</span>
            <div class="flex items-center gap-2">
              <button id="audit-prev-btn" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← পূর্ববর্তী
              </button>
              <button id="audit-next-btn" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                পরবর্তী →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#logs-loading');
  const errorEl = container.querySelector('#logs-error');
  const guidanceBanner = container.querySelector('#logs-guidance-banner');
  const refreshBtn = container.querySelector('#refresh-logs-btn');

  const tabSecBtn = container.querySelector('#tab-security-btn');
  const tabAuditBtn = container.querySelector('#tab-audit-btn');
  const tabSecBadge = container.querySelector('#tab-sec-badge');
  const tabAuditBadge = container.querySelector('#tab-audit-badge');

  const secPanel = container.querySelector('#sec-logs-panel');
  const secTbody = container.querySelector('#sec-logs-tbody');
  const secEmpty = container.querySelector('#sec-logs-empty');
  const secPrevBtn = container.querySelector('#sec-prev-btn');
  const secNextBtn = container.querySelector('#sec-next-btn');
  const secPageInfo = container.querySelector('#sec-page-info');

  const auditPanel = container.querySelector('#audit-logs-panel');
  const auditTbody = container.querySelector('#audit-logs-tbody');
  const auditEmpty = container.querySelector('#audit-logs-empty');
  const auditPrevBtn = container.querySelector('#audit-prev-btn');
  const auditNextBtn = container.querySelector('#audit-next-btn');
  const auditPageInfo = container.querySelector('#audit-page-info');

  function updateTabUI() {
    if (activeTab === 'security') {
      tabSecBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-purple-900/90 text-white shadow-lg border border-purple-700/80';
      tabAuditBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-400 hover:text-white';
      secPanel.classList.remove('hidden');
      auditPanel.classList.add('hidden');
      guidanceBanner.className = 'p-3.5 rounded-xl border text-xs shadow-inner flex items-start gap-3 bg-red-950/30 border-red-900/50 text-red-200';
      guidanceBanner.innerHTML = `
        <span class="text-base shrink-0 mt-0.5">🚨</span>
        <div class="space-y-0.5">
          <span class="font-bold">নিরাপত্তা লগ নির্দেশিকা:</span>
          <p class="text-slate-400">প্রমাণীকরণ ব্যর্থতা, রেট-লিমিট ট্রিগার এবং সন্দেহজনক ট্রাফিকের আইপি ও ডিভাইস তথ্য সংরক্ষিত থাকে। কোনো পাসওয়ার্ড বা সংবেদনশীল প্রমাণ ইন্টারফেসে প্রদর্শিত হয় না।</p>
        </div>
      `;
    } else {
      tabAuditBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-purple-900/90 text-white shadow-lg border border-purple-700/80';
      tabSecBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-400 hover:text-white';
      auditPanel.classList.remove('hidden');
      secPanel.classList.add('hidden');
      guidanceBanner.className = 'p-3.5 rounded-xl border text-xs shadow-inner flex items-start gap-3 bg-indigo-950/30 border-indigo-900/50 text-indigo-200';
      guidanceBanner.innerHTML = `
        <span class="text-base shrink-0 mt-0.5">📝</span>
        <div class="space-y-0.5">
          <span class="font-bold">অডিট লগ নির্দেশিকা:</span>
          <p class="text-slate-400">সুপার অ্যাডমিন ও অ্যাডমিনদের দ্বারা সম্পন্ন সকল নীতিগত ও প্রোফাইল পরিবর্তন অপরিবর্তনশীল (Immutable) অডিট ট্রেইলে সংরক্ষিত। অডিট লগ মুছে ফেলা নিষিদ্ধ।</p>
        </div>
      `;
    }
  }

  tabSecBtn.addEventListener('click', () => {
    activeTab = 'security';
    updateTabUI();
    loadCurrentTab();
  });

  tabAuditBtn.addEventListener('click', () => {
    activeTab = 'audit';
    updateTabUI();
    loadCurrentTab();
  });

  async function loadSecurityLogs() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    secPanel.classList.add('hidden');

    try {
      const res = await superAdminService.getSecurityLogs({ page: secPage, limit: secLimit });
      const logs = res?.data || [];
      const total = res?.meta?.total ?? logs.length;
      const totalPages = Math.max(1, Math.ceil(total / secLimit));

      tabSecBadge.textContent = total;
      secPageInfo.textContent = `পৃষ্ঠা ${secPage} / ${totalPages} (মোট ${total}টি নিরাপত্তা লগ)`;
      secPrevBtn.disabled = secPage <= 1;
      secNextBtn.disabled = secPage >= totalPages;

      if (logs.length === 0) {
        secTbody.innerHTML = '';
        secEmpty.classList.remove('hidden');
      } else {
        secEmpty.classList.add('hidden');
        secTbody.innerHTML = logs
          .map((log) => {
            const time = formatDateTime(log.timestamp);
            return `
              <tr class="hover:bg-slate-850/40 transition">
                <td class="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  ${time}
                </td>
                <td class="px-4 py-3 font-mono font-bold text-red-300 text-xs">
                  <span class="px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-[11px]">
                    ${log.eventType || 'SECURITY_EVENT'}
                  </span>
                </td>
                <td class="px-4 py-3 font-mono text-slate-300 text-[11px]">
                  ${log.ip || '—'}
                </td>
                <td class="px-4 py-3">
                  ${log.riskSignal ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">${log.riskSignal}</span>` : '<span class="text-slate-500">—</span>'}
                </td>
                <td class="px-4 py-3 text-slate-300 text-[11px]">
                  ${log.actionTaken || 'Log Only'}
                </td>
                <td class="px-4 py-3 text-slate-400 text-[10px] font-mono truncate max-w-xs" title="${log.userAgent || ''}">
                  ${log.userAgent || '—'}
                </td>
              </tr>
            `;
          })
          .join('');
      }

      loadingEl.classList.add('hidden');
      if (activeTab === 'security') secPanel.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.classList.remove('hidden');
      errorEl.innerHTML = `
        <div class="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 border border-red-900/60 text-center">
          <p class="text-sm font-semibold text-red-400 mb-2">নিরাপত্তা লগ লোড করা যায়নি</p>
          <p class="text-xs text-slate-400 mb-4">${err?.message || 'অনুরোধ ব্যর্থ হয়েছে'}</p>
        </div>
      `;
    }
  }

  async function loadAuditLogs() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    auditPanel.classList.add('hidden');

    try {
      const res = await superAdminService.getAuditLogs({ page: auditPage, limit: auditLimit });
      const logs = res?.data || [];
      const total = res?.meta?.total ?? logs.length;
      const totalPages = Math.max(1, Math.ceil(total / auditLimit));

      tabAuditBadge.textContent = total;
      auditPageInfo.textContent = `পৃষ্ঠা ${auditPage} / ${totalPages} (মোট ${total}টি অডিট লগ)`;
      auditPrevBtn.disabled = auditPage <= 1;
      auditNextBtn.disabled = auditPage >= totalPages;

      if (logs.length === 0) {
        auditTbody.innerHTML = '';
        auditEmpty.classList.remove('hidden');
      } else {
        auditEmpty.classList.add('hidden');
        auditTbody.innerHTML = logs
          .map((log) => {
            const time = formatDateTime(log.timestamp || log.createdAt);
            const actorBadgeColor = log.actorType === 'superAdmin'
              ? 'bg-purple-950 text-purple-300 border-purple-800'
              : log.actorType === 'admin'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-slate-800 text-slate-300 border-slate-700';

            return `
              <tr class="hover:bg-slate-850/40 transition">
                <td class="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  ${time}
                </td>
                <td class="px-4 py-3 font-mono font-bold text-indigo-300 text-xs">
                  <span class="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-[11px]">
                    ${log.action || 'ACTION'}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${actorBadgeColor}">
                    ${log.actorType || 'actor'}
                  </span>
                  <span class="block text-[10px] text-slate-500 font-mono mt-0.5">${log.actorId ? `#${log.actorId.slice(-6).toUpperCase()}` : ''}</span>
                </td>
                <td class="px-4 py-3 text-slate-300 text-[11px]">
                  <span class="font-semibold text-slate-200">${log.resourceType || log.entity || '—'}</span>
                  ${log.resourceId || log.entityId ? `<span class="text-slate-500 font-mono block text-[10px]">${log.resourceId || log.entityId}</span>` : ''}
                </td>
                <td class="px-4 py-3 font-mono text-slate-400 text-[11px]">
                  ${log.ip || '—'}
                </td>
                <td class="px-4 py-3 font-mono text-slate-500 text-[10px] truncate max-w-[120px]" title="${log.requestId || ''}">
                  ${log.requestId ? log.requestId.slice(0, 8) + '...' : '—'}
                </td>
              </tr>
            `;
          })
          .join('');
      }

      loadingEl.classList.add('hidden');
      if (activeTab === 'audit') auditPanel.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.classList.remove('hidden');
      errorEl.innerHTML = `
        <div class="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 border border-red-900/60 text-center">
          <p class="text-sm font-semibold text-red-400 mb-2">অডিট লগ লোড করা যায়নি</p>
          <p class="text-xs text-slate-400 mb-4">${err?.message || 'অনুরোধ ব্যর্থ হয়েছে'}</p>
        </div>
      `;
    }
  }

  function loadCurrentTab() {
    if (activeTab === 'security') {
      loadSecurityLogs();
    } else {
      loadAuditLogs();
    }
  }

  // Event Listeners
  refreshBtn.addEventListener('click', () => {
    loadSecurityLogs();
    loadAuditLogs();
  });

  secPrevBtn.addEventListener('click', () => {
    if (secPage > 1) {
      secPage--;
      loadSecurityLogs();
    }
  });

  secNextBtn.addEventListener('click', () => {
    secPage++;
    loadSecurityLogs();
  });

  auditPrevBtn.addEventListener('click', () => {
    if (auditPage > 1) {
      auditPage--;
      loadAuditLogs();
    }
  });

  auditNextBtn.addEventListener('click', () => {
    auditPage++;
    loadAuditLogs();
  });

  updateTabUI();
  // Pre-fetch both for badge counters
  await Promise.all([loadSecurityLogs(), loadAuditLogs()]);
}
