import { adminJoinUsService } from '../../../services/admin/adminJoinUsService.js';
import { authService } from '../../../services/auth/authService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';

export async function renderAdminJoinUsPage(container) {
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = currentUser?.accountType === 'superAdmin';

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderAdminNav('join-us')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Join Us Applications</h1>
            <p class="text-sm text-slate-500 mt-1">Review volunteer and professional network submissions, verified references, and uploaded credentials</p>
          </div>

          <div class="flex items-center gap-3">
            <button id="export-btn" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-300 transition flex items-center gap-2 shadow-2xs">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              <span>Export Data</span>
            </button>
            <button id="refresh-btn" class="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-300 transition shadow-2xs" title="Refresh applications" aria-label="Refresh applications">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-xs">
          <div>
            <label for="filter-status" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Status Filter</label>
            <select id="filter-status" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600">
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label for="filter-duplicate" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Duplicate Filter</label>
            <select id="filter-duplicate" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600">
              <option value="">All Applications</option>
              <option value="true">Duplicates Only</option>
              <option value="false">Unique Applications Only</option>
            </select>
          </div>

          <div>
            <label for="filter-search" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Search</label>
            <input type="text" id="filter-search" placeholder="Search name, email, or role..." class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600" />
          </div>
        </div>

        <!-- Alert -->
        <div id="admin-join-alert" role="alert" class="hidden mb-6 p-4 rounded-xl text-sm" aria-live="polite"></div>

        <!-- Submissions Table Card -->
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th scope="col" class="px-6 py-4">Applicant</th>
                  <th scope="col" class="px-6 py-4">Profession & Role</th>
                  <th scope="col" class="px-6 py-4">References / Files</th>
                  <th scope="col" class="px-6 py-4">Status</th>
                  <th scope="col" class="px-6 py-4">Submitted Date</th>
                  <th scope="col" class="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody id="submissions-tbody" class="divide-y divide-slate-100">
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                    <div class="inline-block animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mb-2" aria-hidden="true"></div>
                    <div>Loading applications...</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div id="pagination-controls" class="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span id="page-info">Page 1</span>
            <div class="flex gap-2">
              <button id="prev-page-btn" disabled class="px-3 py-1.5 bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-50 text-slate-700 rounded">Previous</button>
              <button id="next-page-btn" disabled class="px-3 py-1.5 bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-50 text-slate-700 rounded">Next</button>
            </div>
          </div>
        </div>
      </main>

      <!-- Detail Drawer / Modal -->
      <div id="detail-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-6 sm:p-8 relative">
          <button id="close-modal-btn" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition" aria-label="Close dialog">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div id="modal-content"></div>
        </div>
      </div>
    </div>
  `;

  let currentPage = 1;
  const limit = 15;

  const tbody = container.querySelector('#submissions-tbody');
  const alertEl = container.querySelector('#admin-join-alert');
  const filterStatus = container.querySelector('#filter-status');
  const filterDuplicate = container.querySelector('#filter-duplicate');
  const filterSearch = container.querySelector('#filter-search');
  const refreshBtn = container.querySelector('#refresh-btn');
  const exportBtn = container.querySelector('#export-btn');
  const prevBtn = container.querySelector('#prev-page-btn');
  const nextBtn = container.querySelector('#next-page-btn');
  const pageInfo = container.querySelector('#page-info');
  const modal = container.querySelector('#detail-modal');
  const modalContent = container.querySelector('#modal-content');
  const closeModalBtn = container.querySelector('#close-modal-btn');

  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
    }
  });

  async function loadSubmissions() {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-slate-500">
          <div class="inline-block animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mb-2" aria-hidden="true"></div>
          <div>Loading applications...</div>
        </td>
      </tr>
    `;

    try {
      const res = await adminJoinUsService.listSubmissions({
        page: currentPage,
        limit,
        status: filterStatus.value || undefined,
        isDuplicate: filterDuplicate.value || undefined,
        search: filterSearch.value.trim() || undefined,
      });

      const items = res.data || [];
      const meta = res.meta || {};

      if (items.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-12 text-center text-slate-500">
              No applications found matching the selected criteria.
            </td>
          </tr>
        `;
        pageInfo.textContent = 'Total 0 applications';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }

      pageInfo.textContent = `Total ${meta.total || items.length} applications (Page ${currentPage})`;
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = (meta.total || items.length) <= currentPage * limit;

      tbody.innerHTML = items
        .map((sub) => {
          const statusBadge = getStatusBadge(sub.submissionStatus);
          const duplicateBadge = sub.isDuplicate
            ? `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 ml-2" title="Duplicate of previous application">Duplicate</span>`
            : '';
          const hasDocs = (sub.documents || []).length > 0;
          const hasRefs = Boolean(sub.linkedin || sub.portfolio || (sub.socialLinks || []).length > 0);

          const dateStr = sub.submittedAt
            ? new Date(sub.submittedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '—';

          return `
            <tr class="hover:bg-slate-50/80 transition">
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-900 flex items-center">
                  <span>${escapeHtml(sub.fullName)}</span>
                  ${duplicateBadge}
                </div>
                <div class="text-xs text-slate-500">${escapeHtml(sub.email)}</div>
                ${sub.contactInformation?.mobile ? `<div class="text-[11px] text-slate-500 font-mono">${escapeHtml(sub.contactInformation.mobile)}</div>` : ''}
              </td>
              <td class="px-6 py-4">
                <div class="text-slate-900 font-medium">${escapeHtml(sub.primaryProfession)}</div>
                <div class="text-xs text-emerald-700">${escapeHtml(sub.primaryContributionRole)}</div>
              </td>
              <td class="px-6 py-4 text-xs">
                <div class="flex items-center gap-2">
                  ${
                    hasRefs
                      ? `<span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[11px]">🔗 Links</span>`
                      : ''
                  }
                  ${
                    hasDocs
                      ? `<span class="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[11px]">📎 ${(sub.documents || []).length} Files</span>`
                      : ''
                  }
                  ${!hasRefs && !hasDocs ? `<span class="text-slate-400">—</span>` : ''}
                </div>
              </td>
              <td class="px-6 py-4">
                ${statusBadge}
              </td>
              <td class="px-6 py-4 text-xs text-slate-500">
                ${dateStr}
              </td>
              <td class="px-6 py-4 text-right">
                <button data-id="${sub._id}" class="view-details-btn px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition">
                  Details
                </button>
              </td>
            </tr>
          `;
        })
        .join('');

      // Wire view buttons
      tbody.querySelectorAll('.view-details-btn').forEach((btn) => {
        btn.addEventListener('click', () => openDetailsModal(btn.dataset.id));
      });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-red-600">
            Error loading applications: ${escapeHtml(err.message)}
          </td>
        </tr>
      `;
    }
  }

  async function openDetailsModal(id) {
    modal.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="py-12 text-center text-slate-500">
        <div class="inline-block animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mb-2" aria-hidden="true"></div>
        <div>Loading application details...</div>
      </div>
    `;

    try {
      const res = await adminJoinUsService.getSubmissionById(id);
      const sub = res.data;

      const dateStr = sub.submittedAt
        ? new Date(sub.submittedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—';

      const secProfs = (sub.secondaryProfessions || []).join(', ') || 'None';
      const secRoles = (sub.secondaryContributionRoles || []).join(', ') || 'None';

      const notesHtml = (sub.notes || [])
        .map(
          (n) => `
          <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
            <div class="flex items-center justify-between text-slate-500">
              <span class="font-semibold text-slate-800">${escapeHtml(n.adminName || 'Admin')}</span>
              <span>${new Date(n.createdAt).toLocaleDateString('en-US')}</span>
            </div>
            <div class="text-slate-700 whitespace-pre-wrap">${escapeHtml(n.content)}</div>
          </div>
        `
        )
        .join('');

      const docsHtml = (sub.documents || [])
        .map(
          (d) => `
          <div class="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-lg">
            <div>
              <div class="text-sm font-medium text-slate-800 flex items-center gap-2">
                <span>📄 ${escapeHtml(d.originalFilename)}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded ${d.scanStatus === 'clean' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}">
                  ${d.scanStatus}
                </span>
              </div>
              <div class="text-xs text-slate-500 mt-0.5 font-mono">
                ${escapeHtml(d.mimeType)} • ${(d.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <a href="${adminJoinUsService.getDocumentDownloadUrl(sub._id, d._id)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5 shadow-2xs">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              <span>Download</span>
            </a>
          </div>
        `
        )
        .join('');

      modalContent.innerHTML = `
        <div class="space-y-6 text-slate-900">
          <!-- Top Info -->
          <div>
            <div class="flex items-center gap-3">
              <h2 id="modal-title" class="text-xl sm:text-2xl font-bold text-slate-900">${escapeHtml(sub.fullName)}</h2>
              ${getStatusBadge(sub.submissionStatus)}
              ${sub.isDuplicate ? `<span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Duplicate Submission</span>` : ''}
            </div>
            <p class="text-xs text-slate-500 mt-1">Submitted: ${dateStr}</p>
          </div>

          <!-- Section: Personal & Contact -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-xs text-slate-500 block">Email Address:</span>
              <a href="mailto:${escapeHtml(sub.email)}" class="text-emerald-700 hover:underline">${escapeHtml(sub.email)}</a>
            </div>
            <div>
              <span class="text-xs text-slate-500 block">Contact Mobile:</span>
              <span class="text-slate-800 font-mono">${escapeHtml(sub.contactInformation?.mobile || 'Not provided')}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-xs text-slate-500 block">Address / Location:</span>
              <span class="text-slate-800">${escapeHtml(sub.contactInformation?.address || 'Not provided')}</span>
            </div>
          </div>

          <!-- Section: Profession & Role -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-sm">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-slate-500 block">Primary Profession:</span>
                <span class="text-slate-900 font-medium">${escapeHtml(sub.primaryProfession)}</span>
                ${sub.customProfession ? `<div class="text-xs text-slate-600 mt-0.5">(${escapeHtml(sub.customProfession)})</div>` : ''}
              </div>
              <div>
                <span class="text-xs text-slate-500 block">Secondary Professions:</span>
                <span class="text-slate-800">${escapeHtml(secProfs)}</span>
              </div>
            </div>

            <div class="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-slate-500 block">Primary Contribution Role:</span>
                <span class="text-emerald-700 font-medium">${escapeHtml(sub.primaryContributionRole)}</span>
              </div>
              <div>
                <span class="text-xs text-slate-500 block">Secondary Roles:</span>
                <span class="text-slate-800">${escapeHtml(secRoles)}</span>
              </div>
            </div>

            <div class="border-t border-slate-200 pt-3">
              <span class="text-xs text-slate-500 block mb-1">Experience & Motivation Narrative:</span>
              <div class="bg-white p-3 rounded-lg text-slate-800 text-sm whitespace-pre-wrap leading-relaxed border border-slate-200">
                ${escapeHtml(sub.contributionDetails)}
              </div>
            </div>
          </div>

          <!-- Section: References -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Professional & Web References</h3>
            <div class="space-y-1.5">
              ${
                sub.linkedin
                  ? `<div><span class="text-slate-500 text-xs">LinkedIn:</span> <a href="${escapeHtml(sub.linkedin)}" target="_blank" rel="noopener noreferrer" class="text-blue-700 hover:underline break-all ml-2">${escapeHtml(sub.linkedin)}</a></div>`
                  : ''
              }
              ${
                sub.portfolio
                  ? `<div><span class="text-slate-500 text-xs">Portfolio/Website:</span> <a href="${escapeHtml(sub.portfolio)}" target="_blank" rel="noopener noreferrer" class="text-emerald-700 hover:underline break-all ml-2">${escapeHtml(sub.portfolio)}</a></div>`
                  : ''
              }
              ${(sub.socialLinks || [])
                .map(
                  (l) =>
                    `<div><span class="text-slate-500 text-xs">Social:</span> <a href="${escapeHtml(l)}" target="_blank" rel="noopener noreferrer" class="text-teal-700 hover:underline break-all ml-2">${escapeHtml(l)}</a></div>`
                )
                .join('')}
              ${!sub.linkedin && !sub.portfolio && (!sub.socialLinks || sub.socialLinks.length === 0) ? `<div class="text-xs text-slate-500">No reference links provided.</div>` : ''}
            </div>
          </div>

          <!-- Section: Documents -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Attached Supporting Documents (${(sub.documents || []).length})</h3>
            <div class="space-y-2">
              ${docsHtml || '<div class="text-xs text-slate-500">No files uploaded.</div>'}
            </div>
          </div>

          <!-- Section: Status Update Workflow -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Application Moderation & Status</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label for="modal-status-select" class="block text-xs font-medium text-slate-700 mb-1">New Status:</label>
                <select id="modal-status-select" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600">
                  <option value="submitted" ${sub.submissionStatus === 'submitted' ? 'selected' : ''}>Submitted</option>
                  <option value="reviewed" ${sub.submissionStatus === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                  <option value="accepted" ${sub.submissionStatus === 'accepted' ? 'selected' : ''}>Accepted</option>
                  <option value="rejected" ${sub.submissionStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label for="modal-status-note" class="block text-xs font-medium text-slate-700 mb-1">Administrative Note (Optional):</label>
                <input type="text" id="modal-status-note" placeholder="State reason or moderation details..." class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600" />
              </div>
            </div>
            <button id="save-status-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs">
              Update Status
            </button>
          </div>

          <!-- Section: Internal Notes -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Internal Admin Notes (${(sub.notes || []).length})</h3>
            <div class="space-y-2">
              ${notesHtml || '<div class="text-xs text-slate-500">No internal notes added yet.</div>'}
            </div>
            <div class="flex gap-2 pt-2">
              <input type="text" id="new-note-input" placeholder="Enter new internal administrator note..." class="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600" />
              <button id="add-note-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition">
                Add Note
              </button>
            </div>
          </div>

          <!-- Section: Super Admin Danger Zone -->
          ${
            isSuperAdmin
              ? `
            <div class="border border-red-300 bg-red-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 class="text-sm font-bold text-red-800">Permanently Remove Submission</h4>
                <p class="text-xs text-slate-600 mt-0.5">Super Admin only. A justification must be specified and is permanently logged in system audits.</p>
              </div>
              <button id="delete-submission-btn" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-xs">
                Delete Application
              </button>
            </div>
          `
              : ''
          }
        </div>
      `;

      // Wire Status Update
      const saveStatusBtn = modalContent.querySelector('#save-status-btn');
      saveStatusBtn.addEventListener('click', async () => {
        saveStatusBtn.disabled = true;
        saveStatusBtn.textContent = 'Saving...';
        try {
          const newStatus = modalContent.querySelector('#modal-status-select').value;
          const adminNotes = modalContent.querySelector('#modal-status-note').value.trim();
          await adminJoinUsService.updateStatus(sub._id, {
            status: newStatus,
            adminNotes: adminNotes || undefined,
          });
          showAlert('Status updated successfully!', 'success');
          openDetailsModal(sub._id);
          loadSubmissions();
        } catch (err) {
          showAlert(err.message || 'Failed to update status.', 'error');
          saveStatusBtn.disabled = false;
          saveStatusBtn.textContent = 'Update Status';
        }
      });

      // Wire Add Note
      const addNoteBtn = modalContent.querySelector('#add-note-btn');
      const noteInput = modalContent.querySelector('#new-note-input');
      addNoteBtn.addEventListener('click', async () => {
        const text = noteInput.value.trim();
        if (!text) return;
        addNoteBtn.disabled = true;
        try {
          await adminJoinUsService.addNote(sub._id, text);
          showAlert('Note added successfully!', 'success');
          openDetailsModal(sub._id);
        } catch (err) {
          showAlert(err.message || 'Failed to add note.', 'error');
          addNoteBtn.disabled = false;
        }
      });

      // Wire Super Admin Delete
      if (isSuperAdmin) {
        const delBtn = modalContent.querySelector('#delete-submission-btn');
        delBtn.addEventListener('click', async () => {
          const reason = window.prompt('Specify the justification for permanently deleting this application (Required):');
          if (!reason || !reason.trim()) {
            window.alert('A deletion reason is required.');
            return;
          }
          if (
            !window.confirm(
              'Are you sure you want to permanently delete this application and all attached documents?'
            )
          ) {
            return;
          }

          delBtn.disabled = true;
          try {
            await adminJoinUsService.deleteSubmission(sub._id, reason.trim());
            modal.classList.add('hidden');
            showAlert('Application deleted successfully.', 'success');
            loadSubmissions();
          } catch (err) {
            alert(err.message || 'Failed to delete application.');
            delBtn.disabled = false;
          }
        });
      }
    } catch (err) {
      modalContent.innerHTML = `
        <div class="py-8 text-center text-red-600">
          Error loading details: ${escapeHtml(err.message)}
        </div>
      `;
    }
  }

  function showAlert(msg, type = 'success') {
    alertEl.textContent = msg;
    alertEl.className =
      type === 'success'
        ? 'mb-6 p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-300 text-emerald-800 block'
        : 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-300 text-red-800 block';
    setTimeout(() => {
      alertEl.className = 'hidden';
    }, 4000);
  }

  // Filter & Refresh events
  filterStatus.addEventListener('change', () => {
    currentPage = 1;
    loadSubmissions();
  });
  filterDuplicate.addEventListener('change', () => {
    currentPage = 1;
    loadSubmissions();
  });
  filterSearch.addEventListener('input', () => {
    currentPage = 1;
    loadSubmissions();
  });
  refreshBtn.addEventListener('click', () => loadSubmissions());

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadSubmissions();
    }
  });
  nextBtn.addEventListener('click', () => {
    currentPage++;
    loadSubmissions();
  });

  // Export event
  exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Exporting...';
    try {
      const res = await adminJoinUsService.exportData();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `jonoshor_join_us_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showAlert('Data exported successfully!', 'success');
    } catch (err) {
      showAlert(err.message || 'Export failed.', 'error');
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerHTML = `
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        <span>Export Data</span>
      `;
    }
  });

  // Initial load
  loadSubmissions();
}

function getStatusBadge(status) {
  switch (status) {
    case 'submitted':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">Submitted</span>`;
    case 'reviewed':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Reviewed</span>`;
    case 'accepted':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Accepted</span>`;
    case 'rejected':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-200">Rejected</span>`;
    default:
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">${status || 'Unknown'}</span>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
