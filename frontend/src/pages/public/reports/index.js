import { reportService } from '../../../services/reports/reportService.js';
import { locationService } from '../../../services/locations/locationService.js';
import { COMPLAINT_CATEGORIES } from '../../../config/constants.js';

export async function renderReportsPage(container) {
  let currentPage = 1;
  let filters = {
    keyword: '',
    category: '',
    districtId: '',
    upazilaId: '',
    dateFrom: '',
    dateTo: '',
    caseStatus: '',
  };

  const CASE_STATUS_MAP = {
    under_investigation: { bn: 'তদন্তাধীন', color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
    case_filed: { bn: 'মামলা দায়েরকৃত', color: 'text-blue-400 bg-blue-950/60 border-blue-800' },
    trial: { bn: 'বিচারিক পর্যায়ে', color: 'text-purple-400 bg-purple-950/60 border-purple-800' },
    no_legal_case: { bn: 'কোনো মামলা নেই', color: 'text-slate-400 bg-slate-900 border-slate-700' },
    unknown: { bn: 'অনির্ধারিত', color: 'text-slate-400 bg-slate-900 border-slate-700' },
    resolved: { bn: 'নিষ্পত্তিকৃত', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
    closed: { bn: 'সমাপ্ত', color: 'text-slate-400 bg-slate-900 border-slate-700' },
  };

  container.innerHTML = `
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-medium mb-3">
        <span>✓</span> স্বচ্ছ ও নিরপেক্ষ সত্য প্রকাশ
      </div>
      <h1 class="text-3xl font-extrabold text-white mb-2">যাচাইকৃত পাবলিক রিপোর্টসমূহ</h1>
      <p class="text-slate-400 text-sm max-w-3xl leading-relaxed">
        জনস্বর প্ল্যাটফর্মে দালিলিক প্রমাণাদি ও নিরপেক্ষ তদন্তের ভিত্তিতে যাচাইকৃত মানবাধিকার লঙ্ঘন ও অবিচারের উন্মুক্ত নথিপত্র।
      </p>
    </div>

    <!-- Comprehensive Filter Panel -->
    <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 mb-8 space-y-4 shadow-xl">
      <!-- Search Bar -->
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1.5">মূলশব্দ অনুসন্ধান (Keyword Search)</label>
        <div class="relative">
          <input 
            type="text" 
            id="filter-keyword" 
            placeholder="রিপোর্টের শিরোনাম, ঘটনার বিবরণ বা স্থান দিয়ে অনুসন্ধান করুন..." 
            class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <svg class="w-4 h-4 text-slate-500 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Filter Controls Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label class="block font-medium text-slate-400 mb-1">ক্যাটাগরি</label>
          <select id="filter-category" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500">
            <option value="">সকল ক্যাটাগরি</option>
            ${COMPLAINT_CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-medium text-slate-400 mb-1">জেলা</label>
          <select id="filter-district" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500">
            <option value="">সকল জেলা</option>
          </select>
        </div>

        <div>
          <label class="block font-medium text-slate-400 mb-1">উপজেলা / থানা</label>
          <select id="filter-upazila" disabled class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-40">
            <option value="">প্রথমে জেলা নির্বাচন করুন</option>
          </select>
        </div>

        <div>
          <label class="block font-medium text-slate-400 mb-1">আইনি / মামলার অবস্থা</label>
          <select id="filter-case-status" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500">
            <option value="">সকল অবস্থা</option>
            <option value="under_investigation">তদন্তাধীন</option>
            <option value="case_filed">মামলা দায়েরকৃত</option>
            <option value="trial">বিচারিক পর্যায়ে</option>
            <option value="no_legal_case">কোনো মামলা নেই</option>
            <option value="resolved">নিষ্পত্তিকৃত</option>
            <option value="closed">সমাপ্ত</option>
          </select>
        </div>

        <div>
          <label class="block font-medium text-slate-400 mb-1">ঘটনার তারিখ (শুরু)</label>
          <input type="date" id="filter-date-from" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label class="block font-medium text-slate-400 mb-1">ঘটনার তারিখ (শেষ)</label>
          <input type="date" id="filter-date-to" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <div class="sm:col-span-2 flex items-end gap-3 pt-2 sm:pt-0">
          <button id="apply-filters-btn" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow">
            <span>ফিল্টার প্রয়োগ করুন</span>
          </button>
          <button id="reset-filters-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition">
            রিসেট
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filters Summary Badge Bar -->
    <div id="active-filters-bar" class="hidden mb-6 flex flex-wrap items-center gap-2 text-xs"></div>

    <!-- Reports Grid Mount -->
    <div id="reports-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div class="col-span-full py-16 text-center text-slate-500">রিপোর্ট লোড হচ্ছে...</div>
    </div>

    <!-- Pagination Controls -->
    <div id="reports-pagination" class="flex items-center justify-center gap-3"></div>
  `;

  // Populate districts dropdown
  const districtSelect = container.querySelector('#filter-district');
  const upazilaSelect = container.querySelector('#filter-upazila');

  try {
    const districts = await locationService.getDistricts();
    districts.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d.id || d._id;
      opt.textContent = `${d.nameBn || d.nameEn} (${d.nameEn || d.id})`;
      districtSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load districts filter:', err);
  }

  // Handle District selection -> load Upazilas cascading dropdown
  districtSelect.addEventListener('change', async () => {
    const distId = districtSelect.value;
    upazilaSelect.innerHTML = '<option value="">সকল উপজেলা / থানা</option>';
    if (!distId) {
      upazilaSelect.disabled = true;
      upazilaSelect.innerHTML = '<option value="">প্রথমে জেলা নির্বাচন করুন</option>';
      return;
    }

    try {
      upazilaSelect.disabled = false;
      const upazilas = await locationService.getUpazilas(distId);
      upazilas.forEach((u) => {
        const opt = document.createElement('option');
        opt.value = u.id || u._id;
        opt.textContent = u.nameBn || u.nameEn;
        upazilaSelect.appendChild(opt);
      });
    } catch (e) {
      console.warn('Could not load upazilas for district:', e);
    }
  });

  async function loadReports() {
    const grid = container.querySelector('#reports-grid');
    const pagination = container.querySelector('#reports-pagination');
    grid.innerHTML = '<div class="col-span-full py-16 text-center text-slate-500">রিপোর্ট লোড হচ্ছে...</div>';

    try {
      const res = await reportService.getReports({
        ...filters,
        page: currentPage,
        limit: 9,
      });

      const reports = res.data || [];
      const meta = res.meta || {};

      if (reports.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-16 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 p-8 shadow-inner">
            <svg class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="font-semibold text-slate-300 mb-1">কোনো যাচাইকৃত পাবলিক রিপোর্ট পাওয়া যায়নি</p>
            <p class="text-xs text-slate-500">অনুসন্ধান বা ফিল্টারের শর্ত পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
          </div>
        `;
        pagination.innerHTML = '';
        return;
      }

      grid.innerHTML = reports
        .map((report) => {
          const caseStatusInfo = CASE_STATUS_MAP[report.caseStatus] || {
            bn: report.caseStatus || 'অনির্ধারিত',
            color: 'text-slate-400 bg-slate-900 border-slate-700',
          };
          const refCode = report._id ? report._id.slice(-6).toUpperCase() : 'REPORT';
          const pubDate = new Date(report.publishedAt || report.createdAt).toLocaleDateString('bn-BD');
          const incDate = report.incidentDate?.startDate
            ? (report.incidentDate.isRange && report.incidentDate.endDate
                ? `${new Date(report.incidentDate.startDate).toLocaleDateString('bn-BD')} - ${new Date(report.incidentDate.endDate).toLocaleDateString('bn-BD')}`
                : new Date(report.incidentDate.startDate).toLocaleDateString('bn-BD'))
            : null;
          const evCount = Array.isArray(report.approvedEvidence) ? report.approvedEvidence.length : 0;

          return `
            <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-lg">
              <div>
                <!-- Top Badge Bar -->
                <div class="flex items-center justify-between gap-2 mb-3">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      #${refCode}
                    </span>
                    <span class="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                      ${report.category?.primary || 'মানবাধিকার'}
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-400">
                    ${pubDate}
                  </span>
                </div>

                <!-- Title -->
                <h3 class="text-lg font-bold text-white mb-2 leading-snug hover:text-emerald-400 transition">
                  <a href="#/reports/${report._id}">${report.bn?.title || 'যাচাইকৃত প্রতিবেদন'}</a>
                </h3>

                <!-- Summary snippet -->
                <p class="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                  ${report.bn?.summary || ''}
                </p>

                <!-- Metadata pills -->
                <div class="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                  <span class="px-2 py-0.5 rounded border ${caseStatusInfo.color}">
                    মামলা: ${caseStatusInfo.bn}
                  </span>
                  ${
                    incDate
                      ? `<span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                          📅 ঘটনা: ${incDate}
                        </span>`
                      : ''
                  }
                  ${
                    evCount > 0
                      ? `<span class="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300">
                          📎 ${evCount}টি প্রমাণ
                        </span>`
                      : ''
                  }
                  ${
                    report.authorityActionSummary
                      ? `<span class="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800 text-indigo-300 truncate max-w-[200px]" title="${report.authorityActionSummary}">
                          আইনি পদক্ষেপ গৃহীত
                        </span>`
                      : ''
                  }
                </div>
              </div>

              <!-- Footer Section -->
              <div class="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span class="text-slate-400 truncate max-w-[150px]">
                  📍 ${report.location?.generalLocation || report.location?.districtId || 'বাংলাদেশ'}
                </span>
                <a href="#/reports/${report._id}" class="font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition">
                  <span>সম্পূর্ণ পড়ুন</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          `;
        })
        .join('');

      // Render pagination
      if (meta.totalPages > 1) {
        pagination.innerHTML = `
          <button id="prev-page-btn" ${meta.hasPrev ? '' : 'disabled'} class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium disabled:opacity-40 disabled:pointer-events-none transition">
            ← আগের পৃষ্ঠা
          </button>
          <span class="text-xs text-slate-400">পৃষ্ঠা ${meta.page} / ${meta.totalPages} (মোট ${meta.total} টি রিপোর্ট)</span>
          <button id="next-page-btn" ${meta.hasNext ? '' : 'disabled'} class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium disabled:opacity-40 disabled:pointer-events-none transition">
            পরের পৃষ্ঠা →
          </button>
        `;

        const prevBtn = pagination.querySelector('#prev-page-btn');
        const nextBtn = pagination.querySelector('#next-page-btn');

        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
              currentPage--;
              loadReports();
            }
          });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            if (currentPage < meta.totalPages) {
              currentPage++;
              loadReports();
            }
          });
        }
      } else {
        pagination.innerHTML = '';
      }
    } catch (err) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-red-400 text-sm">রিপোর্ট লোড করতে ব্যর্থ হয়েছে: ${err.message}</div>`;
    }
  }

  // Filter apply button
  container.querySelector('#apply-filters-btn').addEventListener('click', () => {
    filters.keyword = container.querySelector('#filter-keyword').value.trim();
    filters.category = container.querySelector('#filter-category').value;
    filters.districtId = container.querySelector('#filter-district').value;
    filters.upazilaId = container.querySelector('#filter-upazila').value;
    filters.dateFrom = container.querySelector('#filter-date-from').value;
    filters.dateTo = container.querySelector('#filter-date-to').value;
    filters.caseStatus = container.querySelector('#filter-case-status').value;
    currentPage = 1;
    loadReports();
  });

  // Filter reset button
  container.querySelector('#reset-filters-btn').addEventListener('click', () => {
    container.querySelector('#filter-keyword').value = '';
    container.querySelector('#filter-category').value = '';
    container.querySelector('#filter-district').value = '';
    container.querySelector('#filter-upazila').value = '';
    container.querySelector('#filter-upazila').disabled = true;
    container.querySelector('#filter-date-from').value = '';
    container.querySelector('#filter-date-to').value = '';
    container.querySelector('#filter-case-status').value = '';

    filters = {
      keyword: '',
      category: '',
      districtId: '',
      upazilaId: '',
      dateFrom: '',
      dateTo: '',
      caseStatus: '',
    };
    currentPage = 1;
    loadReports();
  });

  // Search on enter key
  container.querySelector('#filter-keyword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      container.querySelector('#apply-filters-btn').click();
    }
  });

  // Initial load
  loadReports();
}
