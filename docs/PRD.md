# JonoShor

## Frozen Product Requirements Document — v1.0

---

# 1. Product Vision

বাংলাদেশের সাধারণ মানুষের অভিযোগ, নির্যাতন, অধিকার লঙ্ঘন এবং সংশ্লিষ্ট ঘটনাগুলোকে নিরাপদ, structured এবং responsible উপায়ে document, review এবং public information হিসেবে উপস্থাপন করা।

মূল দর্শন:

> **Document. Verify. Protect. Inform.**

Platform কোনো:

* আদালত নয়
* পুলিশ/আইন-শৃঙ্খলা বাহিনীর বিকল্প নয়
* vigilante বা mob-justice platform নয়
* harassment/doxxing platform নয়
* রাজনৈতিক propaganda platform নয়

মূল distinction:

> **অভিযোগ ≠ প্রমাণিত অপরাধ**
> **Verified Report ≠ Legal Outcome**

---

# 2. Reportable Issues

Platform-এ নিম্ন ধরনের serious complaints/report গ্রহণ করা যাবে:

* চাঁদাবাজি
* দখলদারি
* অপহরণ
* নির্যাতন
* ধর্ষণ/যৌন সহিংসতা
* শারীরিক হামলা
* হুমকি
* জোরপূর্বক গুম
* হেফাজতে নির্যাতন
* অবৈধ আটক
* রাজনৈতিক সহিংসতা
* mob violence
* property abuse
* অন্যান্য গুরুতর human-rights violation

---

# 3. Core Account Types

তিনটি প্রধান account type:

### User

সাধারণ registered platform user।

### Admin

Complaint review, verification, evidence, publication, users এবং operational management পরিচালনা করে।

### Super Admin

Highest-privilege account। Admin management, critical security/system configuration এবং financial configuration পরিচালনা করে।

Reporter account type নয়; Reporter একটি আলাদা identity concept।

---

# 4. Reporter Architecture

একজন Reporter:

* registered User হতে পারে
* account ছাড়াই complaint submit করতে পারে

প্রতিটি Reporter-এর একটি persistent private `Reporter ID` থাকবে।

Reporter ID:

* public হবে না
* অন্য users দেখতে পারবে না
* public report-এ থাকবে না

যদি একজন non-user complaint করার পরে account তৈরি করে, তার existing Reporter ID account-এর সঙ্গে link হবে।

নতুন Reporter ID তৈরি হবে না।

---

# 5. Anonymous / Non-User Complaints

Account ছাড়াই complaint করা যাবে।

Non-user Reporter সর্বোচ্চ **৫টি complaint** submit করতে পারবে।

৫টি complaint-এর পর নতুন complaint submit করতে হলে account তৈরি/login করতে হবে।

Non-user:

* নিজের complaint account ছাড়া দেখতে/track করতে পারবে না
* tracking-এর জন্য login/account creation প্রয়োজন
* provided contact information-এর মাধ্যমে communication পেতে পারে

Limit enforcement শুধু IP-এর ওপর নির্ভর করবে না।

ব্যবহৃত security signals:

* IP
* browser/session signals
* security signals
* অন্যান্য reasonably available abuse-prevention data

Browser data clear/incognito ব্যবহার করে system identity completely prevent করার দাবি করবে না।

---

# 6. Submission Metadata

Submission-এর সময় technically এবং legally appropriate available metadata সংগ্রহ করা যেতে পারে:

* IP
* approximate IP-derived area
* timestamp
* User-Agent
* browser/OS
* language information
* session/security identifiers
* account ID, যদি থাকে
* anonymous submission information
* evidence upload timestamps
* submission source
* security signals

এগুলো:

* public নয়
* normal User-এর জন্য accessible নয়
* privileged access-এর অধীনে থাকবে
* security/audit purpose-এ ব্যবহৃত হবে
* policy অনুযায়ী retained হবে

একই device থেকে identical metadata অপ্রয়োজনীয়ভাবে বারবার store করা হবে না।

---

# 7. Complaint Identity

MongoDB-এর built-in `_id` complaint-এর internal database identity হিসেবে থাকবে।

অপ্রয়োজনীয়ভাবে আলাদা duplicate database identifier তৈরি করা হবে না।

Public-facing report-এর জন্য প্রয়োজন হলে আলাদা public reference ব্যবহার করা যেতে পারে, কিন্তু সেটি internal complaint identity-এর replacement নয় এবং অপ্রয়োজনীয়ভাবে complaint-এর duplicate ID হিসেবে ব্যবহার করা হবে না।

---

# 8. Complaint Categories

প্রতিটি complaint-এর:

* একটি Primary Category
* Optional Secondary Categories

থাকবে।

---

# 9. Incident Information

Complaint form structured field এবং free-text—দুই ধরনের হবে।

Reporter নিজের ভাষায় ঘটনা লিখতে পারবে।

Incident date support করবে:

* exact date
* approximate date
* date range
* unknown date
* ongoing incident

UI-তে calendar-based date selection থাকবে।

---

# 10. Location

Bangladesh-wide location hierarchy:

**Division → District → Upazila/Thana → Free-text location**

সব Bangladesh division, district এবং upazila/thana searchable হবে।

Location names:

* Bangla
* English

দুই ভাষায় থাকবে।

---

# 11. Accused

একটি complaint-এ একাধিক accused থাকতে পারে।

প্রাসঙ্গিক accused information:

* Name
* Alias
* Father's name
* Profession
* Role
* Organization
* Location
* Mobile/contact information
* Facebook/social identifier
* অন্যান্য relevant identifier

প্রতিটি তথ্যের public visibility controlled হবে।

Complaint-এর ভিত্তিতে কাউকে অযথা “criminal” বা “offender” হিসেবে উপস্থাপন করা যাবে না।

---

# 12. Victims

Reporter এবং Victim আলাদা entity।

একাধিক victim থাকতে পারে।

Victim information defaultভাবে protected থাকবে।

বিশেষ protection:

* Minor
* Sexual violence victim
* Sensitive/vulnerable person

Verification-এর সময় visibility নির্ধারণ করা হবে এবং publication-এর পরেও পরিস্থিতি অনুযায়ী পরিবর্তন করা যাবে।

---

# 13. Reporter Contact Requirement

Complaint anonymous হতে পারলেও অন্তত একটি valid contact method required:

* Mobile অথবা
* Email

Email ব্যবহার করলে valid email required।

Fake/disposable/invalid email গ্রহণ করা হবে না।

Evidence optional হলেও contact requirement থাকবে।

---

# 14. Evidence

Evidence optional।

Supported types:

* Image
* PDF
* Video
* Audio
* Document
* External link

External evidence link ব্যবহার করা যাবে, যেমন:

* Google Drive
* Facebook
* অন্যান্য external source

External link automatically verified/trusted হবে না।

---

# 15. Evidence Storage

Evidence upload architecture:

**Client → Upload Session → Direct/Resumable GCS Upload → Quarantine → Malware Scan → Private Permanent Storage**

Google Cloud Storage-এ evidence file থাকবে।

MongoDB-তে evidence metadata থাকবে।

Permanent raw public file URL database-এ রাখা হবে না।

Private evidence access-এর জন্য authorization এবং short-lived signed URL ব্যবহার করা হবে।

Planned total storage:

**5 TB**

Provider/infrastructure limitation প্রযোজ্য হবে; arbitrary ছোট fixed file-size/count restriction architecture-এর মূল requirement নয়।

---

# 16. Evidence Security

Evidence metadata-এর মধ্যে relevant integrity information রাখা হবে, যেমন:

* original filename
* MIME type
* size
* upload timestamp
* uploader
* SHA-256
* malware scan status
* review status

Upload করা মানেই evidence authentic/proven নয়।

Malware scanner failure হলে unscanned file trusted হিসেবে গ্রহণ করা যাবে না।

Malicious file reject/quarantine/delete করা যেতে পারে; পুরো complaint automatically delete করা হবে না।

Evidence deletion-এর জন্য:

* authorized actor
* reason
* timestamp
* audit record

প্রয়োজন।

Legal hold থাকলে deletion block করা যাবে।

---

# 17. Public Evidence

Evidence defaultভাবে private।

Authorized Admin/Reviewer evidence review করার পর public করার সিদ্ধান্ত নিতে পারবে।

Highly sensitive evidence:

* পুরোটা public নাও হতে পারে
* sensitive অংশ redact করা যেতে পারে
* safe public version তৈরি করা যেতে পারে

Approved public evidence:

* login ছাড়াই দেখা যাবে
* যে কেউ দেখতে পারবে

**Public evidence কে দেখেছে তা track করা হবে না।**

তবে evidence public করার approval কোন authorized actor দিয়েছে তা audit trail-এ থাকবে।

---

# 18. Complaint Workflow

Primary workflow:

**Draft → Submitted → Screening → Evidence Review → Verification → Authority Referral → Public Disclosure Review → Published/Withheld → Resolved/Closed**

Additional states:

* Rejected
* Needs More Information
* Withdrawn
* Suspended
* Archived

Verification এবং Public Disclosure Review একই authorized Reviewer/Admin-এর workflow-এর মধ্যে সম্পন্ন হতে পারে।

অপ্রয়োজনীয় approval bureaucracy তৈরি করা হবে না।

---

# 19. Verification

Verification করতে পারবে:

* Assigned Reviewer/Verifier
* Authorized Admin

Verification বিবেচনা করবে:

* Complaint details
* Available evidence
* Corroboration
* Consistency
* Available reliable proof

AI verification-এর final decision নিতে পারবে না।

Final human review required।

Court conviction না থাকলেও platform-এর verification process-এর ভিত্তিতে public report প্রকাশ করা যেতে পারে।

---

# 20. Status Model

একটি single accused label ব্যবহার করা হবে না।

তিনটি আলাদা বিষয়:

### Platform Verification Status

Platform-এর review outcome।

### Legal/Procedural Status

আইনগত process কোথায় আছে।

### Legal Outcome

Court বা relevant authority-এর outcome।

Reliable official/legal source থাকলে conviction প্রকাশ করা যাবে।

---

# 21. Public Report

কোনো complaint automatically public হবে না।

Internal complaint এবং Public Report আলাদা representation।

Public Report শুধুমাত্র approved/public-safe data থেকে তৈরি হবে।

Public Report-এ থাকতে পারে:

* Public report reference
* Incident category
* General location
* Incident date/range
* Public summary
* Verification status
* Evidence status
* Approved accused information
* Authority action
* Legal status
* Legal outcome
* Approved evidence

Internal/private information public report-এ automatically যাবে না।

---

# 22. Public Report Language

Public report-এর Bangla version:

* সহজ
* natural
* সাধারণ মানুষের বোঝার মতো
* robotic database output নয়

English version:

* সম্পূর্ণ English
* independently understandable
* foreign NGO/researcher/international organization-এর জন্য উপযোগী

AI translation/summarization assist করতে পারবে।

Important legal/human-rights information publication-এর আগে human review required।

---

# 23. Public ↔ User Information Consistency

**Public page-এ যে approved/public information থাকবে, User page-এও সেই একই public information accessible থাকবে।**

অর্থাৎ registered User হওয়ার কারণে public information কমানো বা আলাদা করা যাবে না।

উদাহরণ:

* Public Reports → User দেখতে পারবে
* Public Report Details → User দেখতে পারবে
* Public Evidence → User দেখতে পারবে
* Public Statistics → User একইভাবে দেখতে পারবে
* Public announcements/content → User দেখতে পারবে

User account-এর কারণে অতিরিক্ত private information পাওয়া যেতে পারে, যেমন:

* My Complaints
* Complaint status
* Messages
* Notifications
* ব্যক্তিগত submission information

কিন্তু public information-এর source এবং approved content একই থাকবে।

---

# 24. Public Complaint Statistics

Public dashboard-এ:

* Total complaints submitted
* Verified reports
* Category breakdown
* District breakdown
* Time trends
* Legal status breakdown
* Authority action statistics

দেখানো যাবে।

Total submitted complaint count historical count হিসেবে থাকবে।

Complaint withdrawn/deleted হলেও total submitted count কমবে না।

Sensitive individual-level information aggregate statistics-এ প্রকাশ করা যাবে না।

---

# 25. Search & Filtering

Public Reports search/filter:

* Incident type
* District
* Upazila
* Date
* Verification status
* Legal status
* Keyword

---

# 26. Withdrawal

Reporter withdrawal request করতে পারবে।

Workflow:

**Withdrawal Request → Review → Withdrawn**

Automatic permanent deletion হবে না।

Legal, audit এবং retention requirements অনুযায়ী records retained থাকবে।

---

# 27. Correction

Reporter সর্বোচ্চ **৩ বার correction request** করতে পারবে।

Workflow:

**Correction Request → Internal Review → Evidence Review → Approved Update**

Public correction history দেখানো হবে না।

Approved correction-এর পর public report silently update হতে পারে।

Internal history/audit থাকবে।

Problematic অংশ বাদ দিয়ে safe অংশ publish করা যেতে পারে।

Paid removal থাকবে না।

---

# 28. Duplicate Complaints

System related/duplicate complaints detect করতে পারে।

Reviewer final decision নেবে:

* Duplicate
* Related
* Separate
* Link/Merge

AI এখানে assistance দিতে পারবে, final decision নয়।

---

# 29. Risk & Sensitivity

Reporter priority/sensitivity নিজের ইচ্ছায় set করবে না।

System complaint details/evidence/available proof অনুযায়ী:

* Priority
* Sensitivity

determine করতে সাহায্য করবে।

Admin final review করবে।

Internal risk flags:

* Spam suspected
* Duplicate suspected
* Malicious content
* Urgent safety
* High-risk victim
* Legal sensitivity

---

# 30. Legal Cases

এক complaint-এর multiple legal cases থাকতে পারে।

একাধিক:

* Police matter
* Court case
* Government/legal authority case

track করা যাবে।

Multiple courts support থাকবে।

Case number optional।

Legal timeline/history retained থাকবে।

Current এবং historical legal outcome দুটোই দেখানো যাবে।

“No legal case” এবং “Unknown” আলাদা status।

---

# 31. Authority Actions

Authority action structuredভাবে record করা হবে।

Authorities হতে পারে:

* Police
* Court
* Government authority
* Other relevant legal authority

Public version সাধারণ মানুষের বোঝার মতো summary হবে।

Reporter কোনো update দিলে তা automatically public হবে না।

Workflow:

**Reporter Update → Authorized Review → Approved Public Update**

Reporter “accused arrested” বললে তা pending verification হিসেবে থাকবে যতক্ষণ reliable source/review না হয়।

Official source/reference ব্যবহার করা হবে যেখানে applicable।

---

# 32. Legal Documents

Legal documents defaultভাবে private।

Public disclosure-এর জন্য separate approval লাগবে।

Sensitive portions:

* redact
* hide
* omit

করা যেতে পারে।

---

# 33. User Dashboard

User area:

* Dashboard
* My Complaints
* Complaint Status
* Review Timeline
* Evidence
* Requests for More Information
* Notifications
* Messages
* Profile
* Security Settings

Internal reviewer notes automatically visible নয়।

Admin policy অনুযায়ী user কোন information দেখতে পারবে তা নির্ধারণ করবে।

---

# 34. Session Policy

**User নিজের active sessions দেখতে পারবে না।**

Session/security management backend-এর privileged security functionality হিসেবে থাকবে।

Privileged user session revoke করার capability authorized Admin-এর থাকতে পারে according to permission/policy।

---

# 35. Authentication

Support:

* Email/password
* Google Login
* Facebook Login

Password:

* Argon2id
* strong hashing
* plaintext নয়
* decryptable নয়

---

# 36. Admin & Super Admin Security

Admin এবং Super Admin-এর জন্য:

**Mandatory 2FA**

Critical actions-এর জন্য:

* Explicit permission
* Re-authentication
* 2FA
* Audit log

প্রয়োজন।

Super Admin highest privilege রাখবে।

Super Admin account creation normal public flow-এর মাধ্যমে হবে না; restricted/manual process থাকবে।

Super Admin Admin account create করবে।

---

# 37. RBAC

Admin permissions granular হবে।

Backend permission checking mandatory।

Frontend route hiding security measure হিসেবে গণ্য হবে না।

একজন User Admin route access করতে পারবে না।

Admin Super Admin route access করতে পারবে না।

Super Admin Super Admin routes access করতে পারবে।

---

# 38. Routes

## Public

```text
/
/about
/mission
/how-it-works
/reports
/reports/:id
/statistics
/districts
/districts/:district
/districts/:district/:upazila
/join-us
/donate
/faq
/contact
/privacy-policy
/terms
/code-of-conduct
/safety
/login
/register
/forgot-password
/reset-password
```

## User

```text
/app
/app/dashboard
/app/complaints
/app/complaints/new
/app/complaints/:id
/app/profile
/app/settings
```

## Admin

```text
/admin
/admin/dashboard
/admin/complaints
/admin/complaints/:id
/admin/evidence
/admin/users
/admin/join-us
/admin/reports
/admin/audit-logs
```

## Super Admin

```text
/super-admin
/super-admin/dashboard
/super-admin/admins
/super-admin/security
/super-admin/financial-settings
/super-admin/system-settings
/super-admin/audit-logs
```

---

# 39. Frontend Separation

```text
pages/
├── public/
├── user/
├── admin/
└── superAdmin/
```

User/Admin/Super Admin pages আলাদা থাকবে।

Shared components/utilities ব্যবহার করা যাবে, কিন্তু authorization boundary mix করা যাবে না।

---

# 40. Backend Separation

```text
routes/
├── public/
├── auth/
├── user/
├── admin/
└── superAdmin/
```

Backend architecture:

**Route → Middleware → Validation → Controller → Service → Repository/Model → Database/External Service**

API:

```text
/api/v1
```

---

# 41. Join Us

Join Us normal User profile বা membership directory নয়।

Account ছাড়াও Join Us submission করা যাবে।

Join Us-এর জন্য valid:

* Email
* Contact information
* Profession
* Contribution information
* Supporting reference/document

required হবে।

---

# 42. Join Us Professional Information

Profession:

* Primary profession
* Secondary profession
* Free-text profession

Contribution:

* Primary contribution role
* Multiple secondary contribution roles
* Free-text contribution details

Supporting information:

* Social profile
* LinkedIn
* Portfolio
* CV
* Recommendation letter
* Work experience
* Other meaningful professional/social reference

কমপক্ষে একটি meaningful professional/social reference বা supporting document required।

---

# 43. Join Us Data

Dedicated MongoDB collection:

`joinUsSubmissions`

Join Us data:

* public নয়
* normal User profile নয়
* public member directory নয়

Applicant-এর public member dashboard থাকবে না।

Status বর্তমানে simple:

**Submitted**

Admin internal notes রাখতে পারবে।

Duplicate submission reject করা হবে।

---

# 44. Join Us Access

Authorized Admin এবং Super Admin Join Us submissions/documents দেখতে পারবে।

Data export:

* Admin
* Super Admin

specific permission অনুযায়ী।

Delete:

**শুধুমাত্র Super Admin**

Fixed automatic retention period থাকবে না।

Valid email-এ confirmation পাঠানো হবে।

Google Sheets ব্যবহার করা হবে না।

---

# 45. Notifications

Notifications:

* Complaint status
* Evidence review
* More information request
* Verification
* Authority referral
* Publication
* Legal update
* Security
* General organizational communication

প্রতিটি notification আলাদা record এবং read/unread status রাখবে।

Channels:

* In-app
* Email

Email communication/update user choice/consent-এর সঙ্গে যুক্ত থাকবে।

Critical security/account email marketing consent-এর ওপর নির্ভর করবে না।

Sensitive details notification body-তে থাকবে না।

---

# 46. Messages

Admin → User direct message support থাকবে।

User reply করতে পারবে।

Full conversation history থাকবে।

Messages:

* edit করা যাবে না
* delete করা যাবে না

Request-for-information notification relevant complaint/content-এ link করতে পারবে।

Additional information-এর fixed deadline থাকবে না।

Information না দিলে complaint pending থাকতে পারে।

Anonymous/non-user Reporter-এর সঙ্গে provided contact information ব্যবহার করে communication করা যাবে।

Admin-to-Admin internal chat বর্তমান version-এ থাকবে না।

---

# 47. Audit Logs

Audit log গুরুত্বপূর্ণ actions record করবে।

যেমন:

* Verification
* Publication
* Evidence publication
* Evidence deletion
* User/Admin management
* Financial settings
* Critical system settings
* Privileged actions

Record-এ থাকতে পারে:

* Actor
* Actor type
* Action
* Resource
* Timestamp
* IP
* User-Agent
* Request/Correlation ID
* Relevant metadata

Critical audit data append-only/immutable behavior অনুসরণ করবে।

---

# 48. Security Logs

Separate security log থাকবে।

Track হতে পারে:

* Failed login
* Suspicious activity
* Brute-force signals
* Cooldown
* Temporary block
* Unusual request pattern
* Security events

কখনো log করা যাবে না:

* Password
* Raw token
* Secret
* Sensitive credential

---

# 49. Conflict of Interest

Reviewer/Admin নিজের conflict থাকা complaint-এর final decision নিতে পারবে না।

Conflict declaration এবং reviewer reassignment support থাকবে।

---

# 50. Abuse Protection

Endpoint-specific protection:

* Login
* Registration
* Password reset
* OTP
* Complaint submission
* Upload
* Contact/support
* Public API
* Admin authentication
* Sensitive Admin actions

Suspicious excessive traffic হলে:

* throttling
* cooldown
* temporary block

ব্যবহার করা যেতে পারে।

Legitimate users unnecessarily blocked হবে না।

Cloudflare WAF/rate limiting/bot protection/Turnstile প্রয়োজন অনুযায়ী ব্যবহার করা যেতে পারে।

Backend protection mandatory।

---

# 51. Public Content

Public pages-এর content public এবং User area-তেও accessible থাকবে।

User account থাকলেই public information restricted বা altered হবে না।

---

# 52. Technology Stack

## Frontend

* HTML5
* Tailwind CSS
* Vanilla JavaScript
* Vite/PostCSS/Tailwind tooling যেখানে প্রয়োজন
* ESLint
* Prettier

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* MongoDB Atlas

## Object Storage

* Google Cloud Storage

## Hosting

Frontend:

**Cloudflare Pages**

Backend:

**Render**

AI/development system নিজে deployment করবে না।

Architecture temporary domain-এর ওপর hard-code করা যাবে না।

---

# 53. Security Baseline

Implementation-এ থাকবে:

* Argon2id
* Secure HttpOnly cookies
* Short-lived access tokens
* Rotating refresh tokens
* Mandatory 2FA for privileged roles
* Rate limiting
* CSRF protection
* CORS allowlist
* Helmet
* CSP
* HSTS
* Input validation
* NoSQL injection protection
* XSS protection
* SSRF protection
* File validation
* Signed URLs
* Object-level authorization
* Least privilege
* No secrets in Git
* Request IDs
* Structured logs
* Audit/security logs

---

# 54. Monitoring

Monitor করা হবে:

* API health
* Database
* Storage
* Upload system
* Malware scanning
* Authentication failures
* Suspicious activity
* Errors
* Latency
* Queue/backlog where applicable

Backup এবং restore testing implementation planning-এর অংশ হবে।

---

# 55. AI Assistance

AI ব্যবহার করা যেতে পারে:

* Classification
* Duplicate detection
* Summarization
* Translation
* Moderation assistance
* Pattern detection

AI final:

* verification
* legal judgment
* conviction
* publication decision

নিজে নিতে পারবে না।

Human review mandatory থাকবে যেখানে legal/human-rights significance রয়েছে।

---

# 56. Database Architecture — Core Collections

প্রয়োজনীয় core collections:

```text
users
admins
superAdmins

roles
permissions

reporters

complaints
evidence
legalCases
publicReports

notifications
messages

joinUsSubmissions

sessions
refreshTokens

auditLogs
securityLogs

districts
upazilas

systemSettings
```

অপ্রয়োজনীয় duplicate collection/identifier তৈরি করা হবে না।

Complaint-এর tightly coupled information প্রয়োজন অনুযায়ী complaint document-এর মধ্যে থাকবে।

---

# 57. Core Relationship

```text
Reporter
   │
   └── Complaint
         ├── Victims
         ├── Accused
         ├── Evidence
         ├── Review
         ├── Authority Actions
         ├── Legal Cases
         └── Public Report
```

এক Reporter-এর multiple complaints থাকতে পারে।

এক Complaint-এর:

* multiple victims
* multiple accused
* multiple evidence
* multiple legal cases
* multiple authority actions

থাকতে পারে।

---

# 58. User / Public / Admin Boundary

### Public

শুধু approved public information।

### User

Public information + নিজের authorized/private information।

### Admin

Operational/review information according to permission।

### Super Admin

Highest privileged system/security/financial capabilities।

এক স্তরের private data অন্য স্তরে automaticভাবে expose হবে না।

---

# 59. Mobile & Accessibility

পুরো platform mobile-first এবং responsive হবে:

* Public pages
* User dashboard
* Admin dashboard
* Super Admin dashboard
* Forms
* Tables
* Uploads
* Modals
* Navigation
* Authentication

Complaint UI বিশেষভাবে simple Bangla এবং low-technical-literacy users-এর জন্য তৈরি হবে।

Input field-এ সহজ explanation/example থাকবে।

---

# 60. Development Priority

## P0 — Foundation & Security

* Authentication
* RBAC
* Database
* Security
* Audit
* Storage

## P1 — Core Platform

* Complaint submission
* Evidence
* Review
* Verification
* Public reports
* Complaint tracking
* Legal information

## P2 — Organization

* Join Us
* Future organization capabilities
* CMS
* Volunteer functionality

## P3 — Financial

* Donations
* Payment
* Bank configuration
* Crypto donations

## P4 — Optimization

* Search
* Statistics
* Performance
* Automation
* AI assistance

---

# 61. Non-Negotiable Product Rules

1. Complaint automatically public হবে না।
2. Anonymous/non-user complaint allowed।
3. Non-user maximum 5 complaints।
4. Reporter ID private।
5. Complaint ≠ proven crime।
6. Verified Report ≠ Legal Outcome।
7. Court conviction verification-এর prerequisite নয়।
8. Public report internal complaint-এর raw copy নয়।
9. Evidence default private।
10. Evidence review-এর পরে public হতে পারে।
11. Sensitive evidence redact/withhold করা যাবে।
12. Public evidence viewing track করা হবে না।
13. Evidence publication approval audit করা হবে।
14. Victim/minor/sensitive-person protection stronger হবে।
15. Public এবং User page-এ approved public information একই থাকবে।
16. User নিজের active sessions দেখতে পারবে না।
17. User/Admin/Super Admin permissions strictly separated।
18. Admin/Super Admin-এর 2FA mandatory।
19. Critical privileged actions re-authentication + 2FA + audit require করবে।
20. AI final legal/verification decision নেবে না।
21. Join Us আলাদা private MongoDB collection।
22. Google Sheets ব্যবহার করা হবে না।
23. Public correction history দেখানো হবে না।
24. Paid report removal থাকবে না।
25. Rejected complaint public হবে না।
26. Historical submitted complaint count withdrawal/deletion-এর কারণে কমবে না।
27. Public information User-এর কাছ থেকে hide করা হবে না শুধু account থাকার কারণে।
28. Internal/private information public হবে না শুধু report approved হওয়ার কারণে।

---

# 62. Final Product Philosophy

Platform-এর উদ্দেশ্য কোনো ব্যক্তিকে automatically অপরাধী ঘোষণা করা নয়।

উদ্দেশ্য হলো:

**মানুষের অভিযোগ document করা → তথ্য/evidence review করা → safety রক্ষা করা → credible information তৈরি করা → authority/legal development track করা → approved information responsibly public করা।**

এই platform-এর architecture-এ **privacy, verification, accountability এবং public transparency—চারটিকেই একসঙ্গে balance করতে হবে।**

---

## PRD Status

**Version:** 1.0
**Status:** Frozen / Implementation Baseline
**Source of Truth:** User-approved requirements and subsequent corrections
**Next Deliverable:** Detailed MongoDB Schema + Validation + Index Specification
