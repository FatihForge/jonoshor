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
    <div class="min-h-screen bg-slate-950 text-slate-100">
      ${renderAdminNav('complaints')}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">অভিযোগ পর্যালোচনা তালিকা</h1>
            <p class="text-sm text-slate-400 mt-1">দাখিলকৃত অভিযোগের প্রাথমিক বাছাই, সত্যতা যাচাই ও পর্যালোচনা পাইপলাইন</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="refresh-btn" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              রিফ্রেশ
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="my-6 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[180px]">
            <label class="block text-xs font-semibold text-slate-400 mb-1">স্ট্যাটাস অনুযায়ী ফিল্টার</label>
            <select id="filter-status" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
              <option value="">সকল স্ট্যাটাস</option>
              <option value="submitted" ${initialStatus === 'submitted' ? 'selected' : ''}>দাখিলকৃত (Submitted)</option>
              <option value="screening" ${initialStatus === 'screening' ? 'selected' : ''}>বাছাইকরণ (Screening)</option>
              <option value="needs_information" ${initialStatus === 'needs_information' ? 'selected' : ''}>তথ্য প্রয়োজন (Needs Info)</option>
              <option value="evidence_review" ${initialStatus === 'evidence_review' ? 'selected' : ''}>প্রমাণ পর্যালোচনা (Evidence Review)</option>
              <option value="verification" ${initialStatus === 'verification' ? 'selected' : ''}>যাচাইকরণাধীন (Verification)</option>
              <option value="verified" ${initialStatus === 'verified' ? 'selected' : ''}>যাচাইকৃত (Verified)</option>
              <option value="public_disclosure_review" ${initialStatus === 'public_disclosure_review' ? 'selected' : ''}>প্রকাশনা পর্যালোচনা (Publication Review)</option>
              <option value="published" ${initialStatus === 'published' ? 'selected' : ''}>প্রকাশিত (Published)</option>
              <option value="rejected" ${initialStatus === 'rejected' ? 'selected' : ''}>প্রত্যাখ্যাত (Rejected)</option>
              <option value="withdrawn" ${initialStatus === 'withdrawn' ? 'selected' : ''}>প্রত্যাহারকৃত (Withdrawn)</option>
            </select>
          </div>

          <div class="w-44">
            <label class="block text-xs font-semibold text-slate-400 mb-1">অগ্রাধিকার</label>
            <select id="filter-priority" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
              <option value="">সকল অগ্রাধিকার</option>
              <option value="urgent" ${initialPriority === 'urgent' ? 'selected' : ''}>জরুরি (Urgent)</option>
              <option value="high" ${initialPriority === 'high' ? 'selected' : ''}>উচ্চ (High)</option>
              <option value="normal" ${initialPriority === 'normal' ? 'selected' : ''}>সাধারণ (Normal)</option>
              <option value="low" ${initialPriority === 'low' ? 'selected' : ''}>নিম্ন (Low)</option>
            </select>
          </div>

          <div class="self-end flex items-center gap-2">
            <button id="apply-filters-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition">
              ফিল্টার প্রয়োগ
            </button>
            <button id="reset-filters-btn" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition">
              রিসেট
            </button>
          </div>
        </div>

        <!-- Table Container -->
        <div id="complaints-list-container" class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div id="table-loading" class="py-20 text-center">
            <div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-xs text-slate-400">অভিযোগ তালিকা প্রস্তুত হচ্ছে...</p>
          </div>
          <div id="table-content" class="hidden"></div>
          <div id="table-error" class="hidden p-8 text-center text-xs text-red-300"></div>
        </div>

        <!-- Pagination Controls -->
        <div id="pagination-container" class="mt-6 flex items-center justify-between text-xs text-slate-400 hidden">
          <div id="pagination-info"></div>
          <div class="flex items-center gap-2">
            <button id="prev-page-btn" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition">
              ← পূর্ববর্তী
            </button>
            <button id="next-page-btn" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition">
              পরবর্তী →
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
            <svg class="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-sm text-slate-300 font-semibold mb-1">কোনো অভিযোগ পাওয়া যায়নি</p>
            <p class="text-xs text-slate-500">নির্বাচিত ফিল্টারের সাথে মিলে এমন কোনো রেকর্ড বিদ্যমান নেই।</p>
          </div>
        `;
      } else {
        contentEl.innerHTML = `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="px-5 py-3.5">আইডি</th>
                  <th class="px-5 py-3.5">ক্যাটেগরি</th>
                  <th class="px-5 py-3.5">স্থান</th>
                  <th class="px-5 py-3.5">ঘটনার তারিখ</th>
                  <th class="px-5 py-3.5">অগ্রাধিকার</th>
                  <th class="px-5 py-3.5">স্ট্যাটাস</th>
                  <th class="px-5 py-3.5">দাখিলের তারিখ</th>
                  <th class="px-5 py-3.5">রিভিউয়ার</th>
                  <th class="px-5 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${items
                  .map(
                    (comp) => `
                  <tr class="hover:bg-slate-800/40 transition">
                    <td class="px-5 py-3.5 font-mono font-medium text-emerald-400">
                      <a href="#/admin/complaints/${comp._id}" class="hover:underline">
                        #${String(comp._id).slice(-8)}
                      </a>
                    </td>
                    <td class="px-5 py-3.5 font-medium text-white max-w-[160px] truncate" title="${comp.category?.primary || ''}">
                      ${comp.category?.primary || 'অনির্দিষ্ট'}
                    </td>
                    <td class="px-5 py-3.5 text-slate-300">
                      ${comp.location?.districtId || '—'}
                      ${comp.location?.divisionId ? `<span class="text-slate-500 text-[10px]">(${comp.location.divisionId})</span>` : ''}
                    </td>
                    <td class="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      ${formatDate(comp.incident?.startDate)}
                      ${comp.incident?.ongoing ? '<span class="text-[10px] text-amber-400 block font-medium">চলমান</span>' : ''}
                    </td>
                    <td class="px-5 py-3.5">
                      ${getPriorityBadge(comp.priority)}
                    </td>
                    <td class="px-5 py-3.5">
                      ${getStatusBadge(comp.status)}
                    </td>
                    <td class="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      ${formatDate(comp.createdAt)}
                    </td>
                    <td class="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      ${comp.review?.assignedReviewerId ? `#${String(comp.review.assignedReviewerId).slice(-6)}` : '<span class="text-slate-600">নির্ধারিত নয়</span>'}
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <a href="#/admin/complaints/${comp._id}" class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-700/60 hover:bg-emerald-600 text-white rounded font-medium transition text-xs">
                        পর্যালোচনা
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
        paginationInfo.textContent = `মোট ${total} টি অভিযোগের মধ্যে পৃষ্ঠা ${currentPage} / ${totalPages}`;

        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
        paginationContainer.classList.remove('hidden');
      }

      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.textContent = err.message || 'অভিযোগ তালিকা লোড করতে ব্যর্থ হয়েছে। অনুমতি পরীক্ষা করুন।';
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
