import { adminEvidenceService } from '../../../services/admin/adminEvidenceService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';
import {
  getMalwareStatusBadge,
  getEvidenceReviewBadge,
  getPublicStatusBadge,
  getRedactionBadge,
  getUploadStatusBadge,
  getEvidenceTypeBadge,
} from '../../../components/admin/StatusBadge.js';
import { formatDate, formatBytes } from '../../../utils/formatters.js';
import { showModal } from '../../../components/admin/ActionModal.js';

export async function renderAdminEvidencePage(container) {
  let currentPage = 1;
  const limit = 15;
  let currentFilters = {
    reviewStatus: '',
    malwareScanStatus: '',
    publicStatus: '',
    type: '',
    complaintId: '',
  };

  container.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      ${renderAdminNav('evidence')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>প্রমাণ পর্যালোচনা ও ব্যবস্থাপনা</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                Evidence Review
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              দাখিলকৃত নথি, আলোকচিত্র, অডিও-ভিডিও এবং বহিঃস্থ লিঙ্কের সত্যতা, ম্যালওয়্যার অবস্থা এবং প্রকাশনা পর্যালোচনা।
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="refresh-evidence-btn" class="px-3.5 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80 transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              রিফ্রেশ করুন
            </button>
          </div>
        </div>

        <!-- Security & Authenticity Advisory -->
        <div class="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-900/50 text-xs text-slate-300 flex items-start gap-3 shadow-inner">
          <svg class="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="space-y-0.5">
            <span class="font-semibold text-indigo-200">পর্যালোচকদের নির্দেশিকা:</span>
            <p class="text-slate-400">
              ম্যালওয়্যার স্ক্যানে নিরাপদ হওয়া প্রমাণটির সত্যতার স্বয়ংক্রিয় প্রমাণ নয় (Upload ≠ Proof)। নথি বা ফাইলের সত্যতা ও প্রাসঙ্গিকতা স্বতন্ত্রভাবে যাচাই করে পর্যালোচনা ও প্রকাশনা সিদ্ধান্ত গ্রহণ করুন।
            </p>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label class="block text-[11px] font-medium text-slate-400 mb-1">পর্যালোচনা অবস্থা</label>
              <select id="filter-review-status" class="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
                <option value="">সকল অবস্থা</option>
                <option value="pending">পর্যালোচনা অপেক্ষমাণ (Pending)</option>
                <option value="under_review">পর্যালোচনাধীন (Under Review)</option>
                <option value="reviewed">গৃহীত / পর্যালোচিত (Reviewed)</option>
                <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-400 mb-1">ম্যালওয়্যার স্ক্যান</label>
              <select id="filter-malware-status" class="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
                <option value="">সকল অবস্থা</option>
                <option value="clean">নিরাপদ (Clean)</option>
                <option value="pending">স্ক্যান অপেক্ষমাণ (Pending)</option>
                <option value="malicious">ক্ষতিকারক (Malicious)</option>
                <option value="failed">ব্যর্থ (Failed)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-400 mb-1">প্রকাশনা অবস্থা</label>
              <select id="filter-public-status" class="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
                <option value="">সকল অবস্থা</option>
                <option value="private">গোপনীয় (Private)</option>
                <option value="approved_public">উন্মুক্ত অনুমোদিত (Public)</option>
                <option value="withheld">স্থগিত (Withheld)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-400 mb-1">প্রমাণের ধরন</label>
              <select id="filter-type" class="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
                <option value="">সকল ধরন</option>
                <option value="image">ছবি (Image)</option>
                <option value="pdf">পিডিএফ (PDF)</option>
                <option value="video">ভিডিও (Video)</option>
                <option value="audio">অডিও (Audio)</option>
                <option value="document">ডকুমেন্ট (Document)</option>
                <option value="external_link">বহিঃস্থ লিঙ্ক (External)</option>
              </select>
            </div>

            <div class="flex items-end gap-2">
              <button id="apply-filters-btn" class="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow">
                ফিল্টার প্রয়োগ
              </button>
              <button id="reset-filters-btn" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition">
                রিসেট
              </button>
            </div>
          </div>
        </div>

        <!-- Evidence List Container -->
        <div id="evidence-table-container" class="rounded-xl bg-slate-900 border border-slate-800 shadow-md overflow-hidden">
          <div class="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin"></span>
            প্রমাণ তালিকা লোড হচ্ছে...
          </div>
        </div>

        <!-- Pagination Container -->
        <div id="evidence-pagination-container" class="flex items-center justify-between text-xs text-slate-400 pt-2"></div>
      </main>
    </div>
  `;

  // Attach event handlers
  const filterReview = container.querySelector('#filter-review-status');
  const filterMalware = container.querySelector('#filter-malware-status');
  const filterPublic = container.querySelector('#filter-public-status');
  const filterType = container.querySelector('#filter-type');
  const applyBtn = container.querySelector('#apply-filters-btn');
  const resetBtn = container.querySelector('#reset-filters-btn');
  const refreshBtn = container.querySelector('#refresh-evidence-btn');

  applyBtn.addEventListener('click', () => {
    currentFilters.reviewStatus = filterReview.value;
    currentFilters.malwareScanStatus = filterMalware.value;
    currentFilters.publicStatus = filterPublic.value;
    currentFilters.type = filterType.value;
    currentPage = 1;
    loadEvidence();
  });

  resetBtn.addEventListener('click', () => {
    filterReview.value = '';
    filterMalware.value = '';
    filterPublic.value = '';
    filterType.value = '';
    currentFilters = {
      reviewStatus: '',
      malwareScanStatus: '',
      publicStatus: '',
      type: '',
      complaintId: '',
    };
    currentPage = 1;
    loadEvidence();
  });

  refreshBtn.addEventListener('click', () => {
    loadEvidence();
  });

  async function loadEvidence() {
    const tableContainer = container.querySelector('#evidence-table-container');
    const paginationContainer = container.querySelector('#evidence-pagination-container');

    tableContainer.innerHTML = `
      <div class="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <span class="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin"></span>
        প্রমাণ তালিকা লোড হচ্ছে...
      </div>
    `;

    try {
      const res = await adminEvidenceService.listEvidence({
        page: currentPage,
        limit,
        ...currentFilters,
      });

      const items = res.data || [];
      const meta = res.meta || { total: items.length, page: 1, limit: 15, totalPages: 1 };

      if (items.length === 0) {
        tableContainer.innerHTML = `
          <div class="p-12 text-center text-slate-400 text-xs space-y-2">
            <svg class="w-8 h-8 text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>কোনো প্রমাণ পাওয়া যায়নি।</p>
          </div>
        `;
        paginationContainer.innerHTML = '';
        return;
      }

      tableContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4">আইডি / ধরন</th>
                <th class="py-3 px-4">অভিযোগ রেফারেন্স</th>
                <th class="py-3 px-4">ফাইল / সাইজ</th>
                <th class="py-3 px-4">আপলোড তারিখ</th>
                <th class="py-3 px-4">ম্যালওয়্যার অবস্থা</th>
                <th class="py-3 px-4">স্টোরেজ অবস্থা</th>
                <th class="py-3 px-4">পর্যালোচনা</th>
                <th class="py-3 px-4">পাবলিক অবস্থা</th>
                <th class="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              ${items
                .map((item) => {
                  const complaintNo = item.complaintId?.complaintNumber || item.complaintId?._id || 'অজ্ঞাত';
                  const compId = item.complaintId?._id || item.complaintId;
                  const filename = item.originalFilename || (item.external?.url ? 'বাহ্যিক লিঙ্ক' : 'নামবিহীন');
                  const sizeFormatted = item.size ? formatBytes(item.size) : 'N/A';

                  return `
                    <tr class="hover:bg-slate-850/50 transition">
                      <td class="py-3 px-4 font-mono">
                        <div class="font-bold text-slate-200">#${String(item._id).slice(-6)}</div>
                        <div class="mt-1">${getEvidenceTypeBadge(item.type)}</div>
                      </td>
                      <td class="py-3 px-4">
                        ${
                          compId
                            ? `<a href="#/admin/complaints/${compId}" class="text-indigo-400 hover:text-indigo-300 font-mono font-medium hover:underline block">
                                ${complaintNo}
                              </a>`
                            : '<span class="text-slate-500">N/A</span>'
                        }
                        ${item.complaintId?.title ? `<span class="text-[11px] text-slate-400 truncate max-w-[180px] block">${item.complaintId.title}</span>` : ''}
                      </td>
                      <td class="py-3 px-4">
                        <span class="font-medium text-slate-200 block truncate max-w-[200px]" title="${filename}">
                          ${filename}
                        </span>
                        <span class="text-[11px] text-slate-400 font-mono">${sizeFormatted}</span>
                      </td>
                      <td class="py-3 px-4 text-slate-400 text-[11px]">
                        ${formatDate(item.createdAt)}
                      </td>
                      <td class="py-3 px-4">
                        ${getMalwareStatusBadge(item.malwareScanStatus)}
                      </td>
                      <td class="py-3 px-4">
                        ${getUploadStatusBadge(item.uploadStatus)}
                      </td>
                      <td class="py-3 px-4">
                        ${getEvidenceReviewBadge(item.reviewStatus)}
                      </td>
                      <td class="py-3 px-4">
                        ${getPublicStatusBadge(item.publicStatus)}
                        ${item.redactionStatus && item.redactionStatus !== 'none' ? `<div class="mt-1">${getRedactionBadge(item.redactionStatus)}</div>` : ''}
                      </td>
                      <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <button data-evidence-id="${item._id}" class="view-evidence-details-btn px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 font-medium transition text-[11px]">
                            পর্যালোচনা
                          </button>
                          ${
                            item.downloadUrl
                              ? `<a href="${item.downloadUrl}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]" title="নিরাপদ অভ্যন্তরীণ প্রিভিউ/ডাউনলোড">
                                  ফাইল
                                </a>`
                              : ''
                          }
                          ${
                            item.external?.url
                              ? `<a href="${item.external.url}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]" title="বহিঃস্থ লিঙ্ক খুলুন">
                                  লিঙ্ক ↗
                                </a>`
                              : ''
                          }
                        </div>
                      </td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      `;

      // Attach row action listeners
      tableContainer.querySelectorAll('.view-evidence-details-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const evId = btn.getAttribute('data-evidence-id');
          openEvidenceReviewModal(evId);
        });
      });

      // Pagination
      paginationContainer.innerHTML = `
        <div>
          মোট <span class="font-bold text-slate-200">${meta.total}</span> টি প্রমাণের মধ্যে 
          <span class="font-bold text-slate-200">${(currentPage - 1) * limit + 1}</span> - 
          <span class="font-bold text-slate-200">${Math.min(currentPage * limit, meta.total)}</span> টি প্রদর্শিত
        </div>
        <div class="flex items-center gap-2">
          <button id="prev-page-btn" ${currentPage <= 1 ? 'disabled' : ''} class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 transition">
            পূর্ববর্তী
          </button>
          <span class="font-medium text-slate-300">${currentPage} / ${meta.totalPages || 1}</span>
          <button id="next-page-btn" ${currentPage >= meta.totalPages ? 'disabled' : ''} class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 transition">
            পরবর্তী
          </button>
        </div>
      `;

      paginationContainer.querySelector('#prev-page-btn')?.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          loadEvidence();
        }
      });

      paginationContainer.querySelector('#next-page-btn')?.addEventListener('click', () => {
        if (currentPage < meta.totalPages) {
          currentPage++;
          loadEvidence();
        }
      });
    } catch (err) {
      tableContainer.innerHTML = `
        <div class="p-8 text-center text-red-400 text-xs space-y-2">
          <p>প্রমাণ তালিকা লোড করতে ব্যর্থ হয়েছে: ${err.message || 'নেটওয়ার্ক ত্রুটি'}</p>
          <button id="retry-load-btn" class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      `;
      tableContainer.querySelector('#retry-load-btn')?.addEventListener('click', loadEvidence);
    }
  }

  // Open detailed Evidence Review modal
  async function openEvidenceReviewModal(evidenceId) {
    try {
      const res = await adminEvidenceService.getEvidenceById(evidenceId);
      const ev = res.data;
      if (!ev) throw new Error('প্রমাণ বিবরণ পাওয়া যায়নি');

      const modalHtml = `
        <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <!-- Metadata Overview -->
          <div class="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
            <div>
              <span class="text-slate-400 block text-[11px]">প্রমাণ রেফারেন্স:</span>
              <span class="font-mono font-bold text-slate-200">#${ev._id}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">প্রমাণের ধরন:</span>
              <span>${getEvidenceTypeBadge(ev.type)}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">মূল ফাইলের নাম:</span>
              <span class="font-medium text-slate-200 truncate block" title="${ev.originalFilename || ''}">${ev.originalFilename || 'নামবিহীন'}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">ফাইলের আকার:</span>
              <span class="font-mono text-slate-300">${ev.size ? formatBytes(ev.size) : 'N/A'}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">MIME টাইপ:</span>
              <span class="font-mono text-slate-300">${ev.mimeType || 'N/A'}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">SHA-256 চেকসাম:</span>
              <span class="font-mono text-[10px] text-slate-400 truncate block" title="${ev.sha256 || ''}">${ev.sha256 ? `${ev.sha256.slice(0, 16)}...` : 'N/A'}</span>
            </div>
          </div>

          <!-- Status Indicators -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div class="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <span class="text-[10px] text-slate-400 uppercase font-mono block mb-1">ম্যালওয়্যার</span>
              ${getMalwareStatusBadge(ev.malwareScanStatus)}
            </div>
            <div class="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <span class="text-[10px] text-slate-400 uppercase font-mono block mb-1">স্টোরেজ অবস্থা</span>
              ${getUploadStatusBadge(ev.uploadStatus)}
            </div>
            <div class="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <span class="text-[10px] text-slate-400 uppercase font-mono block mb-1">পর্যালোচনা অবস্থা</span>
              ${getEvidenceReviewBadge(ev.reviewStatus)}
            </div>
            <div class="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <span class="text-[10px] text-slate-400 uppercase font-mono block mb-1">পাবলিক অবস্থা</span>
              ${getPublicStatusBadge(ev.publicStatus)}
            </div>
          </div>

          <!-- Associated Complaint -->
          ${
            ev.complaintId
              ? `
            <div class="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs">
              <span class="text-slate-400 block text-[11px] mb-1">সম্পর্কিত অভিযোগ:</span>
              <div class="flex items-center justify-between">
                <div>
                  <a href="#/admin/complaints/${ev.complaintId._id || ev.complaintId}" class="text-indigo-400 hover:underline font-mono font-semibold">
                    ${ev.complaintId.complaintNumber || ev.complaintId._id}
                  </a>
                  ${ev.complaintId.title ? `<span class="text-slate-300 ml-2">${ev.complaintId.title}</span>` : ''}
                </div>
                <a href="#/admin/complaints/${ev.complaintId._id || ev.complaintId}" class="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700">
                  অভিযোগে যান ↗
                </a>
              </div>
            </div>
          `
              : ''
          }

          <!-- External Link Info -->
          ${
            ev.external?.url
              ? `
            <div class="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs space-y-1">
              <span class="text-slate-400 block text-[11px]">বহিঃস্থ লিঙ্ক তথ্য:</span>
              <div class="break-all text-emerald-400 font-mono">
                <a href="${ev.external.url}" target="_blank" rel="noopener noreferrer" class="hover:underline">
                  ${ev.external.url} ↗
                </a>
              </div>
              <div class="text-[11px] text-slate-400">উৎস: ${ev.external.sourceType || 'news_or_social'}</div>
            </div>
          `
              : ''
          }

          <!-- Protected File Stream Link -->
          ${
            ev.downloadUrl
              ? `
            <div class="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/60 flex items-center justify-between text-xs">
              <div>
                <span class="font-medium text-indigo-300 block">অভ্যন্তরীণ সুরক্ষিত ফাইল এক্সেস</span>
                <span class="text-[11px] text-slate-400">ফাইলটি ব্যাকএন্ড সুরক্ষা গেটওয়ে হয়ে স্ট্রিম করা হবে (গুগল ড্রাইভ লিংক সম্পূর্ণ গোপন)।</span>
              </div>
              <a href="${ev.downloadUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow text-xs">
                প্রিভিউ / ডাউনলোড
              </a>
            </div>
          `
              : ''
          }

          <!-- Action Forms Container -->
          <div class="space-y-3 pt-2 border-t border-slate-800">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider font-mono">প্রশাসনিক পর্যালোচনা ও সিদ্ধান্ত</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <!-- Accept/Review Button -->
              <button id="modal-action-accept" class="p-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-200 text-xs font-semibold transition text-left flex items-center justify-between">
                <div>
                  <div>গৃহীত হিসেবে মার্ক করুন</div>
                  <div class="text-[10px] text-emerald-400 font-normal">Mark Reviewed / Accepted</div>
                </div>
                <span>✓</span>
              </button>

              <!-- Mark Under Review Button -->
              <button id="modal-action-under-review" class="p-2.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-800 text-indigo-200 text-xs font-semibold transition text-left flex items-center justify-between">
                <div>
                  <div>পর্যালোচনাধীন রাখুন</div>
                  <div class="text-[10px] text-indigo-400 font-normal">Mark Under Review</div>
                </div>
                <span>⏳</span>
              </button>

              <!-- Reject Button -->
              <button id="modal-action-reject" class="p-2.5 rounded-lg bg-red-950/70 hover:bg-red-900/80 border border-red-800 text-red-200 text-xs font-semibold transition text-left flex items-center justify-between">
                <div>
                  <div>প্রমাণ প্রত্যাখ্যান করুন</div>
                  <div class="text-[10px] text-red-400 font-normal">Reject with reason</div>
                </div>
                <span>✕</span>
              </button>

              <!-- Public Approval Button -->
              <button id="modal-action-publish" class="p-2.5 rounded-lg bg-teal-950/70 hover:bg-teal-900/80 border border-teal-800 text-teal-200 text-xs font-semibold transition text-left flex items-center justify-between">
                <div>
                  <div>পাবলিক প্রকাশনা অনুমোদন</div>
                  <div class="text-[10px] text-teal-400 font-normal">Approve Public Disclosure</div>
                </div>
                <span>🌐</span>
              </button>
            </div>
          </div>

          <!-- Audit Trail -->
          ${
            ev.auditLogs && ev.auditLogs.length > 0
              ? `
            <div class="pt-3 border-t border-slate-800 space-y-2">
              <span class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">অডিট ইতিহাস (Audit Logs):</span>
              <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                ${ev.auditLogs
                  .map(
                    (log) => `
                  <div class="p-2 rounded bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <div>
                      <span class="font-semibold text-slate-300 font-mono">${log.action}</span>
                      ${log.metadata?.notes ? `<span class="text-slate-400 ml-1.5">"${log.metadata.notes}"</span>` : ''}
                      ${log.metadata?.publicStatus ? `<span class="text-slate-400 ml-1.5">(public: ${log.metadata.publicStatus})</span>` : ''}
                    </div>
                    <span class="text-[10px] text-slate-500 font-mono">${formatDate(log.timestamp)}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        </div>
      `;

      const modal = showModal({
        title: `প্রমাণ বিস্তারিত ও পর্যালোচনা (#${String(ev._id).slice(-6)})`,
        description: 'প্রমাণ পর্যালোচনা, গ্রহণযোগ্যতা নির্ধারণ ও প্রকাশনা নিয়ন্ত্রণ।',
        contentHtml: modalHtml,
        confirmText: 'সম্পন্ন',
        confirmColor: 'bg-slate-700 hover:bg-slate-600',
        onConfirm: async () => {},
      });

      // Handle Accept Action
      modal.querySelector('#modal-action-accept')?.addEventListener('click', () => {
        showModal({
          title: 'প্রমাণ গ্রহণযোগ্য হিসেবে নিশ্চিতকরণ',
          description: 'প্রমাণটি নির্ভরযোগ্য হিসেবে পর্যালোচনা তালিকায় অন্তর্ভুক্ত হবে।',
          contentHtml: `
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">পর্যালোচনা মন্তব্য (ঐচ্ছিক):</label>
                <textarea id="accept-notes" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500" placeholder="প্রমাণের প্রাসঙ্গিকতা ও সত্যতা সম্পর্কিত নোট লিখুন..."></textarea>
              </div>
            </div>
          `,
          confirmText: 'অনুমোদন নিশ্চিত করুন',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-500',
          onConfirm: async (subModal) => {
            const notes = subModal.querySelector('#accept-notes').value.trim();
            await adminEvidenceService.reviewEvidence(ev._id, {
              reviewStatus: 'reviewed',
              notes: notes || 'Reviewed and accepted by administrator',
            });
            loadEvidence();
            openEvidenceReviewModal(ev._id);
          },
        });
      });

      // Handle Under Review Action
      modal.querySelector('#modal-action-under-review')?.addEventListener('click', () => {
        showModal({
          title: 'পর্যালোচনাধীন হিসেবে স্থানান্তর',
          description: 'প্রমাণটির বিস্তারিত সত্যতা যাচাই প্রক্রিয়া চলমান রাখা হবে।',
          contentHtml: `
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">মন্তব্য (ঐচ্ছিক):</label>
              <textarea id="under-review-notes" rows="2" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="চলমান পর্যালোচনার বিবরণ..."></textarea>
            </div>
          `,
          confirmText: 'নিশ্চিত করুন',
          confirmColor: 'bg-indigo-600 hover:bg-indigo-500',
          onConfirm: async (subModal) => {
            const notes = subModal.querySelector('#under-review-notes').value.trim();
            await adminEvidenceService.reviewEvidence(ev._id, {
              reviewStatus: 'under_review',
              notes,
            });
            loadEvidence();
            openEvidenceReviewModal(ev._id);
          },
        });
      });

      // Handle Reject Action
      modal.querySelector('#modal-action-reject')?.addEventListener('click', () => {
        showModal({
          title: 'প্রমাণ প্রত্যাখ্যান নিশ্চিতকরণ',
          description: 'প্রমাণটি অপ্রাসঙ্গিক বা অবিশ্বস্ত বিবেচিত হলে প্রত্যাখ্যান করুন।',
          contentHtml: `
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">প্রত্যাখ্যানের সুনির্দিষ্ট কারণ (আবশ্যক):</label>
                <textarea id="reject-reason" required rows="3" class="w-full bg-slate-950 border border-red-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500" placeholder="প্রত্যাখ্যানের সঠিক কারণ উল্লেখ করুন..."></textarea>
              </div>
            </div>
          `,
          confirmText: 'প্রত্যাখ্যান নিশ্চিত করুন',
          confirmColor: 'bg-red-600 hover:bg-red-500',
          onConfirm: async (subModal) => {
            const reason = subModal.querySelector('#reject-reason').value.trim();
            if (!reason) throw new Error('প্রত্যাখ্যানের কারণ উল্লেখ করা আবশ্যক');

            await adminEvidenceService.reviewEvidence(ev._id, {
              reviewStatus: 'rejected',
              notes: reason,
            });
            loadEvidence();
            openEvidenceReviewModal(ev._id);
          },
        });
      });

      // Handle Public Approval Action
      modal.querySelector('#modal-action-publish')?.addEventListener('click', () => {
        showModal({
          title: 'জনসাধারণের জন্য উন্মুক্ত প্রকাশনা অনুমোদন',
          description: 'সতর্কতা: শুধুমাত্র নিরাপদ এবং রিডাক্টেড প্রমাণই উন্মুক্ত করা উচিত। কোনো দর্শক ট্র্যাকিং প্রয়োগ হবে না।',
          contentHtml: `
            <div class="space-y-3 text-xs">
              ${
                ev.malwareScanStatus !== 'clean'
                  ? `
                <div class="p-3 bg-red-950/80 border border-red-800 rounded-lg text-red-200">
                  সতর্কতা: এই প্রমাণটি ম্যালওয়্যার স্ক্যানে নিরাপদ (Clean) হিসেবে চিহ্নিত নয়। নীতি অনুযায়ী শুধুমাত্র নিরাপদ প্রমাণই উন্মুক্ত করা যাবে।
                </div>
              `
                  : ''
              }

              <div>
                <label class="block font-medium text-slate-300 mb-1">প্রকাশনা অবস্থা:</label>
                <select id="pub-status-select" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500">
                  <option value="approved_public" ${ev.publicStatus === 'approved_public' ? 'selected' : ''}>জনসাধারণের জন্য উন্মুক্ত (Approved Public)</option>
                  <option value="private" ${ev.publicStatus === 'private' ? 'selected' : ''}>গোপনীয় রাখুন (Private)</option>
                  <option value="withheld" ${ev.publicStatus === 'withheld' ? 'selected' : ''}>স্থগিত রাখুন (Withheld)</option>
                </select>
              </div>

              <div>
                <label class="block font-medium text-slate-300 mb-1">রিডাকশন অবস্থা (Redaction Status):</label>
                <select id="pub-redaction-select" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500">
                  <option value="none" ${ev.redactionStatus === 'none' ? 'selected' : ''}>রিডাকশন প্রয়োজন নেই (None)</option>
                  <option value="required" ${ev.redactionStatus === 'required' ? 'selected' : ''}>রিডাকশন আবশ্যক (Required)</option>
                  <option value="completed" ${ev.redactionStatus === 'completed' ? 'selected' : ''}>রিডাকশন সম্পন্ন (Completed)</option>
                </select>
                <span class="text-[10px] text-slate-400 block mt-1">সংবেদনশীল ব্যক্তিগত অংশ আড়াল করা হলে 'রিডাকশন সম্পন্ন' নির্বাচন করুন।</span>
              </div>
            </div>
          `,
          confirmText: 'প্রকাশনা আপডেট নিশ্চিত করুন',
          confirmColor: 'bg-teal-600 hover:bg-teal-500',
          onConfirm: async (subModal) => {
            const publicStatus = subModal.querySelector('#pub-status-select').value;
            const redactionStatus = subModal.querySelector('#pub-redaction-select').value;

            if (publicStatus === 'approved_public' && ev.malwareScanStatus !== 'clean') {
              throw new Error('ম্যালওয়্যার স্ক্যানে উত্তীর্ণ না হওয়া পর্যন্ত প্রমাণ প্রকাশ করা যাবে না');
            }

            await adminEvidenceService.updatePublication(ev._id, {
              publicStatus,
              redactionStatus,
            });
            loadEvidence();
            openEvidenceReviewModal(ev._id);
          },
        });
      });
    } catch (err) {
      showModal({
        title: 'ত্রুটি',
        description: '',
        contentHtml: `<p class="text-xs text-red-300">${err.message || 'প্রমাণ লোড করতে ব্যর্থ হয়েছে'}</p>`,
        confirmText: 'ঠিক আছে',
        confirmColor: 'bg-slate-700 hover:bg-slate-600',
        onConfirm: async () => {},
      });
    }
  }

  // Initial load
  loadEvidence();
}
