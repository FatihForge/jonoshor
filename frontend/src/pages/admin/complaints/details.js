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
      const [res, legalCasesRes, updateRequestsRes] = await Promise.all([
        adminComplaintService.getComplaintById(complaintId),
        adminComplaintService.getLegalCases(complaintId).catch(() => ({ data: [] })),
        adminComplaintService.getLegalUpdateRequests(complaintId).catch(() => ({ data: [] })),
      ]);
      const comp = res?.data;
      if (!comp) {
        throw new Error('Complaint record not found');
      }
      const legalCases = legalCasesRes?.data || [];
      const legalUpdateRequests = updateRequestsRes?.data || [];

      renderComplaintUI(comp, legalCases, legalUpdateRequests);
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

  function renderComplaintUI(comp, legalCases = [], legalUpdateRequests = []) {
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

          <!-- 4. Legal Cases & Judicial Proceedings Workspace -->
          <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>⚖️ Legal Cases & Proceedings</span>
                  <span class="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-normal border border-slate-200">
                    ${legalCases.length} logged
                  </span>
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">Formal cases, courts, and timeline events tracked for this complaint.</p>
              </div>
              <button id="btn-add-legal-case" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1.5">
                <span>+ Add Legal Case</span>
              </button>
            </div>

            ${
              legalCases.length === 0
                ? `
              <div class="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No formal legal cases or court proceedings recorded yet.
              </div>
            `
                : `
              <div class="space-y-4">
                ${legalCases
                  .map(
                    (lc) => `
                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3" data-legal-case-id="${lc._id}">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-slate-900 text-sm font-mono">${lc.caseNumber ? `Case #${lc.caseNumber}` : 'General Legal Case'}</span>
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">${lc.caseType || 'General'}</span>
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">${lc.currentLegalStatus || 'Pending'}</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                          ${lc.courts?.length ? `<span>Courts: ${lc.courts.map((c) => c.name).join(', ')}</span> • ` : ''}
                          ${lc.authorities?.length ? `<span>Authorities: ${lc.authorities.map((a) => a.name).join(', ')}</span>` : ''}
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <button class="btn-edit-legal-case px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium transition" data-id="${lc._id}">
                          Edit Case
                        </button>
                        <button class="btn-add-timeline-event px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-medium transition" data-id="${lc._id}">
                          + Timeline Event
                        </button>
                      </div>
                    </div>

                    <!-- Timeline Events -->
                    <div class="space-y-2 pt-1">
                      <span class="text-xs font-semibold text-slate-700 block">Case Timeline (${lc.timeline?.length || 0}):</span>
                      ${
                        !lc.timeline || lc.timeline.length === 0
                          ? `
                        <p class="text-[11px] text-slate-400 italic">No timeline events recorded.</p>
                      `
                          : `
                        <div class="divide-y divide-slate-200/60 pl-2">
                          ${lc.timeline
                            .map(
                              (ev) => `
                            <div class="py-2 flex items-start justify-between gap-3 text-xs">
                              <div class="space-y-0.5">
                                <div class="flex items-center gap-2">
                                  <span class="font-semibold text-slate-900">${formatDate(ev.date)}</span>
                                  <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-medium">${ev.eventType || 'Event'}</span>
                                  ${ev.verified ? '<span class="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 rounded border border-emerald-200">Verified</span>' : '<span class="text-[10px] text-slate-500">Unverified</span>'}
                                </div>
                                <p class="text-slate-700 text-xs">${ev.description || ''}</p>
                                ${ev.publicSummary ? `<p class="text-[11px] text-emerald-700 font-medium">Public: "${ev.publicSummary}"</p>` : ''}
                                ${ev.reference ? `<p class="text-[10px] text-slate-400">Ref: ${ev.reference}</p>` : ''}
                              </div>
                              <button class="btn-edit-timeline-event text-[11px] text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap" data-case-id="${lc._id}" data-event-id="${ev._id}">
                                Edit
                              </button>
                            </div>
                          `
                            )
                            .join('')}
                        </div>
                      `
                      }
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </div>

          <!-- 5. Authority Actions Workspace -->
          <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🏛️ Authority Actions & Interventions</span>
                  <span class="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-normal border border-slate-200">
                    ${authorityActions.length} recorded
                  </span>
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">Police inquiries, administrative notices, and department actions.</p>
              </div>
              <button id="btn-add-authority-action" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1.5">
                <span>+ Add Authority Action</span>
              </button>
            </div>

            ${
              authorityActions.length === 0
                ? `
              <div class="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No authority interventions or official actions logged yet.
              </div>
            `
                : `
              <div class="space-y-3">
                ${authorityActions
                  .map(
                    (act) => `
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" data-action-id="${act._id}">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900">${act.authorityName || 'Authority'}</span>
                        <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 uppercase font-semibold">${act.authorityType || 'police'}</span>
                        <span class="text-slate-500 text-[11px]">• ${formatDate(act.actionDate)}</span>
                        ${act.verified ? '<span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Verified</span>' : '<span class="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Pending Verification</span>'}
                      </div>
                      <p class="text-slate-800 font-medium">${act.action || ''}</p>
                      ${act.publicSummary ? `<p class="text-[11px] text-emerald-700">Public: "${act.publicSummary}"</p>` : ''}
                      ${act.reference ? `<p class="text-[10px] text-slate-400">Ref: ${act.reference}</p>` : ''}
                    </div>
                    <button class="btn-edit-authority-action shrink-0 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium transition" data-id="${act._id}">
                      Edit / Verify
                    </button>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </div>

          <!-- 6. User / Reporter Legal Update Claims -->
          <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div class="border-b border-slate-100 pb-3">
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📝 Reporter Legal Update Claims</span>
                <span class="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-normal border border-slate-200">
                  ${legalUpdateRequests.length} submitted
                </span>
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Claims submitted by the reporter. Claims must be reviewed and verified before becoming public facts.</p>
            </div>

            ${
              legalUpdateRequests.length === 0
                ? `
              <p class="text-xs text-slate-500 py-2">No pending legal update claims submitted by the reporter.</p>
            `
                : `
              <div class="space-y-3">
                ${legalUpdateRequests
                  .map(
                    (req) => `
                  <div class="p-3.5 rounded-xl ${req.status === 'pending' ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'} border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900">${req.claim}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${req.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : (req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')} uppercase">
                          ${req.status}
                        </span>
                        <span class="text-slate-500 text-[10px]">${formatDateTime(req.submittedAt)}</span>
                      </div>
                      ${req.name ? `<p class="text-slate-600 text-[11px]">Authority/Entity: ${req.name} (${req.type || 'police'})</p>` : ''}
                      ${req.reference ? `<p class="text-slate-400 text-[10px]">Reference: ${req.reference}</p>` : ''}
                      ${req.adminNotes ? `<p class="text-slate-600 text-[11px] italic">Admin Review: "${req.adminNotes}"</p>` : ''}
                    </div>
                    ${
                      req.status === 'pending'
                        ? `
                      <button class="btn-review-legal-claim shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition" data-id="${req._id}">
                        Review Claim
                      </button>
                    `
                        : ''
                    }
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
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

    setupActionModals(comp, legalCases, legalUpdateRequests, authorityActions);
  }

  function setupActionModals(comp, legalCases = [], legalUpdateRequests = [], authorityActions = []) {
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

    // 7. Add Legal Case
    const addLegalCaseBtn = container.querySelector('#btn-add-legal-case');
    if (addLegalCaseBtn) {
      addLegalCaseBtn.addEventListener('click', () => {
        showModal({
          title: 'Add Formal Legal Case',
          description: 'Record a new legal case, court proceeding, or official inquiry linked to this complaint.',
          contentHtml: `
            <div class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="input-case-number" class="block font-semibold text-slate-700 mb-1">Case / GD Number (Optional)</label>
                  <input id="input-case-number" type="text" placeholder="e.g. 14(08)2024 or GD-512" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label for="input-case-type" class="block font-semibold text-slate-700 mb-1">Case Type</label>
                  <input id="input-case-type" type="text" placeholder="e.g. Criminal, Writ, GD" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="input-case-court" class="block font-semibold text-slate-700 mb-1">Court Name & Location</label>
                  <input id="input-case-court" type="text" placeholder="e.g. Dhaka Metropolitan Sessions Court" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label for="input-case-authority" class="block font-semibold text-slate-700 mb-1">Investigating Authority / Thana</label>
                  <input id="input-case-authority" type="text" placeholder="e.g. Kotwali Police Station" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>
              <div>
                <label for="input-case-status" class="block font-semibold text-slate-700 mb-1">Current Legal Status *</label>
                <select id="input-case-status" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                  <option value="pending">Pending</option>
                  <option value="under_investigation">Under Investigation</option>
                  <option value="case_filed">Case Filed</option>
                  <option value="trial">In Trial</option>
                  <option value="appeal">In Appeal</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          `,
          confirmText: 'Create Legal Case',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-700',
          onConfirm: async (modal) => {
            const caseNumber = modal.querySelector('#input-case-number').value.trim();
            const caseType = modal.querySelector('#input-case-type').value.trim();
            const courtName = modal.querySelector('#input-case-court').value.trim();
            const authorityName = modal.querySelector('#input-case-authority').value.trim();
            const currentLegalStatus = modal.querySelector('#input-case-status').value;

            const courts = courtName ? [{ name: courtName }] : [];
            const authorities = authorityName ? [{ name: authorityName, type: 'police' }] : [];

            await adminComplaintService.createLegalCase(comp._id, {
              caseNumber,
              caseType,
              courts,
              authorities,
              currentLegalStatus,
            });

            await loadDetails();
          },
        });
      });
    }

    // 8. Edit Legal Case
    container.querySelectorAll('.btn-edit-legal-case').forEach((btn) => {
      btn.addEventListener('click', () => {
        const caseId = btn.dataset.id;
        const currentCase = legalCases.find((c) => String(c._id) === String(caseId));
        if (!currentCase) return;

        showModal({
          title: `Edit Case ${currentCase.caseNumber ? '#' + currentCase.caseNumber : ''}`,
          description: 'Update the judicial status, case number, or investigation phase.',
          contentHtml: `
            <div class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="edit-case-number" class="block font-semibold text-slate-700 mb-1">Case Number</label>
                  <input id="edit-case-number" type="text" value="${currentCase.caseNumber || ''}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label for="edit-case-type" class="block font-semibold text-slate-700 mb-1">Case Type</label>
                  <input id="edit-case-type" type="text" value="${currentCase.caseType || ''}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="edit-case-status" class="block font-semibold text-slate-700 mb-1">Legal Status *</label>
                  <select id="edit-case-status" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                    <option value="pending" ${currentCase.currentLegalStatus === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="under_investigation" ${currentCase.currentLegalStatus === 'under_investigation' ? 'selected' : ''}>Under Investigation</option>
                    <option value="case_filed" ${currentCase.currentLegalStatus === 'case_filed' ? 'selected' : ''}>Case Filed</option>
                    <option value="trial" ${currentCase.currentLegalStatus === 'trial' ? 'selected' : ''}>In Trial</option>
                    <option value="appeal" ${currentCase.currentLegalStatus === 'appeal' ? 'selected' : ''}>In Appeal</option>
                    <option value="resolved" ${currentCase.currentLegalStatus === 'resolved' ? 'selected' : ''}>Resolved</option>
                    <option value="closed" ${currentCase.currentLegalStatus === 'closed' ? 'selected' : ''}>Closed</option>
                  </select>
                </div>
                <div>
                  <label for="edit-case-arrest" class="block font-semibold text-slate-700 mb-1">Arrest / Bail Status</label>
                  <input id="edit-case-arrest" type="text" value="${currentCase.arrestStatus || ''}" placeholder="e.g. Accused detained, Bail denied" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>
            </div>
          `,
          confirmText: 'Save Case Changes',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-700',
          onConfirm: async (modal) => {
            const caseNumber = modal.querySelector('#edit-case-number').value.trim();
            const caseType = modal.querySelector('#edit-case-type').value.trim();
            const currentLegalStatus = modal.querySelector('#edit-case-status').value;
            const arrestStatus = modal.querySelector('#edit-case-arrest').value.trim();

            await adminComplaintService.updateLegalCase(caseId, {
              caseNumber,
              caseType,
              currentLegalStatus,
              arrestStatus,
            });

            await loadDetails();
          },
        });
      });
    });

    // 9. Add Timeline Event
    container.querySelectorAll('.btn-add-timeline-event').forEach((btn) => {
      btn.addEventListener('click', () => {
        const caseId = btn.dataset.id;
        showModal({
          title: 'Add Judicial Timeline Event',
          description: 'Add a new hearing, order, charge sheet, or procedural event to this case.',
          contentHtml: `
            <div class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="input-ev-date" class="block font-semibold text-slate-700 mb-1">Event Date *</label>
                  <input id="input-ev-date" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label for="input-ev-type" class="block font-semibold text-slate-700 mb-1">Event Type</label>
                  <input id="input-ev-type" type="text" placeholder="e.g. FIR Filed, Bail Hearing, Charge Sheet" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>
              <div>
                <label for="input-ev-desc" class="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea id="input-ev-desc" rows="2" placeholder="Procedural details, court orders, or outcomes..." class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
              </div>
              <div>
                <label for="input-ev-public" class="block font-semibold text-slate-700 mb-1">Public Summary (Safe for Disclosure)</label>
                <input id="input-ev-public" type="text" placeholder="Brief public description (optional)..." class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div class="flex items-center gap-2 pt-1">
                <input id="input-ev-verified" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <label for="input-ev-verified" class="font-semibold text-slate-700">Verified by Admin / Field Corroboration</label>
              </div>
            </div>
          `,
          confirmText: 'Record Timeline Event',
          confirmColor: 'bg-indigo-600 hover:bg-indigo-700',
          onConfirm: async (modal) => {
            const date = modal.querySelector('#input-ev-date').value;
            const eventType = modal.querySelector('#input-ev-type').value.trim();
            const description = modal.querySelector('#input-ev-desc').value.trim();
            const publicSummary = modal.querySelector('#input-ev-public').value.trim();
            const verified = modal.querySelector('#input-ev-verified').checked;

            if (!description) {
              throw new Error('Description is required');
            }

            await adminComplaintService.addLegalTimeline(caseId, {
              date,
              eventType: eventType || 'Court Session',
              description,
              publicSummary,
              verified,
            });

            await loadDetails();
          },
        });
      });
    });

    // 10. Edit Timeline Event
    container.querySelectorAll('.btn-edit-timeline-event').forEach((btn) => {
      btn.addEventListener('click', () => {
        const caseId = btn.dataset.caseId;
        const eventId = btn.dataset.eventId;
        const legalCase = legalCases.find((c) => String(c._id) === String(caseId));
        const ev = legalCase?.timeline?.find((e) => String(e._id) === String(eventId));
        if (!ev) return;

        showModal({
          title: 'Edit Timeline Event',
          description: 'Update the judicial timeline event and verification status.',
          contentHtml: `
            <div class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="edit-ev-date" class="block font-semibold text-slate-700 mb-1">Date</label>
                  <input id="edit-ev-date" type="date" value="${ev.date ? new Date(ev.date).toISOString().split('T')[0] : ''}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label for="edit-ev-type" class="block font-semibold text-slate-700 mb-1">Event Type</label>
                  <input id="edit-ev-type" type="text" value="${ev.eventType || ''}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>
              <div>
                <label for="edit-ev-desc" class="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea id="edit-ev-desc" rows="2" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">${ev.description || ''}</textarea>
              </div>
              <div>
                <label for="edit-ev-public" class="block font-semibold text-slate-700 mb-1">Public Summary</label>
                <input id="edit-ev-public" type="text" value="${ev.publicSummary || ''}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div class="flex items-center gap-2 pt-1">
                <input id="edit-ev-verified" type="checkbox" ${ev.verified ? 'checked' : ''} class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <label for="edit-ev-verified" class="font-semibold text-slate-700">Verified Status</label>
              </div>
            </div>
          `,
          confirmText: 'Save Event Changes',
          confirmColor: 'bg-indigo-600 hover:bg-indigo-700',
          onConfirm: async (modal) => {
            const date = modal.querySelector('#edit-ev-date').value;
            const eventType = modal.querySelector('#edit-ev-type').value.trim();
            const description = modal.querySelector('#edit-ev-desc').value.trim();
            const publicSummary = modal.querySelector('#edit-ev-public').value.trim();
            const verified = modal.querySelector('#edit-ev-verified').checked;

            await adminComplaintService.updateLegalTimeline(caseId, eventId, {
              date,
              eventType,
              description,
              publicSummary,
              verified,
            });

            await loadDetails();
          },
        });
      });
    });

    // 11. Add Authority Action
    const addAuthActionBtn = container.querySelector('#btn-add-authority-action');
    if (addAuthActionBtn) {
      addAuthActionBtn.addEventListener('click', () => {
        showModal({
          title: 'Record Authority Action',
          description: 'Document police investigation, administrative notice, or department action.',
          contentHtml: `
            <div class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="input-auth-type" class="block font-semibold text-slate-700 mb-1">Authority Type *</label>
                  <select id="input-auth-type" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                    <option value="police">Police Department</option>
                    <option value="court">Court / Judiciary</option>
                    <option value="government">Government Ministry / District Admin</option>
                    <option value="other_legal_authority">Other Legal Authority</option>
                  </select>
                </div>
                <div>
                  <label for="input-auth-name" class="block font-semibold text-slate-700 mb-1">Authority Name *</label>
                  <input id="input-auth-name" type="text" placeholder="e.g. Mirpur Model Thana, Rapid Action Battalion" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>
              <div>
                <label for="input-auth-action" class="block font-semibold text-slate-700 mb-1">Action Description *</label>
                <textarea id="input-auth-action" rows="2" placeholder="Details of action taken (e.g. Investigation officer appointed, Notice served)..." class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="input-auth-date" class="block font-semibold text-slate-700 mb-1">Action Date</label>
                  <input id="input-auth-date" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label for="input-auth-ref" class="block font-semibold text-slate-700 mb-1">Official Reference / Memo No</label>
                  <input id="input-auth-ref" type="text" placeholder="e.g. Ref: DMP/2024/78" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>
              <div>
                <label for="input-auth-public" class="block font-semibold text-slate-700 mb-1">Public Summary (Safe for Reports)</label>
                <input id="input-auth-public" type="text" placeholder="Neutral summary for public reports..." class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div class="flex items-center gap-2 pt-1">
                <input id="input-auth-verified" type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label for="input-auth-verified" class="font-semibold text-slate-700">Verified Official Action</label>
              </div>
            </div>
          `,
          confirmText: 'Record Authority Action',
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          onConfirm: async (modal) => {
            const authorityType = modal.querySelector('#input-auth-type').value;
            const authorityName = modal.querySelector('#input-auth-name').value.trim();
            const action = modal.querySelector('#input-auth-action').value.trim();
            const actionDate = modal.querySelector('#input-auth-date').value;
            const reference = modal.querySelector('#input-auth-ref').value.trim();
            const publicSummary = modal.querySelector('#input-auth-public').value.trim();
            const verified = modal.querySelector('#input-auth-verified').checked;

            if (!authorityName || !action) {
              throw new Error('Authority name and action description are required');
            }

            await adminComplaintService.addAuthorityAction(comp._id, {
              authorityType,
              authorityName,
              action,
              actionDate,
              reference,
              publicSummary,
              verified,
            });

            await loadDetails();
          },
        });
      });
    }

    // 12. Edit Authority Action
    container.querySelectorAll('.btn-edit-authority-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        const actionId = btn.dataset.id;
        const act = authorityActions.find((a) => String(a._id) === String(actionId));
        if (!act) return;

        showModal({
          title: `Edit Authority Action: ${act.authorityName || 'Action'}`,
          description: 'Update official action details, verification status, and public disclosure summary.',
          contentHtml: `
            <div class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="edit-auth-name" class="block font-semibold text-slate-700 mb-1">Authority Name</label>
                  <input id="edit-auth-name" type="text" value="${act.authorityName || ''}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label for="edit-auth-type" class="block font-semibold text-slate-700 mb-1">Authority Type</label>
                  <select id="edit-auth-type" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                    <option value="police" ${act.authorityType === 'police' ? 'selected' : ''}>Police Department</option>
                    <option value="court" ${act.authorityType === 'court' ? 'selected' : ''}>Court / Judiciary</option>
                    <option value="government" ${act.authorityType === 'government' ? 'selected' : ''}>Government / Administration</option>
                    <option value="other_legal_authority" ${act.authorityType === 'other_legal_authority' ? 'selected' : ''}>Other Legal Authority</option>
                  </select>
                </div>
              </div>
              <div>
                <label for="edit-auth-action" class="block font-semibold text-slate-700 mb-1">Action Description</label>
                <textarea id="edit-auth-action" rows="2" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">${act.action || ''}</textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="edit-auth-date" class="block font-semibold text-slate-700 mb-1">Date</label>
                  <input id="edit-auth-date" type="date" value="${act.actionDate ? new Date(act.actionDate).toISOString().split('T')[0] : ''}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label for="edit-auth-ref" class="block font-semibold text-slate-700 mb-1">Reference</label>
                  <input id="edit-auth-ref" type="text" value="${act.reference || ''}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>
              <div>
                <label for="edit-auth-public" class="block font-semibold text-slate-700 mb-1">Public Summary</label>
                <input id="edit-auth-public" type="text" value="${act.publicSummary || ''}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div class="flex items-center gap-2 pt-1">
                <input id="edit-auth-verified" type="checkbox" ${act.verified ? 'checked' : ''} class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label for="edit-auth-verified" class="font-semibold text-slate-700">Verified Action</label>
              </div>
            </div>
          `,
          confirmText: 'Save Action Changes',
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          onConfirm: async (modal) => {
            const authorityType = modal.querySelector('#edit-auth-type').value;
            const authorityName = modal.querySelector('#edit-auth-name').value.trim();
            const action = modal.querySelector('#edit-auth-action').value.trim();
            const actionDate = modal.querySelector('#edit-auth-date').value;
            const reference = modal.querySelector('#edit-auth-ref').value.trim();
            const publicSummary = modal.querySelector('#edit-auth-public').value.trim();
            const verified = modal.querySelector('#edit-auth-verified').checked;

            await adminComplaintService.updateAuthorityAction(comp._id, actionId, {
              authorityType,
              authorityName,
              action,
              actionDate,
              reference,
              publicSummary,
              verified,
            });

            await loadDetails();
          },
        });
      });
    });

    // 13. Review Reporter Legal Update Claim
    container.querySelectorAll('.btn-review-legal-claim').forEach((btn) => {
      btn.addEventListener('click', () => {
        const requestId = btn.dataset.id;
        const claimReq = legalUpdateRequests.find((r) => String(r._id) === String(requestId));
        if (!claimReq) return;

        showModal({
          title: 'Review Reporter Legal Claim',
          description: 'Evaluate user-submitted legal claims. User claims must be verified before inclusion in official reports.',
          contentHtml: `
            <div class="space-y-3 text-xs">
              <div class="p-3 rounded-lg bg-slate-100 border border-slate-200">
                <p class="font-semibold text-slate-900">${claimReq.claim}</p>
                ${claimReq.name ? `<p class="text-slate-600 text-[11px] mt-1">Authority: ${claimReq.name} (${claimReq.type || 'police'})</p>` : ''}
                ${claimReq.reference ? `<p class="text-slate-500 text-[10px]">Reference: ${claimReq.reference}</p>` : ''}
              </div>
              <div>
                <label for="input-claim-status" class="block font-semibold text-slate-700 mb-1">Review Decision *</label>
                <select id="input-claim-status" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                  <option value="verified">Verified (Claim Authenticated)</option>
                  <option value="rejected">Rejected (Unsubstantiated / Inaccurate)</option>
                </select>
              </div>
              <div>
                <label for="input-claim-notes" class="block font-semibold text-slate-700 mb-1">Review Notes / Verification Basis</label>
                <textarea id="input-claim-notes" rows="2" placeholder="Record verification source, court record check, or rationale..." class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
              </div>
              <div class="flex items-center gap-2 pt-1">
                <input id="input-claim-add-action" type="checkbox" checked class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <label for="input-claim-add-action" class="font-semibold text-slate-700">Add to Official Authority Actions (if verified)</label>
              </div>
            </div>
          `,
          confirmText: 'Submit Claim Review',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-700',
          onConfirm: async (modal) => {
            const status = modal.querySelector('#input-claim-status').value;
            const adminNotes = modal.querySelector('#input-claim-notes').value.trim();
            const addToAuthorityActions = modal.querySelector('#input-claim-add-action').checked;

            await adminComplaintService.reviewLegalUpdateRequest(comp._id, requestId, {
              status,
              adminNotes,
              addToAuthorityActions,
            });

            await loadDetails();
          },
        });
      });
    });
  }

  await loadDetails();
}
