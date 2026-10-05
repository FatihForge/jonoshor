# JonoShor

## FRONTEND-ARCHITECTURE.md

### Frozen Frontend Specification — v1.0

> **Source of Truth:** PRD v1.0 + DATABASE-SCHEMA.md v1.0 + API-SPECIFICATION.md v1.0 + BACKEND-ARCHITECTURE.md + SECURITY.md.
>
> Frontend-এর কাজ হলো approved backend/API behavior-এর নিরাপদ এবং ব্যবহারবান্ধব interface প্রদান করা। Frontend নিজে security authority বা business-rule authority নয়।

---

# 1. Frontend Technology

Frontend:

* HTML5
* Tailwind CSS
* Vanilla JavaScript
* Vite
* ESLint
* Prettier

Current architecture-এ নিজের থেকে নতুন frontend framework introduce করা যাবে না।

---

# 2. Frontend Architecture Principle

Frontend structure:

```text
Pages
  ↓
Components
  ↓
Services
  ↓
API
```

Business/security authority backend-এর হাতে থাকবে।

Frontend:

* UI rendering
* form interaction
* client-side validation
* API communication
* loading/error states
* local UI state
* language preference
* responsive behavior

handle করবে।

---

# 3. Top-Level Separation

Frontend-এ চারটি strict area থাকবে:

```text
src/pages/
├── public/
├── user/
├── admin/
└── superAdmin/
```

এই separation শুধু visual নয়।

প্রতিটি area-এর:

* route
* navigation
* page components
* access guard
* API usage

আলাদা থাকবে।

---

# 4. Public Area

Public area সাধারণ visitor-এর জন্য।

```text id="fpt5a7"
public/
├── home/
├── about/
├── mission/
├── how-it-works/
├── reports/
├── statistics/
├── districts/
├── join-us/
├── donate/
├── faq/
├── contact/
├── legal/
└── auth/
```

---

# 5. Public Navigation

Public navigation-এ প্রধান public sections:

```text
Home
About
How It Works
Reports
Statistics
Join Us
Donate
Contact
Bangla | English
Login
```

প্রয়োজন অনুযায়ী responsive/mobile navigation থাকবে।

---

# 6. Public Report Pages

Public report interface:

```text
Reports List
    ↓
Report Details
```

Reports List-এ:

* category
* district
* upazila
* date
* verification status
* legal status
* keyword

filter/search support থাকবে।

---

# 7. Public Report Details

Report details page-এ approved public data দেখানো হবে:

* report reference
* category
* general location
* incident date/range
* summary
* incident story
* verification status
* evidence status
* approved accused information
* approved victim information যেখানে প্রকাশ অনুমোদিত
* authority action summary
* legal summary
* case status
* legal outcome
* approved public evidence

Private/internal fields দেখানো যাবে না।

---

# 8. Public Evidence UI

Public evidence:

* শুধু approved public version
* sensitive হলে redacted version
* login ছাড়াই accessible

হবে।

Public evidence viewer tracking UI বা tracking mechanism থাকবে না।

---

# 9. Statistics Page

Statistics page public API ব্যবহার করবে।

দেখাতে পারে:

* total complaints submitted
* verified reports
* category breakdown
* district breakdown
* time trends
* legal status
* authority action statistics

Individual sensitive information দেখানো যাবে না।

---

# 10. Public Location Pages

Location navigation:

```text
Division
   ↓
District
   ↓
Upazila/Thana
   ↓
Public Reports
```

Bangla এবং English names support করবে।

---

# 11. Public Join Us

Join Us public landing/submission page হবে।

এটি public user profile বা public member directory নয়।

Applicant account ছাড়াই submission করতে পারবে।

---

# 12. Join Us Form

Form-এ required/appropriate information:

* Name
* Valid email
* Contact information
* Primary profession
* Secondary profession
* Custom profession
* Primary contribution role
* Secondary contribution roles
* Contribution details
* Social links
* LinkedIn
* Portfolio
* Supporting documents/references

কমপক্ষে একটি meaningful professional/social reference বা supporting document requirement backend enforce করবে।

---

# 13. Public Complaint Submission

Anonymous/non-user complaint-এর জন্য public complaint flow থাকবে।

```text
Public
  ↓
Complaint Form
  ↓
Contact Information
  ↓
Evidence (optional)
  ↓
Submit
```

Authentication required নয়।

Backend non-user 5-complaint policy enforce করবে।

---

# 14. User Area

User area:

```text id="grlm1u"
user/
├── dashboard/
├── complaints/
├── profile/
├── settings/
├── notifications/
└── messages/
```

---

# 15. User Dashboard

Dashboard-এ user নিজের relevant information পাবে:

* My Complaints
* Complaint status
* Review timeline
* Information requests
* Notifications
* Messages
* permitted evidence

এছাড়া public information-এর access থাকবে।

---

# 16. Public ↔ User Shared Information

এটি **non-negotiable frontend rule**।

Public website-এর approved public information এবং logged-in User area-এর public information-এর মধ্যে mismatch থাকবে না।

Canonical source:

```text
publicReports API
```

Architecture:

```text
                 publicReports API
                       │
               ┌───────┴───────┐
               │               │
               ▼               ▼
        Public Interface   User Interface
```

যেমন:

```text
Public:
 /reports/:id

User:
 /app/complaints/:id
```

User যদি নিজের complaint-এর approved public report view করে, তার public portion অবশ্যই Public page-এর approved information-এর সঙ্গে consistent থাকবে।

User account থাকার কারণে public information গোপন/পরিবর্তিত হবে না।

---

# 17. User Complaint List

```text
/app/complaints
```

User নিজের complaints দেখবে।

List-এ relevant:

* complaint status
* category
* incident information
* last update
* information request
* permitted evidence

দেখানো যাবে।

---

# 18. User Complaint Details

```text
/app/complaints/:id
```

Page-এ আলাদা sections থাকতে পারে:

```text
Complaint Information
Status
Review Timeline
Evidence
Information Requests
Messages
Public Report
Legal/Authority Updates
```

Internal/private reviewer information user-এর জন্য automaticভাবে visible নয়।

---

# 19. User Complaint Submission

```text
/app/complaints/new
```

Form-এর লক্ষ্য:

**কম technical knowledge থাকা User-ও যেন সহজে complaint submit করতে পারে।**

Input language primary Bangla হবে।

প্রতিটি গুরুত্বপূর্ণ field-এর:

* simple label
* short explanation
* example

থাকবে।

---

# 20. Complaint Form UX

Form unnecessarily complex করা যাবে না।

Structured fields থাকবে যেখানে useful:

* category
* incident date
* location
* accused
* victims

এবং reporter নিজের ভাষায় detailed incident description লিখতে পারবে।

---

# 21. User Evidence Interface

User নিজের complaint-এর evidence section-এ:

* uploaded evidence
* upload status
* review status
* approved public status, where applicable

দেখতে পারবে।

Private evidence-এর raw storage information UI-তে দেখানো যাবে না।

---

# 22. Evidence Upload UX

Upload flow:

```text
Select File
   ↓
Client-side validation
   ↓
Upload Session
   ↓
GCS Upload
   ↓
Processing
   ↓
Scan
   ↓
Status
```

Large files-এর জন্য resumable upload support করা হবে।

---

# 23. Evidence Status UI

User-friendly status:

```text
Uploading
Processing
Under Review
Approved
Not Approved
Public
Redacted Public Version
```

Technical malware/security terminology user-facing UI-তে অপ্রয়োজনীয়ভাবে দেখানো হবে না।

---

# 24. User Correction Interface

Correction:

```text
Complaint Details
      ↓
Request Correction
      ↓
Reason
      ↓
Supporting Evidence
      ↓
Submit
```

Maximum 3 requests backend enforce করবে।

Frontend remaining correction count দেখাতে পারে।

---

# 25. User Withdrawal Interface

User complaint withdrawal request করতে পারবে।

UI language clear হবে:

> Withdrawal request review-এর পরে complaint status পরিবর্তিত হতে পারে; এটি automatic permanent deletion নয়।

Backend final decision করবে।

---

# 26. User Legal Update Interface

Reporter legal/authority update submit করতে পারবে।

```text
Submit Update
   ↓
Pending Review
   ↓
Authorized Review
   ↓
Approved Public Update
```

User-provided claim immediately verified fact হিসেবে show করা যাবে না।

---

# 27. User Notifications

```text
/app/notifications
```

প্রতিটি notification:

* title
* safe summary
* timestamp
* read/unread
* optional destination

দেখাবে।

Sensitive details body-তে দেখানো যাবে না।

---

# 28. User Messages

```text
/app/messages
/app/messages/:conversationId
```

User:

* message পড়তে পারবে
* reply করতে পারবে
* previous messages দেখতে পারবে

Message edit/delete controls থাকবে না।

---

# 29. User Security Settings

```text
/app/settings
```

Security settings-এ applicable account controls থাকতে পারে।

**Active sessions list থাকবে না।**

User নিজের active session inventory দেখতে পারবে না।

---

# 30. User Profile

User profile:

* basic account identity
* email
* mobile where applicable
* profile photo
* external links
* language preference

ইত্যাদি manage করতে পারবে।

Public profile থাকবে না।

---

# 31. Language Architecture

Primary:

**Bangla**

Secondary:

**English**

Language detection:

```text
Browser Language
      ↓
Accept-Language / navigator.languages
      ↓
Automatic Language
```

Fallback:

**English**

User manual switch করতে পারবে:

```text
Bangla
English
```

Manual selection cookie/localStorage-এ রাখা হবে এবং auto detection override করবে।

Google Search/Google Account language ব্যবহার করা হবে না।

---

# 32. Public Content Translation

Public report:

```text
bn
en
```

দুই version-এ থাকবে।

Frontend language অনুযায়ী correct approved content render করবে।

Automatic runtime translation-এর ওপর frontend dependency থাকবে না।

---

# 33. Admin Frontend

Admin area:

```text id="w8qc1k"
admin/
├── dashboard/
├── complaints/
├── evidence/
├── users/
├── join-us/
├── reports/
├── corrections/
├── withdrawals/
├── messages/
├── notifications/
└── audit-logs/
```

---

# 34. Admin Dashboard

Admin dashboard operational work-এর জন্য।

Possible sections:

* Complaint queue
* Assigned complaints
* Needs information
* Evidence review
* Verification
* Publication review
* Corrections
* Withdrawals
* Join Us
* User management
* Messages
* Audit logs

Visible content permission অনুযায়ী হবে।

---

# 35. Admin Complaint Workspace

Admin complaint details page আলাদা workspace model follow করবে:

```text
Complaint
Reporter
Incident
Accused
Victims
Evidence
Review
Authority Actions
Legal Cases
Publication
History
```

Internal data visible হবে according to permission।

---

# 36. Admin Review UI

Reviewer/Admin workflow:

```text
Screening
 ↓
Evidence Review
 ↓
Verification
 ↓
Disclosure Review
```

একজন authorized reviewer একই workflow-তে verification + disclosure review complete করতে পারবে যেখানে permission allow করে।

---

# 37. Conflict of Interest UI

Reviewer/Admin নিজের conflict declare করতে পারবে।

Conflict declaration থাকলে final approval control বন্ধ/blocked থাকবে এবং reassignment workflow দেখানো হবে।

---

# 38. Admin Evidence Workspace

Admin evidence UI-তে:

* file information
* scan state
* review state
* preview where safe
* public/private state
* redaction controls
* publication decision
* deletion controls

থাকবে।

Raw public exposure UI থেকে করা যাবে না।

---

# 39. Admin Public Disclosure UI

Disclosure review-এ clearly separated sections থাকবে:

```text
Reporter Visibility
Victim Visibility
Accused Visibility
Incident Details
Evidence
Legal Information
Authority Action
```

Reviewer approved/withheld সিদ্ধান্ত নিতে পারবে।

---

# 40. Public Report Editor

Admin public report-এর public-safe content maintain করতে পারবে।

Separate:

```text
Bangla
English
```

content থাকবে।

Public report internal complaint-এর raw document নয়।

---

# 41. Admin Legal Workspace

Admin multiple legal cases manage করতে পারবে।

UI:

```text
Legal Cases
 ├── Case A
 ├── Case B
 └── Case C
```

প্রতিটি case-এর:

* case number
* authority
* court
* legal status
* timeline
* outcome
* official references

manageable হবে।

---

# 42. Admin Correction Workspace

Admin:

```text
Correction Requests
   ↓
Review
   ↓
Evidence
   ↓
Approve / Reject
```

Public correction history display করা হবে না।

---

# 43. Admin Withdrawal Workspace

Withdrawal request:

```text
Pending
 ↓
Review
 ↓
Withdrawn / Other Decision
```

Permanent deletion action-এর সঙ্গে withdrawal UI এক করা যাবে না।

---

# 44. Admin Join Us Workspace

```text
/admin/join-us
/admin/join-us/:id
```

Admin applicant-এর private submission data এবং approved documents দেখতে পারবে according to permission।

Applicant-এর জন্য যা internal, তা public page-এ leak করা যাবে না।

---

# 45. Admin Audit Log UI

Audit logs:

* searchable
* filterable
* permission-controlled

হতে পারে।

Normal User access পাবে না।

Public page-এ audit log থাকবে না।

---

# 46. Super Admin Frontend

```text id="2p6zfp"
superAdmin/
├── dashboard/
├── admins/
├── security/
├── system-settings/
├── financial-settings/
└── audit-logs/
```

---

# 47. Super Admin Dashboard

Super Admin-এর জন্য privileged system controls।

যেমন:

* Admin management
* permissions
* security
* system settings
* financial settings
* audit information

---

# 48. Admin Management UI

Super Admin:

* Admin create
* Admin view
* Admin status manage
* permissions manage

করতে পারবে according to policy।

Critical permission change enhanced security flow follow করবে।

---

# 49. Financial Settings UI

Financial destination/configuration শুধুমাত্র Super Admin-এর privileged area-তে থাকবে।

Normal Admin UI-তে sensitive destination data render করা যাবে না।

Critical financial changes:

```text
Re-authentication
+
2FA
+
Confirmation
+
Audit
```

---

# 50. Security UI

Super Admin security section-এ applicable security controls এবং security logs দেখা যাবে according to permission।

Sensitive security secrets UI-তে raw form-এ expose করা যাবে না।

---

# 51. Navigation Separation

Public, User, Admin এবং Super Admin-এর navigation পৃথক থাকবে।

```text
Public Nav
≠
User Nav
≠
Admin Nav
≠
Super Admin Nav
```

কোনো user interface-এ অন্য role-এর privileged menu শুধু CSS/hiding দিয়ে protected হবে না; backend authorization final authority।

---

# 52. Route Guards

Frontend route guards UX এবং navigation control-এর জন্য থাকবে।

Example:

```text
/admin/*
    ↓
Admin guard

/super-admin/*
    ↓
Super Admin guard
```

কিন্তু route guard security-এর একমাত্র layer নয়।

---

# 53. Unauthorized UI

Unauthorized access হলে appropriate:

* Login
* Forbidden
* Not Found

state দেখাতে পারে।

Internal permission details expose করা যাবে না।

---

# 54. API Service Layer

Frontend সরাসরি প্রতিটি page থেকে `fetch()` logic ছড়িয়ে দেবে না।

Central API service layer থাকবে:

```text id="1e4lod"
services/
└── api/
    ├── client.js
    ├── publicApi.js
    ├── authApi.js
    ├── userApi.js
    ├── adminApi.js
    └── superAdminApi.js
```

---

# 55. API Client

Central client handle করতে পারে:

* base URL
* credentials
* request headers
* request ID behavior যেখানে applicable
* error normalization
* common response handling

---

# 56. Public API Client

```text
publicApi.js
```

handle করবে:

* public reports
* public evidence
* statistics
* locations
* public content

---

# 57. User API Client

```text
userApi.js
```

handle করবে:

* profile
* complaints
* evidence
* corrections
* withdrawal
* notifications
* messages
* permitted legal update requests
* user settings

---

# 58. Admin API Client

```text
adminApi.js
```

handle করবে:

* complaint review
* evidence
* verification
* publication
* legal cases
* corrections
* withdrawals
* users
* Join Us
* messages
* audit

---

# 59. Super Admin API Client

```text
superAdminApi.js
```

handle করবে:

* Admin management
* permission management
* security
* system settings
* financial settings
* privileged audit access

---

# 60. Shared Components

```text
components/common/
├── Button
├── Input
├── Select
├── Modal
├── Table
├── Pagination
├── Alert
├── Toast
├── Loading
├── EmptyState
├── ErrorState
├── ConfirmDialog
└── FileUpload
```

Shared components reusable হতে পারে।

কিন্তু shared component-এর ভিতরে role-specific authorization logic hard-code করা যাবে না।

---

# 61. Public Components

```text
components/public/
├── PublicNavbar
├── Footer
├── ReportCard
├── ReportFilters
├── ReportStatus
├── StatisticsCard
├── LanguageSwitcher
├── EvidenceViewer
└── PublicContent
```

---

# 62. User Components

```text
components/user/
├── UserNavbar
├── ComplaintCard
├── ComplaintStatus
├── ComplaintTimeline
├── ComplaintForm
├── EvidenceList
├── NotificationItem
└── MessageThread
```

---

# 63. Admin Components

```text
components/admin/
├── AdminNavbar
├── ComplaintReviewPanel
├── EvidenceReviewPanel
├── VerificationPanel
├── DisclosurePanel
├── LegalCasePanel
├── CorrectionReview
├── JoinUsReview
└── AuditLogTable
```

---

# 64. Super Admin Components

```text
components/superAdmin/
├── SuperAdminNavbar
├── AdminManager
├── PermissionManager
├── SecurityPanel
├── SystemSettings
├── FinancialSettings
└── PrivilegedAuditLog
```

---

# 65. Client-Side State

Current architecture-এ unnecessary large state-management framework introduce করা হবে না।

Native JavaScript modules এবং controlled application state ব্যবহার করা হবে।

State categories:

```text
UI State
Form State
API State
Authentication State
Language Preference
```

---

# 66. Authentication State

Frontend authentication state শুধুমাত্র UI behavior-এর জন্য।

Example:

```text
authenticated
accountType
emailVerified
```

কিন্তু privilege confirmation backend-এর response এবং authorization-এর ওপর নির্ভর করবে।

---

# 67. Form State

Complex forms যেমন Complaint form-এ local state রাখা যাবে:

* entered values
* validation state
* upload state
* current step
* errors

Browser refresh-এ sensitive data অযথা persist করা যাবে না।

---

# 68. Sensitive Browser Storage

Browser storage-এ:

* passwords
* access secrets
* refresh tokens
* private evidence
* sensitive reporter metadata

রাখা যাবে না।

Language preference-এর মতো non-sensitive preference cookie/localStorage-এ রাখা যাবে।

---

# 69. Loading States

প্রতিটি asynchronous operation-এ appropriate loading state থাকবে।

যেমন:

* submitting complaint
* uploading evidence
* loading report
* sending message
* submitting correction
* admin verification
* publication action

---

# 70. Error States

User-friendly error states:

```text
Validation Error
Network Error
Unauthorized
Forbidden
Not Found
Rate Limited
Server Error
Upload Error
```

Internal technical details user-facing message-এ দেখানো যাবে না।

---

# 71. Empty States

যেখানে data নেই:

```text
No complaints
No notifications
No messages
No evidence
No public reports found
```

clear Bangla/English empty state দেখানো হবে।

---

# 72. Accessibility

Forms এবং major interactive elements:

* keyboard accessible
* readable labels
* clear focus state
* sufficient text clarity
* understandable error messages

হতে হবে।

Complaint form accessibility বিশেষ গুরুত্বপূর্ণ।

---

# 73. Responsive Design

Mobile-first।

Breakpoints অনুযায়ী adapt করবে:

* desktop
* tablet
* mobile

Public pages এবং dashboards উভয়ই responsive।

---

# 74. Tables

Admin/Super Admin tables mobile-এ horizontally overflow বা responsive card representation ব্যবহার করতে পারবে।

Critical data mobile screen-এ unreadable হবে না।

---

# 75. File Upload UX

Upload UI:

* file selection
* supported type
* progress
* processing state
* error
* completed state

দেখাবে।

User-facing language simple হবে।

---

# 76. Confirmation Dialogs

Destructive/critical actions-এর জন্য confirmation:

* evidence delete
* withdrawal-related action
* privileged configuration
* financial changes
* Admin permission changes

ব্যবহার হবে।

Critical operations backend re-authentication/2FA enforce করবে।

---

# 77. Public Report Safety UI

Public report UI-তে legally sensitive information sensationalize করা যাবে না।

Status distinction visually clear থাকবে:

```text
Platform Verification
Legal Status
Legal Outcome
```

এগুলোকে এক label-এ merge করা যাবে না।

---

# 78. Victim Safety UI

Sensitive cases-এর ক্ষেত্রে protected identity visibly disclose না করে safe presentation করা হবে।

Minor বা sexual-violence victim-এর identity public না করার ক্ষেত্রে UI approved public version অনুযায়ী render করবে।

---

# 79. Accused Presentation

Accused information public approval অনুযায়ী render হবে।

শুধু complaint থাকার কারণে interface-এ “criminal”, “convict” ইত্যাদি label ব্যবহার করা যাবে না।

Legally supported outcome থাকলে appropriate status দেখানো যাবে।

---

# 80. Language Tone

Public/User complaint interface-এর Bangla:

* natural
* সহজ
* respectful
* jargon-minimized

হবে।

Internal Admin/Super Admin interface-এ প্রয়োজন অনুযায়ী technical terminology ব্যবহার করা যাবে।

---

# 81. Frontend Security Rules

Frontend কখনো:

* secret expose করবে না
* privileged API key রাখবে না
* database credential রাখবে না
* GCS private credential রাখবে না
* raw private evidence URL hard-code করবে না
* role access শুধুমাত্র UI hiding দিয়ে protect করবে না

---

# 82. Environment Configuration

Frontend environment-এ শুধু public-safe configuration থাকবে।

যেমন:

```text
API_BASE_URL
PUBLIC_APP_CONFIG
```

কখনো:

```text
MONGODB_URI
GCS_PRIVATE_KEY
OAUTH_CLIENT_SECRET
AI_SECRET
EMAIL_SECRET
```

থাকবে না।

---

# 83. Frontend Project Structure — Final

```text id="d1s0vr"
frontend/
│
├── public/
│   ├── assets/
│   ├── images/
│   └── icons/
│
├── src/
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── home/
│   │   │   ├── about/
│   │   │   ├── mission/
│   │   │   ├── how-it-works/
│   │   │   ├── reports/
│   │   │   ├── statistics/
│   │   │   ├── districts/
│   │   │   ├── join-us/
│   │   │   ├── donate/
│   │   │   ├── faq/
│   │   │   ├── contact/
│   │   │   ├── legal/
│   │   │   └── auth/
│   │   │
│   │   ├── user/
│   │   │   ├── dashboard/
│   │   │   ├── complaints/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── notifications/
│   │   │   └── messages/
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── complaints/
│   │   │   ├── evidence/
│   │   │   ├── users/
│   │   │   ├── join-us/
│   │   │   ├── reports/
│   │   │   ├── corrections/
│   │   │   ├── withdrawals/
│   │   │   ├── messages/
│   │   │   ├── notifications/
│   │   │   └── audit-logs/
│   │   │
│   │   └── superAdmin/
│   │       ├── dashboard/
│   │       ├── admins/
│   │       ├── security/
│   │       ├── system-settings/
│   │       ├── financial-settings/
│   │       └── audit-logs/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── public/
│   │   ├── user/
│   │   ├── admin/
│   │   └── superAdmin/
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── publicApi.js
│   │   │   ├── authApi.js
│   │   │   ├── userApi.js
│   │   │   ├── adminApi.js
│   │   │   └── superAdminApi.js
│   │   ├── auth/
│   │   └── upload/
│   │
│   ├── validators/
│   ├── utils/
│   ├── constants/
│   ├── config/
│   └── main.js
│
├── package.json
├── vite.config.js
└── ...
```

---

# 84. Frontend Development Rule

একটি feature implement করার সময় developer প্রথমে নির্ধারণ করবে:

```text
Which area?
↓
Public / User / Admin / Super Admin
↓
Which API?
↓
Which permission?
↓
Which data is public/private?
```

এরপর UI তৈরি হবে।

---

# 85. Frontend/Public Data Rule

যদি কোনো data Public Report হিসেবে approved হয়:

```text
Public Page
+
User Page
```

দুই জায়গায় consistent presentation থাকতে হবে।

একটি interface-এ approved data দেখিয়ে অন্য interface-এ hide করা যাবে না, শুধু user logged-in হওয়ার কারণে নয়।

---

# 86. Frontend Non-Negotiable Rules

1. HTML + Tailwind + Vanilla JS + Vite ব্যবহার করা হবে।
2. User/Admin/Super Admin pages strictly separated।
3. Frontend route guard UX protection; backend authorization final।
4. User active sessions page থাকবে না।
5. Public reports এবং User area একই approved public data ব্যবহার করবে।
6. Public evidence viewer tracking থাকবে না।
7. Private evidence raw URL frontend-এ expose করা যাবে না।
8. Complaint form simple Bangla হবে।
9. Public Bangla এবং English report আলাদা approved content হিসেবে render হবে।
10. Internal reviewer notes automatic public/User UI-তে যাবে না।
11. Admin/Super Admin UI permission অনুযায়ী dynamic হবে।
12. Sensitive victim information approved disclosure-এর বাইরে render হবে না।
13. Accused-এর legal status misleadingভাবে display করা যাবে না।
14. Password/token/secret browser storage-এ রাখা যাবে না।
15. MongoDB/GCS/private credentials frontend-এ রাখা যাবে না।
16. Critical destructive actions-এ confirmation থাকবে।
17. Public এবং User page-এ approved public information mismatch করা যাবে না।
18. নতুন frontend framework বা state-management dependency নিজের থেকে যোগ করা যাবে না।

---

# 87. Final Frontend Architecture

```text id="rv37tz"
                     FRONTEND
                        │
          ┌─────────────┼─────────────┐
          │             │             │
       Public         User          Admin
          │             │             │
          │             │             └────── Super Admin
          │             │
          └───────┬─────┘
                  │
          Approved Public Data
                  │
             publicReports
                  │
               API Layer
                  │
                Backend
```

Public/User shared information-এর canonical source backend-এর approved `publicReports` data।

Private User/Admin/Super Admin information আলাদা authorization boundary-এর মধ্যে থাকবে।

---

## Document Status

**Document:** FRONTEND-ARCHITECTURE.md
**Version:** 1.0
**Status:** Frozen for implementation
**Parent:** PRD v1.0
**Database:** DATABASE-SCHEMA.md v1.0
**API:** API-SPECIFICATION.md v1.0
**Backend:** BACKEND-ARCHITECTURE.md v1.0
**Security:** SECURITY.md v1.0
