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
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderAdminNav('evidence')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Evidence Review & Management</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                Quarantine & Public Disclosure
              </span>
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              Factual corroboration, malware security analysis, and redaction management for submitted evidence files and web links.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="refresh-evidence-btn" class="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 transition flex items-center gap-1.5 shadow-2xs">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- Security & Authenticity Advisory -->
        <div class="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-slate-700 flex items-start gap-3">
          <svg class="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="space-y-0.5">
            <span class="font-bold text-indigo-900">Reviewer Guidance:</span>
            <p class="text-slate-600 leading-relaxed">
              Clean malware status does not automatically substantiate allegations (Upload ≠ Proof). Always independently verify source credibility, chain of custody, and relevance before approving for public disclosure.
            </p>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label for="filter-review-status" class="block text-[11px] font-medium text-slate-700 mb-1">Review Status</label>
              <select id="filter-review-status" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="reviewed">Reviewed / Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label for="filter-malware-status" class="block text-[11px] font-medium text-slate-700 mb-1">Malware Scan</label>
              <select id="filter-malware-status" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600">
                <option value="">All Statuses</option>
                <option value="clean">Clean</option>
                <option value="pending">Scan Pending</option>
                <option value="malicious">Malicious / Infected</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label for="filter-public-status" class="block text-[11px] font-medium text-slate-700 mb-1">Public Disclosure</label>
              <select id="filter-public-status" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600">
                <option value="">All Statuses</option>
                <option value="private">Private (Restricted)</option>
                <option value="approved_public">Approved Public</option>
                <option value="withheld">Withheld</option>
              </select>
            </div>

            <div>
              <label for="filter-type" class="block text-[11px] font-medium text-slate-700 mb-1">Evidence Type</label>
              <select id="filter-type" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600">
                <option value="">All Types</option>
                <option value="image">Image</option>
                <option value="pdf">PDF Document</option>
                <option value="video">Video Recording</option>
                <option value="audio">Audio Clip</option>
                <option value="document">Document</option>
                <option value="external_link">External URL</option>
              </select>
            </div>

            <div class="flex items-end gap-2">
              <button id="apply-filters-btn" class="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs">
                Apply Filters
              </button>
              <button id="reset-filters-btn" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs transition">
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Evidence List Container -->
        <div id="evidence-table-container" class="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div class="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
            Loading evidence files...
          </div>
        </div>

        <!-- Pagination Container -->
        <div id="evidence-pagination-container" class="flex items-center justify-between text-xs text-slate-500 pt-2"></div>
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
      <div class="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <span class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
        Loading evidence files...
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
          <div class="p-12 text-center text-slate-500 text-xs space-y-2">
            <svg class="w-8 h-8 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>No evidence items found matching the selected criteria.</p>
          </div>
        `;
        paginationContainer.innerHTML = '';
        return;
      }

      tableContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th scope="col" class="py-3 px-4">ID / Type</th>
                <th scope="col" class="py-3 px-4">Complaint Ref</th>
                <th scope="col" class="py-3 px-4">File / Size</th>
                <th scope="col" class="py-3 px-4">Uploaded</th>
                <th scope="col" class="py-3 px-4">Malware Scan</th>
                <th scope="col" class="py-3 px-4">Storage</th>
                <th scope="col" class="py-3 px-4">Review Status</th>
                <th scope="col" class="py-3 px-4">Public Status</th>
                <th scope="col" class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${items
                .map((item) => {
                  const complaintNo = item.complaintId?.complaintNumber || item.complaintId?._id || 'Unknown';
                  const compId = item.complaintId?._id || item.complaintId;
                  const filename = item.originalFilename || (item.external?.url ? 'External Link' : 'Unnamed File');
                  const sizeFormatted = item.size ? formatBytes(item.size) : 'N/A';

                  return `
                    <tr class="hover:bg-slate-50/80 transition">
                      <td class="py-3 px-4 font-mono">
                        <div class="font-bold text-slate-900">#${String(item._id).slice(-6)}</div>
                        <div class="mt-1">${getEvidenceTypeBadge(item.type)}</div>
                      </td>
                      <td class="py-3 px-4">
                        ${
                          compId
                            ? `<a href="#/admin/complaints/${compId}" class="text-emerald-700 hover:text-emerald-800 font-mono font-medium hover:underline block">
                                ${complaintNo}
                              </a>`
                            : '<span class="text-slate-400">N/A</span>'
                        }
                        ${item.complaintId?.title ? `<span class="text-[11px] text-slate-500 truncate max-w-[180px] block">${item.complaintId.title}</span>` : ''}
                      </td>
                      <td class="py-3 px-4">
                        <span class="font-medium text-slate-900 block truncate max-w-[200px]" title="${filename}">
                          ${filename}
                        </span>
                        <span class="text-[11px] text-slate-500 font-mono">${sizeFormatted}</span>
                      </td>
                      <td class="py-3 px-4 text-slate-500 text-[11px]">
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
                          <button data-evidence-id="${item._id}" class="view-evidence-details-btn px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-medium transition text-[11px]">
                            Review
                          </button>
                          ${
                            item.downloadUrl
                              ? `<a href="${item.downloadUrl}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition text-[11px]" title="Secure file preview">
                                  File
                                </a>`
                              : ''
                          }
                          ${
                            item.external?.url
                              ? `<a href="${item.external.url}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-300 transition text-[11px]" title="Open external URL">
                                  Link ↗
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
          Showing <span class="font-bold text-slate-800">${(currentPage - 1) * limit + 1}</span> - 
          <span class="font-bold text-slate-800">${Math.min(currentPage * limit, meta.total)}</span> of 
          <span class="font-bold text-slate-800">${meta.total}</span> evidence files
        </div>
        <div class="flex items-center gap-2">
          <button id="prev-page-btn" ${currentPage <= 1 ? 'disabled' : ''} class="px-3 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition">
            Previous
          </button>
          <span class="font-medium text-slate-700">${currentPage} / ${meta.totalPages || 1}</span>
          <button id="next-page-btn" ${currentPage >= meta.totalPages ? 'disabled' : ''} class="px-3 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition">
            Next
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
        <div class="p-8 text-center text-red-600 text-xs space-y-2">
          <p>Failed to load evidence records: ${err.message || 'Network error'}</p>
          <button id="retry-load-btn" class="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition">
            Try Again
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
      if (!ev) throw new Error('Evidence record not found');

      const modalHtml = `
        <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-slate-900">
          <!-- Metadata Overview -->
          <div class="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span class="text-slate-500 block text-[11px]">Evidence Ref:</span>
              <span class="font-mono font-bold text-slate-900">#${ev._id}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Type:</span>
              <span>${getEvidenceTypeBadge(ev.type)}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Original File Name:</span>
              <span class="font-medium text-slate-800 truncate block" title="${ev.originalFilename || ''}">${ev.originalFilename || 'Unnamed'}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">File Size:</span>
              <span class="font-mono text-slate-700">${ev.size ? formatBytes(ev.size) : 'N/A'}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">MIME Type:</span>
              <span class="font-mono text-slate-700">${ev.mimeType || 'N/A'}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">SHA-256 Checksum:</span>
              <span class="font-mono text-[10px] text-slate-600 truncate block" title="${ev.sha256 || ''}">${ev.sha256 ? `${ev.sha256.slice(0, 16)}...` : 'N/A'}</span>
            </div>
          </div>

          <!-- Status Indicators -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase font-mono block mb-1">Malware Scan</span>
              ${getMalwareStatusBadge(ev.malwareScanStatus)}
            </div>
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase font-mono block mb-1">Storage</span>
              ${getUploadStatusBadge(ev.uploadStatus)}
            </div>
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase font-mono block mb-1">Review</span>
              ${getEvidenceReviewBadge(ev.reviewStatus)}
            </div>
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase font-mono block mb-1">Public Status</span>
              ${getPublicStatusBadge(ev.publicStatus)}
            </div>
          </div>

          <!-- Associated Complaint -->
          ${
            ev.complaintId
              ? `
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span class="text-slate-500 block text-[11px] mb-1">Associated Complaint:</span>
              <div class="flex items-center justify-between">
                <div>
                  <a href="#/admin/complaints/${ev.complaintId._id || ev.complaintId}" class="text-emerald-700 hover:underline font-mono font-semibold">
                    ${ev.complaintId.complaintNumber || ev.complaintId._id}
                  </a>
                  ${ev.complaintId.title ? `<span class="text-slate-700 ml-2">${ev.complaintId.title}</span>` : ''}
                </div>
                <a href="#/admin/complaints/${ev.complaintId._id || ev.complaintId}" class="px-2 py-0.5 rounded bg-white border border-slate-300 text-[11px] text-slate-700 hover:bg-slate-50">
                  Open Case ↗
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
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span class="text-slate-500 block text-[11px]">External Link Details:</span>
              <div class="break-all text-emerald-700 font-mono">
                <a href="${ev.external.url}" target="_blank" rel="noopener noreferrer" class="hover:underline">
                  ${ev.external.url} ↗
                </a>
              </div>
              <div class="text-[11px] text-slate-500">Source: ${ev.external.sourceType || 'news_or_social'}</div>
            </div>
          `
              : ''
          }

          <!-- Protected File Stream Link -->
          ${
            ev.downloadUrl
              ? `
            <div class="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
              <div>
                <span class="font-medium text-indigo-900 block">Protected Internal File Access</span>
                <span class="text-[11px] text-slate-600">File is streamed via secure gateway (Google Drive link completely hidden).</span>
              </div>
              <a href="${ev.downloadUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs text-xs">
                Preview / Download
              </a>
            </div>
          `
              : ''
          }

          <!-- Action Forms Container -->
          <div class="space-y-3 pt-2 border-t border-slate-200">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Administrative Review Actions</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <!-- Accept/Review Button -->
              <button id="modal-action-accept" class="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition text-left flex items-center justify-between">
                <div>
                  <div>Mark Reviewed / Accepted</div>
                  <div class="text-[10px] text-emerald-600 font-normal">Corroborated as reliable evidence</div>
                </div>
                <span aria-hidden="true">✓</span>
              </button>

              <!-- Mark Under Review Button -->
              <button id="modal-action-under-review" class="p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold transition text-left flex items-center justify-between">
                <div>
                  <div>Keep Under Review</div>
                  <div class="text-[10px] text-indigo-600 font-normal">Active forensics or inquiry</div>
                </div>
                <span aria-hidden="true">⏳</span>
              </button>

              <!-- Reject Button -->
              <button id="modal-action-reject" class="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs font-semibold transition text-left flex items-center justify-between">
                <div>
                  <div>Reject Evidence</div>
                  <div class="text-[10px] text-red-600 font-normal">Unreliable or fabricated</div>
                </div>
                <span aria-hidden="true">✕</span>
              </button>

              <!-- Public Approval Button -->
              <button id="modal-action-publish" class="p-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-semibold transition text-left flex items-center justify-between">
                <div>
                  <div>Approve Public Disclosure</div>
                  <div class="text-[10px] text-teal-600 font-normal">Authorize public viewing with redaction</div>
                </div>
                <span aria-hidden="true">🌐</span>
              </button>
            </div>
          </div>

          <!-- Audit Trail -->
          ${
            ev.auditLogs && ev.auditLogs.length > 0
              ? `
            <div class="pt-3 border-t border-slate-200 space-y-2">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Audit Log History:</span>
              <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                ${ev.auditLogs
                  .map(
                    (log) => `
                  <div class="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                    <div>
                      <span class="font-semibold text-slate-800 font-mono">${log.action}</span>
                      ${log.metadata?.notes ? `<span class="text-slate-600 ml-1.5">"${log.metadata.notes}"</span>` : ''}
                      ${log.metadata?.publicStatus ? `<span class="text-slate-600 ml-1.5">(public: ${log.metadata.publicStatus})</span>` : ''}
                    </div>
                    <span class="text-[10px] text-slate-400 font-mono">${formatDate(log.timestamp)}</span>
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
        title: `Evidence File Review (#${String(ev._id).slice(-6)})`,
        description: 'Verify file authenticity, manage quarantine status, and control public disclosure.',
        contentHtml: modalHtml,
        confirmText: 'Done',
        confirmColor: 'bg-slate-700 hover:bg-slate-800',
        onConfirm: async () => {},
      });

      // Handle Accept Action
      modal.querySelector('#modal-action-accept')?.addEventListener('click', () => {
        showModal({
          title: 'Confirm Evidence Acceptance',
          description: 'Mark this evidence item as corroborated and accepted into case files.',
          contentHtml: `
            <div class="space-y-3">
              <div>
                <label for="accept-notes" class="block text-xs font-medium text-slate-700 mb-1">Review Notes (Optional):</label>
                <textarea id="accept-notes" rows="3" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600" placeholder="Notes on relevance, authenticity, or chain of custody..."></textarea>
              </div>
            </div>
          `,
          confirmText: 'Confirm Acceptance',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-700',
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
          title: 'Set as Under Review',
          description: 'Keep this file in the active investigation pipeline for ongoing analysis.',
          contentHtml: `
            <div>
              <label for="under-review-notes" class="block text-xs font-medium text-slate-700 mb-1">Notes (Optional):</label>
              <textarea id="under-review-notes" rows="2" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600" placeholder="Ongoing review notes..."></textarea>
            </div>
          `,
          confirmText: 'Save State',
          confirmColor: 'bg-indigo-600 hover:bg-indigo-700',
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
          title: 'Reject Evidence Item',
          description: 'Mark this evidence item as rejected due to lack of credibility or relevance.',
          contentHtml: `
            <div class="space-y-3">
              <div>
                <label for="reject-reason" class="block text-xs font-medium text-slate-700 mb-1">Rejection Rationale (Required):</label>
                <textarea id="reject-reason" required rows="3" class="w-full bg-white border border-red-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500" placeholder="State specific reason for rejecting this evidence..."></textarea>
              </div>
            </div>
          `,
          confirmText: 'Confirm Rejection',
          confirmColor: 'bg-red-600 hover:bg-red-700',
          onConfirm: async (subModal) => {
            const reason = subModal.querySelector('#reject-reason').value.trim();
            if (!reason) throw new Error('Rejection reason is required');

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
          title: 'Approve Public Disclosure',
          description: 'Notice: Only clean, sanitized, and redacted files should be released publicly.',
          contentHtml: `
            <div class="space-y-3 text-xs">
              ${
                ev.malwareScanStatus !== 'clean'
                  ? `
                <div class="p-3 bg-red-50 border border-red-300 rounded-lg text-red-800">
                  Warning: This evidence file is not marked Clean by malware analysis. Platform policy forbids public release until scan passes.
                </div>
              `
                  : ''
              }

              <div>
                <label for="pub-status-select" class="block font-medium text-slate-700 mb-1">Public Disclosure Status:</label>
                <select id="pub-status-select" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600">
                  <option value="approved_public" ${ev.publicStatus === 'approved_public' ? 'selected' : ''}>Approved Public</option>
                  <option value="private" ${ev.publicStatus === 'private' ? 'selected' : ''}>Private (Restricted)</option>
                  <option value="withheld" ${ev.publicStatus === 'withheld' ? 'selected' : ''}>Withheld</option>
                </select>
              </div>

              <div>
                <label for="pub-redaction-select" class="block font-medium text-slate-700 mb-1">Redaction Status:</label>
                <select id="pub-redaction-select" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600">
                  <option value="none" ${ev.redactionStatus === 'none' ? 'selected' : ''}>None Required</option>
                  <option value="required" ${ev.redactionStatus === 'required' ? 'selected' : ''}>Redaction Required</option>
                  <option value="completed" ${ev.redactionStatus === 'completed' ? 'selected' : ''}>Redaction Completed</option>
                </select>
                <span class="text-[10px] text-slate-500 block mt-1">Select 'Redaction Completed' if personal identifying markers have been removed.</span>
              </div>
            </div>
          `,
          confirmText: 'Save Publication Settings',
          confirmColor: 'bg-teal-600 hover:bg-teal-700',
          onConfirm: async (subModal) => {
            const publicStatus = subModal.querySelector('#pub-status-select').value;
            const redactionStatus = subModal.querySelector('#pub-redaction-select').value;

            if (publicStatus === 'approved_public' && ev.malwareScanStatus !== 'clean') {
              throw new Error('Evidence cannot be published without passing malware scan');
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
        title: 'Error',
        description: '',
        contentHtml: `<p class="text-xs text-red-600">${err.message || 'Failed to load evidence details'}</p>`,
        confirmText: 'OK',
        confirmColor: 'bg-slate-700 hover:bg-slate-800',
        onConfirm: async () => {},
      });
    }
  }

  // Initial load
  loadEvidence();
}
