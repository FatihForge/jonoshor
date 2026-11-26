# জনস্বর (JonoShor) — বর্তমান প্রজেক্ট অবস্থা ও বিস্তারিত ডকুমেন্টেশন (Current Project Status)

> **সর্বশেষ আপডেট:** ২৬ নভেম্বর ২০২৬  
> **বর্তমান অবস্থা:** ব্যাকএন্ড হার্ডেন্ড ও Swagger-ডকুমেন্টেড; Next.js 14 ফ্রন্টএন্ড সম্পূর্ণ, Dreamhub-অনুপ্রাণিত UI ও পূর্ণাঙ্গ দ্বিভাষিক (`bn`/`en`) সাপোর্ট সহ বিল্ড ও ভেরিফাইড  
> **সর্বশেষ যাচাই:** Next.js প্রোডাকশন বিল্ড ৩৯টি রুট (`exit code 0`), লাইভ HTTP চেক ৪০/৪০ (`200 OK`), দ্বিভাষিক বান্ডল চেক ১৪/১৪ পাস; ব্যাকএন্ড অডিট Section 2 (5/5) ও Section 3 (16/16) ফিক্সড ও `0 vulnerabilities`

---

## ১. প্রজেক্টের সংক্ষিপ্ত পরিচিতি (Project Overview)

**জনস্বর (JonoShor)** হলো বাংলাদেশের মানবাধিকার লঙ্ঘন, নির্যাতন ও বৈষম্যের ঘটনা নিরাপদ, দায়িত্বশীল ও নিরপেক্ষভাবে নথিভুক্ত করার একটি স্বাধীন নাগরিক প্ল্যাটফর্ম।

### মূল নীতি ও আইনি সীমাবদ্ধতা
* **অভিযোগ ≠ প্রমাণিত অপরাধ (Complaint ≠ Proven Crime):** প্ল্যাটফর্মে জমা হওয়া অভিযোগ সরাসরি অপরাধের প্রমাণ নয়।
* **যাচাইকৃত রিপোর্ট ≠ আইনি রায় (Verified Report ≠ Legal Outcome):** এটি কোনো আদালত বা বিচারিক বিকল্প নয়, বরং নিরপেক্ষ মানবাধিকার প্রমাণের দলিল।
* **পরিচয় সর্বদা সুরক্ষিত:** অভিযোগকারীর পরিচয় ডিফল্টভাবে সম্পূর্ণ গোপন (Private) থাকে এবং পাবলিক রিপোর্টে কখনোই অভিযোগকারীর তথ্য প্রকাশ করা হয় না।

---

## ২. প্রযুক্তিগত আর্কিটেকচার (Technology Stack & Architecture)

```text
[ ক্লায়েন্ট ব্রাউজার ]
       │
       ▼ (Next.js 14 App Router: Hybrid SSR + CSR, SEO Metadata & JSON-LD)
[ ফ্রন্টএন্ড: Next.js 14.2.35 + React 18 + Tailwind CSS (Port 3000) ]
       │
       ▼ (Next.js Rewrite Proxy `/api/v1/*` / HttpOnly JWT Cookies / CSRF Token)
[ ব্যাকএন্ড: Express.js 4 + Node.js ESM (Port 5000) ]
       ├── [ API ডকুমেন্টেশন ]: OpenAPI 3.0 + Swagger UI (`/api-docs`, `/api-docs.json`)
       ├── [ অথেনটিকেশন ও সিকিউরিটি ]: Argon2id, JWT, TOTP 2FA, Re-Auth (jti replay block), Helmet, CSRF (`timingSafeEqual`), Rate-Limit
       ├── [ মেইল সার্ভিস ]: Nodemailer + Gmail App Password (Live SMTP Dispatcher)
       ├── [ ক্লাউড স্টোরেজ ]: Google Drive API (Quarantine ➔ Clean ➔ Public Workflow)
       └── [ ডাটাবেজ ]: MongoDB Atlas (Mongoose ODM, DNS Fallback Resolver)
```

| স্তর (Layer) | ব্যবহৃত প্রযুক্তি (Technologies) | বিবরণ |
| :--- | :--- | :--- |
| **Frontend** | Next.js `14.2.35` (App Router), React `18.3.1`, Tailwind CSS `3.4.17`, Lucide Icons | হাইব্রিড SSR + CSR আর্কিটেকচার, পূর্ণাঙ্গ SEO (`metadata`, `generateMetadata`, JSON-LD `NewsArticle`, `robots.js`, `sitemap.js`), Dreamhub Medical-অনুপ্রাণিত UI, Light/Dark থিম টগল (`ThemeContext`), পূর্ণাঙ্গ `bn`/`en` সাপোর্ট (`LanguageContext`) |
| **Backend** | Node.js (ESM), Express.js `4.21.2` | লেয়ার্ড আর্কিটেকচার (`Routes ➔ Middlewares ➔ Controllers ➔ Services ➔ Repositories ➔ Models`) |
| **API Docs** | `swagger-ui-express`, OpenAPI 3.0 (`backend/src/docs/swagger.js`) | ইন্টারঅ্যাক্টিভ Swagger UI (`/api-docs`) এবং স্পেক JSON (`/api-docs.json`) |
| **Database** | MongoDB Atlas, Mongoose `8.9.5` | ইনডেক্সড স্কিমা কালেকশন ও প্রোডাকশন রিডিনেস হেলথ চেক |
| **Storage** | Google Drive API (`googleapis`, Service Account) | কোয়ারেন্টাইন, ক্লিন ও পাবলিক ফোল্ডারের মাধ্যমে ফাইল লাইফসাইকেল |
| **Email Service** | Nodemailer SMTP (`10.6.1`) | জিমেইল অ্যাপ পাসওয়ার্ডের মাধ্যমে লাইভ ওটিপি ও ভেরিফিকেশন মেইল |
| **Security** | Argon2id (`0.41.1`), `otplib`, `jsonwebtoken`, `helmet`, `crypto` | আধুনিক পাসওয়ার্ড হ্যাশিং, TOTP 2FA, CSRF timing-safe তুলনা, রি-অথ `jti` রিপ্লে প্রতিরোধ |

---

## ৩. মডিউল ভিত্তিক বাস্তবায়ন ও বর্তমান অবস্থা (Module Implementation Status)

### মডিউল ১: অথেনটিকেশন ও অ্যাকাউন্ট সিকিউরিটি (Authentication & Security)
* **রেজিস্ট্রেশন (`/register`):** নাম, ইমেইল ও পাসওয়ার্ড (৮+ অক্ষর) দিয়ে অ্যাকাউন্ট তৈরি এবং ডিসপোজেবল মেইল ব্লকার।
* **লাইভ ইমেইল ভেরিফিকেশন (`/verify-email`):** ৬-সংখ্যার OTP ইমেইলে প্রেরণ ও রিসেন্ড সুবিধা; ইমেইল ভেরিফাই না হওয়া পর্যন্ত লগইন ব্লক (`EMAIL_NOT_VERIFIED`)।
* **লগইন ও সেশন (`/login`, `/admin/login`, `/super-admin/login`):** নিরাপদ HttpOnly `access_token` ও `refresh_token` কুকি, Admin ও Super Admin টোকেন রিফ্রেশ, এবং অ্যাডমিন ও সুপার অ্যাডমিনদের জন্য বাধ্যতামূলক ২-ধাপের TOTP 2FA।
* **পাসওয়ার্ড রিকভারি (`/forgot-password`, `/reset-password`):** টাইম-বাউন্ড টোকেনের মাধ্যমে পাসওয়ার্ড রিসেট এবং পাসওয়ার্ড পরিবর্তনে পূর্বের সব সেশন বাতিল।
* **গুগল ও-অথ ২.০ (Google OAuth):** গুগল অ্যাকাউন্টের মাধ্যমে সাইন-ইন (`/api/v1/auth/google`)।
* **CSRF, Rate-Limit ও সেশন নিরাপত্তাকরণ:** স্টেট-চেঞ্জিং মিউটেশনে `crypto.timingSafeEqual` CSRF ভ্যালিডেশন; সাসপেন্ড/ব্লক হওয়া অ্যাডমিনের তাৎক্ষণিক সেশন রিভোকেশন।

### মডিউল ২: অভিযোগ দাখিল ইঞ্জিন (Complaint Submission Engine)
* **৩-ধাপের নিরাপদ উইজার্ড (`/complaints/new`):** ঘটনার ধরন ও বিবরণ ➔ ভৌগোলিক স্থান (৮ বিভাগ ও ৬৪ জেলা API) ➔ অভিযুক্ত ও ভুক্তভোগীর গোপন তথ্য।
* **নন-ইউজার বনাম রেজিস্টার্ড ইউজার:** অ্যাকাউন্ট ছাড়াও নাগরিকরা নিরাপদে অভিযোগ দাখিল করতে পারেন (সর্বোচ্চ ৫টি পর্যন্ত); লগইনকৃত ব্যবহারকারীরা খসড়া ও সম্পূর্ণ কেস ড্যাশবোর্ড থেকে পরিচালনা করতে পারেন।

### মডিউল ৩: প্রমাণাদি ও ক্লাউড স্টোরেজ (Evidence & Cloud Storage)
* **মাল্টি-স্টেজ লাইফসাইকেল:** `Quarantine` ➔ স্বয়ংক্রিয় ম্যালওয়্যার স্ক্যান ➔ `Clean` ➔ অনুমোদন সাপেক্ষে `Public` ফোল্ডার।
* **প্রাইভেট প্রক্সি স্ট্রিমিং ও মাস্কিং:** সাধারণ ব্যবহারকারীর রেসপন্স থেকে ইন্টারনাল `driveFileId` গোপন রাখা হয় এবং প্রমাণাদি প্রক্সি ডাউনলোড এন্ডপয়েন্টে প্রবাহিত হয়।

### মডিউল ৪: অ্যাডমিন রিভিউ ও ভেরিফিকেশন (`/admin/*`)
* **কেসওয়ার্ক কনসোল (`/admin/dashboard`, `/admin/complaints`, `/admin/complaints/[id]`):** অভিযোগ তালিকা ফিল্টারিং, স্বার্থের সংঘাত (COI) ঘোষণা, যাচাই সিদ্ধান্ত (`verified`, `rejected`, `more_info_needed`)।
* **পাবলিক রিপোর্ট বিল্ডার (`/admin/complaints/[id]/public-report`):** বাংলা ও ইংরেজি উভয় সংস্করণে নিরপেক্ষ জনস্বার্থ রিপোর্ট তৈরি ও প্রকাশনা।
* **আলামত, স্বেচ্ছাসেবক, নাগরিক ও ইনবক্স ব্যবস্থাপনা:**
  * `/admin/evidence` — ফরেনসিক রিভিউ ও পাবলিক ডিসক্লোজার অনুমোদন।
  * `/admin/join-us` — আবেদন স্ট্যাটাস আপডেট, নোট যুক্ত করা ও CSV এক্সপোর্ট।
  * `/admin/users` — নাগরিক অ্যাকাউন্ট সার্চ ও স্ট্যাটাস নিয়ন্ত্রণ।
  * `/admin/contact` — জনসাধারণের বার্তা ও অভ্যন্তরীণ সমাধান নোট।

### মডিউল ৫: সুপার অ্যাডমিন গভর্ন্যান্স (`/super-admin/*`)
* **কমান্ড সেন্টার (`/super-admin/dashboard`):** অ্যাডমিন, অডিট লগ এবং নিরাপত্তা লগ KPI মনিটরিং।
* **অ্যাডমিন ও RBAC ব্যবস্থাপনা (`/super-admin/admins`):** নতুন অ্যাডমিন অনবোর্ডিং, স্ট্যাটাস নিয়ন্ত্রণ, ও Re-Auth সুরক্ষিত পারমিশন আপডেট (`ReAuthModal`)।
* **টেলিমেট্রি ও কনফিগারেশন:**
  * `/super-admin/audit-logs` — অপরিবর্তনযোগ্য অডিট লগ ও সিকিউরিটি ইভেন্ট JSON ইন্সপেকশন।
  * `/super-admin/system-settings` — গ্লোবাল অপারেশনাল ও নিরাপত্তা কনফিগারেশন (Re-Auth সুরক্ষিত)।
  * `/super-admin/financial-settings` — bKash/Nagad মার্চেন্ট নম্বর ও আইনি সহায়তা তহবিল নীতিমালা (Re-Auth সুরক্ষিত)।
  * `/super-admin/storage` — Google Drive OAuth অনুমোদন এবং ভোল্ট ফোল্ডার ইনিশিয়ালাইজেশন।

### মডিউল ৬: ব্যবহারকারীর অ্যাকাউন্ট পোর্টাল (`/user/*`)
* **ড্যাশবোর্ড (`/user/dashboard`):** জমাকৃত অভিযোগের তালিকা ও স্ট্যাটাস।
* **কেস বিস্তারিত ও প্রত্যাহার (`/user/complaints/[id]`):** সংযুক্ত প্রমাণ তালিকা এবং কারণ দর্শিয়ে প্রত্যাহারের আবেদন।
* **নিরাপদ বার্তা ও নোটিফিকেশন (`/user/messages`, `/user/notifications`, `/user/profile`):** অপরিবর্তনযোগ্য থ্রেডেড মেসেজিং, নোটিফিকেশন ও পাসওয়ার্ড পরিবর্তন।

### মডিউল ৭: পাবলিক পোর্টাল, UI থিমিং ও দ্বিভাষিক সাপোর্ট
* **SSR ও SEO রুটসমূহ:** `/` ([HomeView.jsx](file:///c:/Users/pc/Desktop/projects/JonoShor/frontend/app/components/HomeView.jsx)), `/reports`, `/reports/[id]`, `/statistics`, `/about`, `/how-it-works`, `/safety`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`।
* **Dreamhub-অনুপ্রাণিত UI + Light/Dark মোড:** `ThemeContext.jsx` দ্বারা নিয়ন্ত্রিত Light (ice-blue `#EAF2FF` / `#F8FAFF`, Royal Blue `#1456D1`) এবং Dark মোড (`Navbar.jsx` `[data-testid="theme-toggle"]`)।
* **সম্পূর্ণ দ্বিভাষিক (`bn` / `en`) সাপোর্ট:** `LanguageContext.jsx` (`localStorage` + cookie + `<html lang>` সিঙ্ক) ফ্রন্টএন্ডের সকল ৩৯টি রুটে কার্যকর (`Navbar`, `Footer`, SSR পাবলিক ভিউ, ইনটেক ফর্ম `/complaints/new`, `/join-us`, `/contact`, সব Auth পেইজ, Citizen Portal, Admin Console ও Super Admin Console)।

---

## ৪. এনভায়রনমেন্ট কনফিগারেশন গাইড (`.env`)

প্রজেক্টের রুট ডিরেক্টরিতে `.env` ফাইলটি নিম্নোক্ত প্রধান কনফিগারেশন ধারণ করে:

| ভ্যারিয়েবল গ্রুপ | মূল কি (Keys) | বিবরণ |
| :--- | :--- | :--- |
| **সার্ভার ও ক্লায়েন্ট** | `NODE_ENV`, `PORT=5000`, `CLIENT_ORIGIN=http://localhost:3000`, `TRUST_PROXY`, `COOKIE_SAME_SITE` | সার্ভার, প্রক্সি ও ক্রস-অরিজিন CORS/Cookie পলিসি |
| **ডাটাবেজ** | `MONGODB_URI` | MongoDB Atlas কানেকশন স্ট্রিং |
| **JWT ও ক্রিপ্টো** | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `SESSION_SECRET` | প্রোডাকশনে `validateProductionSecrets()` দ্বারা বাধ্যতামূলক যাচাইকৃত সিক্রেট |
| **গুগল ও-অথ** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | গুগল সাইন-ইন ক্রেডেনশিয়াল |
| **গুগল ড্রাইভ** | `GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY`, `GOOGLE_DRIVE_ROOT_FOLDER_ID` | সার্ভিস অ্যাকাউন্ট ক্লাউড স্টোরেজ |
| **জিমেইল SMTP** | `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS` | লাইভ ইমেইল ডিসপ্যাচিং |
| **আপলোড ও রেট-লিমিট** | `MAX_UPLOAD_FILE_SIZE_MB`, `RATE_LIMIT_WHITELIST=127.0.0.1,::1,localhost` | আপলোড সীমা ও লোকাল আইপি হোয়াইটলিস্ট |

> **সতর্কতা:** `.env` ফাইলে কোনো পরিবর্তন আনলে তা কখনো গিটহাবে পুশ করবেন না (`.gitignore` এ ডিফাইন করা আছে)। শুধুমাত্র `.env.example` টেমপ্লেট হিসেবে শেয়ার করবেন।

---

## ৫. লোকাল পরিবেশে রান ও টেস্ট করার নির্দেশিকা (Commands Guide)

### ১. ডিপেন্ডেন্সি ইনস্টল
```bash
# রুট ও ওয়ার্কস্পেস ডিপেন্ডেন্সি
npm install

# অথবা আলাদাভাবে
npm install --prefix backend
npm install --prefix frontend
```

### ২. ডেভেলপমেন্ট ও প্রোডাকশন সার্ভার চালু করা
```bash
# ব্যাকএন্ড সার্ভার (পোর্ট 5000, Swagger UI: http://localhost:5000/api-docs)
npm run dev:backend
# অথবা প্রোডাকশন/ডাইরেক্ট স্টার্ট:
npm run start:backend

# ফ্রন্টএন্ড ডেভ সার্ভার (Next.js App Router, পোর্ট 3000)
npm run dev:frontend

# ফ্রন্টএন্ড প্রোডাকশন বিল্ড ও স্টার্ট (পোর্ট 3000)
npm run build:frontend
npm run start --prefix frontend
```
* **ওয়েবসাইট ব্রাউজ করুন:** `http://localhost:3000`
* **Swagger API ডকুমেন্টেশন:** `http://localhost:5000/api-docs`
* **ব্যাকএন্ড হেলথ চেক:** `http://localhost:5000/api/v1/health` এবং `/api/v1/health/ready`

### ৩. টেস্ট, লিন্ট ও বিল্ড ভেরিফিকেশন
```bash
# ব্যাকএন্ড অফলাইন ইউনিট/মডেল টেস্ট (MongoDB ছাড়াও রানযোগ্য)
node --test backend/tests/health.test.js backend/tests/models.test.js backend/tests/adminUserManagementUnit.test.js

# সম্পূর্ণ ব্যাকএন্ড টেস্ট স্যুইট (MongoDB সংযোগসহ)
npm run test:backend

# ব্যাকএন্ড ও ফ্রন্টএন্ড লিন্ট চেক
npm run lint

# ফ্রন্টএন্ড প্রোডাকশন বিল্ড
npm run build:frontend
```

---

## ৬. প্রগ্রেস ও কমিট হিস্ট্রি লগ (Engineering & Release Log)

### সাম্প্রতিক মাইলস্টোন (২৬ নভেম্বর ২০২৬)
1. **Phase 1 ও Section 2/3 সিকিউরিটি হার্ডেনিং (`ee8042b`, `c8c0b93`):**
   - ৫টি Critical ও ১৬টি High-severity ইস্যু ফিক্স এবং `npm audit` অনুযায়ী **০টি ডিপেন্ডেন্সি ভালনারেবিলিটি** নিশ্চিত (`docs/SECURITY-AUDIT.md`)।
2. **ইন্টারঅ্যাক্টিভ Swagger OpenAPI 3.0 ডকুমেন্টেশন (`52de673`):**
   - `backend/src/docs/swagger.js`-এ সকল রুট ডকুমেন্ট করে `/api-docs` ও `/api-docs.json` চালু।
3. **Next.js 14 হাইব্রিড SSR/CSR ফ্রন্টএন্ড ও সম্পূর্ণ SEO (`83bdd9a`):**
   - Swagger স্পেক অনুযায়ী Public, Auth, Citizen Portal, Admin এবং Super Admin-এর সব রাউট Next.js 14 App Router-এ নির্মিত (`frontend/next.config.mjs`-এ `/api/v1/*` প্রক্সি সহ)।
4. **Dreamhub-অনুপ্রাণিত UI রিডিজাইন ও Light/Dark থিম (`5ee803a`):**
   - ভিজ্যুয়াল আইডেন্টিটি আপগ্রেড, `frontend/public/images/hero-advocate.jpg` ও `mission-team.jpg` সংযুক্তি এবং থিম টগল।
5. **সম্পূর্ণ সাইটজুড়ে দ্বিভাষিক (`bn`/`en`) সাপোর্ট (`868df41`):**
   - SSR/CSR প্রতিটি পেইজে `LanguageContext` যুক্ত করে প্রোডাকশন বিল্ড (৩৯টি রুট), ৪০/৪০ লাইভ HTTP চেক ও ১৪/১৪ দ্বিভাষিক বান্ডল যাচাই সম্পন্ন।

### প্রয়োগকৃত সিকিউরিটি ফিক্সের সারাংশ (Section 2 & 3)

| ফাইল | পরিবর্তন | ক্যাটাগরি |
| :--- | :--- | :--- |
| `backend/src/config/env.js` | Production secrets validation (`validateProductionSecrets`), `TRUST_PROXY`, `COOKIE_SAME_SITE`, `MAX_UPLOAD_FILE_SIZE_MB` | P0 Hardening |
| `backend/src/config/auth.js` | Cross-origin SPA+API-এর জন্য `resolveCookieSameSite()` — OAuth cookie drop ঠিক | P0 Hardening |
| `backend/src/app.js` | `trust proxy` সেটআপ, `/api/v1/health/ready` DB readiness endpoint, `/api-docs` Swagger UI | P0 Hardening & Docs |
| `backend/src/server.js` | Startup-এ `validateProductionSecrets()` কল; Production-এ DB failure-এ `process.exit(1)` | P0 Hardening |
| `backend/src/utils/sanitize.js` | Prototype pollution keys (`__proto__`, `constructor`, `prototype`) ব্লক; `escapeRegex()` helper | P0 Security |
| `backend/src/utils/urlValidation.js` | IPv6 bracketed, IPv4-mapped IPv6, CGNAT, multicast, loopback ব্লক ও DNS rebinding check | P0 Security |

* **Section 2 (Critical 2.1–2.5):** Google Drive OAuth `SuperAdmin` + JWT `state` যাচাই, 2FA রিসেট বাইপাস ব্লক, মেসেজিং অংশগ্রহণকারী IDOR প্রতিরোধ, Join Us `scanStatus` ইনজেকশন ব্লক, সাসপেন্ড/ব্লক অ্যাডমিনের তাৎক্ষণিক সেশন বাতিল।
* **Section 3 (High 3.1–3.16):** Admin/SuperAdmin টোকেন রিফ্রেশ, `AuditLog` সর্টিং (`timestamp`), Priority/Publication/Notification ইনাম ও ফিল্টার সংশোধন, Withdrawal সিদ্ধান্ত ক্ষেত্র ঠিক, User প্রোফাইল ও পাসওয়ার্ড পরিবর্তনে সেশন বাতিল, Re-Auth `jti` রিপ্লে প্রতিরোধ, পাবলিক রিপোর্ট ডাটা লিকেজ ও `driveFileId` মাস্কিং, Validation এরর স্যানিটাইজেশন, Multipart NoSQL স্যানিটাইজার, IP-যুক্ত সেশন ফিঙ্গারপ্রিন্ট এবং `crypto.timingSafeEqual` CSRF যাচাই।

> বিস্তারিত সিকিউরিটি অডিট রিপোর্ট: [docs/SECURITY-AUDIT.md](./docs/SECURITY-AUDIT.md)

---

*ডকুমেন্টটি ভবিষ্যতের ডেভেলপার ও কোলাবোরেটরদের জন্য প্রস্তুতকৃত।*
