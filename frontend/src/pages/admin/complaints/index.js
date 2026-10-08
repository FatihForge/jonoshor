import { adminComplaintService } from '../../../services/admin/adminComplaintService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';
import { getStatusBadge, getPriorityBadge } from '../../../components/admin/StatusBadge.js';
import { formatDate } from '../../../utils/formatters.js';

export async function renderAdminComplaintsPage(container) {
  // Extract query parameters from URL hash e.g. #/admin/complaints?status=submitted&page=1
  const hash = window.location.hash || '#/admin/complaints';
  const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
  const searchParams = new URLSearchParams(queryStr);

  const initialStatus = searchParams.get('status') || '';
  const initialPriority = searchParams.get('priority') || '';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderAdminNav('complaints')}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Complaints Review Queue</h1>
            <p class="text-sm text-slate-500 mt-1">Intake screening, factual verification, and review pipeline for human rights reports</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="refresh-btn" class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 transition flex items-center gap-1.5 shadow-2xs">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="my-6 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[180px]">
            <label for="filter-status" class="block text-xs font-semibold text-slate-700 mb-1">Filter by Status</label>
            <select id="filter-status" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
              <option value="">All Statuses</option>
              <option value="submitted" ${initialStatus === 'submitted' ? 'selected' : ''}>Submitted</option>
              <option value="screening" ${initialStatus === 'screening' ? 'selected' : ''}>Screening</option>
              <option value="needs_information" ${initialStatus === 'needs_information' ? 'selected' : ''}>Needs Information</option>
              <option value="evidence_review" ${initialStatus === 'evidence_review' ? 'selected' : ''}>Evidence Review</option>
              <option value="verification" ${initialStatus === 'verification' ? 'selected' : ''}>Verification</option>
              <option value="verified" ${initialStatus === 'verified' ? 'selected' : ''}>Verified</option>
              <option value="public_disclosure_review" ${initialStatus === 'public_disclosure_review' ? 'selected' : ''}>Publication Review</option>
              <option value="published" ${initialStatus === 'published' ? 'selected' : ''}>Published</option>
              <option value="rejected" ${initialStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
              <option value="withdrawn" ${initialStatus === 'withdrawn' ? 'selected' : ''}>Withdrawn</option>
            </select>
          </div>

          <div class="w-44">
            <label for="filter-priority" class="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select id="filter-priority" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
              <option value="">All Priorities</option>
              <option value="urgent" ${initialPriority === 'urgent' ? 'selected' : ''}>Urgent</option>
              <option value="high" ${initialPriority === 'high' ? 'selected' : ''}>High</option>
              <option value="normal" ${initialPriority === 'normal' ? 'selected' : ''}>Normal</option>
              <option value="low" ${initialPriority === 'low' ? 'selected' : ''}>Low</option>
            </select>
          </div>

          <div class="self-end flex items-center gap-2">
            <button id="apply-filters-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
              Apply Filters
            </button>
            <button id="reset-filters-btn" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs transition">
              Reset
            </button>
          </div>
        </div>

        <!-- Table Container -->
        <div id="complaints-list-container" class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div id="table-loading" class="py-20 text-center" role="status">
            <div class="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" aria-hidden="true"></div>
            <p class="text-xs text-slate-500">Loading complaints list...</p>
          </div>
          <div id="table-content" class="hidden"></div>
          <div id="table-error" class="hidden p-8 text-center text-xs text-red-700" role="alert"></div>
        </div>

        <!-- Pagination Controls -->
        <div id="pagination-container" class="mt-6 flex items-center justify-between text-xs text-slate-500 hidden">
          <div id="pagination-info"></div>
          <div class="flex items-center gap-2">
            <button id="prev-page-btn" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
              ← Previous
            </button>
            <button id="next-page-btn" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  `;

  let currentPage = initialPage;
  const limit = 20;

  const statusSelect = container.querySelector('#filter-status');
  const prioritySelect = container.querySelector('#filter-priority');
  const applyBtn = container.querySelector('#apply-filters-btn');
  const resetBtn = container.querySelector('#reset-filters-btn');
  const refreshBtn = container.querySelector('#refresh-btn');

  const loadingEl = container.querySelector('#table-loading');
  const contentEl = container.querySelector('#table-content');
  const errorEl = container.querySelector('#table-error');
  const paginationContainer = container.querySelector('#pagination-container');
  const paginationInfo = container.querySelector('#pagination-info');
  const prevBtn = container.querySelector('#prev-page-btn');
  const nextBtn = container.querySelector('#next-page-btn');

  async function loadComplaints() {
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    paginationContainer.classList.add('hidden');

    const status = statusSelect.value || undefined;
    const priority = prioritySelect.value || undefined;

    try {
      const res = await adminComplaintService.listComplaints({
        page: currentPage,
        limit,
        status,
        priority,
      });

      const items = res?.data || [];
      const meta = res?.meta || { page: currentPage, limit, total: items.length };

      if (items.length === 0) {
        contentEl.innerHTML = `
          <div class="py-16 text-center text-slate-500">
            <svg class="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-sm text-slate-800 font-semibold mb-1">No complaints found</p>
            <p class="text-xs text-slate-500">No records match the current filter selection.</p>
          </div>
        `;
      } else {
        contentEl.innerHTML = `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" class="px-5 py-3.5">ID</th>
                  <th scope="col" class="px-5 py-3.5">Category</th>
                  <th scope="col" class="px-5 py-3.5">Location</th>
                  <th scope="col" class="px-5 py-3.5">Incident Date</th>
                  <th scope="col" class="px-5 py-3.5">Priority</th>
                  <th scope="col" class="px-5 py-3.5">Status</th>
                  <th scope="col" class="px-5 py-3.5">Filed On</th>
                  <th scope="col" class="px-5 py-3.5">Reviewer</th>
                  <th scope="col" class="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${items
                  .map(
                    (comp) => `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="px-5 py-3.5 font-mono font-medium text-emerald-700">
                      <a href="#/admin/complaints/${comp._id}" class="hover:underline">
                        #${String(comp._id).slice(-8)}
                      </a>
                    </td>
                    <td class="px-5 py-3.5 font-medium text-slate-900 max-w-[160px] truncate" title="${comp.category?.primary || ''}">
                      ${comp.category?.primary || 'Unspecified'}
                    </td>
                    <td class="px-5 py-3.5 text-slate-700">
                      ${comp.location?.districtId || '—'}
                      ${comp.location?.divisionId ? `<span class="text-slate-500 text-[10px]">(${comp.location.divisionId})</span>` : ''}
                    </td>
                    <td class="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                      ${formatDate(comp.incident?.startDate)}
                      ${comp.incident?.ongoing ? '<span class="text-[10px] text-amber-700 block font-medium">Ongoing</span>' : ''}
                    </td>
                    <td class="px-5 py-3.5">
                      ${getPriorityBadge(comp.priority)}
                    </td>
                    <td class="px-5 py-3.5">
                      ${getStatusBadge(comp.status)}
                    </td>
                    <td class="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                      ${formatDate(comp.createdAt)}
                    </td>
                    <td class="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      ${comp.review?.assignedReviewerId ? `#${String(comp.review.assignedReviewerId).slice(-6)}` : '<span class="text-slate-400">Unassigned</span>'}
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <a href="#/admin/complaints/${comp._id}" class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium transition text-xs">
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
        `;

        // Update pagination
        const total = meta.total || items.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        paginationInfo.textContent = `Showing page ${currentPage} of ${totalPages} (${total} total complaints)`;

        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
        paginationContainer.classList.remove('hidden');
      }

      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.textContent = err.message || 'Failed to load complaints list. Check permissions.';
      errorEl.classList.remove('hidden');
    }
  }

  applyBtn.addEventListener('click', () => {
    currentPage = 1;
    const params = new URLSearchParams();
    if (statusSelect.value) params.set('status', statusSelect.value);
    if (prioritySelect.value) params.set('priority', prioritySelect.value);
    params.set('page', '1');
    window.location.hash = `#/admin/complaints?${params.toString()}`;
    loadComplaints();
  });

  resetBtn.addEventListener('click', () => {
    statusSelect.value = '';
    prioritySelect.value = '';
    currentPage = 1;
    window.location.hash = '#/admin/complaints';
    loadComplaints();
  });

  refreshBtn.addEventListener('click', loadComplaints);

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadComplaints();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentPage++;
    loadComplaints();
  });

  await loadComplaints();
}
