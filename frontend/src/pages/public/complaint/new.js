import { complaintService } from '../../../services/complaints/complaintService.js';
import { locationService } from '../../../services/locations/locationService.js';
import { authService } from '../../../services/auth/authService.js';
import { COMPLAINT_CATEGORIES } from '../../../config/constants.js';

export async function renderNewComplaintPage(container) {
  const currentUser = authService.getCurrentUser();

  // Parse draftId from hash if present (e.g. #/complaint/new?draftId=xyz)
  const hash = window.location.hash || '';
  const draftIdMatch = hash.match(/draftId=([a-fA-F0-9]{24})/);
  const activeDraftId = draftIdMatch ? draftIdMatch[1] : null;

  let existingDraft = null;
  if (activeDraftId && currentUser) {
    try {
      const res = await complaintService.getMyComplaintById(activeDraftId);
      existingDraft = res.data || res;
    } catch (err) {
      console.warn('Could not load existing draft:', err);
    }
  }

  container.innerHTML = `
    <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-extrabold text-white mb-2">
          ${existingDraft ? 'খসড়া অভিযোগ সম্পাদনা ও জমা দিন' : 'নতুন অভিযোগ দাখিল করুন'}
        </h1>
        <p class="text-slate-400 text-sm max-w-xl mx-auto">
          আপনার প্রদত্ত তথ্য গোপনীয় ও সম্পূর্ণ সুরক্ষিত রাখা হবে। নিরপেক্ষ মানবাধিকার যাচাইয়ের জন্য সত্য ও সঠিক তথ্য দিন।
        </p>
      </div>

      <div id="complaint-alert" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      <form id="complaint-form" class="space-y-6 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
        <!-- 1. Category Selection -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 class="text-sm font-semibold text-white">মানবাধিকার লঙ্ঘনের ধরন ও ক্যাটাগরি</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-300 mb-1.5 font-medium">
                প্রধান ক্যাটাগরি <span class="text-red-400">*</span>
              </label>
              <select id="comp-category" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                ${COMPLAINT_CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs text-slate-300 mb-1.5 font-medium">
                ঐচ্ছিক দ্বিতীয় ক্যাটাগরি
              </label>
              <select id="comp-secondary-category" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                <option value="">কোনোটি নয়</option>
                ${COMPLAINT_CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- 2. Incident Date, Range & Ongoing -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 class="text-sm font-semibold text-white">ঘটনার তারিখ ও সময়কাল</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-slate-300 mb-1.5 font-medium">
                শুরুর তারিখ <span class="text-red-400">*</span>
              </label>
              <input type="date" id="comp-start-date" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label class="block text-xs text-slate-300 mb-1.5 font-medium">
                শেষের তারিখ (ঐচ্ছিক / পরিসর)
              </label>
              <input type="date" id="comp-end-date" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label class="block text-xs text-slate-300 mb-1.5 font-medium">
                তারিখের যথার্থতা (Precision)
              </label>
              <select id="comp-date-precision" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                <option value="exact">সুনির্দিষ্ট (Exact)</option>
                <option value="approximate">আনুমানিক (Approximate)</option>
                <option value="range">তারিখের পরিসর (Range)</option>
                <option value="ongoing">চলমান (Ongoing)</option>
              </select>
            </div>
          </div>

          <div class="flex items-center pt-2">
            <label class="flex items-center gap-2.5 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" id="comp-ongoing" class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0" />
              <span>ঘটনাটি এখনো চলমান রয়েছে</span>
            </label>
          </div>
        </div>

        <!-- 3. Incident Description -->
        <div>
          <label class="block text-sm font-medium text-slate-200 mb-2">
            ঘটনার বিস্তারিত বিবরণ <span class="text-red-400">*</span>
          </label>
          <textarea id="comp-description" rows="5" placeholder="কী ঘটেছিল, কীভাবে ঘটেছিল এবং কী ক্ষয়ক্ষতি হয়েছে বিস্তারিত লিখুন (কমপক্ষে ২০ অক্ষর)..." class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"></textarea>
          <p class="text-xs text-slate-500 mt-1">সঠিক ও নিরপেক্ষ তথ্য দিন যাতে মানবাধিকার কর্মীরা কার্যকরভাবে অনুসন্ধান চালাতে পারেন।</p>
        </div>

        <!-- 4. Geographic Location (Division -> District -> Upazila/Thana) -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 class="text-sm font-semibold text-white">ঘটনাস্থল (ভৌগোলিক অবস্থান)</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-slate-400 mb-1">বিভাগ <span class="text-red-400">*</span></label>
              <select id="comp-division" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                <option value="">বিভাগ নির্বাচন করুন</option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-slate-400 mb-1">জেলা <span class="text-red-400">*</span></label>
              <select id="comp-district" disabled class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50">
                <option value="">আগে বিভাগ নির্বাচন করুন</option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-slate-400 mb-1">উপজেলা / থানা</label>
              <select id="comp-upazila" disabled class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50">
                <option value="">আগে জেলা নির্বাচন করুন</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs text-slate-400 mb-1">নির্দিষ্ট ঠিকানা / এলাকা (ঐচ্ছিক)</label>
            <input type="text" id="comp-freetext-location" placeholder="গ্রাম, পাড়া, রোড নম্বর বা পরিচিত স্থান..." class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>

        <!-- 5. Accused Information -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 class="text-sm font-semibold text-white">অভিযুক্তের তথ্য (যদি জানা থাকে)</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-400 mb-1">অভিযুক্ত ব্যক্তি / প্রতিষ্ঠানের নাম</label>
              <input type="text" id="comp-accused-name" placeholder="নাম বা পরিচিতি" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">পদবি / ভূমিকা</label>
              <input type="text" id="comp-accused-role" placeholder="উদাঃ পুলিশ কর্মকর্তা, স্থানীয় নেতা" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">সংস্থা / প্রতিষ্ঠান</label>
              <input type="text" id="comp-accused-org" placeholder="উদাঃ সংশ্লিষ্ট থানা বা বিভাগ" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">কর্মক্ষেত্র / এলাকা</label>
              <input type="text" id="comp-accused-location" placeholder="ঠিকানা বা অবস্থান" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
        </div>

        <!-- 6. Victim Information -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 class="text-sm font-semibold text-white">ভিকটিম / ক্ষতিগ্রস্ত ব্যক্তির তথ্য (যদি প্রযোজ্য হয়)</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-400 mb-1">ভিকটিমের নাম</label>
              <input type="text" id="comp-victim-name" placeholder="নাম" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">বয়সের শ্রেণি</label>
              <select id="comp-victim-age-category" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                <option value="adult">প্রাপ্তবয়স্ক (Adult)</option>
                <option value="minor">নাবালক / শিশু (Minor)</option>
                <option value="senior">বয়োজ্যেষ্ঠ (Senior)</option>
                <option value="unknown">অজ্ঞাত (Unknown)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">লিঙ্গ</label>
              <select id="comp-victim-gender" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                <option value="male">পুরুষ</option>
                <option value="female">নারী</option>
                <option value="other">অন্যান্য</option>
                <option value="prefer_not_to_say">বলতে অনিচ্ছুক</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">অভিযোগকারীর সাথে সম্পর্ক</label>
              <input type="text" id="comp-victim-relationship" placeholder="উদাঃ আমি নিজে, পিতা, প্রতিবেশী" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
        </div>

        <!-- 7. Contact Information -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white">যোগাযোগের তথ্য ${!currentUser ? '<span class="text-red-400">*</span>' : ''}</h3>
            ${!currentUser ? '<span class="text-xs text-slate-400">কমপক্ষে মোবাইল অথবা ইমেইল আবশ্যক</span>' : ''}
          </div>
          <p class="text-xs text-slate-400">
            ${
              currentUser
                ? `আপনার নিবন্ধিত অ্যাকাউন্ট (${currentUser.email}) দিয়ে দাখিল হচ্ছে। অতিরিক্ত যোগাযোগের জন্য ফোন নম্বর দিতে পারেন।`
                : 'অভিযোগের সত্যতা যাচাইয়ে আপনার সাথে যোগাযোগ করা হতে পারে। যোগাযোগ তথ্য কখনো প্রকাশ করা হবে না।'
            }
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-400 mb-1">ইমেইল ঠিকানা</label>
              <input type="email" id="comp-contact-email" value="${currentUser ? currentUser.email : ''}" ${currentUser ? 'readonly' : ''} placeholder="example@domain.com" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 ${currentUser ? 'opacity-70 cursor-not-allowed' : ''}" />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">মোবাইল নম্বর</label>
              <input type="tel" id="comp-contact-mobile" value="${currentUser?.mobile || ''}" placeholder="017XXXXXXXX" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          ${
            currentUser
              ? `
            <button type="button" id="save-draft-btn" class="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-sm border border-slate-700 transition flex items-center justify-center gap-2">
              <span>💾 খসড়া সংরক্ষণ করুন</span>
            </button>
          `
              : ''
          }
          <button type="submit" id="submit-complaint-btn" class="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-950/50 transition flex items-center justify-center gap-2">
            <span>🚀 ${existingDraft ? 'খসড়া দাখিল করুন' : 'অভিযোগ জমা দিন'}</span>
          </button>
        </div>
      </form>
    </div>
  `;

  // Elements
  const divSelect = container.querySelector('#comp-division');
  const distSelect = container.querySelector('#comp-district');
  const upaSelect = container.querySelector('#comp-upazila');
  const alertEl = container.querySelector('#complaint-alert');
  const form = container.querySelector('#complaint-form');
  const saveDraftBtn = container.querySelector('#save-draft-btn');
  const submitBtn = container.querySelector('#submit-complaint-btn');

  function showAlert(message, type = 'error') {
    alertEl.textContent = message;
    if (type === 'success') {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-emerald-950/80 border border-emerald-800 text-emerald-300';
    } else {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
    }
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Load Divisions
  try {
    const divisions = await locationService.getDivisions();
    divisions.forEach((div) => {
      const opt = document.createElement('option');
      opt.value = div.id;
      opt.textContent = `${div.nameBn} (${div.nameEn})`;
      divSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Error fetching divisions:', err);
  }

  // Division Change -> load Districts & reset Upazila
  divSelect.addEventListener('change', async () => {
    const divisionId = divSelect.value;
    distSelect.innerHTML = '<option value="">জেলা নির্বাচন করুন</option>';
    upaSelect.innerHTML = '<option value="">আগে জেলা নির্বাচন করুন</option>';
    upaSelect.disabled = true;

    if (!divisionId) {
      distSelect.disabled = true;
      return;
    }

    try {
      const districts = await locationService.getDistricts(divisionId);
      districts.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = d.id || d.nameEn?.toLowerCase() || d._id;
        opt.textContent = `${d.nameBn} (${d.nameEn})`;
        distSelect.appendChild(opt);
      });
      distSelect.disabled = false;
    } catch (err) {
      console.error('Error fetching districts:', err);
    }
  });

  // District Change -> load Upazilas/Thanas
  distSelect.addEventListener('change', async () => {
    const districtId = distSelect.value;
    upaSelect.innerHTML = '<option value="">উপজেলা / থানা নির্বাচন করুন</option>';

    if (!districtId) {
      upaSelect.disabled = true;
      return;
    }

    try {
      const upazilas = await locationService.getUpazilas(districtId);
      if (upazilas && upazilas.length > 0) {
        upazilas.forEach((u) => {
          const opt = document.createElement('option');
          opt.value = u.id || u.nameEn?.toLowerCase() || u._id || u.nameBn;
          opt.textContent = `${u.nameBn} (${u.nameEn})`;
          upaSelect.appendChild(opt);
        });
      } else {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'কোনো উপজেলা পাওয়া যায়নি';
        upaSelect.appendChild(opt);
      }
      upaSelect.disabled = false;
    } catch (err) {
      console.error('Error fetching upazilas:', err);
      upaSelect.disabled = false;
    }
  });

  // Helper to gather form payload
  function getPayload() {
    const categoryPrimary = container.querySelector('#comp-category').value;
    const categorySecondary = container.querySelector('#comp-secondary-category').value;
    const startDateVal = container.querySelector('#comp-start-date').value;
    const endDateVal = container.querySelector('#comp-end-date').value;
    const precisionVal = container.querySelector('#comp-date-precision').value;
    const ongoingVal = container.querySelector('#comp-ongoing').checked;
    const descriptionVal = container.querySelector('#comp-description').value;

    const divisionVal = divSelect.value;
    const districtVal = distSelect.value;
    const upazilaVal = upaSelect.value;
    const freeTextLocationVal = container.querySelector('#comp-freetext-location').value;

    const accusedName = container.querySelector('#comp-accused-name').value;
    const accusedRole = container.querySelector('#comp-accused-role').value;
    const accusedOrg = container.querySelector('#comp-accused-org').value;
    const accusedLoc = container.querySelector('#comp-accused-location').value;

    const victimName = container.querySelector('#comp-victim-name').value;
    const victimAgeCat = container.querySelector('#comp-victim-age-category').value;
    const victimGender = container.querySelector('#comp-victim-gender').value;
    const victimRel = container.querySelector('#comp-victim-relationship').value;

    const emailVal = container.querySelector('#comp-contact-email')?.value;
    const mobileVal = container.querySelector('#comp-contact-mobile')?.value;

    const payload = {
      category: {
        primary: categoryPrimary || undefined,
        secondary: categorySecondary ? [categorySecondary] : [],
      },
      incident: {
        startDate: startDateVal ? new Date(startDateVal).toISOString() : undefined,
        endDate: endDateVal ? new Date(endDateVal).toISOString() : undefined,
        datePrecision: precisionVal || 'exact',
        ongoing: Boolean(ongoingVal),
        description: descriptionVal || undefined,
      },
      location: {
        divisionId: divisionVal || undefined,
        districtId: districtVal || undefined,
        upazilaId: upazilaVal || undefined,
        freeTextLocation: freeTextLocationVal || undefined,
      },
      accused: [],
      victims: [],
    };

    if (accusedName || accusedRole || accusedOrg || accusedLoc) {
      payload.accused.push({
        name: accusedName || undefined,
        role: accusedRole || undefined,
        organization: accusedOrg || undefined,
        location: accusedLoc || undefined,
        visibility: 'private',
      });
    }

    if (victimName || victimRel) {
      payload.victims.push({
        name: victimName || undefined,
        ageCategory: victimAgeCat || 'adult',
        gender: victimGender || 'male',
        relationshipToIncident: victimRel || undefined,
        identityVisibility: 'private',
      });
    }

    if (!currentUser) {
      payload.contact = {
        email: emailVal || undefined,
        mobile: mobileVal || undefined,
      };
    } else if (mobileVal) {
      payload.contact = {
        email: currentUser.email,
        mobile: mobileVal,
      };
    }

    return payload;
  }

  // Pre-fill existing draft if editing
  if (existingDraft) {
    if (existingDraft.category?.primary) {
      container.querySelector('#comp-category').value = existingDraft.category.primary;
    }
    if (existingDraft.category?.secondary?.[0]) {
      container.querySelector('#comp-secondary-category').value = existingDraft.category.secondary[0];
    }
    if (existingDraft.incident?.startDate) {
      container.querySelector('#comp-start-date').value = existingDraft.incident.startDate.split('T')[0];
    }
    if (existingDraft.incident?.endDate) {
      container.querySelector('#comp-end-date').value = existingDraft.incident.endDate.split('T')[0];
    }
    if (existingDraft.incident?.datePrecision) {
      container.querySelector('#comp-date-precision').value = existingDraft.incident.datePrecision;
    }
    if (existingDraft.incident?.ongoing) {
      container.querySelector('#comp-ongoing').checked = true;
    }
    if (existingDraft.incident?.description) {
      container.querySelector('#comp-description').value = existingDraft.incident.description;
    }
    if (existingDraft.location?.freeTextLocation) {
      container.querySelector('#comp-freetext-location').value = existingDraft.location.freeTextLocation;
    }
    if (existingDraft.accused?.[0]) {
      container.querySelector('#comp-accused-name').value = existingDraft.accused[0].name || '';
      container.querySelector('#comp-accused-role').value = existingDraft.accused[0].role || '';
      container.querySelector('#comp-accused-org').value = existingDraft.accused[0].organization || '';
      container.querySelector('#comp-accused-location').value = existingDraft.accused[0].location || '';
    }
    if (existingDraft.victims?.[0]) {
      container.querySelector('#comp-victim-name').value = existingDraft.victims[0].name || '';
      container.querySelector('#comp-victim-age-category').value = existingDraft.victims[0].ageCategory || 'adult';
      container.querySelector('#comp-victim-gender').value = existingDraft.victims[0].gender || 'male';
      container.querySelector('#comp-victim-relationship').value = existingDraft.victims[0].relationshipToIncident || '';
    }

    // Trigger division & district selection
    if (existingDraft.location?.divisionId) {
      divSelect.value = existingDraft.location.divisionId;
      divSelect.dispatchEvent(new window.Event('change'));
      setTimeout(() => {
        if (existingDraft.location?.districtId) {
          distSelect.value = existingDraft.location.districtId;
          distSelect.dispatchEvent(new window.Event('change'));
          setTimeout(() => {
            if (existingDraft.location?.upazilaId) {
              upaSelect.value = existingDraft.location.upazilaId;
            }
          }, 300);
        }
      }, 300);
    }
  }

  // Handle Save Draft (Authenticated Users Only)
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', async () => {
      alertEl.className = 'hidden';
      saveDraftBtn.disabled = true;
      saveDraftBtn.textContent = 'সংরক্ষণ হচ্ছে...';

      const payload = getPayload();

      try {
        let savedComplaint;
        if (existingDraft && existingDraft._id) {
          const res = await complaintService.updateDraft(existingDraft._id, payload, false);
          savedComplaint = res.data?.complaint || res.data || res;
        } else {
          const res = await complaintService.saveDraft(payload);
          savedComplaint = res.data?.complaint || res.data || res;
        }

        showAlert('খসড়া সফলভাবে সংরক্ষিত হয়েছে! ড্যাশবোর্ডে নেওয়া হচ্ছে...', 'success');
        const targetId = savedComplaint._id || existingDraft?._id;
        setTimeout(() => {
          if (targetId) {
            window.location.hash = `#/user/complaints/${targetId}`;
          } else {
            window.location.hash = '#/user/dashboard';
          }
        }, 1200);
      } catch (err) {
        showAlert(err.message || 'খসড়া সংরক্ষণ করতে ব্যর্থ হয়েছে।');
      } finally {
        saveDraftBtn.disabled = false;
        saveDraftBtn.textContent = '💾 খসড়া সংরক্ষণ করুন';
      }
    });
  }

  // Handle Submit Form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.className = 'hidden';

    // Client-side validations for final submission
    const cat = container.querySelector('#comp-category').value;
    if (!cat) {
      showAlert('অনুগ্রহ করে প্রধান ক্যাটাগরি নির্বাচন করুন।');
      return;
    }
    const sDate = container.querySelector('#comp-start-date').value;
    if (!sDate) {
      showAlert('অনুগ্রহ করে ঘটনার শুরুর তারিখ প্রদান করুন।');
      return;
    }
    const desc = container.querySelector('#comp-description').value.trim();
    if (!desc || desc.length < 20) {
      showAlert('ঘটনার বিবরণ কমপক্ষে ২০ অক্ষর হতে হবে।');
      return;
    }
    if (!divSelect.value) {
      showAlert('অনুগ্রহ করে বিভাগ নির্বাচন করুন।');
      return;
    }
    if (!distSelect.value) {
      showAlert('অনুগ্রহ করে জেলা নির্বাচন করুন।');
      return;
    }

    if (!currentUser) {
      const email = container.querySelector('#comp-contact-email')?.value.trim();
      const mobile = container.querySelector('#comp-contact-mobile')?.value.trim();
      if (!email && !mobile) {
        showAlert('দয়া করে অন্তত একটি যোগাযোগের মাধ্যম (ইমেইল অথবা মোবাইল নম্বর) প্রদান করুন।');
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'জমা হচ্ছে...';

    const payload = getPayload();

    try {
      let created;
      if (existingDraft && existingDraft._id) {
        // Submitting an existing draft
        const res = await complaintService.updateDraft(existingDraft._id, payload, true);
        created = res.data?.complaint || res.data || res;
      } else if (currentUser) {
        // Submitting directly as authenticated user
        const res = await complaintService.submitUserComplaint(payload);
        created = res.data?.complaint || res.data || res;
      } else {
        // Submitting anonymously
        const res = await complaintService.submitPublicComplaint(payload);
        created = res.data?.complaint || res.data || res;
      }

      showAlert('অভিযোগ সফলভাবে জমা হয়েছে! বিস্তারিত পাতায় নেওয়া হচ্ছে...', 'success');
      form.reset();

      setTimeout(() => {
        if (currentUser && (created?._id || existingDraft?._id)) {
          const compId = created?._id || existingDraft?._id;
          window.location.hash = `#/user/complaints/${compId}`;
        } else {
          window.location.hash = currentUser ? '#/user/dashboard' : '#/reports';
        }
      }, 1500);
    } catch (err) {
      showAlert(err.message || 'অভিযোগ জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = `🚀 ${existingDraft ? 'খসড়া দাখিল করুন' : 'অভিযোগ জমা দিন'}`;
    }
  });
}
