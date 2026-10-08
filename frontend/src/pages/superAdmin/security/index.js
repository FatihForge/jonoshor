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
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderSuperAdminNav('security')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Security & Audit Intelligence</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono font-semibold">
                Security & Audit Intel
              </span>
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              Platform cyber security telemetry, authentication threat signals, and immutable privileged audit logs.
            </p>
          </div>
          <button id="refresh-logs-btn" class="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-purple-500/20" aria-label="Refresh security and audit logs">
            <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        <!-- Distinct Tabs Bar -->
        <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm w-fit" role="tablist" aria-label="Log categories">
          <button id="tab-security-btn" role="tab" aria-selected="${activeTab === 'security'}" class="px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }">
            <span>🛡️ Security Logs</span>
            <span id="tab-sec-badge" class="px-1.5 py-0.2 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-mono">0</span>
          </button>
          <button id="tab-audit-btn" role="tab" aria-selected="${activeTab === 'audit'}" class="px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }">
            <span>📜 Privileged Audit Logs</span>
            <span id="tab-audit-badge" class="px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">0</span>
          </button>
        </div>

        <!-- Guidance Banner -->
        <div id="logs-guidance-banner" class="p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
          activeTab === 'security'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-indigo-50 border-indigo-200 text-indigo-900'
        }">
          <span class="text-base shrink-0 mt-0.5" aria-hidden="true">${activeTab === 'security' ? '🚨' : '📝'}</span>
          <div class="space-y-0.5">
            <span class="font-bold">${activeTab === 'security' ? 'Security Telemetry Protocol:' : 'Audit Protocol & Immutability:'}</span>
            <p class="text-slate-600 text-xs">
              ${
                activeTab === 'security'
                  ? 'Authentication failures, rate-limit triggers, and suspicious IP telemetry are recorded for security monitoring. Passwords and sensitive payloads are never logged or exposed.'
                  : 'All policy and configuration modifications initiated by administrators and Super Admins are saved to an immutable audit trail. Logs are permanent and tampering-resistant.'
              }
            </p>
          </div>
        </div>

        <!-- Main State Containers -->
        <div id="logs-loading" class="py-20 text-center" role="status" aria-live="polite">
          <div class="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
          <p class="text-slate-500 text-sm">Loading security logs...</p>
        </div>

        <div id="logs-error" class="hidden py-16 text-center" role="alert"></div>

        <!-- Panel 1: Security Logs -->
        <div id="sec-logs-panel" class="${activeTab === 'security' ? '' : 'hidden'} space-y-4" role="tabpanel" aria-labelledby="tab-security-btn">
          <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th scope="col" class="px-4 py-3 font-semibold">Timestamp</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Event Type</th>
                  <th scope="col" class="px-4 py-3 font-semibold">IP Address</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Risk Signal</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Action Taken</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Device / User Agent</th>
                </tr>
              </thead>
              <tbody id="sec-logs-tbody" class="divide-y divide-slate-100 text-slate-700">
                <!-- Injected dynamically -->
              </tbody>
            </table>
          </div>

          <div id="sec-logs-empty" class="hidden py-16 text-center rounded-2xl border border-slate-200 bg-white">
            <p class="text-sm font-semibold text-slate-900">No security events found</p>
          </div>

          <div id="sec-pagination" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <span id="sec-page-info">Page 1</span>
            <div class="flex items-center gap-2">
              <button id="sec-prev-btn" class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition">
                ← Previous
              </button>
              <button id="sec-next-btn" class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition">
                Next →
              </button>
            </div>
          </div>
        </div>

        <!-- Panel 2: Audit Logs -->
        <div id="audit-logs-panel" class="${activeTab === 'audit' ? '' : 'hidden'} space-y-4" role="tabpanel" aria-labelledby="tab-audit-btn">
          <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th scope="col" class="px-4 py-3 font-semibold">Timestamp</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Action</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Actor</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Resource</th>
                  <th scope="col" class="px-4 py-3 font-semibold">IP Address</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Request ID</th>
                </tr>
              </thead>
              <tbody id="audit-logs-tbody" class="divide-y divide-slate-100 text-slate-700">
                <!-- Injected dynamically -->
              </tbody>
            </table>
          </div>

          <div id="audit-logs-empty" class="hidden py-16 text-center rounded-2xl border border-slate-200 bg-white">
            <p class="text-sm font-semibold text-slate-900">No privileged audit logs found</p>
          </div>

          <div id="audit-pagination" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <span id="audit-page-info">Page 1</span>
            <div class="flex items-center gap-2">
              <button id="audit-prev-btn" class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition">
                ← Previous
              </button>
              <button id="audit-next-btn" class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition">
                Next →
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
      tabSecBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-purple-700 text-white shadow-sm';
      tabSecBtn.setAttribute('aria-selected', 'true');
      tabAuditBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-600 hover:text-slate-900';
      tabAuditBtn.setAttribute('aria-selected', 'false');
      secPanel.classList.remove('hidden');
      auditPanel.classList.add('hidden');
      guidanceBanner.className = 'p-3.5 rounded-xl border text-xs flex items-start gap-3 bg-rose-50 border-rose-200 text-rose-900';
      guidanceBanner.innerHTML = `
        <span class="text-base shrink-0 mt-0.5" aria-hidden="true">🚨</span>
        <div class="space-y-0.5">
          <span class="font-bold">Security Telemetry Protocol:</span>
          <p class="text-slate-600 text-xs">Authentication failures, rate-limit triggers, and suspicious IP telemetry are recorded for security monitoring. Passwords and sensitive payloads are never logged or exposed.</p>
        </div>
      `;
    } else {
      tabAuditBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-purple-700 text-white shadow-sm';
      tabAuditBtn.setAttribute('aria-selected', 'true');
      tabSecBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-600 hover:text-slate-900';
      tabSecBtn.setAttribute('aria-selected', 'false');
      auditPanel.classList.remove('hidden');
      secPanel.classList.add('hidden');
      guidanceBanner.className = 'p-3.5 rounded-xl border text-xs flex items-start gap-3 bg-indigo-50 border-indigo-200 text-indigo-900';
      guidanceBanner.innerHTML = `
        <span class="text-base shrink-0 mt-0.5" aria-hidden="true">📝</span>
        <div class="space-y-0.5">
          <span class="font-bold">Audit Protocol & Immutability:</span>
          <p class="text-slate-600 text-xs">All policy and configuration modifications initiated by administrators and Super Admins are saved to an immutable audit trail. Logs are permanent and tampering-resistant.</p>
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
      secPageInfo.textContent = `Page ${secPage} of ${totalPages} (${total} total security logs)`;
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
              <tr class="hover:bg-slate-50/80 transition">
                <td class="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  ${time}
                </td>
                <td class="px-4 py-3 font-mono font-bold text-rose-700 text-xs">
                  <span class="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-[11px]">
                    ${log.eventType || 'SECURITY_EVENT'}
                  </span>
                </td>
                <td class="px-4 py-3 font-mono text-slate-700 text-[11px]">
                  ${log.ip || '—'}
                </td>
                <td class="px-4 py-3">
                  ${log.riskSignal ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">${log.riskSignal}</span>` : '<span class="text-slate-400">—</span>'}
                </td>
                <td class="px-4 py-3 text-slate-700 text-[11px]">
                  ${log.actionTaken || 'Log Only'}
                </td>
                <td class="px-4 py-3 text-slate-500 text-[10px] font-mono truncate max-w-xs" title="${log.userAgent || ''}">
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
        <div class="max-w-md mx-auto p-6 rounded-2xl bg-white border border-rose-200 text-center shadow-sm">
          <p class="text-sm font-semibold text-rose-700 mb-2">Failed to load security logs</p>
          <p class="text-xs text-slate-500 mb-4">${err?.message || 'Request failed'}</p>
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
      auditPageInfo.textContent = `Page ${auditPage} of ${totalPages} (${total} total audit logs)`;
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
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : log.actorType === 'admin'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200';

            return `
              <tr class="hover:bg-slate-50/80 transition">
                <td class="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  ${time}
                </td>
                <td class="px-4 py-3 font-mono font-bold text-indigo-700 text-xs">
                  <span class="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-[11px]">
                    ${log.action || 'ACTION'}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${actorBadgeColor}">
                    ${log.actorType || 'actor'}
                  </span>
                  <span class="block text-[10px] text-slate-400 font-mono mt-0.5">${log.actorId ? `#${log.actorId.slice(-6).toUpperCase()}` : ''}</span>
                </td>
                <td class="px-4 py-3 text-slate-700 text-[11px]">
                  <span class="font-semibold text-slate-900">${log.resourceType || log.entity || '—'}</span>
                  ${log.resourceId || log.entityId ? `<span class="text-slate-400 font-mono block text-[10px]">${log.resourceId || log.entityId}</span>` : ''}
                </td>
                <td class="px-4 py-3 font-mono text-slate-600 text-[11px]">
                  ${log.ip || '—'}
                </td>
                <td class="px-4 py-3 font-mono text-slate-400 text-[10px] truncate max-w-[120px]" title="${log.requestId || ''}">
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
        <div class="max-w-md mx-auto p-6 rounded-2xl bg-white border border-rose-200 text-center shadow-sm">
          <p class="text-sm font-semibold text-rose-700 mb-2">Failed to load audit logs</p>
          <p class="text-xs text-slate-500 mb-4">${err?.message || 'Request failed'}</p>
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
