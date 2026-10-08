import { complaintService } from '../../../services/complaints/complaintService.js';
import { evidenceService } from '../../../services/evidence/evidenceService.js';
import { authService } from '../../../services/auth/authService.js';
import { STATUS_LABELS } from '../../../config/constants.js';

export async function renderComplaintDetailsPage(container, complaintId) {
  const user = authService.getCurrentUser();
  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  container.innerHTML = `
    <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div id="details-alert" role="alert" class="hidden mb-6 p-4 rounded-xl text-sm" aria-live="polite"></div>

      <div class="mb-6 flex items-center justify-between">
        <a href="#/user/dashboard" class="text-sm text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 font-medium">
          ← Back to Dashboard
        </a>
        <div id="header-action-zone"></div>
      </div>

      <div id="complaint-loading" class="p-16 text-center text-slate-500">
        Loading complaint details...
      </div>

      <div id="complaint-content" class="hidden space-y-6"></div>
    </div>

    <!-- Modals Container -->
    <div id="modal-container"></div>
  `;

  const alertEl = container.querySelector('#details-alert');
  const loadingEl = container.querySelector('#complaint-loading');
  const contentEl = container.querySelector('#complaint-content');
  const headerActionZone = container.querySelector('#header-action-zone');
  const modalContainer = container.querySelector('#modal-container');

  function showAlert(msg, type = 'error') {
    alertEl.textContent = msg;
    if (type === 'success') {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-300 text-emerald-800';
    } else {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-300 text-red-800';
    }
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async function loadData() {
    try {
      const compRes = await complaintService.getMyComplaintById(complaintId);
      const complaint = compRes.data || compRes;

      let evidenceList = [];
      try {
        evidenceList = await evidenceService.listEvidence(complaintId);
      } catch (e) {
        console.warn('Could not load evidence:', e);
      }

      renderComplaintUI(complaint, evidenceList);
    } catch (err) {
      loadingEl.innerHTML = `
        <div class="p-12 text-center text-red-600">
          <p class="font-bold mb-2">Complaint Record Not Found</p>
          <p class="text-sm text-slate-600 mb-4">${err.message || 'Unauthorized access or record does not exist.'}</p>
          <a href="#/user/dashboard" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold">
            Return to Dashboard
          </a>
        </div>
      `;
    }
  }

  function renderComplaintUI(complaint, evidenceList) {
    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

    const statusConfig = STATUS_LABELS[complaint.status] || {
      en: complaint.status,
      bn: complaint.status,
      color: 'bg-slate-100 text-slate-700 border-slate-300',
    };

    const statusText = statusConfig.en || statusConfig.bn || complaint.status;
    const isDraft = complaint.status === 'draft';

    // Header actions
    if (isDraft) {
      headerActionZone.innerHTML = `
        <a href="#/complaint/new?draftId=${complaint._id}" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-1.5 shadow-sm">
          ✏️ Edit & Submit Draft
        </a>
      `;
    } else {
      headerActionZone.innerHTML = '';
    }

    contentEl.innerHTML = `
      <!-- Status Banner -->
      <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-semibold px-3 py-1 rounded-full border ${statusConfig.color}">
              ${statusText}
            </span>
            <span class="text-xs text-slate-500 font-mono">ID: ${complaint._id}</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">
            ${complaint.category?.primary || 'Human Rights Incident Report'}
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Filed: ${new Date(complaint.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          ${
            !isDraft && !complaint.withdrawal?.requested && complaint.status !== 'withdrawn' && complaint.status !== 'closed'
              ? `
            <button id="open-withdraw-modal" class="px-3.5 py-2 rounded-lg bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-300 text-xs font-medium transition">
              Request Withdrawal
            </button>
          `
              : ''
          }
          ${
            !isDraft && (complaint.correctionCount || 0) < 3
              ? `
            <button id="open-correct-modal" class="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-medium transition">
              Request Correction (${3 - (complaint.correctionCount || 0)}/3)
            </button>
          `
              : ''
          }
          ${
            !isDraft
              ? `
            <button id="open-legal-modal" class="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-medium transition">
              ⚖️ Legal Updates
            </button>
          `
              : ''
          }
        </div>
      </div>

      ${
        isDraft
          ? `
        <div class="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm flex items-center justify-between">
          <div>
            <strong>Unpublished Draft:</strong> This draft is private and only visible to you until fully submitted.
          </div>
          <a href="#/complaint/new?draftId=${complaint._id}" class="ml-4 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold whitespace-nowrap shadow-xs">
            Edit Draft
          </a>
        </div>
      `
          : ''
      }

      ${
        complaint.withdrawal?.requested
          ? `
        <div class="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-sm">
          <strong>Withdrawal Request Under Review:</strong> ${complaint.withdrawal.reason || 'No reason provided'}
          <span class="block text-xs text-slate-500 mt-1">Requested on: ${new Date(complaint.withdrawal.requestedAt).toLocaleDateString('en-US')}</span>
        </div>
      `
          : ''
      }

      <!-- Canonical Public Report Banner -->
      ${
        complaint.status === 'published' || complaint.publicReportId
          ? `
        <div class="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true"></span>
              <h2 class="text-sm font-bold text-emerald-900">
                This complaint has been verified and published as an open public report
              </h2>
            </div>
            <a 
              href="#/reports/${complaint.publicReportId || ''}" 
              target="_blank" 
              class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <span>View Public Report</span>
              <span>↗</span>
            </a>
          </div>

          <div class="space-y-2 text-xs">
            <h3 class="text-base font-bold text-slate-900">
              ${complaint.publicReport?.title || 'Verified Public Investigation'}
            </h3>
            <p class="text-slate-700 leading-relaxed">
              ${complaint.publicReport?.summary || ''}
            </p>
            <div class="flex flex-wrap items-center gap-4 text-slate-600 pt-2">
              <span>Published: ${new Date(complaint.publicReport?.publishedAt || complaint.updatedAt).toLocaleDateString('en-US')}</span>
              <span>Legal Status: ${complaint.publicReport?.caseStatus || 'Under Investigation'}</span>
              <span>Approved Evidence: ${complaint.publicReport?.approvedEvidence?.length || 0}</span>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- Grid of Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Details (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Incident Story -->
          <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 class="text-base font-bold text-slate-900 mb-3">Incident Description</h2>
            <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">${complaint.incident?.description || 'No description provided.'}</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span class="text-slate-500 block mb-0.5">Incident Date:</span>
                <span class="text-slate-900 font-medium">
                  ${complaint.incident?.startDate ? new Date(complaint.incident.startDate).toLocaleDateString('en-US') : 'Unknown'}
                  ${complaint.incident?.endDate ? ` — ${new Date(complaint.incident.endDate).toLocaleDateString('en-US')}` : ''}
                </span>
              </div>
              <div>
                <span class="text-slate-500 block mb-0.5">Timeline Status:</span>
                <span class="text-slate-900 font-medium">
                  ${complaint.incident?.ongoing ? '⚠️ Incident is ongoing' : 'Concluded'}
                </span>
              </div>
            </div>
          </div>

          <!-- Accused & Victims -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <h3 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <span aria-hidden="true">👤</span> Accused Details
              </h3>
              ${
                complaint.accused && complaint.accused.length > 0
                  ? complaint.accused
                      .map(
                        (a) => `
                    <div class="text-xs space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-2">
                      <p class="font-bold text-slate-900">${a.name || 'Unknown'}</p>
                      ${a.role ? `<p class="text-slate-600">Role: ${a.role}</p>` : ''}
                      ${a.organization ? `<p class="text-slate-600">Agency: ${a.organization}</p>` : ''}
                      ${a.location ? `<p class="text-slate-600">Area: ${a.location}</p>` : ''}
                    </div>
                  `
                      )
                      .join('')
                  : '<p class="text-xs text-slate-500">No accused details specified.</p>'
              }
            </div>

            <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <h3 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <span aria-hidden="true">🛡️</span> Victim Details
              </h3>
              ${
                complaint.victims && complaint.victims.length > 0
                  ? complaint.victims
                      .map(
                        (v) => `
                    <div class="text-xs space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-2">
                      <p class="font-bold text-slate-900">${v.name || 'Unknown'}</p>
                      ${v.ageCategory ? `<p class="text-slate-600">Age Group: ${v.ageCategory}</p>` : ''}
                      ${v.relationshipToIncident ? `<p class="text-slate-600">Relationship: ${v.relationshipToIncident}</p>` : ''}
                    </div>
                  `
                      )
                      .join('')
                  : '<p class="text-xs text-slate-500">No victim details specified.</p>'
              }
            </div>
          </div>

          <!-- Evidence List & Upload Section -->
          <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span aria-hidden="true">📁</span> Evidence & Attachments
                <span class="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-normal border border-slate-200">
                  ${evidenceList.length} total
                </span>
              </h2>
            </div>

            <!-- Evidence List -->
            <div class="space-y-3 mb-6" id="evidence-items-container">
              ${
                evidenceList.length === 0
                  ? `
                <div class="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  <p class="text-sm mb-1">No evidence uploaded yet</p>
                  <p class="text-xs text-slate-500">Use the form below to attach documents, images, audio, or video.</p>
                </div>
              `
                  : evidenceList
                      .map((ev) => {
                        const isLink = ev.type === 'external_link';
                        return `
                    <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div class="flex items-center gap-3 overflow-hidden">
                        <span class="text-xl" aria-hidden="true">${isLink ? '🔗' : '📄'}</span>
                        <div class="truncate">
                          <p class="font-medium text-slate-900 truncate">
                            ${isLink ? ev.external?.url : ev.originalFilename || 'Document'}
                          </p>
                          <div class="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                            <span class="uppercase">${ev.type}</span>
                            ${ev.size ? `<span>• ${formatBytes(ev.size)}</span>` : ''}
                            <span>• ${ev.malwareScanStatus === 'clean' ? '<span class="text-emerald-700 font-medium">Clean</span>' : '<span class="text-amber-700">Scanning</span>'}</span>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        ${
                          ev.downloadUrl
                            ? `
                          <a href="${ev.downloadUrl}" target="_blank" class="px-3 py-1.5 bg-white hover:bg-slate-100 text-emerald-800 font-medium border border-slate-300 rounded-lg transition shadow-2xs">
                            Download / View
                          </a>
                        `
                            : isLink
                            ? `
                          <a href="${ev.external?.url}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-700 font-medium border border-slate-300 rounded-lg transition shadow-2xs">
                            Open Link
                          </a>
                        `
                            : ''
                        }
                      </div>
                    </div>
                  `;
                      })
                      .join('')
              }
            </div>

            <!-- Upload Box -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <h4 class="text-xs font-semibold text-slate-900">Upload Additional Evidence</h4>
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label for="new-ev-type" class="block text-[11px] font-medium text-slate-700 mb-1">Evidence Type</label>
                  <select id="new-ev-type" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                    <option value="image">Image</option>
                    <option value="pdf">PDF</option>
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label for="new-ev-file" class="block text-[11px] font-medium text-slate-700 mb-1">Select File (Max 100MB)</label>
                  <input type="file" id="new-ev-file" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                </div>
              </div>

              <div class="flex items-center justify-between pt-1">
                <span id="upload-status-text" class="text-xs text-slate-500"></span>
                <button type="button" id="upload-evidence-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5">
                  <span>Upload & Scan</span>
                </button>
              </div>

              <!-- External URL alternative -->
              <details class="text-xs text-slate-600 pt-2 border-t border-slate-200">
                <summary class="cursor-pointer hover:text-slate-900 font-medium">Or attach news article / verified public web link</summary>
                <div class="mt-3 space-y-2">
                  <input type="url" id="new-ev-url" placeholder="https://example.com/news-report" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600" />
                  <div class="flex justify-end">
                    <button type="button" id="add-link-btn" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-medium">
                      Attach Link
                    </button>
                  </div>
                </div>
              </details>
            </div>
          </div>

          <!-- Official Authority Actions & Legal Updates -->
          <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🏛️ Official Authority & Legal Updates</span>
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">Verified actions taken by legal authorities and police departments.</p>
              </div>
              <button type="button" id="open-legal-modal" class="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs border border-indigo-200 transition shadow-2xs">
                + Submit Legal Update
              </button>
            </div>

            ${
              (!complaint.authorityActions || complaint.authorityActions.length === 0) &&
              (!complaint.legalUpdateRequests || complaint.legalUpdateRequests.length === 0)
                ? `
              <div class="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p class="mb-1 font-medium text-slate-700">No authority actions or legal claims recorded yet.</p>
                <p class="text-slate-500">If a General Diary (GD), FIR, or court proceeding has been initiated, click "+ Submit Legal Update" to submit details for verification.</p>
              </div>
            `
                : `
              <div class="space-y-3">
                ${(complaint.authorityActions || [])
                  .filter((a) => a.verified)
                  .map(
                    (a) => `
                  <div class="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-slate-900">${a.authorityName || 'Authority'} (${a.authorityType || 'police'})</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Verified Action</span>
                    </div>
                    <p class="text-slate-800 font-medium">${a.action || ''}</p>
                    ${a.reference ? `<p class="text-slate-500 text-[11px]">Official Reference: ${a.reference}</p>` : ''}
                  </div>
                `
                  )
                  .join('')}

                ${(complaint.legalUpdateRequests || [])
                  .map(
                    (r) => `
                  <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-slate-900">${r.claim}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      } uppercase">
                        ${r.status === 'pending' ? 'Pending Review' : r.status}
                      </span>
                    </div>
                    ${r.name ? `<p class="text-slate-600 text-[11px]">Authority: ${r.name}</p>` : ''}
                    ${r.reference ? `<p class="text-slate-500 text-[10px]">Reference: ${r.reference}</p>` : ''}
                    ${r.adminNotes ? `<p class="text-slate-600 text-[11px] italic">Admin Note: ${r.adminNotes}</p>` : ''}
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </div>
        </div>

        <!-- Sidebar (Location + Timeline) (1 col) -->
        <div class="space-y-6">
          <!-- Location Details -->
          <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-sm font-bold text-slate-900">Incident Location</h3>
            <div class="text-xs space-y-2">
              <div>
                <span class="text-slate-500 block">Division:</span>
                <span class="text-slate-900 font-medium capitalize">${complaint.location?.divisionId || 'Not specified'}</span>
              </div>
              <div>
                <span class="text-slate-500 block">District:</span>
                <span class="text-slate-900 font-medium capitalize">${complaint.location?.districtId || 'Not specified'}</span>
              </div>
              ${
                complaint.location?.upazilaId
                  ? `
                <div>
                  <span class="text-slate-500 block">Upazila / Thana:</span>
                  <span class="text-slate-900 font-medium">${complaint.location.upazilaId}</span>
                </div>
              `
                  : ''
              }
              ${
                complaint.location?.freeTextLocation
                  ? `
                <div>
                  <span class="text-slate-500 block">Specific Area:</span>
                  <span class="text-slate-900 font-medium">${complaint.location.freeTextLocation}</span>
                </div>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Status History Timeline -->
          <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Case Timeline</h3>
            <div class="space-y-4 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-200">
              ${
                complaint.statusHistory && complaint.statusHistory.length > 0
                  ? complaint.statusHistory
                      .map((h) => {
                        const cfg = STATUS_LABELS[h.status] || { en: h.status, bn: h.status, color: 'bg-slate-100 text-slate-700' };
                        const sName = cfg.en || cfg.bn || h.status;
                        return `
                    <div class="relative pl-6 text-xs">
                      <div class="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" aria-hidden="true"></div>
                      <p class="font-bold text-slate-900">${sName}</p>
                      <span class="text-[11px] text-slate-500 block">
                        ${new Date(h.changedAt).toLocaleDateString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      ${h.note ? `<p class="text-slate-600 text-[11px] mt-0.5">${h.note}</p>` : ''}
                    </div>
                  `;
                      })
                      .join('')
                  : '<p class="text-xs text-slate-500 pl-6">No historical records available.</p>'
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach Event Listeners
    setupActions(complaint);
  }

  function setupActions(complaint) {
    // 1. Evidence Upload Action
    const uploadBtn = container.querySelector('#upload-evidence-btn');
    const fileInput = container.querySelector('#new-ev-file');
    const typeSelect = container.querySelector('#new-ev-type');
    const statusText = container.querySelector('#upload-status-text');

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
          showAlert('Please select a file to upload.');
          return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading & scanning...';
        statusText.textContent = 'Step 1/2: Initializing secure upload session...';

        try {
          const sessionRes = await evidenceService.createUploadSession(complaintId, {
            type: typeSelect.value,
            originalFilename: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
          });

          const sessionData = sessionRes.data || sessionRes;
          const evidenceId = sessionData.evidenceId;

          statusText.textContent = 'Step 2/2: Transferring and scanning for malware...';

          await evidenceService.completeUpload(complaintId, {
            evidenceId,
            file,
          });

          showAlert('Evidence uploaded and verified successfully!', 'success');
          fileInput.value = '';
          statusText.textContent = '';
          await loadData();
        } catch (err) {
          showAlert(err.message || 'Failed to upload evidence.');
          statusText.textContent = 'Upload failed';
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.textContent = 'Upload & Scan';
        }
      });
    }

    // 2. External Link Action
    const addLinkBtn = container.querySelector('#add-link-btn');
    const urlInput = container.querySelector('#new-ev-url');
    if (addLinkBtn && urlInput) {
      addLinkBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
          showAlert('Please enter a valid URL.');
          return;
        }

        addLinkBtn.disabled = true;
        try {
          await evidenceService.addExternalLink(complaintId, {
            url,
            sourceType: 'news_or_social',
          });
          showAlert('Online link attached successfully!', 'success');
          urlInput.value = '';
          await loadData();
        } catch (err) {
          showAlert(err.message || 'Failed to attach link.');
        } finally {
          addLinkBtn.disabled = false;
        }
      });
    }

    // 3. Withdrawal Modal
    const openWithdrawBtn = container.querySelector('#open-withdraw-modal');
    if (openWithdrawBtn) {
      openWithdrawBtn.addEventListener('click', () => {
        renderModal(`
          <div class="space-y-4">
            <h3 id="modal-title" class="text-base font-bold text-slate-900">Request Complaint Withdrawal</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              Notice: Withdrawal requests are reviewed by case administrators; records are not permanently destroyed immediately.
            </p>
            <div>
              <label for="modal-withdraw-reason" class="block text-xs font-medium text-slate-700 mb-1">Reason for Withdrawal <span class="text-red-500">*</span></label>
              <textarea id="modal-withdraw-reason" rows="3" placeholder="Explain the rationale for withdrawal..." class="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">Cancel</button>
              <button type="button" id="modal-withdraw-confirm" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs">Submit Request</button>
            </div>
          </div>
        `);

        modalContainer.querySelector('#modal-withdraw-confirm').addEventListener('click', async () => {
          const reason = modalContainer.querySelector('#modal-withdraw-reason').value.trim();
          if (!reason) {
            alert('Please specify the reason for withdrawal.');
            return;
          }
          closeModal();
          try {
            await complaintService.requestWithdrawal(complaintId, reason);
            showAlert('Withdrawal request submitted successfully.', 'success');
            await loadData();
          } catch (err) {
            showAlert(err.message || 'Failed to submit withdrawal request.');
          }
        });
      });
    }

    // 4. Correction Modal
    const openCorrectBtn = container.querySelector('#open-correct-modal');
    if (openCorrectBtn) {
      openCorrectBtn.addEventListener('click', () => {
        const remaining = 3 - (complaint.correctionCount || 0);
        renderModal(`
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 id="modal-title" class="text-base font-bold text-slate-900">Request Complaint Correction</h3>
              <span class="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-mono">Remaining: ${remaining}/3</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              If any submitted details contain factual errors, submit a request for review.
            </p>
            <div>
              <label for="modal-correct-changes" class="block text-xs font-medium text-slate-700 mb-1">Requested Corrections <span class="text-red-500">*</span></label>
              <textarea id="modal-correct-changes" rows="3" placeholder="Detail the corrected information..." class="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
            </div>
            <div>
              <label for="modal-correct-reason" class="block text-xs font-medium text-slate-700 mb-1">Reason for Correction <span class="text-red-500">*</span></label>
              <input type="text" id="modal-correct-reason" placeholder="e.g. Typographical error, newly acquired dates" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">Cancel</button>
              <button type="button" id="modal-correct-confirm" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs">Submit Correction</button>
            </div>
          </div>
        `);

        modalContainer.querySelector('#modal-correct-confirm').addEventListener('click', async () => {
          const changes = modalContainer.querySelector('#modal-correct-changes').value.trim();
          const reason = modalContainer.querySelector('#modal-correct-reason').value.trim();
          if (!changes || !reason) {
            alert('Both fields are required.');
            return;
          }
          closeModal();
          try {
            await complaintService.requestCorrection(complaintId, changes, reason);
            showAlert('Correction request submitted successfully.', 'success');
            await loadData();
          } catch (err) {
            showAlert(err.message || 'Failed to submit correction request.');
          }
        });
      });
    }

    // 5. Legal Update Modal
    const openLegalBtn = container.querySelector('#open-legal-modal');
    if (openLegalBtn) {
      openLegalBtn.addEventListener('click', () => {
        renderModal(`
          <div class="space-y-4">
            <h3 id="modal-title" class="text-base font-bold text-slate-900">Provide Legal or Institutional Updates</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              Provide information if a General Diary (GD), case, or administrative complaint has been formally lodged with authorities.
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="modal-legal-type" class="block text-xs font-medium text-slate-700 mb-1">Authority Type</label>
                <select id="modal-legal-type" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600">
                  <option value="police">Police Station</option>
                  <option value="court">Judicial Court</option>
                  <option value="human_rights_commission">Human Rights Commission</option>
                  <option value="administrative">Administrative Office</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label for="modal-legal-name" class="block text-xs font-medium text-slate-700 mb-1">Authority / Institution Name</label>
                <input type="text" id="modal-legal-name" placeholder="e.g. Dhanmondi Police Station" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600" />
              </div>
            </div>
            <div>
              <label for="modal-legal-claim" class="block text-xs font-medium text-slate-700 mb-1">Action Lodged / Claim <span class="text-red-500">*</span></label>
              <textarea id="modal-legal-claim" rows="2" placeholder="GD lodged / FIR registered / complaint submitted..." class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"></textarea>
            </div>
            <div>
              <label for="modal-legal-ref" class="block text-xs font-medium text-slate-700 mb-1">Case Number or Reference</label>
              <input type="text" id="modal-legal-ref" placeholder="GD No. 1234, Case No. 56/24" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600" />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">Cancel</button>
              <button type="button" id="modal-legal-confirm" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs">Submit Update</button>
            </div>
          </div>
        `);

        modalContainer.querySelector('#modal-legal-confirm').addEventListener('click', async () => {
          const type = modalContainer.querySelector('#modal-legal-type').value;
          const name = modalContainer.querySelector('#modal-legal-name').value.trim();
          const claim = modalContainer.querySelector('#modal-legal-claim').value.trim();
          const reference = modalContainer.querySelector('#modal-legal-ref').value.trim();
          if (!claim) {
            alert('Action description is required.');
            return;
          }
          closeModal();
          try {
            await complaintService.requestLegalUpdate(complaintId, { type, name, claim, reference });
            showAlert('Legal update submitted successfully for review.', 'success');
            await loadData();
          } catch (err) {
            showAlert(err.message || 'Failed to submit legal update.');
          }
        });
      });
    }
  }

  function renderModal(contentHtml) {
    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
          ${contentHtml}
        </div>
      </div>
    `;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { once: true });
    modalContainer.querySelector('#modal-cancel-btn')?.addEventListener('click', closeModal);
  }

  function closeModal() {
    modalContainer.innerHTML = '';
  }

  // Initial load
  await loadData();
}
