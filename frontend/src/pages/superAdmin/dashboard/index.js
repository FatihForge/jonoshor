import { superAdminService } from '../../../services/superAdmin/superAdminService.js';
import { renderSuperAdminNav } from '../../../components/superAdmin/SuperAdminNav.js';
import { formatDateTime } from '../../../utils/formatters.js';

export async function renderSuperAdminDashboardPage(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      ${renderSuperAdminNav('dashboard')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <!-- Header Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/30">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black text-white tracking-tight">সুপার অ্যাডমিন ড্যাশবোর্ড</h1>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                ROOT EXECUTIVE
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              প্ল্যাটফর্মের শীর্ষ শাসনব্যবস্থা, অ্যাডমিন অ্যাকাউন্ট পরিচালনা এবং রুট-লেভেল নিরাপত্তা পর্যবেক্ষণ কেন্দ্র।
            </p>
          </div>
          <div class="flex items-center gap-2.5">
            <button id="refresh-dashboard-btn" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 text-xs font-semibold border border-purple-900/60 shadow-lg transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              রিফ্রেশ
            </button>
            <a href="#/super-admin/admins" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/60 transition flex items-center gap-1.5">
              <span>+ নতুন অ্যাডমিন তৈরি</span>
            </a>
          </div>
        </div>

        <!-- State Containers -->
        <div id="sa-dash-loading" class="py-20 text-center">
          <div class="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm">সুপার অ্যাডমিন পরিসংখ্যান লোড হচ্ছে...</p>
        </div>

        <div id="sa-dash-error" class="hidden py-16 text-center"></div>

        <div id="sa-dash-content" class="hidden space-y-8">
          <!-- KPI Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- 1. Total Admins -->
            <a href="#/super-admin/admins" class="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-900/40 hover:border-purple-600/60 transition group shadow-lg">
              <div class="flex items-center justify-between text-xs text-purple-400 mb-2">
                <span class="font-semibold">মোট অ্যাডমিন</span>
                <span class="text-base group-hover:scale-110 transition">👥</span>
              </div>
              <div id="sa-count-admins" class="text-3xl font-black text-white group-hover:text-purple-300 transition">0</div>
              <div id="sa-admin-status-breakdown" class="mt-2 text-[11px] text-slate-400 font-mono">
                সক্রিয়: 0 • স্থগিত: 0
              </div>
            </a>

            <!-- 2. Security Logs -->
            <a href="#/super-admin/security" class="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-red-800/60 transition group shadow-lg">
              <div class="flex items-center justify-between text-xs text-red-400 mb-2">
                <span class="font-semibold">নিরাপত্তা লগ ইভেন্ট</span>
                <span class="text-base group-hover:scale-110 transition">🛡️</span>
              </div>
              <div id="sa-count-security" class="text-3xl font-black text-white group-hover:text-red-300 transition">0</div>
              <div class="mt-2 text-[11px] text-slate-500">
                লগইন ব্যর্থতা ও সাইবার ঝুঁকি রেকর্ড
              </div>
            </a>

            <!-- 3. Audit Logs -->
            <a href="#/super-admin/security?tab=audit" class="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-800/60 transition group shadow-lg">
              <div class="flex items-center justify-between text-xs text-indigo-400 mb-2">
                <span class="font-semibold">প্রশাসনিক অডিট ট্রেইল</span>
                <span class="text-base group-hover:scale-110 transition">📜</span>
              </div>
              <div id="sa-count-audit" class="text-3xl font-black text-white group-hover:text-indigo-300 transition">0</div>
              <div class="mt-2 text-[11px] text-slate-500">
                অপরিবর্তনীয় বিশেষাধিকারপ্রাপ্ত অ্যাকশন
              </div>
            </a>

            <!-- 4. System Status -->
            <div class="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-900/40 shadow-lg">
              <div class="flex items-center justify-between text-xs text-emerald-400 mb-2">
                <span class="font-semibold">প্ল্যাটফর্ম অবস্থা</span>
                <span class="text-base">⚡</span>
              </div>
              <div class="text-xl font-bold text-emerald-300 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                পরিচালনক্ষম
              </div>
              <div class="mt-2 text-[11px] text-slate-500 font-mono">
                API Core: 200 OK • CSRF Active
              </div>
            </div>
          </div>

          <!-- Dual Preview Panels: Recent Security Events & Recent Audit Actions -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left: Recent Security Logs -->
            <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="text-red-400">🚨</span>
                  <h2 class="text-sm font-bold text-white uppercase tracking-wider">সাম্প্রতিক নিরাপত্তা ঘটনা</h2>
                </div>
                <a href="#/super-admin/security" class="text-xs text-purple-400 hover:text-purple-300 font-medium transition">
                  সকল দেখুন →
                </a>
              </div>

              <div id="sa-recent-security-list" class="space-y-2.5">
                <!-- Injected dynamically -->
              </div>
            </div>

            <!-- Right: Recent Privileged Audit Actions -->
            <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="text-indigo-400">📝</span>
                  <h2 class="text-sm font-bold text-white uppercase tracking-wider">সাম্প্রতিক অডিট কার্যকলাপ</h2>
                </div>
                <a href="#/super-admin/security?tab=audit" class="text-xs text-purple-400 hover:text-purple-300 font-medium transition">
                  সকল দেখুন →
                </a>
              </div>

              <div id="sa-recent-audit-list" class="space-y-2.5">
                <!-- Injected dynamically -->
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#sa-dash-loading');
  const errorEl = container.querySelector('#sa-dash-error');
  const contentEl = container.querySelector('#sa-dash-content');
  const refreshBtn = container.querySelector('#refresh-dashboard-btn');

  const countAdmins = container.querySelector('#sa-count-admins');
  const adminBreakdown = container.querySelector('#sa-admin-status-breakdown');
  const countSecurity = container.querySelector('#sa-count-security');
  const countAudit = container.querySelector('#sa-count-audit');
  const securityListEl = container.querySelector('#sa-recent-security-list');
  const auditListEl = container.querySelector('#sa-recent-audit-list');

  async function loadDashboard() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    contentEl.classList.add('hidden');

    try {
      const [dashRes, securityRes, auditRes] = await Promise.all([
        superAdminService.getDashboard(),
        superAdminService.getSecurityLogs({ page: 1, limit: 5 }),
        superAdminService.getAuditLogs({ page: 1, limit: 5 }),
      ]);

      const counts = dashRes?.data?.counts || {};
      const secLogs = securityRes?.data || [];
      const auditLogs = auditRes?.data || [];

      countAdmins.textContent = counts.totalAdmins ?? 0;
      adminBreakdown.textContent = `সক্রিয়: ${counts.activeAdmins ?? 0} • স্থগিত: ${counts.suspendedAdmins ?? 0} • অবরুদ্ধ: ${counts.blockedAdmins ?? 0}`;
      countSecurity.textContent = counts.totalSecurityLogs ?? securityRes?.meta?.total ?? 0;
      countAudit.textContent = counts.totalAuditLogs ?? auditRes?.meta?.total ?? 0;

      // Render recent security events
      if (secLogs.length === 0) {
        securityListEl.innerHTML = '<p class="text-xs text-slate-500 py-4 text-center">কোনো নিরাপত্তা ঘটনা রেকর্ড নেই</p>';
      } else {
        securityListEl.innerHTML = secLogs
          .map((log) => {
            const time = formatDateTime(log.timestamp);
            return `
              <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between gap-3">
                <div class="space-y-0.5 truncate">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-red-300 text-[11px]">${log.eventType || 'SECURITY_EVENT'}</span>
                    ${log.riskSignal ? `<span class="px-1.5 py-0.2 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">${log.riskSignal}</span>` : ''}
                  </div>
                  <div class="text-[11px] text-slate-400 font-mono truncate">IP: ${log.ip || '—'}</div>
                </div>
                <span class="text-[11px] text-slate-500 whitespace-nowrap font-mono">${time}</span>
              </div>
            `;
          })
          .join('');
      }

      // Render recent audit logs
      if (auditLogs.length === 0) {
        auditListEl.innerHTML = '<p class="text-xs text-slate-500 py-4 text-center">কোনো অডিট কার্যকলাপ রেকর্ড নেই</p>';
      } else {
        auditListEl.innerHTML = auditLogs
          .map((log) => {
            const time = formatDateTime(log.timestamp || log.createdAt);
            return `
              <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between gap-3">
                <div class="space-y-0.5 truncate">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-indigo-300 text-[11px]">${log.action || 'AUDIT_ACTION'}</span>
                    <span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">${log.actorType || 'actor'}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 truncate">${log.resourceType || ''} ${log.resourceId ? `#${log.resourceId.slice(-6).toUpperCase()}` : ''}</div>
                </div>
                <span class="text-[11px] text-slate-500 whitespace-nowrap font-mono">${time}</span>
              </div>
            `;
          })
          .join('');
      }

      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.classList.remove('hidden');
      errorEl.innerHTML = `
        <div class="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 border border-red-900/60 text-center">
          <p class="text-sm font-semibold text-red-400 mb-2">ড্যাশবোর্ড তথ্য লোড করা যায়নি</p>
          <p class="text-xs text-slate-400 mb-4">${err?.message || 'অনুরোধ ব্যর্থ হয়েছে'}</p>
          <button id="retry-dash-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition">
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      `;
      const retryBtn = errorEl.querySelector('#retry-dash-btn');
      if (retryBtn) retryBtn.addEventListener('click', loadDashboard);
    }
  }

  refreshBtn.addEventListener('click', loadDashboard);
  await loadDashboard();
}
