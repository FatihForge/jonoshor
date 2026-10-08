import { reportService } from '../../../services/reports/reportService.js';
import { locationService } from '../../../services/locations/locationService.js';
import { COMPLAINT_CATEGORIES } from '../../../config/constants.js';
import { t, isBangla, translateCategory, translateCaseStatus, formatNumber } from '../../../i18n/index.js';

export async function renderReportsPage(container) {
  let currentPage = 1;
  const isBn = isBangla();

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
    under_investigation: { color: 'text-amber-800 bg-amber-50 border-amber-200' },
    case_filed: { color: 'text-blue-800 bg-blue-50 border-blue-200' },
    trial: { color: 'text-purple-800 bg-purple-50 border-purple-200' },
    no_legal_case: { color: 'text-slate-700 bg-slate-100 border-slate-200' },
    unknown: { color: 'text-slate-700 bg-slate-100 border-slate-200' },
    resolved: { color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
    closed: { color: 'text-slate-700 bg-slate-100 border-slate-200' },
  };

  container.innerHTML = `
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
        <span aria-hidden="true">✓</span> ${t('reports.badge')}
      </div>
      <h1 class="text-3xl font-extrabold text-slate-900 mb-2">${t('reports.title')}</h1>
      <p class="text-slate-600 text-sm max-w-3xl leading-relaxed">
        ${t('reports.subtitle')}
      </p>
    </div>

    <!-- Comprehensive Filter Panel -->
    <div class="p-5 rounded-2xl bg-white border border-slate-200 mb-8 space-y-4 shadow-sm">
      <!-- Search Bar -->
      <div>
        <label for="filter-keyword" class="block text-xs font-semibold text-slate-700 mb-1.5">${t('reports.search_label')}</label>
        <div class="relative">
          <input 
            type="text" 
            id="filter-keyword" 
            placeholder="${t('reports.search_placeholder')}" 
            class="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Filter Controls Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label for="filter-category" class="block font-semibold text-slate-700 mb-1">${t('reports.category_label')}</label>
          <select id="filter-category" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
            <option value="">${t('reports.all_categories')}</option>
            ${COMPLAINT_CATEGORIES.map((c) => `<option value="${c}">${translateCategory(c)}</option>`).join('')}
          </select>
        </div>

        <div>
          <label for="filter-district" class="block font-semibold text-slate-700 mb-1">${t('reports.district_label')}</label>
          <select id="filter-district" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
            <option value="">${t('reports.all_districts')}</option>
          </select>
        </div>

        <div>
          <label for="filter-upazila" class="block font-semibold text-slate-700 mb-1">${t('reports.upazila_label')}</label>
          <select id="filter-upazila" disabled class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:opacity-40 disabled:bg-slate-50">
            <option value="">${t('reports.select_district_first')}</option>
          </select>
        </div>

        <div>
          <label for="filter-case-status" class="block font-semibold text-slate-700 mb-1">${t('reports.case_status_label')}</label>
          <select id="filter-case-status" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
            <option value="">${t('reports.all_statuses')}</option>
            <option value="under_investigation">${translateCaseStatus('under_investigation')}</option>
            <option value="case_filed">${translateCaseStatus('case_filed')}</option>
            <option value="trial">${translateCaseStatus('trial')}</option>
            <option value="no_legal_case">${translateCaseStatus('no_legal_case')}</option>
            <option value="resolved">${translateCaseStatus('resolved')}</option>
            <option value="closed">${translateCaseStatus('closed')}</option>
          </select>
        </div>

        <div>
          <label for="filter-date-from" class="block font-semibold text-slate-700 mb-1">${t('reports.date_from')}</label>
          <input type="date" id="filter-date-from" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <div>
          <label for="filter-date-to" class="block font-semibold text-slate-700 mb-1">${t('reports.date_to')}</label>
          <input type="date" id="filter-date-to" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <div class="sm:col-span-2 flex items-end gap-3 pt-2 sm:pt-0">
          <button id="apply-filters-btn" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs">
            <span>${t('reports.apply_filters')}</span>
          </button>
          <button id="reset-filters-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition">
            ${t('reports.reset_filters')}
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filters Summary Badge Bar -->
    <div id="active-filters-bar" class="hidden mb-6 flex flex-wrap items-center gap-2 text-xs" aria-live="polite"></div>

    <!-- Reports Grid Mount -->
    <div id="reports-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" aria-live="polite">
      <div class="col-span-full py-16 text-center text-slate-500">${t('reports.loading_reports')}</div>
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
      opt.textContent = isBn ? (d.nameBn || d.nameEn) : `${d.nameEn || d.nameBn} (${d.nameBn || d.id})`;
      districtSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load districts filter:', err);
  }

  // Handle District selection -> load Upazilas cascading dropdown
  districtSelect.addEventListener('change', async () => {
    const distId = districtSelect.value;
    upazilaSelect.innerHTML = `<option value="">${t('reports.all_upazilas')}</option>`;
    if (!distId) {
      upazilaSelect.disabled = true;
      upazilaSelect.innerHTML = `<option value="">${t('reports.select_district_first')}</option>`;
      return;
    }

    try {
      upazilaSelect.disabled = false;
      const upazilas = await locationService.getUpazilas(distId);
      upazilas.forEach((u) => {
        const opt = document.createElement('option');
        opt.value = u.id || u._id;
        opt.textContent = isBn ? (u.nameBn || u.nameEn) : (u.nameEn || u.nameBn);
        upazilaSelect.appendChild(opt);
      });
    } catch (e) {
      console.warn('Could not load upazilas for district:', e);
    }
  });

  async function loadReports() {
    const grid = container.querySelector('#reports-grid');
    const pagination = container.querySelector('#reports-pagination');
    grid.innerHTML = `<div class="col-span-full py-16 text-center text-slate-500">${t('reports.loading_reports')}</div>`;

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
          <div class="col-span-full py-16 text-center rounded-2xl bg-white border border-slate-200 text-slate-600 p-8 shadow-xs" role="status">
            <svg class="w-12 h-12 mx-auto text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="font-bold text-slate-800 mb-1">${t('reports.no_reports_found')}</p>
            <p class="text-xs text-slate-500">${t('reports.no_reports_desc')}</p>
          </div>
        `;
        pagination.innerHTML = '';
        return;
      }

      grid.innerHTML = reports
        .map((report) => {
          const statusStyle = CASE_STATUS_MAP[report.caseStatus]?.color || 'text-slate-700 bg-slate-100 border-slate-200';
          const statusLabel = translateCaseStatus(report.caseStatus);
          const refCode = report._id ? report._id.slice(-6).toUpperCase() : 'REPORT';
          
          const localeCode = isBn ? 'bn-BD' : 'en-US';
          const pubDate = new Date(report.publishedAt || report.createdAt).toLocaleDateString(localeCode, { year: 'numeric', month: 'short', day: 'numeric' });
          const incDate = report.incidentDate?.startDate
            ? (report.incidentDate.isRange && report.incidentDate.endDate
                ? `${new Date(report.incidentDate.startDate).toLocaleDateString(localeCode, { year: 'numeric', month: 'short', day: 'numeric' })} - ${new Date(report.incidentDate.endDate).toLocaleDateString(localeCode, { year: 'numeric', month: 'short', day: 'numeric' })}`
                : new Date(report.incidentDate.startDate).toLocaleDateString(localeCode, { year: 'numeric', month: 'short', day: 'numeric' }))
            : null;
          const evCount = Array.isArray(report.approvedEvidence) ? report.approvedEvidence.length : 0;

          // Localized Title & Summary selection
          const title = isBn
            ? (report.bn?.title || report.en?.title || 'যাচাইকৃত রিপোর্ট')
            : (report.en?.title || report.bn?.title || 'Verified Report');
          const summary = isBn
            ? (report.bn?.summary || report.en?.summary || '')
            : (report.en?.summary || report.bn?.summary || '');
          const categoryName = translateCategory(report.category?.primary);

          return `
            <div class="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between shadow-xs">
              <div>
                <!-- Top Badge Bar -->
                <div class="flex items-center justify-between gap-2 mb-3">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      #${refCode}
                    </span>
                    <span class="text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      ${categoryName || (isBn ? 'মানবাধিকার' : 'Human Rights')}
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-500">
                    ${pubDate}
                  </span>
                </div>

                <!-- Title -->
                <h2 class="text-lg font-bold text-slate-900 mb-2 leading-snug hover:text-emerald-700 transition">
                  <a href="#/reports/${report._id}">${title}</a>
                </h2>

                <!-- Summary snippet -->
                <p class="text-slate-600 text-xs line-clamp-3 mb-4 leading-relaxed">
                  ${summary}
                </p>

                <!-- Metadata pills -->
                <div class="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                  <span class="px-2 py-0.5 rounded border font-medium ${statusStyle}">
                    ${t('common.status')}: ${statusLabel}
                  </span>
                  ${
                    incDate
                      ? `<span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          📅 ${t('reports.incident_date')}: ${incDate}
                        </span>`
                      : ''
                  }
                  ${
                    evCount > 0
                      ? `<span class="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-medium">
                          📎 ${formatNumber(evCount)} ${t('reports.evidence_attached')}
                        </span>`
                      : ''
                  }
                </div>
              </div>

              <!-- Footer Section -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-500 truncate max-w-[150px]">
                  📍 ${report.location?.generalLocation || report.location?.districtId || (isBn ? 'বাংলাদেশ' : 'Bangladesh')}
                </span>
                <a href="#/reports/${report._id}" class="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition">
                  <span>${t('reports.read_report')}</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          `;
        })
        .join('');

      // Render pagination
      if (meta.totalPages > 1) {
        pagination.innerHTML = `
          <button id="prev-page-btn" ${meta.hasPrev ? '' : 'disabled'} class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none transition shadow-xs">
            ← ${t('common.previous')}
          </button>
          <span class="text-xs text-slate-600 font-medium">
            ${isBn ? `পৃষ্ঠা ${formatNumber(meta.page)} / ${formatNumber(meta.totalPages)} (মোট ${formatNumber(meta.total)}টি রিপোর্ট)` : `Page ${meta.page} of ${meta.totalPages} (${meta.total} reports)`}
          </span>
          <button id="next-page-btn" ${meta.hasNext ? '' : 'disabled'} class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none transition shadow-xs">
            ${t('common.next')} →
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
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-red-700 text-sm">${t('common.error')}: ${err.message}</div>`;
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
