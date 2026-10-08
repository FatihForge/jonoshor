import { adminComplaintService } from '../../../services/admin/adminComplaintService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';
import { getStatusBadge, getPriorityBadge, getSensitivityBadge } from '../../../components/admin/StatusBadge.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { formatDate, formatDateTime, formatBytes } from '../../../utils/formatters.js';

export async function renderAdminComplaintDetailsPage(container, complaintId) {
  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderAdminNav('complaints')}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="details-loading" class="py-20 text-center" role="status">
          <div class="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" aria-hidden="true"></div>
          <p class="text-xs text-slate-500">Loading complaint details...</p>
        </div>
        <div id="details-content" class="hidden space-y-6"></div>
        <div id="details-error" class="hidden py-16 text-center" role="alert"></div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#details-loading');
  const contentEl = container.querySelector('#details-content');
  const errorEl = container.querySelector('#details-error');

  async function loadDetails() {
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    errorEl.classList.add('hidden');

    try {
      const res = await adminComplaintService.getComplaintById(complaintId);
      const comp = res?.data;
      if (!comp) {
        throw new Error('Complaint record not found');
      }

      renderComplaintUI(comp);
      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.innerHTML = `
        <div class="max-w-md mx-auto p-6 bg-red-50 border border-red-300 rounded-xl text-center">
          <h3 class="text-base font-bold text-red-900 mb-2">Failed to Load Complaint Details</h3>
          <p class="text-xs text-red-700 mb-4">${err.message || 'Access denied or record does not exist.'}</p>
          <a href="#/admin/complaints" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold inline-block transition">
            Back to Complaints Queue
          </a>
        </div>
      `;
      errorEl.classList.remove('hidden');
    }
  }

  function renderComplaintUI(comp) {
    const isConflict = comp.review?.conflictOfInterest;
    const assignedReviewer = comp.review?.assignedReviewerId;
    const evidenceList = comp.evidence || [];
    const statusHistory = comp.statusHistory || [];
    const accusedList = comp.accused || [];
    const victimsList = comp.victims || [];
    const authorityActions = comp.authorityActions || [];
    const reporter = comp.reporterId || {};

    contentEl.innerHTML = `
      <!-- Top Navigation & Actions Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <a href="#/admin/complaints" class="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition" aria-label="Back to Complaints Queue">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-xl font-bold text-slate-900 font-mono">#${String(comp._id)}</h1>
              ${getStatusBadge(comp.status)}
              ${getPriorityBadge(comp.priority)}
              ${getSensitivityBadge(comp.sensitivity)}
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Filed: ${formatDateTime(comp.createdAt)} | Last Updated: ${formatDateTime(comp.updatedAt)}
            </p>
          </div>
        </div>

        <!-- Workflow Review Action Buttons -->
        <div class="flex flex-wrap items-center gap-2" id="action-buttons-group">
          <!-- Assign Reviewer -->
          <button id="btn-assign-reviewer" class="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition shadow-2xs">
            Assign Reviewer
          </button>

          <!-- Screening -->
          <button id="btn-screen" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition">
            Screening & Intake
          </button>

          <!-- Request Information -->
          <button id="btn-req-info" class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition">
            Request Info
          </button>

          <!-- Verification -->
          <button id="btn-verify" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition">
            Verify Case
          </button>

          <!-- Publication Review -->
          ${
            comp.status === 'verified' || comp.status === 'public_disclosure_review'
              ? `
            <button id="btn-public-disclosure" class="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5">
              <span>Publication Review</span>
            </button>
          `
              : ''
          }

          ${
            comp.status === 'published'
              ? `
            <a href="#/reports/${comp.publicReportId || ''}" target="_blank" class="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition flex items-center gap-1.5">
              <span>View Public Report →</span>
            </a>
          `
              : ''
          }

          <!-- Declare Conflict -->
          <button id="btn-conflict" class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-red-800 text-xs font-semibold transition">
            Conflict of Interest
          </button>
        </div>
      </div>

      <!-- Conflict Warning Banner -->
      ${
        isConflict
          ? `
        <div class="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-3" role="alert">
          <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <strong class="font-bold">Notice:</strong> A Conflict of Interest was declared on this complaint. Investigation is suspended pending reviewer reassignment.
          </div>
        </div>
      `
          : ''
      }

      <!-- Main Layout: Left 2/3 Content, Right 1/3 Review Status -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 1. Incident Info -->
          <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Incident Details</span>
              <span class="text-xs font-normal text-emerald-700">${comp.category?.primary || ''}</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-slate-500 block mb-1">Primary Category</span>
                <span class="font-semibold text-slate-800 text-sm">${comp.category?.primary || '—'}</span>
              </div>
              <div>
                <span class="text-slate-500 block mb-1">Secondary Category</span>
                <span class="text-slate-700">${comp.category?.secondary?.join(', ') || 'None'}</span>
              </div>
              <div>
                <span class="text-slate-500 block mb-1">Incident Date & Timeline</span>
                <span class="text-slate-800">${formatDate(comp.incident?.startDate)} ${comp.incident?.endDate ? `to ${formatDate(comp.incident.endDate)}` : ''}</span>
                ${comp.incident?.ongoing ? '<span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200">Incident Ongoing</span>' : ''}
              </div>
              <div>
                <span class="text-slate-500 block mb-1">Location</span>
                <span class="text-slate-800 font-medium">
                  ${comp.location?.upazilaId ? `${comp.location.upazilaId}, ` : ''}
                  ${comp.location?.districtId || ''}, 
                  ${comp.location?.divisionId || ''}
                </span>
                ${comp.location?.freeTextLocation ? `<span class="block text-slate-500 mt-1">${comp.location.freeTextLocation}</span>` : ''}
              </div>
            </div>

            <div class="pt-2">
              <span class="text-slate-500 text-xs block mb-2 font-medium">Full Narrative:</span>
              <div class="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                ${comp.incident?.description || 'No description provided.'}
              </div>
            </div>
          </div>

          <!-- 2. Attached Evidence -->
          <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Attached Evidence</span>
              <span class="text-xs text-slate-500">${evidenceList.length} files attached</span>
            </h2>

            ${
              evidenceList.length === 0
                ? `
              <div class="p-6 text-center text-slate-500 text-xs">
                No evidence items attached to this complaint yet.
              </div>
            `
                : `
              <div class="divide-y divide-slate-100">
                ${evidenceList
                  .map(
                    (ev) => `
                  <div class="py-3.5 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-500" aria-hidden="true">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                        </svg>
                      </div>
                      <div>
                        <span class="text-xs font-semibold text-slate-900 block">${ev.originalFilename || 'File'}</span>
                        <div class="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span class="uppercase">${ev.type || 'Unknown'}</span>
                          <span>•</span>
                          <span>${formatBytes(ev.size)}</span>
                          <span>•</span>
                          <span>Uploaded: ${formatDate(ev.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium ${
                        ev.malwareScanStatus === 'clean'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : ev.malwareScanStatus === 'infected'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }">
                        Malware Scan: ${ev.malwareScanStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </div>

          <!-- 3. Accused & Victims Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Accused Persons -->
            <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Accused Entities (${accusedList.length})
              </h3>
              ${
                accusedList.length === 0
                  ? `<p class="text-xs text-slate-500 py-3">No accused parties listed.</p>`
                  : `
                <div class="space-y-3 text-xs">
                  ${accusedList
                    .map(
                      (acc) => `
                    <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span class="font-bold text-slate-900 block">${acc.name || 'Unknown Entity'} ${acc.alias ? `(${acc.alias})` : ''}</span>
                      <span class="text-slate-600 text-[11px] block mt-0.5">${acc.role || acc.profession || ''} ${acc.organization ? `— ${acc.organization}` : ''}</span>
                      ${acc.mobile ? `<span class="text-slate-500 text-[11px] block mt-0.5">Contact: ${acc.mobile}</span>` : ''}
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
              }
            </div>

            <!-- Victims -->
            <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Victims Information (${victimsList.length})
              </h3>
              ${
                victimsList.length === 0
                  ? `<p class="text-xs text-slate-500 py-3">No victim details logged.</p>`
                  : `
                <div class="space-y-3 text-xs">
                  ${victimsList
                    .map(
                      (vic) => `
                    <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-900">${vic.name || 'Confidential'}</span>
                        ${vic.minor ? '<span class="px-1.5 py-0.5 rounded text-[9px] bg-red-50 text-red-800 border border-red-200 font-semibold">Minor</span>' : ''}
                      </div>
                      <span class="text-slate-600 text-[11px] block mt-0.5">Age: ${vic.age || vic.ageCategory || '—'} | Gender: ${vic.gender || '—'}</span>
                      ${vic.relationshipToIncident ? `<span class="text-slate-500 text-[11px] block mt-0.5">Relationship: ${vic.relationshipToIncident}</span>` : ''}
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
              }
            </div>
          </div>
        </div>

        <!-- Right Column: Review State & Reporter Details -->
        <div class="space-y-6">
          <!-- Review State Box -->
          <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Review Status & Assignment
            </h2>
            <div class="space-y-3 text-xs">
              <div>
                <span class="text-slate-500 block mb-1">Current Status</span>
                <div>${getStatusBadge(comp.status)}</div>
              </div>
              <div>
                <span class="text-slate-500 block mb-1">Assigned Reviewer</span>
                <span class="font-mono text-slate-800 font-medium text-xs">
                  ${assignedReviewer ? `#${String(assignedReviewer)}` : '<span class="text-slate-400 font-normal">Unassigned</span>'}
                </span>
                ${comp.review?.assignedAt ? `<span class="text-[10px] text-slate-500 block mt-0.5">Assigned: ${formatDateTime(comp.review.assignedAt)}</span>` : ''}
              </div>

              ${
                comp.review?.reviewerNotes
                  ? `
                <div>
                  <span class="text-slate-500 block mb-1">Internal Reviewer Notes:</span>
                  <div class="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700 text-xs italic">
                    ${comp.review.reviewerNotes}
                  </div>
                </div>
              `
                  : ''
              }

              ${
                comp.review?.verificationDecision
                  ? `
                <div>
                  <span class="text-slate-500 block mb-1">Verification Decision:</span>
                  <span class="font-semibold text-emerald-700 capitalize">${comp.review.verificationDecision}</span>
                  ${comp.review.verificationReason ? `<p class="text-slate-600 mt-1">${comp.review.verificationReason}</p>` : ''}
                </div>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Reporter Details Box -->
          <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Reporter Identity
            </h2>
            <div class="space-y-3 text-xs">
              <div>
                <span class="text-slate-500 block mb-1">Submission Channel</span>
                <span class="font-medium text-slate-800">${comp.submissionType === 'user' ? 'Authenticated User' : 'Anonymous / Non-User'}</span>
              </div>

              ${
                reporter.isAnonymous
                  ? `
                <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                  <span class="font-bold block mb-1">Anonymous Report</span>
                  Reporter requested anonymity in all public disclosures.
                </div>
              `
                  : ''
              }

              ${
                reporter.contact?.email
                  ? `
                <div>
                  <span class="text-slate-500 block mb-0.5">Contact Email</span>
                  <span class="text-slate-800 font-mono">${reporter.contact.email}</span>
                </div>
              `
                  : ''
              }

              ${
                reporter.contact?.mobile
                  ? `
                <div>
                  <span class="text-slate-500 block mb-0.5">Contact Mobile</span>
                  <span class="text-slate-800 font-mono">${reporter.contact.mobile}</span>
                </div>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Workflow History Timeline -->
          <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Workflow Timeline (${statusHistory.length})
            </h2>

            ${
              statusHistory.length === 0
                ? `<p class="text-xs text-slate-500">No lifecycle events recorded.</p>`
                : `
              <div class="relative border-l border-slate-200 ml-2 space-y-4 text-xs">
                ${statusHistory
                  .map(
                    (h) => `
                  <div class="relative pl-4">
                    <span class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-300 border border-white" aria-hidden="true"></span>
                    <span class="font-semibold text-slate-800 block">${h.status}</span>
                    <span class="text-[10px] text-slate-500 block">${formatDateTime(h.changedAt)}</span>
                    ${h.note ? `<p class="text-[11px] text-slate-600 mt-1 italic">${h.note}</p>` : ''}
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </div>

          <!-- Authority Actions if any -->
          ${
            authorityActions.length > 0
              ? `
            <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h2 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Authority Actions</h2>
              <div class="space-y-2 text-xs">
                ${authorityActions
                  .map(
                    (act) => `
                  <div class="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span class="font-bold text-slate-800 block">${act.authorityName || 'Authority'}</span>
                    <span class="text-slate-600">${act.action || ''} (${formatDate(act.actionDate)})</span>
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
      </div>
    `;

    setupActionModals(comp);
  }

  function setupActionModals(comp) {
    // 1. Assign Reviewer
    const assignBtn = container.querySelector('#btn-assign-reviewer');
    if (assignBtn) {
      assignBtn.addEventListener('click', () => {
        showModal({
          title: 'Assign Reviewer',
          description: 'Provide an administrator ObjectId to assign responsibility for investigating this complaint.',
          contentHtml: `
            <div>
              <label for="input-reviewer-id" class="block text-xs font-semibold text-slate-700 mb-1">Reviewer Admin ID *</label>
              <input id="input-reviewer-id" type="text" placeholder="e.g. 64b8f... (Admin ObjectId)" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"/>
              <p class="text-[11px] text-slate-500 mt-1.5">Assigning a reviewer advances the complaint to the 'screening' phase.</p>
            </div>
          `,
          confirmText: 'Assign Reviewer',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-700',
          onConfirm: async (modal) => {
            const reviewerId = modal.querySelector('#input-reviewer-id').value.trim();
            if (!reviewerId) {
              throw new Error('Reviewer Admin ID is required');
            }
            await adminComplaintService.assignReviewer(comp._id, reviewerId);
            await loadDetails();
          },
        });
      });
    }

    // 2. Screening
    const screenBtn = container.querySelector('#btn-screen');
    if (screenBtn) {
      screenBtn.addEventListener('click', () => {
        showModal({
          title: 'Screening & Intake Decision',
          description: 'Record intake findings and transition the case to the next lifecycle stage or reject if ineligible.',
          contentHtml: `
            <div class="space-y-3">
              <div>
                <label for="input-screen-status" class="block text-xs font-semibold text-slate-700 mb-1">Target Lifecycle Status *</label>
                <select id="input-screen-status" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                  <option value="screening">Active Screening</option>
                  <option value="evidence_review">Evidence Review</option>
                  <option value="verification">Verification Pipeline</option>
                  <option value="rejected">Rejected (Out of Mandate / Ineligible)</option>
                </select>
              </div>
              <div>
                <label for="input-screen-notes" class="block text-xs font-semibold text-slate-700 mb-1">Screening Notes / Rationale</label>
                <textarea id="input-screen-notes" rows="3" placeholder="Provide notes regarding intake observations..." class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
              </div>
            </div>
          `,
          confirmText: 'Save Decision',
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          onConfirm: async (modal) => {
            const status = modal.querySelector('#input-screen-status').value;
            const notes = modal.querySelector('#input-screen-notes').value.trim();
            await adminComplaintService.screenComplaint(comp._id, { status, notes });
            await loadDetails();
          },
        });
      });
    }

    // 3. Request Information
    const reqInfoBtn = container.querySelector('#btn-req-info');
    if (reqInfoBtn) {
      reqInfoBtn.addEventListener('click', () => {
        showModal({
          title: 'Request Additional Information',
          description: 'Communicate with the complainant to obtain clarifications or missing evidence items.',
          contentHtml: `
            <div>
              <label for="input-req-msg" class="block text-xs font-semibold text-slate-700 mb-1">Message Content *</label>
              <textarea id="input-req-msg" rows="4" placeholder="Detail the specific information or corroboration requested..." class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
            </div>
          `,
          confirmText: 'Send Request',
          confirmColor: 'bg-amber-600 hover:bg-amber-700',
          onConfirm: async (modal) => {
            const message = modal.querySelector('#input-req-msg').value.trim();
            if (!message) {
              throw new Error('Message content is required');
            }
            const targetUserId = comp.reporterId?.accountId || undefined;
            await adminComplaintService.requestInformation(comp._id, { message, targetUserId });
            await loadDetails();
          },
        });
      });
    }

    // 4. Verify Complaint
    const verifyBtn = container.querySelector('#btn-verify');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        showModal({
          title: 'Verify Complaint',
          description: 'Record the definitive factual verification evaluation based on corroborated evidence and field inquiries.',
          contentHtml: `
            <div class="space-y-3">
              <div>
                <label for="input-verify-decision" class="block text-xs font-semibold text-slate-700 mb-1">Verification Decision *</label>
                <select id="input-verify-decision" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                  <option value="verified">Verified (Allegations Corroborated)</option>
                  <option value="partially_verified">Partially Verified</option>
                  <option value="unverified">Unverified (Insufficient Evidence)</option>
                </select>
              </div>
              <div>
                <label for="input-verify-reason" class="block text-xs font-semibold text-slate-700 mb-1">Decision Rationale *</label>
                <textarea id="input-verify-reason" rows="2" placeholder="Summary of findings leading to this determination..." class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
              </div>
              <div>
                <label for="input-verify-assessment" class="block text-xs font-semibold text-slate-700 mb-1">Evidence Assessment</label>
                <textarea id="input-verify-assessment" rows="2" placeholder="Assessment of evidence reliability and chain of custody..." class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
              </div>
            </div>
          `,
          confirmText: 'Record Verification',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-700',
          onConfirm: async (modal) => {
            const decision = modal.querySelector('#input-verify-decision').value;
            const reason = modal.querySelector('#input-verify-reason').value.trim();
            const assessment = modal.querySelector('#input-verify-assessment').value.trim();

            if (!reason) {
              throw new Error('Decision rationale is required');
            }

            await adminComplaintService.verifyComplaint(comp._id, {
              decision,
              reason,
              assessment,
              notes: reason,
            });
            await loadDetails();
          },
        });
      });
    }

    // 5. Declare Conflict
    const conflictBtn = container.querySelector('#btn-conflict');
    if (conflictBtn) {
      conflictBtn.addEventListener('click', () => {
        showModal({
          title: 'Declare Conflict of Interest',
          description: 'If you have any personal, organizational, or familial connection to parties involved, declare a conflict to ensure impartial review.',
          contentHtml: `
            <div>
              <label for="input-conflict-reason" class="block text-xs font-semibold text-red-700 mb-1">Reason for Conflict *</label>
              <textarea id="input-conflict-reason" rows="3" placeholder="Specify nature of conflict of interest..." class="w-full bg-white border border-red-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"></textarea>
              <p class="text-[11px] text-red-600 mt-2">Declaring a conflict unassigns you from the case and re-queues it for independent reassignment.</p>
            </div>
          `,
          confirmText: 'Confirm Conflict Declaration',
          confirmColor: 'bg-red-600 hover:bg-red-700',
          onConfirm: async (modal) => {
            const reason = modal.querySelector('#input-conflict-reason').value.trim();
            if (!reason) {
              throw new Error('Reason is required');
            }
            await adminComplaintService.declareConflict(comp._id, reason);
            await loadDetails();
          },
        });
      });
    }

    // 6. Publication Disclosure Review
    const pubBtn = container.querySelector('#btn-public-disclosure');
    if (pubBtn) {
      pubBtn.addEventListener('click', () => {
        const defaultTitle = `${comp.location?.districtId ? comp.location.districtId + ': ' : ''}${comp.category?.primary || 'Human Rights Incident'}`;
        const defaultSummary = comp.incident?.description
          ? comp.incident.description.slice(0, 180) + '...'
          : 'Factual incident details verified through investigation.';
        const defaultStory = comp.incident?.description || '';

        showModal({
          title: 'Public Disclosure Review',
          description: 'Prepare a sanitized, safe public report for open publishing. Sensitive identifying data remains confidential.',
          contentHtml: `
            <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              <div>
                <label for="input-pub-title" class="block font-semibold text-slate-700 mb-1">Public Report Title *</label>
                <input id="input-pub-title" type="text" value="${defaultTitle}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div>
                <label for="input-pub-summary" class="block font-semibold text-slate-700 mb-1">Executive Summary *</label>
                <textarea id="input-pub-summary" rows="2" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">${defaultSummary}</textarea>
              </div>
              <div>
                <label for="input-pub-story" class="block font-semibold text-slate-700 mb-1">Incident Narrative (Sanitized & Verified) *</label>
                <textarea id="input-pub-story" rows="4" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">${defaultStory}</textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="input-pub-authority" class="block font-semibold text-slate-700 mb-1">Authority Action Summary</label>
                  <input id="input-pub-authority" type="text" placeholder="Measures initiated by police or administration..." class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label for="input-pub-case-status" class="block font-semibold text-slate-700 mb-1">Legal Case Status</label>
                  <select id="input-pub-case-status" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                    <option value="under_investigation">Under Investigation</option>
                    <option value="case_filed">Case Filed</option>
                    <option value="trial">At Trial</option>
                    <option value="no_legal_case">No Legal Case</option>
                    <option value="unknown">Unknown</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div>
                <label for="input-pub-legal" class="block font-semibold text-slate-700 mb-1">Legal Summary & Reference</label>
                <input id="input-pub-legal" type="text" placeholder="GD number or judicial reference (if available)..." class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p class="font-bold text-slate-800">🔒 Automated Protection Standards:</p>
                <p>• Complainant identity is strictly shielded and never made public.</p>
                <p>• Minor victims' identities are automatically pseudonymized.</p>
                <p>• Only clean, approved evidence items are published.</p>
              </div>
            </div>
          `,
          confirmText: 'Approve & Publish',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-700',
          onConfirm: async (modal) => {
            const title = modal.querySelector('#input-pub-title').value.trim();
            const summary = modal.querySelector('#input-pub-summary').value.trim();
            const story = modal.querySelector('#input-pub-story').value.trim();
            const authority = modal.querySelector('#input-pub-authority').value.trim();
            const legalSummary = modal.querySelector('#input-pub-legal').value.trim();
            const caseStatus = modal.querySelector('#input-pub-case-status').value;

            if (!title || !summary || !story) {
              throw new Error('Title, summary, and narrative are required');
            }

            await adminComplaintService.createPublicReport(comp._id, {
              bn: {
                title,
                summary,
                incidentStory: story,
                authorityActionSummary: authority,
                legalSummary,
              },
              authorityActionSummary: authority,
              legalSummary,
              caseStatus,
            });

            await loadDetails();
          },
        });
      });
    }
  }

  await loadDetails();
}
