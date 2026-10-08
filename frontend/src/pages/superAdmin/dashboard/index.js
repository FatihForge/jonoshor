import { superAdminService } from '../../../services/superAdmin/superAdminService.js';
import { renderSuperAdminNav } from '../../../components/superAdmin/SuperAdminNav.js';
import { formatDateTime } from '../../../utils/formatters.js';

export async function renderSuperAdminDashboardPage(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderSuperAdminNav('dashboard')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <!-- Header Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">Super Admin Console</h1>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                ROOT EXECUTIVE
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Platform root governance, administrator management, and executive security monitoring center.
            </p>
          </div>
          <div class="flex items-center gap-2.5">
            <button id="refresh-dashboard-btn" class="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20" aria-label="Refresh executive dashboard">
              <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>Refresh</span>
            </button>
            <a href="#/super-admin/admins" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20">
              <span aria-hidden="true">+</span>
              <span>New Administrator</span>
            </a>
          </div>
        </div>

        <!-- State Containers -->
        <div id="sa-dash-loading" class="py-20 text-center" role="status" aria-live="polite">
          <div class="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
          <p class="text-slate-500 text-sm">Loading executive dashboard metrics...</p>
        </div>

        <div id="sa-dash-error" class="hidden py-16 text-center" role="alert"></div>

        <div id="sa-dash-content" class="hidden space-y-8">
          <!-- KPI Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- 1. Total Admins -->
            <a href="#/super-admin/admins" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-sm transition group">
              <div class="flex items-center justify-between text-xs text-purple-700 mb-2">
                <span class="font-semibold">Total Administrators</span>
                <span class="text-base group-hover:scale-110 transition" aria-hidden="true">👥</span>
              </div>
              <div id="sa-count-admins" class="text-3xl font-black text-slate-900 group-hover:text-purple-700 transition">0</div>
              <div id="sa-admin-status-breakdown" class="mt-2 text-[11px] text-slate-500 font-mono">
                Active: 0 • Suspended: 0 • Blocked: 0
              </div>
            </a>

            <!-- 2. Security Logs -->
            <a href="#/super-admin/security" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 shadow-sm transition group">
              <div class="flex items-center justify-between text-xs text-rose-700 mb-2">
                <span class="font-semibold">Security Events</span>
                <span class="text-base group-hover:scale-110 transition" aria-hidden="true">🛡️</span>
              </div>
              <div id="sa-count-security" class="text-3xl font-black text-slate-900 group-hover:text-rose-700 transition">0</div>
              <div class="mt-2 text-[11px] text-slate-500">
                Failed logins & threat signals
              </div>
            </a>

            <!-- 3. Audit Logs -->
            <a href="#/super-admin/security?tab=audit" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-sm transition group">
              <div class="flex items-center justify-between text-xs text-indigo-700 mb-2">
                <span class="font-semibold">Privileged Audit Trail</span>
                <span class="text-base group-hover:scale-110 transition" aria-hidden="true">📜</span>
              </div>
              <div id="sa-count-audit" class="text-3xl font-black text-slate-900 group-hover:text-indigo-700 transition">0</div>
              <div class="mt-2 text-[11px] text-slate-500">
                Immutable privileged actions
              </div>
            </a>

            <!-- 4. System Status -->
            <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between text-xs text-emerald-700 mb-2">
                <span class="font-semibold">System Operational Status</span>
                <span class="text-base" aria-hidden="true">⚡</span>
              </div>
              <div class="text-xl font-bold text-emerald-700 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                Operational
              </div>
              <div class="mt-2 text-[11px] text-slate-500 font-mono">
                Core API: 200 OK • CSRF Active
              </div>
            </div>
          </div>

          <!-- Dual Preview Panels: Recent Security Events & Recent Audit Actions -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left: Recent Security Logs -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <span class="text-rose-600" aria-hidden="true">🚨</span>
                  <h2 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Security Events</h2>
                </div>
                <a href="#/super-admin/security" class="text-xs text-purple-700 hover:text-purple-800 font-medium transition">
                  View All →
                </a>
              </div>

              <div id="sa-recent-security-list" class="space-y-2.5">
                <!-- Injected dynamically -->
              </div>
            </div>

            <!-- Right: Recent Privileged Audit Actions -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <span class="text-indigo-600" aria-hidden="true">📝</span>
                  <h2 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Audit Activity</h2>
                </div>
                <a href="#/super-admin/security?tab=audit" class="text-xs text-purple-700 hover:text-purple-800 font-medium transition">
                  View All →
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
      adminBreakdown.textContent = `Active: ${counts.activeAdmins ?? 0} • Suspended: ${counts.suspendedAdmins ?? 0} • Blocked: ${counts.blockedAdmins ?? 0}`;
      countSecurity.textContent = counts.totalSecurityLogs ?? securityRes?.meta?.total ?? 0;
      countAudit.textContent = counts.totalAuditLogs ?? auditRes?.meta?.total ?? 0;

      // Render recent security events
      if (secLogs.length === 0) {
        securityListEl.innerHTML = '<p class="text-xs text-slate-500 py-4 text-center">No recent security events recorded.</p>';
      } else {
        securityListEl.innerHTML = secLogs
          .map((log) => {
            const time = formatDateTime(log.timestamp);
            return `
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                <div class="space-y-0.5 truncate">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-rose-700 text-[11px]">${log.eventType || 'SECURITY_EVENT'}</span>
                    ${log.riskSignal ? `<span class="px-1.5 py-0.2 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200">${log.riskSignal}</span>` : ''}
                  </div>
                  <div class="text-[11px] text-slate-500 font-mono truncate">IP: ${log.ip || '—'}</div>
                </div>
                <span class="text-[11px] text-slate-500 whitespace-nowrap font-mono">${time}</span>
              </div>
            `;
          })
          .join('');
      }

      // Render recent audit logs
      if (auditLogs.length === 0) {
        auditListEl.innerHTML = '<p class="text-xs text-slate-500 py-4 text-center">No privileged audit actions recorded.</p>';
      } else {
        auditListEl.innerHTML = auditLogs
          .map((log) => {
            const time = formatDateTime(log.timestamp || log.createdAt);
            return `
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                <div class="space-y-0.5 truncate">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-indigo-700 text-[11px]">${log.action || 'AUDIT_ACTION'}</span>
                    <span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">${log.actorType || 'actor'}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 truncate">${log.resourceType || ''} ${log.resourceId ? `#${log.resourceId.slice(-6).toUpperCase()}` : ''}</div>
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
        <div class="max-w-md mx-auto p-6 rounded-2xl bg-white border border-rose-200 text-center shadow-sm">
          <p class="text-sm font-semibold text-rose-700 mb-2">Unable to load dashboard data</p>
          <p class="text-xs text-slate-500 mb-4">${err?.message || 'Request failed'}</p>
          <button id="retry-dash-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition">
            Retry
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
