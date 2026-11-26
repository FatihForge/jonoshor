# জনস্বর (JonoShor) — বর্তমান প্রজেক্ট অবস্থা ও বিস্তারিত ডকুমেন্টেশন (Current Project Status)

> **সর্বশেষ নিরীক্ষা ও আপডেট:** ৭ অক্টোবর ২০২৬  
> **বর্তমান অবস্থা:** সম্পূর্ণ সক্রিয় ও প্রস্তুত (Active, Fully Integrated & Tested)  
> **টেস্ট কভারেজ:** ২২৪/২২৪ পাস (২১টি টেস্ট স্যুইট)  
> **কোড কোয়ালিটি:** ব্যাকএন্ড ও ফ্রন্টএন্ড লিন্ট ০ এরর, ফ্রন্টএন্ড বিল্ড সফল  

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
       ▼ (Hash-based SPA Router / REST API Calls / CSRF Cookie)
[ ফ্রন্টএন্ড: Vite + Vanilla JS + Tailwind CSS (Port 5173) ]
       │
       ▼ (HttpOnly JWT Cookies / Proxy Endpoints)
[ ব্যাকএন্ড: Express.js + Node.js ESM (Port 5000) ]
       ├── [ অথেনটিকেশন ও সিকিউরিটি ]: Argon2id, JWT, TOTP 2FA, Helmet, CSRF, Rate-Limit
       ├── [ মেইল সার্ভিস ]: Nodemailer + Gmail App Password (Live SMTP Dispatcher)
       ├── [ ক্লাউড স্টোরেজ ]: Google Drive API (Quarantine ➔ Clean ➔ Public Workflow)
       └── [ ডাটাবেজ ]: MongoDB Atlas (Mongoose ODM, DNS Fallback Resolver)
```

| স্তর (Layer) | ব্যবহৃত প্রযুক্তি (Technologies) | বিবরণ |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS, Vanilla JavaScript (ES6 Modules), Vite | কাস্টম কম্পোনেন্ট আর্কিটেকচার, হ্যাশ রাউটার (`#/`), সম্পূর্ণ ডার্ক মোড ডিজাইন, জিরো থার্ড-পার্টি ট্র্যাকার |
| **Backend** | Node.js (ESM), Express.js | লেয়ার্ড আর্কিটেকচার (Routes ➔ Middlewares ➔ Controllers ➔ Services ➔ Repositories ➔ Models) |
| **Database** | MongoDB Atlas, Mongoose | ২১টি সংজ্ঞায়িত ও ইনডেক্সড স্কিমা কালেকশন |
| **Storage** | Google Drive API (Service Account) | কোয়ারেন্টাইন, ক্লিন ও পাবলিক ফোল্ডারের মাধ্যমে ফাইল লাইফসাইকেল |
| **Email Service**| Nodemailer SMTP | জিমেইল অ্যাপ পাসওয়ার্ডের মাধ্যমে লাইভ ওটিপি ও ভেরিফিকেশন মেইল |
| **Security** | Argon2id, speakeasy, crypto | আধুনিক পাসওয়ার্ড হ্যাশিং, TOTP 2FA, টাইম-লকড রিস্টোরেশন |

---

## ৩. মডিউল ভিত্তিক বাস্তবায়ন ও বর্তমান অবস্থা (Module Implementation Status)

### মডিউল ১: অথেনটিকেশন ও অ্যাকাউন্ট সিকিউরিটি (Authentication & Security)
* **রেজিস্ট্রেশন (Local Registration):** নাম, ইমেইল ও পাসওয়ার্ড (৮+ অক্ষর) দিয়ে অ্যাকাউন্ট তৈরি।
* **ডিসপোজেবল মেইল ব্লকার:** অস্থায়ী/টেম্পোরারি মেইল (`mailinator`, `tempmail`, `10minutemail`, ইত্যাদি) স্বয়ংক্রিয়ভাবে ব্লক করা হয়।
* **লাইভ ইমেইল ভেরিফিকেশন:** রেজিস্ট্রেশনের পর জিমেইল SMTP এর মাধ্যমে স্বয়ংক্রিয়ভাবে ৬ সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়। ইমেইল ভেরিফাই না হওয়া পর্যন্ত লগইন সুরক্ষিতভাবে বন্ধ (৪০৩ `EMAIL_NOT_VERIFIED`) থাকে। ফ্রন্টএন্ডে `#/verify-email` পেজে রিসেন্ড ও যাচাইয়ের সুবিধা রয়েছে।
* **লগইন ও সেশন:** নিরাপদ HttpOnly `access_token` ও `refresh_token` কুকি এবং Bearer টোকেন সাপোর্ট।
* **পাসওয়ার্ড রিকভারি:** Forgot Password ➔ ক্রিপ্টোগ্রাফিক টাইম-বাউন্ড টোকেন ইমেইলে প্রেরণ ➔ Reset Password।
* **গুগল ও-অথ ২.০ (Google OAuth):** গুগল অ্যাকাউন্টের মাধ্যমে সরাসরি সাইন-ইন। পূর্বের ভেরিফাইড লোকাল অ্যাকাউন্টের সাথে স্বয়ংক্রিয়ভাবে মার্জ/লিংক হয়।
* **অ্যাডমিন ২-এফ-এ (2FA TOTP):** অ্যাডমিন ও সুপার অ্যাডমিনদের জন্য বাধ্যতামূলক TOTP ভেরিফিকেশন এবং ব্যাকআপ কোড।
* **CSRF সুরক্ষা ও অটো-হিলিং:** স্টেট-চেঞ্জিং মিউটেশনে CSRF টোকেন ভ্যালিডেশন। টোকেন মিসিং বা ইনভ্যালিড হলে ফ্রন্টএন্ড স্বয়ংক্রিয়ভাবে নতুন টোকেন সংগ্রহ করে রিকোয়েস্ট রি-ট্রাই করে।
* **রেট-লিমিট ও আইপি হোয়াইটলিস্ট:** ব্রুটফোর্স আক্রমণ প্রতিরোধের পাশাপাশি ডেভেলপারদের টেস্টের সুবিধার্থে `localhost` এবং লোকাল নেটওয়ার্ক আইপি হোয়াইটলিস্টেড।

### মডিউল ২: অভিযোগ দাখিল ইঞ্জিন (Complaint Submission Engine)
* **নন-ইউজার বনাম রেজিস্টার্ড ইউজার:** অ্যাকাউন্ট ছাড়াও যেকোনো সাধারণ নাগরিক অভিযোগ দাখিল করতে পারেন (সর্বোচ্চ ৫টি পর্যন্ত)। ৫টির পর অ্যাকাউন্ট তৈরি বাধ্যতামূলক।
* **খসড়া সংরক্ষণ (Drafts):** লগইনকৃত ব্যবহারকারীরা অসম্পূর্ণ অভিযোগ খসড়া হিসেবে সেভ করতে পারেন এবং পরবর্তীতে তা এডিট বা সাবমিট করতে পারেন।
* **বাংলাদেশ ভৌগোলিক স্তরবিন্যাস:** ৮টি বিভাগ ➔ ৬৪টি জেলা ➔ উপজেলা ভিত্তিক ডাইনামিক ক্যাস্কেডিং ড্রপডাউন সিলেক্টর।
* **বিস্তারিত ইনপুট:** ঘটনার তারিখ, যথার্থতা (Exact, Approximate, Range, Ongoing), ক্যাটাগরি, অভিযুক্তের তথ্য এবং প্রভাবের বর্ণনা।

### মডিউল ৩: প্রমাণাদি ও ক্লাউড স্টোরেজ (Evidence & Cloud Storage)
* **মাল্টি-স্টেজ লাইফসাইকেল:** ক্লায়েন্ট আপলোড সেশন ➔ গুগল ড্রাইভের `Quarantine` ফোল্ডারে জমা ➔ স্বয়ংক্রিয় অ্যান্টিভাইরাস/ম্যালওয়্যার স্ক্যান ➔ সফল হলে `Clean` ফোল্ডারে স্থানান্তর।
* **প্রাইভেট প্রক্সি স্ট্রিমিং:** গুগল ড্রাইভের সরাসরি ফাইল ইউআরএল ব্যবহারকারীদের দেখানো হয় না; ব্যাকএন্ড অথেন্টিকেটেড প্রক্সি (`/api/v1/user/complaints/:id/evidence/:evId/download`) দিয়ে ফাইল স্ট্রিম করে।
* **IDOR সুরক্ষা:** কেবলমাত্র অভিযোগের মূল মালিক এবং অনুমোদিত অ্যাডমিনরা প্রমাণাদি দেখতে বা ডাউনলোড করতে পারেন।

### মডিউল ৪: অ্যাডমিন রিভিউ ও ভেরিফিকেশন (Admin Verification Pipeline)
* **কেস কিউ ও অ্যাসাইনমেন্ট:** সুপার অ্যাডমিন বা লিড অ্যাডমিন পর্যালোচকদের অভিযোগ বরাদ্দ করতে পারেন।
* **স্বার্থের সংঘাত (Conflict of Interest):** কোনো পর্যালোচকের ব্যক্তিগত স্বার্থের সংঘাত থাকলে তিনি COI ডিক্লেয়ার করতে পারেন, ফলে অভিযোগটি তাৎক্ষণিকভাবে কিউতে ফিরে যায় এবং অন্য স্বাধীন পর্যবেক্ষককে দেওয়া হয়।
* **স্ট্যাটাস ট্রানজিশন:** `submitted` ➔ `under_review` ➔ `verified` / `rejected`।
* **প্রমাণাদি পর্যালোচনা ও রেডঅ্যাকশন:** প্রমাণের বৈধতা যাচাই ও ভিকটিমের তথ্য জনস্বার্থে ব্লার/রেডঅ্যাক্ট করা।
* **পাবলিক রিপোর্ট অনুমোদন:** চূড়ান্ত যাচাই সম্পন্ন হলে জনস্বার্থে উন্মুক্ত করার জন্য পাবলিক রিপোর্টে রূপান্তর।

### মডিউল ৫: সুপার অ্যাডমিন গভর্ন্যান্স (Super Admin Platform Governance)
* **রুট কনসোল ও RBAC:** প্ল্যাটফর্মের পূর্ণ নির্বাহী ক্ষমতা (Role-Based Access Control)।
* **অ্যাডমিন ব্যবস্থাপনা:** নতুন অ্যাডমিন অনবোর্ডিং, পারমিশন নির্ধারণ এবং স্ট্যাটাস পরিবর্তন (Active/Suspended)।
* **আর্থিক ও সিস্টেম সেটিংস:** সংবেদনশীল কনফিগারেশন পরিবর্তনের জন্য স্বল্পমেয়াদী রি-অথেনটিকেশন টোকেন (`Re-Auth`) বাধ্যতামূলক।
* **অপরিবর্তনযোগ্য অডিট লগ (Audit Log):** প্রশাসনিক প্রতিটি অ্যাকশন ডাটাবেজে পার্মানেন্ট টাইমস্ট্যাম্প সহ সংরক্ষিত থাকে।

### মডিউল ৬: ব্যবহারকারীর অ্যাকাউন্ট পোর্টাল (User Account Experience)
* **ড্যাশবোর্ড (`#/user/dashboard`):** ব্যবহারকারীর জমাকৃত অভিযোগের তালিকা ও লাইভ স্ট্যাটাস।
* **আইনি আপডেট ও সংশোধন:** মামলার আইনি অগ্রগতি নোটিশ যুক্ত করা এবং সর্বোচ্চ ৩ বার তথ্য সংশোধনের আবেদন।
* **প্রত্যাহার অধিকার (Withdrawal):** উপযুক্ত কারণ দর্শিয়ে অভিযোগ প্রত্যাহারের আবেদন।
* **নোটিফিকেশন ও নিরাপদ মেসেজিং (`#/user/messages`):** অ্যাডমিনের সাথে দ্বিমুখী অপরিবর্তনযোগ্য (Immutable) থ্রেডেড বার্তা বিনিময়।
* **প্রোফাইল ও সিকিউরিটি (`#/user/profile`):** নাম, মোবাইল ও পাসওয়ার্ড পরিবর্তন।

### মডিউল ৭: পাবলিক পোর্টাল ও তথ্যমূলক পেজ (Public Directory & CMS)
* **রিপোর্ট ডিরেক্টরি (`#/reports`):** ফিল্টারিং (ক্যাটাগরি, জেলা, উপজেলা, মামলার অবস্থা, কি-ওয়ার্ড) সহ অনুমোদিত পাবলিক রিপোর্ট তালিকা।
* **দ্বিভাষিক বিস্তারিত ভিউ (`#/reports/:id`):** বাংলা এবং ইংরেজি ভাষায় রিপোর্ট পড়ার সুযোগ।
* **লাইভ পরিসংখ্যান (`/api/v1/public/statistics`):** মঙ্গোডিবি থেকে ডায়নামিক ক্যালকুলেটেড ডাটা।
* **স্বেচ্ছাসেবক প্ল্যাটফর্ম (`#/join-us`):** আইনজীবক, সাংবাদিক, ডাক্তার বা সাধারণ নাগরিকদের যুক্ত হওয়ার আবেদন পোর্টাল।
* **তথ্যমূলক পেজসমূহ:**
  * `#/about` & `#/mission`: প্ল্যাটফর্মের লক্ষ্য ও উদ্দেশ্য।
  * `#/how-it-works`: ৫-ধাপের কাজের পদ্ধতি।
  * `#/privacy`, `#/safety`, `#/terms`: তথ্যের নিরাপত্তা, সুরক্ষা ও ব্যবহারের নীতিমালা।

---

## ৪. এনভায়রনমেন্ট কনফিগারেশন গাইড (`.env`)

প্রজেক্টের রুট ডিরেক্টরিতে `.env` ফাইলটি নিম্নোক্ত প্রধান কনফিগারেশন ধারণ করে:

| ভ্যারিয়েবল গ্রুপ | মূল কি (Keys) | বিবরণ |
| :--- | :--- | :--- |
| **সার্ভার ও ক্লায়েন্ট** | `NODE_ENV`, `PORT=5000`, `CLIENT_ORIGIN=http://localhost:5173` | সার্ভার ও CORS পলিসি |
| **ডাটাবেজ** | `MONGODB_URI` | MongoDB Atlas কানেকশন স্ট্রিং |
| **JWT ও ক্রিপ্টো** | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `SESSION_SECRET` | টোকেন সাইনিং ও সেশন কি |
| **গুগল ও-অথ** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | গুগল সাইন-ইন ক্রেডেনশিয়াল |
| **গুগল ড্রাইভ** | `GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY`, `GOOGLE_DRIVE_ROOT_FOLDER_ID` | সার্ভিস অ্যাকাউন্ট ক্লাউড স্টোরেজ |
| **জিমেইল SMTP** | `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS` | লাইভ ইমেইল ডিসপ্যাচিং (জিমেইল অ্যাপ পাসওয়ার্ড) |
| **হোয়াইটলিস্ট** | `RATE_LIMIT_WHITELIST=127.0.0.1,::1,localhost` | লোকাল ডেভেলপমেন্ট আইপি হোয়াইটলিস্টিং |

> **সতর্কতা:** `.env` ফাইলে কোনো পরিবর্তন আনলে তা কখনো গিটহাবে পুশ করবেন না (`.gitignore` এ ডিফাইন করা আছে)। শুধুমাত্র `.env.example` টেমপ্লেট হিসেবে শেয়ার করবেন।

---

## ৫. লোকাল পরিবেশে রান ও টেস্ট করার নির্দেশিকা (Commands Guide)

### ১. ডিপেন্ডেন্সি ইনস্টল
```bash
# ব্যাকএন্ড ও রুট ডিপেন্ডেন্সি
npm install

# ফ্রন্টএন্ড ডিপেন্ডেন্সি
cd frontend && npm install && cd ..
```

### ২. ডেভেলপমেন্ট সার্ভার চালু করা
```bash
# ব্যাকএন্ড সার্ভার (Nodemon সহ, পোর্ট 5000)
npm run dev

# ফ্রন্টএন্ড সার্ভার (Vite dev server, পোর্ট 5173)
npm run dev --prefix frontend
```
* **ওয়েবসাইট ব্রাউজ করুন:** `http://localhost:5173`
* **ব্যাকএন্ড হেলথ চেক:** `http://localhost:5000/api/v1/health`

### ৩. টেস্ট স্যুইট রান করা (Full Verification)
```bash
# ব্যাকএন্ডের সকল ২২৪টি অটোমেটেড ইন্টিগ্রেশন ও সিকিউরিটি টেস্ট রান করা
npm test --prefix backend
```

### ৪. লিন্টার ও কোড কোয়ালিটি চেক
```bash
# ব্যাকএন্ড লিন্ট চেক
npm run lint --prefix backend

# ফ্রন্টএন্ড লিন্ট চেক
npm run lint --prefix frontend
```

### ৫. প্রোডাকশন বিল্ড ভেরিফিকেশন
```bash
# ফ্রন্টএন্ড প্রোডাকশন বিল্ড
npm run build --prefix frontend
```

---

## ৬. গুরুত্বপূর্ণ রুলস ও কনভেনশন (Rules for Next Developers/Agents)

1. **ডকুমেন্টেশনই চূড়ান্ত সত্য (Source of Truth):**
   * `docs/PRD.md`, `docs/API-SPECIFICATION.md`, `docs/SECURITY.md`, `docs/FRONTEND-ARCHITECTURE.md` ও `docs/DATABASE-SCHEMA.md` অনুসরণ করতে হবে।
   * ডকুমেন্টে অনুমোদিত নয় এমন কোনো নতুন ফিল্ড, কালেকশন বা রোল নিজে থেকে তৈরি করা নিষিদ্ধ।
2. **ফেসবুক লগইন স্থগিত:**
   * ফেসবুক লগইন ইচ্ছা করেই পরবর্তী ফেজের জন্য স্থগিত রাখা হয়েছে। এটি এখন যুক্ত করবেন না।
3. **গুগল ও-অথ ও ড্রাইভের পৃথকীকরণ:**
   * গুগল ড্রাইভ সার্ভিস অ্যাকাউন্টের ক্রিডেনশিয়াল এবং সাধারণ ব্যবহারকারীর গুগল ও-অথ সম্পূর্ণ পৃথক স্কোপে পরিচালিত।
4. **টেস্টের ধারাবাহিকতা:**
   * কোনো কোড পরিবর্তন করার পর অবশ্যই `npm test --prefix backend` এবং `npm run lint` চালিয়ে নিশ্চিত করতে হবে যে পূর্বের কোনো কার্যকারিতা নষ্ট হয়নি।

---

---

## ৭. সিকিউরিটি অডিট ও হার্ডেনিং লগ (Security Audit & Hardening Log)

### Phase 1 Security Audit — ২৬ নভেম্বর ২০২৬

প্রজেক্টের পূর্ণাঙ্গ ব্যাকএন্ড সিকিউরিটি অডিট পরিচালিত হয়েছে। বিস্তারিত ফাইন্ডিংস ও প্রতিটি ইস্যুর বর্ণনা docs/SECURITY-AUDIT.md ফাইলে সংরক্ষিত আছে।

#### প্রয়োগকৃত সিকিউরিটি ফিক্স (Applied Fixes)

| ফাইল | পরিবর্তন | ক্যাটাগরি |
| :--- | :--- | :--- |
| ackend/src/config/env.js | Production secrets validation (alidateProductionSecrets), নতুন ENV keys: TRUST_PROXY, COOKIE_SAME_SITE, MAX_UPLOAD_FILE_SIZE_MB | P0 Hardening |
| ackend/src/config/auth.js | Cross-origin SPA+API-র জন্য esolveCookieSameSite() — OAuth cookie drop ঠিক | P0 Hardening |
| ackend/src/app.js | 	rust proxy সঠিকভাবে set, /api/v1/health/ready DB readiness endpoint যোগ | P0 Hardening |
| ackend/src/server.js | Startup-এ alidateProductionSecrets() call; Production-এ DB failure-এ process.exit(1) | P0 Hardening |
| ackend/src/utils/sanitize.js | Prototype pollution keys (__proto__, constructor, prototype) ব্লক; escapeRegex() helper | P0 Security |
| ackend/src/utils/urlValidation.js | IPv6 bracketed form, IPv4-mapped IPv6, CGNAT, multicast, loopback সব ব্লক; DNS rebinding check; credentials-in-URL block | P0 Security |

#### চিহ্নিত কিন্তু পরবর্তী ফেজে ফিক্স করতে হবে

নিচের ইস্যুগুলো অডিটে চিহ্নিত হয়েছে এবং docs/SECURITY-AUDIT.md-এ বিস্তারিত বর্ণনা আছে। এগুলো পরবর্তী স্প্রিন্টে ঠিক করতে হবে:

- **[CRITICAL]** Google Drive OAuth state bypass (Section 2.1) — সব env-এ equireSuperAdmin enforce করতে হবে
- **[CRITICAL]** 2FA Setup Bypass — 	woFactorEnabled চেক ছাড়া 2FA secret overwrite হয় (Section 2.2)
- **[CRITICAL]** Messaging IDOR — conversation participant verification নেই (Section 2.3)
- **[HIGH]** Admin/SuperAdmin token refresh সবসময় 401 — শুধু User লুকআপ করে (Section 3.1)
- **[HIGH]** AuditLog sort field mismatch — createdAt এর বদলে 	imestamp (Section 3.2)
- **[HIGH]** Publication status enum bug — 'rejected' invalid; 'withheld' হওয়া উচিত (Section 3.4)
- **[HIGH]** Validation error value echo — rejected password response-এ ফিরে আসে (Section 3.14)
- **[MEDIUM]** Auth middleware accountStatus check নেই — suspended account JWT দিয়ে access পায় (Section 2.5)
- **[MEDIUM]** CSRF timing-safe comparison নেই — timing attack সম্ভব (Section 3.17)

> বিস্তারিত: [docs/SECURITY-AUDIT.md](./docs/SECURITY-AUDIT.md)
*ডকুমেন্টটি ভবিষ্যতের ডেভেলপার ও কোলাবোরেটরদের জন্য প্রস্তুতকৃত।*
