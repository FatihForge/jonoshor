import { t, isBangla } from '../../../i18n/index.js';

export function renderJoinUsPage(container) {
  const isBn = isBangla();

  container.innerHTML = `
    <div class="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div class="mb-8 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
          <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true"></span>
          ${t('join_us.badge')}
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">${t('join_us.title')}</h1>
        <p class="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          ${t('join_us.subtitle')}
        </p>
      </div>

      <div id="join-alert" role="alert" class="hidden mb-6 p-4 rounded-xl text-sm transition-all duration-200" aria-live="polite"></div>

      <form id="join-form" novalidate class="space-y-6 bg-white border border-slate-200 p-6 sm:p-10 rounded-2xl shadow-sm">
        <!-- Section 1: Personal Info -->
        <fieldset class="border-b border-slate-200 pb-6 space-y-4">
          <legend class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-6 h-6 rounded bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold" aria-hidden="true">1</span>
            ${t('join_us.sec1_title')}
          </legend>
          
          <div>
            <label for="join-name" class="block text-sm font-medium text-slate-700 mb-1.5">
              ${t('join_us.full_name')} <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input type="text" id="join-name" name="fullName" required placeholder="${t('join_us.name_placeholder')}" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="join-email" class="block text-sm font-medium text-slate-700 mb-1.5">
                ${t('join_us.email_label')} <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <input type="email" id="join-email" name="email" required placeholder="name@example.com" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              <span class="text-[11px] text-slate-500 mt-1 block">${t('join_us.email_hint')}</span>
            </div>
            <div>
              <label for="join-mobile" class="block text-sm font-medium text-slate-700 mb-1.5">${t('join_us.mobile_label')}</label>
              <input type="tel" id="join-mobile" name="mobile" placeholder="017XXXXXXXX" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
          </div>

          <div>
            <label for="join-address" class="block text-sm font-medium text-slate-700 mb-1.5">${t('join_us.address_label')}</label>
            <input type="text" id="join-address" name="address" placeholder="${t('join_us.address_placeholder')}" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
          </div>
        </fieldset>

        <!-- Section 2: Profession & Contribution -->
        <fieldset class="border-b border-slate-200 pb-6 space-y-4">
          <legend class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-6 h-6 rounded bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold" aria-hidden="true">2</span>
            ${t('join_us.sec2_title')}
          </legend>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="join-profession" class="block text-sm font-medium text-slate-700 mb-1.5">
                ${t('join_us.profession_label')} <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <select id="join-profession" name="primaryProfession" required class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                <option value="">${isBn ? 'পেশা নির্বাচন করুন' : 'Select profession'}</option>
                <option value="Lawyer / Legal Researcher">${isBn ? 'আইনজীবী / আইন গবেষক' : 'Lawyer / Legal Researcher'}</option>
                <option value="Human Rights Advocate">${isBn ? 'মানবাধিকার কর্মী' : 'Human Rights Advocate'}</option>
                <option value="Journalist / Investigative Reporter">${isBn ? 'সাংবাদিক / অনুসন্ধানী প্রতিবেদক' : 'Journalist / Investigative Reporter'}</option>
                <option value="Medical / Mental Health Professional">${isBn ? 'চিকিৎসক / মানসিক স্বাস্থ্য বিশেষজ্ঞ' : 'Medical / Mental Health Professional'}</option>
                <option value="Software Engineer / IT Specialist">${isBn ? 'সফটওয়্যার প্রকৌশলী / প্রযুক্তি বিশেষজ্ঞ' : 'Software Engineer / IT Specialist'}</option>
                <option value="Translator (Bengali & English)">${isBn ? 'অনুবাদক (বাংলা ও ইংরেজি)' : 'Translator (Bengali & English)'}</option>
                <option value="Academic / Researcher / Student">${isBn ? 'শিক্ষাবিদ / শিক্ষার্থী' : 'Academic / Researcher / Student'}</option>
                <option value="Other">${isBn ? 'অন্যান্য' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label for="join-custom-profession" class="block text-sm font-medium text-slate-700 mb-1.5">${isBn ? 'নির্দিষ্ট পদবি / বিশেষ ক্ষেত্র (ঐচ্ছিক)' : 'Detailed Title / Specialization (Optional)'}</label>
              <input type="text" id="join-custom-profession" name="customProfession" placeholder="${t('join_us.profession_placeholder')}" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
          </div>

          <div>
            <label for="join-role" class="block text-sm font-medium text-slate-700 mb-1.5">
              ${t('join_us.primary_role')} <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <select id="join-role" name="primaryContributionRole" required class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
              <option value="">${isBn ? 'ভূমিকা নির্বাচন করুন' : 'Select role'}</option>
              <option value="Legal Advocacy & Case Drafting">${isBn ? 'আইনি সহায়তা ও কেস ড্রাফটিং' : 'Legal Advocacy & Case Drafting'}</option>
              <option value="On-ground Complaint & Evidence Verification">${isBn ? 'মাঠপর্যায়ে অভিযোগ ও প্রমাণ যাচাই' : 'On-ground Complaint & Evidence Verification'}</option>
              <option value="Victim Support & Counseling">${isBn ? 'ভুক্তভোগী সহায়তা ও কাউন্সেলিং' : 'Victim Support & Counseling'}</option>
              <option value="Report Translation & Editorial Review">${isBn ? 'রিপোর্ট অনুবাদ ও সম্পাদনা' : 'Report Translation & Editorial Review'}</option>
              <option value="Cyber Security & Platform Support">${isBn ? 'সাইবার নিরাপত্তা ও প্ল্যাটফর্ম সহায়তা' : 'Cyber Security & Platform Support'}</option>
              <option value="Human Rights Advocacy & Public Communications">${isBn ? 'মানবাধিকার প্রচার ও গণযোগাযোগ' : 'Human Rights Advocacy & Public Communications'}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">${isBn ? 'অতিরিক্ত ভূমিকা (প্রযোজ্যগুলো নির্বাচন করুন)' : 'Secondary Areas of Contribution (Select all that apply)'}</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="secondaryContributionRoles" value="Legal Analysis" class="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span>${isBn ? 'আইনি বিশ্লেষণ' : 'Legal Analysis'}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="secondaryContributionRoles" value="Field Fact-Checking" class="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span>${isBn ? 'মাঠপর্যায়ে তথ্য যাচাই' : 'Field Fact-Checking'}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="secondaryContributionRoles" value="Translation & Content" class="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span>${isBn ? 'অনুবাদ ও কনটেন্ট' : 'Translation & Content'}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="secondaryContributionRoles" value="Technical & Security" class="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span>${isBn ? 'প্রযুক্তি ও নিরাপত্তা' : 'Technical & Security'}</span>
              </label>
            </div>
          </div>

          <div>
            <label for="join-details" class="block text-sm font-medium text-slate-700 mb-1.5">
              ${t('join_us.motivation_label')} <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea id="join-details" name="contributionDetails" required rows="4" placeholder="${t('join_us.motivation_placeholder')}" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
          </div>
        </fieldset>

        <!-- Section 3: References & Supporting Documents -->
        <fieldset class="border-b border-slate-200 pb-6 space-y-4">
          <div class="flex items-center justify-between mb-2">
            <legend class="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span class="w-6 h-6 rounded bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold" aria-hidden="true">3</span>
              ${isBn ? 'পেশাদার রেফারেন্স ও সহায়ক কাগজপত্র' : 'Professional References & Supporting Documents'}
            </legend>
            <span class="text-xs text-amber-700 font-medium">${isBn ? 'কমপক্ষে ১টি আবশ্যক' : 'At least 1 required'}</span>
          </div>

          <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <span class="font-bold">${isBn ? 'যাচাইকরণের শর্ত:' : 'Required Verification:'}</span> ${isBn ? 'আবেদনকারীর পরিচয় নিশ্চিতের জন্য কমপক্ষে একটি প্রোফাইল লিংক (LinkedIn, Portfolio, GitHub/website) অথবা সহায়ক দলিল (CV, সুপারিশপত্র) আপলোড করুন।' : 'To confirm applicant identity, please provide at least one professional/social link (LinkedIn, Portfolio, GitHub) or one supporting document (CV, recommendation).'}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="join-linkedin" class="block text-sm font-medium text-slate-700 mb-1.5">${isBn ? 'লিঙ্কডইন প্রোফাইল URL' : 'LinkedIn Profile URL'}</label>
              <input type="url" id="join-linkedin" name="linkedin" placeholder="https://linkedin.com/in/username" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
            <div>
              <label for="join-portfolio" class="block text-sm font-medium text-slate-700 mb-1.5">${isBn ? 'পোর্টফোলিও / ওয়েবসাইট / গিটহাব' : 'Portfolio / Website / GitHub'}</label>
              <input type="url" id="join-portfolio" name="portfolio" placeholder="https://github.com/username or personal site" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
          </div>

          <div>
            <label for="join-social" class="block text-sm font-medium text-slate-700 mb-1.5">${isBn ? 'অন্যান্য রেফারেন্স / সোশ্যাল প্রোফাইল (ঐচ্ছিক)' : 'Other Reference / Social Profile (Optional)'}</label>
            <input type="url" id="join-social" name="socialLink" placeholder="https://twitter.com/..., https://facebook.com/..." class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
          </div>

          <div>
            <label for="join-files" class="block text-sm font-medium text-slate-700 mb-1.5">${isBn ? 'সহায়ক কাগজপত্র আপলোড (CV, সনদপত্র)' : 'Upload Supporting Documents (CV, Letters, Certifications)'}</label>
            <div class="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-5 text-center bg-slate-50 transition">
              <input type="file" id="join-files" name="documents" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" class="hidden" />
              <label for="join-files" class="cursor-pointer flex flex-col items-center">
                <svg class="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span class="text-sm text-emerald-700 font-medium hover:underline">${isBn ? 'ফাইল নির্বাচন করতে ক্লিক করুন' : 'Click to browse and select files'}</span>
                <span class="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 20MB per file)</span>
              </label>
              <div id="file-list-preview" class="mt-3 text-xs text-slate-600 text-left space-y-1"></div>
            </div>
          </div>
        </fieldset>

        <div class="pt-2">
          <button type="submit" id="join-submit-btn" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2">
            <span>${t('join_us.submit_btn')}</span>
          </button>
          <p class="text-center text-xs text-slate-500 mt-3">
            ${isBn ? 'আপনার আবেদন সম্পূর্ণ গোপন রাখা হবে এবং কেবল অনুমোদিত অ্যাডমিনিস্ট্রেটরদের দ্বারা পর্যালোচিত হবে।' : 'Your application is kept strictly confidential and reviewed only by authorized JonoShor administrators.'}
          </p>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#join-form');
  const alertEl = container.querySelector('#join-alert');
  const fileInput = container.querySelector('#join-files');
  const fileListPreview = container.querySelector('#file-list-preview');

  fileInput.addEventListener('change', () => {
    fileListPreview.innerHTML = '';
    if (fileInput.files.length > 0) {
      for (const file of fileInput.files) {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between bg-white px-3 py-1.5 rounded border border-slate-200';
        item.innerHTML = `
          <span class="truncate max-w-[300px] text-slate-700">📎 ${file.name}</span>
          <span class="text-slate-500 text-[11px]">${(file.size / 1024).toFixed(1)} KB</span>
        `;
        fileListPreview.appendChild(item);
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#join-submit-btn');
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>${t('join_us.submitting')}</span>
    `;
    alertEl.className = 'hidden';

    try {
      const formData = new FormData();
      formData.append('fullName', container.querySelector('#join-name').value.trim());
      formData.append('email', container.querySelector('#join-email').value.trim());

      const mobile = container.querySelector('#join-mobile').value.trim();
      const address = container.querySelector('#join-address').value.trim();
      if (mobile || address) {
        formData.append('contactInformation', JSON.stringify({ mobile, address }));
      }

      formData.append('primaryProfession', container.querySelector('#join-profession').value);
      const customProf = container.querySelector('#join-custom-profession').value.trim();
      if (customProf) {
        formData.append('customProfession', customProf);
      }

      formData.append('primaryContributionRole', container.querySelector('#join-role').value);

      const secRoles = Array.from(
        container.querySelectorAll('input[name="secondaryContributionRoles"]:checked')
      ).map((cb) => cb.value);
      if (secRoles.length > 0) {
        formData.append('secondaryContributionRoles', JSON.stringify(secRoles));
      }

      formData.append('contributionDetails', container.querySelector('#join-details').value.trim());

      const linkedin = container.querySelector('#join-linkedin').value.trim();
      if (linkedin) formData.append('linkedin', linkedin);

      const portfolio = container.querySelector('#join-portfolio').value.trim();
      if (portfolio) formData.append('portfolio', portfolio);

      const social = container.querySelector('#join-social').value.trim();
      if (social) formData.append('socialLinks', JSON.stringify([social]));

      // Attach uploaded documents
      if (fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append('documents', fileInput.files[i]);
        }
      }

      // Check client-side requirement for friendly immediate feedback
      const hasRef = Boolean(linkedin || portfolio || social);
      const hasFiles = fileInput.files.length > 0;
      if (!hasRef && !hasFiles) {
        throw new Error(
          isBn
            ? 'অনুগ্রহ করে কমপক্ষে একটি প্রোফাইল লিংক (LinkedIn, Portfolio, GitHub) বা একটি সহায়ক দলিল সংযুক্ত করুন।'
            : 'Please provide at least one professional/social link (LinkedIn, Portfolio, GitHub) or one supporting document (CV, recommendation).'
        );
      }

      const response = await fetch('/api/v1/public/join-us', {
        method: 'POST',
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        const errMsg =
          resData.error?.message ||
          (resData.error?.details && resData.error.details[0]?.msg) ||
          (isBn ? 'আবেদন জমা দিতে সমস্যা হয়েছে।' : 'Failed to submit application.');
        throw new Error(errMsg);
      }

      alertEl.innerHTML = `
        <div class="font-bold mb-1">✓ ${t('join_us.success_title')}</div>
        <div>${resData.data?.message || t('join_us.success_desc')}</div>
      `;
      alertEl.className =
        'mb-6 p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-300 text-emerald-800';
      form.reset();
      fileListPreview.innerHTML = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alertEl.textContent = err.message || (isBn ? 'আবেদন জমা দিতে সমস্যা হয়েছে।' : 'Failed to submit application.');
      alertEl.className =
        'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-300 text-red-800';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>${t('join_us.submit_btn')}</span>`;
    }
  });
}
