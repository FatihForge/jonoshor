import { complaintService } from '../../../services/complaints/complaintService.js';
import { locationService } from '../../../services/locations/locationService.js';
import { authService } from '../../../services/auth/authService.js';
import { COMPLAINT_CATEGORIES } from '../../../config/constants.js';
import { t, isBangla, translateCategory } from '../../../i18n/index.js';

export async function renderNewComplaintPage(container) {
  const currentUser = authService.getCurrentUser();
  const isBn = isBangla();

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
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          ${existingDraft ? t('complaint.title_edit') : t('complaint.title_new')}
        </h1>
        <p class="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          ${t('complaint.subtitle')}
        </p>
      </div>

      <div id="complaint-alert" role="alert" class="hidden mb-6 p-4 rounded-xl text-sm" aria-live="polite"></div>

      <form id="complaint-form" novalidate class="space-y-6 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
        <!-- 1. Category Selection -->
        <fieldset class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <legend class="text-sm font-semibold text-slate-900 px-1">${t('complaint.sec1_title')}</legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="comp-category" class="block text-xs text-slate-700 mb-1.5 font-medium">
                ${t('complaint.primary_category')} <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <select id="comp-category" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                <option value="">${t('complaint.select_category')}</option>
                ${COMPLAINT_CATEGORIES.map((c) => `<option value="${c}">${translateCategory(c)}</option>`).join('')}
              </select>
            </div>

            <div>
              <label for="comp-secondary-category" class="block text-xs text-slate-700 mb-1.5 font-medium">
                ${t('complaint.secondary_category')}
              </label>
              <select id="comp-secondary-category" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                <option value="">${t('common.none')}</option>
                ${COMPLAINT_CATEGORIES.map((c) => `<option value="${c}">${translateCategory(c)}</option>`).join('')}
              </select>
            </div>
          </div>
        </fieldset>

        <!-- 2. Incident Date, Range & Ongoing -->
        <fieldset class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <legend class="text-sm font-semibold text-slate-900 px-1">${t('complaint.sec2_title')}</legend>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="comp-start-date" class="block text-xs text-slate-700 mb-1.5 font-medium">
                ${t('complaint.start_date')} <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <input type="date" id="comp-start-date" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>

            <div>
              <label for="comp-end-date" class="block text-xs text-slate-700 mb-1.5 font-medium">
                ${t('complaint.end_date')}
              </label>
              <input type="date" id="comp-end-date" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>

            <div>
              <label for="comp-date-precision" class="block text-xs text-slate-700 mb-1.5 font-medium">
                ${t('complaint.date_precision')}
              </label>
              <select id="comp-date-precision" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                <option value="exact">${t('complaint.precision_exact')}</option>
                <option value="approximate">${t('complaint.precision_approximate')}</option>
                <option value="range">${t('complaint.precision_range')}</option>
                <option value="ongoing">${t('complaint.precision_ongoing')}</option>
              </select>
            </div>
          </div>

          <div class="flex items-center pt-2">
            <label class="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700">
              <input type="checkbox" id="comp-ongoing" class="w-4 h-4 rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <span>${t('complaint.incident_ongoing')}</span>
            </label>
          </div>
        </fieldset>

        <!-- 3. Incident Description -->
        <div>
          <label for="comp-description" class="block text-sm font-medium text-slate-900 mb-2">
            ${t('complaint.detailed_description')} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea id="comp-description" rows="5" required placeholder="${t('complaint.desc_placeholder')}" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 leading-relaxed"></textarea>
          <p class="text-xs text-slate-500 mt-1.5">${isBn ? 'নিরপেক্ষ তদন্তের স্বার্থে বস্তুনিষ্ঠ ও নির্ভরযোগ্য বিবরণ প্রদান করুন।' : 'Provide factual, neutral details to enable human rights investigators to effectively verify the case.'}</p>
        </div>

        <!-- 4. Geographic Location -->
        <fieldset class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <legend class="text-sm font-semibold text-slate-900 px-1">${t('complaint.sec3_title')}</legend>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="comp-division" class="block text-xs text-slate-700 mb-1 font-medium">${t('complaint.division')} <span class="text-red-500" aria-hidden="true">*</span></label>
              <select id="comp-division" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                <option value="">${t('complaint.select_division')}</option>
              </select>
            </div>

            <div>
              <label for="comp-district" class="block text-xs text-slate-700 mb-1 font-medium">${t('complaint.district')} <span class="text-red-500" aria-hidden="true">*</span></label>
              <select id="comp-district" required disabled class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:opacity-50">
                <option value="">${isBn ? 'প্রথমে বিভাগ নির্বাচন করুন' : 'Select Division first'}</option>
              </select>
            </div>

            <div>
              <label for="comp-upazila" class="block text-xs text-slate-700 mb-1 font-medium">${t('complaint.upazila')}</label>
              <select id="comp-upazila" disabled class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:opacity-50">
                <option value="">${isBn ? 'প্রথমে জেলা নির্বাচন করুন' : 'Select District first'}</option>
              </select>
            </div>
          </div>

          <div>
            <label for="comp-freetext-location" class="block text-xs text-slate-700 mb-1 font-medium">${t('complaint.location_details')}</label>
            <input type="text" id="comp-freetext-location" placeholder="${t('complaint.location_placeholder')}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
          </div>
        </fieldset>

        <!-- 5. Accused Information -->
        <fieldset class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <legend class="text-sm font-semibold text-slate-900 px-1">${isBn ? '৫. অভিযুক্ত ব্যক্তিবর্গ / সংস্থা (জানা থাকলে)' : '5. Accused Information (If known)'}</legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="comp-accused-name" class="block text-xs text-slate-700 mb-1 font-medium">${isBn ? 'অভিযুক্ত ব্যক্তি বা প্রতিষ্ঠানের নাম' : 'Accused Individual / Organization'}</label>
              <input type="text" id="comp-accused-name" placeholder="${isBn ? 'নাম বা পরিচিতি' : 'Name or alias'}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
            <div>
              <label for="comp-accused-role" class="block text-xs text-slate-700 mb-1 font-medium">${isBn ? 'পদবি / ভূমিকা' : 'Role / Designation'}</label>
              <input type="text" id="comp-accused-role" placeholder="${isBn ? 'যেমন: কর্মকর্তা, স্থানীয় প্রভাবশালী' : 'e.g. Officer, Local Authority'}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
            <div>
              <label for="comp-accused-org" class="block text-xs text-slate-700 mb-1 font-medium">${isBn ? 'সংস্থা বা বিভাগ' : 'Department / Agency'}</label>
              <input type="text" id="comp-accused-org" placeholder="${isBn ? 'যেমন: থানা, দপ্তর' : 'e.g. Police Station, Department'}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
            <div>
              <label for="comp-accused-location" class="block text-xs text-slate-700 mb-1 font-medium">${isBn ? 'কর্মস্থল বা এলাকা' : 'Workplace / Operational Area'}</label>
              <input type="text" id="comp-accused-location" placeholder="${isBn ? 'ঠিকানা বা এলাকা' : 'Address or post location'}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
          </div>
        </fieldset>

        <!-- 6. Victim Information -->
        <fieldset class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <legend class="text-sm font-semibold text-slate-900 px-1">${isBn ? '৬. ভুক্তভোগীর তথ্য (প্রযোজ্য ক্ষেত্রে)' : '6. Victim Information (If applicable)'}</legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="comp-victim-name" class="block text-xs text-slate-700 mb-1 font-medium">${isBn ? 'ভুক্তভোগীর নাম' : 'Victim Name'}</label>
              <input type="text" id="comp-victim-name" placeholder="${isBn ? 'পূর্ণ নাম বা পরিচয়' : 'Full name or alias'}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
            <div>
              <label for="comp-victim-age-category" class="block text-xs text-slate-700 mb-1 font-medium">${isBn ? 'বয়স সীমা' : 'Age Group'}</label>
              <select id="comp-victim-age-category" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                <option value="adult">${isBn ? 'প্রাপ্তবয়স্ক' : 'Adult'}</option>
                <option value="minor">${isBn ? 'অপ্রাপ্তবয়স্ক / শিশু' : 'Minor / Child'}</option>
                <option value="senior">${isBn ? 'প্রবীণ' : 'Senior'}</option>
                <option value="unknown">${isBn ? 'অজ্ঞাত' : 'Unknown'}</option>
              </select>
            </div>
            <div>
              <label for="comp-victim-gender" class="block text-xs text-slate-700 mb-1 font-medium">${isBn ? 'লিঙ্গ' : 'Gender'}</label>
              <select id="comp-victim-gender" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                <option value="male">${isBn ? 'পুরুষ' : 'Male'}</option>
                <option value="female">${isBn ? 'নারী' : 'Female'}</option>
                <option value="other">${isBn ? 'অন্যান্য' : 'Other'}</option>
                <option value="prefer_not_to_say">${isBn ? 'বলতে অনিচ্ছুক' : 'Prefer not to say'}</option>
              </select>
            </div>
            <div>
              <label for="comp-victim-relationship" class="block text-xs text-slate-700 mb-1 font-medium">${isBn ? 'অভিযোগকারীর সাথে সম্পর্ক' : 'Relationship to Complainant'}</label>
              <input type="text" id="comp-victim-relationship" placeholder="${isBn ? 'যেমন: নিজে, পরিবারের সদস্য, প্রতিবেশী' : 'e.g. Self, Family member, Neighbor'}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
          </div>
        </fieldset>

        <!-- 7. Contact Information -->
        <fieldset class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <legend class="text-sm font-semibold text-slate-900 px-1">
              ${isBn ? '৭. যোগাযোগের তথ্য' : '7. Contact Information'} ${!currentUser ? '<span class="text-red-500" aria-hidden="true">*</span>' : ''}
            </legend>
            ${!currentUser ? `<span class="text-xs text-slate-500">${isBn ? 'কমপক্ষে একটি যোগাযোগ মাধ্যম আবশ্যক' : 'At least one contact method required'}</span>` : ''}
          </div>
          <p class="text-xs text-slate-600">
            ${
              currentUser
                ? (isBn ? `আপনার নিবন্ধিত অ্যাকাউন্ট (${currentUser.email}) থেকে দাখিল করা হচ্ছে। চাইলে সক্রিয় মোবাইল নম্বর দিতে পারেন।` : `Filing from your registered account (${currentUser.email}). You may optionally provide an active contact number.`)
                : (isBn ? 'তদন্তের স্বার্থে অনুসন্ধানকারী দল আপনার সাথে যোগাযোগ করতে পারে। আপনার তথ্য কখনোই প্রকাশ করা হবে না।' : 'Investigators may reach out to verify allegations. Your contact information is never published publicly.')
            }
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="comp-contact-email" class="block text-xs text-slate-700 mb-1 font-medium">${t('contact.email_label')}</label>
              <input type="email" id="comp-contact-email" value="${currentUser ? currentUser.email : ''}" ${currentUser ? 'readonly' : ''} placeholder="example@domain.com" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 ${currentUser ? 'bg-slate-100 cursor-not-allowed' : ''}" />
            </div>
            <div>
              <label for="comp-contact-mobile" class="block text-xs text-slate-700 mb-1 font-medium">${t('contact.phone_label')}</label>
              <input type="tel" id="comp-contact-mobile" value="${currentUser?.mobile || ''}" placeholder="017XXXXXXXX" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
          </div>
        </fieldset>

        <!-- Actions -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          ${
            currentUser
              ? `
            <button type="button" id="save-draft-btn" class="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm border border-slate-300 transition flex items-center justify-center gap-2">
              <span>${t('complaint.save_draft_btn')}</span>
            </button>
          `
              : ''
          }
          <button type="submit" id="submit-complaint-btn" class="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2">
            <span>${existingDraft ? t('complaint.submit_btn') : (isBn ? 'অভিযোগ দাখিল করুন' : 'File Complaint')}</span>
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
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-300 text-emerald-800';
    } else {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-300 text-red-800';
    }
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Load Divisions
  try {
    const divisions = await locationService.getDivisions();
    divisions.forEach((div) => {
      const opt = document.createElement('option');
      opt.value = div.id;
      opt.textContent = isBn ? (div.nameBn || div.nameEn) : `${div.nameEn} (${div.nameBn})`;
      divSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Error fetching divisions:', err);
  }

  // Division Change -> load Districts & reset Upazila
  divSelect.addEventListener('change', async () => {
    const divisionId = divSelect.value;
    distSelect.innerHTML = `<option value="">${t('complaint.select_district')}</option>`;
    upaSelect.innerHTML = `<option value="">${isBn ? 'প্রথমে জেলা নির্বাচন করুন' : 'Select District first'}</option>`;
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
        opt.textContent = isBn ? (d.nameBn || d.nameEn) : `${d.nameEn} (${d.nameBn})`;
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
    upaSelect.innerHTML = `<option value="">${t('complaint.select_upazila')}</option>`;

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
          opt.textContent = isBn ? (u.nameBn || u.nameEn) : `${u.nameEn} (${u.nameBn})`;
          upaSelect.appendChild(opt);
        });
      } else {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = isBn ? 'কোনো উপজেলা পাওয়া যায়নি' : 'No upazilas found';
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
      saveDraftBtn.textContent = isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...';

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

        showAlert(isBn ? 'খসড়া সফলভাবে সংরক্ষিত হয়েছে। রিডাইরেক্ট হচ্ছে...' : 'Draft saved successfully. Redirecting...', 'success');
        const targetId = savedComplaint._id || existingDraft?._id;
        setTimeout(() => {
          if (targetId) {
            window.location.hash = `#/user/complaints/${targetId}`;
          } else {
            window.location.hash = '#/user/dashboard';
          }
        }, 1200);
      } catch (err) {
        showAlert(err.message || (isBn ? 'খসড়া সংরক্ষণে সমস্যা হয়েছে।' : 'Failed to save draft.'));
      } finally {
        saveDraftBtn.disabled = false;
        saveDraftBtn.textContent = t('complaint.save_draft_btn');
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
      showAlert(isBn ? 'অনুগ্রহ করে প্রধান ক্যাটাগরি নির্বাচন করুন।' : 'Please select a primary category.');
      return;
    }
    const sDate = container.querySelector('#comp-start-date').value;
    if (!sDate) {
      showAlert(isBn ? 'অনুগ্রহ করে ঘটনার শুরুর তারিখ প্রদান করুন।' : 'Please provide the incident start date.');
      return;
    }
    const desc = container.querySelector('#comp-description').value.trim();
    if (!desc || desc.length < 20) {
      showAlert(isBn ? 'ঘটনার বিবরণ কমপক্ষে ২০ অক্ষর হতে হবে।' : 'Incident description must be at least 20 characters long.');
      return;
    }
    if (!divSelect.value) {
      showAlert(isBn ? 'অনুগ্রহ করে বিভাগ নির্বাচন করুন।' : 'Please select a division.');
      return;
    }
    if (!distSelect.value) {
      showAlert(isBn ? 'অনুগ্রহ করে জেলা নির্বাচন করুন।' : 'Please select a district.');
      return;
    }

    if (!currentUser) {
      const email = container.querySelector('#comp-contact-email')?.value.trim();
      const mobile = container.querySelector('#comp-contact-mobile')?.value.trim();
      if (!email && !mobile) {
        showAlert(isBn ? 'অনুগ্রহ করে অন্তত একটি যোগাযোগের মাধ্যম (ইমেইল বা মোবাইল) প্রদান করুন।' : 'Please provide at least one contact method (email or mobile number).');
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t('complaint.submitting');

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

      showAlert(isBn ? 'অভিযোগ সফলভাবে দাখিল হয়েছে! বিস্তারিত পৃষ্ঠায় নেওয়া হচ্ছে...' : 'Complaint submitted successfully! Redirecting to details...', 'success');
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
      showAlert(err.message || (isBn ? 'অভিযোগ দাখিল ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।' : 'Failed to submit complaint. Please try again.'));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = existingDraft ? t('complaint.submit_btn') : (isBn ? 'অভিযোগ দাখিল করুন' : 'File Complaint');
    }
  });
}
