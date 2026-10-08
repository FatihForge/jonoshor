import { adminComplaintService } from '../../../services/admin/adminComplaintService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';
import { getStatusBadge } from '../../../components/admin/StatusBadge.js';
import { formatDate } from '../../../utils/formatters.js';

export async function renderAdminDashboardPage(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderAdminNav('dashboard')}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="dashboard-loading" class="py-20 text-center" role="status">
          <div class="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
          <p class="text-slate-500 text-sm">Loading dashboard data...</p>
        </div>
        <div id="dashboard-content" class="hidden space-y-8"></div>
        <div id="dashboard-error" class="hidden py-16 text-center" role="alert"></div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#dashboard-loading');
  const contentEl = container.querySelector('#dashboard-content');
  const errorEl = container.querySelector('#dashboard-error');

  try {
    const [metricsRes, recentComplaintsRes] = await Promise.all([
      adminComplaintService.getDashboard(),
      adminComplaintService.listComplaints({ page: 1, limit: 5 }),
    ]);

    const counts = metricsRes?.data?.counts || {};
    const recentItems = recentComplaintsRes?.data || [];

    contentEl.innerHTML = `
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Administrative Dashboard</h1>
          <p class="text-sm text-slate-500 mt-1">Complaint verification pipeline and operational case summaries</p>
        </div>
        <div>
          <a href="#/admin/complaints" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition">
            Review All Complaints
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Metric Cards Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- 1. Total -->
        <a href="#/admin/complaints" class="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition block group">
          <span class="text-xs font-medium text-slate-500 block mb-1">Total Complaints</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition">${counts.total || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">All logged incident records</span>
        </a>

        <!-- 2. Submitted (New) -->
        <a href="#/admin/complaints?status=submitted" class="p-5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 shadow-xs transition block group">
          <span class="text-xs font-medium text-amber-700 block mb-1">Submitted (New)</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-amber-600">${counts.submitted || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">Awaiting intake screening</span>
        </a>

        <!-- 3. In Review -->
        <a href="#/admin/complaints?status=screening" class="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs transition block group">
          <span class="text-xs font-medium text-blue-700 block mb-1">Under Review</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-blue-600">${counts.pendingReview || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">Active screening & investigation</span>
        </a>

        <!-- 4. Needs Info -->
        <a href="#/admin/complaints?status=needs_information" class="p-5 rounded-xl bg-white border border-slate-200 hover:border-orange-400 shadow-xs transition block group">
          <span class="text-xs font-medium text-orange-700 block mb-1">Needs Information</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-orange-600">${counts.needsInformation || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">Awaiting complainant response</span>
        </a>

        <!-- 5. Verified -->
        <a href="#/admin/complaints?status=verified" class="p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs transition block group">
          <span class="text-xs font-medium text-emerald-700 block mb-1">Verified</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-emerald-600">${counts.verified || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">Corroborated allegations</span>
        </a>

        <!-- 6. Published -->
        <a href="#/admin/complaints?status=published" class="p-5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 shadow-xs transition block group">
          <span class="text-xs font-medium text-teal-700 block mb-1">Published</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-teal-600">${counts.published || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">Available in public reports</span>
        </a>

        <!-- 7. Rejected -->
        <a href="#/admin/complaints?status=rejected" class="p-5 rounded-xl bg-white border border-slate-200 hover:border-red-400 shadow-xs transition block group">
          <span class="text-xs font-medium text-red-700 block mb-1">Rejected</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-red-600">${counts.rejected || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">Unsubstantiated / ineligible</span>
        </a>

        <!-- 8. High Priority -->
        <a href="#/admin/complaints?priority=high" class="p-5 rounded-xl bg-white border border-slate-200 hover:border-rose-400 shadow-xs transition block group">
          <span class="text-xs font-medium text-rose-700 block mb-1">High Priority</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-rose-600">${counts.highPriority || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">Urgent scrutiny / high risk</span>
        </a>
      </div>

      <!-- Recent Complaints Section -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">Recent Complaints</h2>
          <a href="#/admin/complaints" class="text-xs text-emerald-700 hover:text-emerald-800 font-medium">View all complaints →</a>
        </div>

        ${
          recentItems.length === 0
            ? `
          <div class="p-8 text-center text-slate-500 text-sm">
            No complaints recorded in the system yet.
          </div>
        `
            : `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" class="px-6 py-3">Reference</th>
                  <th scope="col" class="px-6 py-3">Category</th>
                  <th scope="col" class="px-6 py-3">Location</th>
                  <th scope="col" class="px-6 py-3">Status</th>
                  <th scope="col" class="px-6 py-3">Date</th>
                  <th scope="col" class="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${recentItems
                  .map(
                    (comp) => `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="px-6 py-4 font-mono text-xs text-slate-600 font-medium">
                      #${String(comp._id).slice(-8)}
                    </td>
                    <td class="px-6 py-4 font-medium text-slate-900">
                      ${comp.category?.primary || 'Unspecified'}
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-500">
                      ${comp.location?.districtId || ''} ${comp.location?.divisionId ? `(${comp.location.divisionId})` : ''}
                    </td>
                    <td class="px-6 py-4">
                      ${getStatusBadge(comp.status)}
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-500">
                      ${formatDate(comp.createdAt)}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <a href="#/admin/complaints/${comp._id}" class="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded border border-slate-300 transition">
                        Review
                      </a>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
        }
      </div>
    `;

    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');
  } catch (err) {
    loadingEl.classList.add('hidden');
    errorEl.innerHTML = `
      <div class="max-w-md mx-auto p-6 bg-red-50 border border-red-300 rounded-xl text-center">
        <svg class="w-12 h-12 text-red-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <h3 class="text-base font-bold text-red-900 mb-1">Access Denied or Error</h3>
        <p class="text-xs text-red-700 mb-4">${err.message || 'Unable to load dashboard data. Check authorization or session status.'}</p>
        <a href="#/login" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold inline-block transition">
          Go to Login Page
        </a>
      </div>
    `;
    errorEl.classList.remove('hidden');
  }
}
