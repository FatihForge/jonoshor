# JonoShor

## API-SPECIFICATION.md

### Frozen API Specification — v1.0

> **Source of Truth:** PRD v1.0 + DATABASE-SCHEMA.md v1.0 + approved subsequent corrections.
>
> **API Base:** `/api/v1`
>
> **Important:** API authorization backend-enforced হবে। Frontend route hiding security হিসেবে গণ্য হবে না।

---

# 1. API Architecture

Request flow:

```text
Client
  ↓
Route
  ↓
Security Middleware
  ↓
Authentication
  ↓
Authorization / Permission
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Repository / Model
  ↓
MongoDB / GCS / External Service
```

External service call থাকলে:

```text
Service
  ↓
External Service
```

---

# 2. API Access Classes

API চারটি access boundary অনুসরণ করবে:

```text
Public
User
Admin
Super Admin
```

একটি route একাধিক role-এর জন্য available হতে পারে, তবে response data role অনুযায়ী controlled হবে।

---

# 3. Public API

Public API login ছাড়াই ব্যবহার করা যাবে, যেখানে applicable।

```text id="m1zvse"
GET  /api/v1/public/reports
GET  /api/v1/public/reports/:id

GET  /api/v1/public/statistics
GET  /api/v1/public/districts
GET  /api/v1/public/districts/:districtId
GET  /api/v1/public/districts/:districtId/upazilas

GET  /api/v1/public/content/:slug
GET  /api/v1/public/announcements
GET  /api/v1/public/faqs
```

শুধু approved public information return হবে।

---

# 4. Public Reports API

## 4.1 List Reports

```text id="n4y9mf"
GET /api/v1/public/reports
```

Supported filters:

```text id="dqj8ar"
category
district
upazila
date
verificationStatus
legalStatus
keyword
page
limit
sort
```

শুধু published/approved public reports return হবে।

Internal complaint data return করা যাবে না।

---

## 4.2 Report Details

```text id="ky1s3m"
GET /api/v1/public/reports/:id
```

Return করবে:

* report information
* approved accused information
* approved victim information যেখানে disclosure permitted
* verification status
* evidence status
* approved public evidence
* authority summary
* legal summary
* case status
* legal outcome

Private fields return হবে না।

---

# 5. Public Evidence Access

Approved public evidence:

```text id="p8d16m"
GET /api/v1/public/evidence/:evidenceId
```

অথবা public report detail response-এর মাধ্যমে approved evidence resource পাওয়া যাবে।

Public evidence:

* login ছাড়াই accessible
* public-approved version only
* sensitive/redacted version হলে সেটিই return হবে

**Viewer tracking করা হবে না।**

Public access log তৈরি হবে না।

---

# 6. Public Statistics

```text id="n8jkee"
GET /api/v1/public/statistics
```

Return করতে পারে:

* total submitted complaints
* verified reports
* category breakdown
* district breakdown
* time trends
* legal status breakdown
* authority action statistics

Historical total submitted count withdrawal/rejection/deletion-এর কারণে decrease হবে না।

Sensitive individual information statistics response-এ থাকবে না।

---

# 7. Public Location APIs

```text id="52bo99"
GET /api/v1/public/districts
GET /api/v1/public/districts/:districtId
GET /api/v1/public/districts/:districtId/upazilas
```

Location data:

* Bangla
* English

দুই language support করবে।

---

# 8. Public Language

Public report response:

```text id="9zo4sy"
{
  "bn": {...},
  "en": {...}
}
```

Bangla এবং English content independently usable হবে।

---

# 9. Public ↔ User API Consistency

Public reports-এর canonical source:

```text id="051ehp"
publicReports
```

Public site:

```text id="lb5x49"
GET /api/v1/public/reports
GET /api/v1/public/reports/:id
```

User site-ও একই approved public report information ব্যবহার করবে।

User-এর জন্য আলাদা duplicate public-report API/source তৈরি করা হবে না।

Registered User হওয়ার কারণে public report:

* কমবে না
* বদলাবে না
* hidden হবে না

User-এর additional private data আলাদা authenticated endpoint থেকে আসবে।

---

# 10. Authentication API

## Register

```text id="vpzmzx"
POST /api/v1/auth/register
```

Request:

```text id="f7z5eq"
fullName
email
password
mobile
languagePreference
```

Validation:

* valid email
* strong password
* unique email
* appropriate mobile validation

Registration-এর পরে email verification flow থাকবে।

---

# 11. Login

```text id="gb0miw"
POST /api/v1/auth/login
```

Successful authentication-এর পরে secure session/token mechanism ব্যবহার হবে।

Failed login security logging এবং endpoint-specific rate limiting-এর অধীনে থাকবে।

---

# 12. Social Login

```text id="44k77l"
GET /api/v1/auth/google
GET /api/v1/auth/google/callback
```

Google OAuth 2.0 Authorization Code flow। Server-side cryptographically signed state token, code exchange, এবং Google verified email-এর মাধ্যমে account creation ও safe account linking পরিচালিত হয়। Authentication সফল হলে JonoShor HttpOnly session cookies (`access_token`, `refresh_token`) ইস্যু করা হয়। Provider tokens কখনোই frontend-এ প্রকাশ করা হয় না।

---

# 13. Email Verification

```text id="t8be7j"
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
```

Valid email verification required হবে।

---

# 14. Password Reset

```text id="uzs06j"
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Password reset flow secure, time-limited এবং rate-limited হবে।

Reset token raw form database-এ রাখা যাবে না।

---

# 15. Logout

```text id="1s6qe8"
POST /api/v1/auth/logout
```

Current authentication session revoke করা হবে।

---

# 16. User Profile API

Authentication required।

```text id="ctzn8v"
GET   /api/v1/user/profile
PATCH /api/v1/user/profile
```

User নিজের basic profile information manage করতে পারবে।

Public user profile system নেই।

---

# 17. User Security Settings

```text id="c9or4k"
GET /api/v1/user/security
PATCH /api/v1/user/security
```

শুধু নিজের account-এর permitted security settings।

User-এর active sessions list দেখানোর endpoint থাকবে না।

---

# 18. Complaint Submission

Registered User:

```text id="0vhh8m"
POST /api/v1/user/complaints
```

Non-user:

```text id="s92nq7"
POST /api/v1/public/complaints
```

---

# 19. Complaint Submission Request

Conceptual request:

```text id="1x4nws"
{
  "category": {
    "primary": "...",
    "secondary": ["..."]
  },
  "incident": {
    "startDate": "...",
    "endDate": "...",
    "datePrecision": "...",
    "ongoing": false,
    "description": "..."
  },
  "location": {
    "divisionId": "...",
    "districtId": "...",
    "upazilaId": "...",
    "freeTextLocation": "..."
  },
  "accused": [...],
  "victims": [...],
  "contact": {...}
}
```

Actual implementation schema অনুযায়ী validation হবে।

---

# 20. Non-User Complaint Rules

Non-user complaint endpoint:

```text id="w3phih"
POST /api/v1/public/complaints
```

Submission-এর আগে backend:

1. security signals evaluate করবে
2. non-user Reporter identify/link করবে
3. 5-complaint limit check করবে
4. valid contact verify করবে
5. rate limiting apply করবে

5টি complaint already থাকলে:

```text
Account required
```

response দিতে হবে।

---

# 21. Reporter ID Security

API response-এ Reporter ID public-facing identifier হিসেবে return করা যাবে না।

Reporter ID শুধুমাত্র internally authorized operations-এর জন্য ব্যবহার করা হবে।

---

# 22. User Complaint List

```text id="a6m8fi"
GET /api/v1/user/complaints
```

User শুধু নিজের authorized complaints দেখতে পারবে।

---

# 23. User Complaint Details

```text id="y9d2ym"
GET /api/v1/user/complaints/:id
```

Return করা যাবে:

* own complaint information
* complaint status
* status timeline
* permitted evidence
* requests for more information
* permitted communication
* approved public version

Internal reviewer notes/private administrative information automatically return হবে না।

---

# 24. User Complaint Update

শুধুমাত্র যেসব fields User policy অনুযায়ী editable, সেগুলো update করা যাবে।

```text id="ut8k5t"
PATCH /api/v1/user/complaints/:id
```

Published/public-safe information User সরাসরি overwrite করতে পারবে না।

Correction request আলাদা endpoint ব্যবহার করবে।

---

# 25. Correction Request

```text id="w7z77i"
POST /api/v1/user/complaints/:id/corrections
```

Request-এর মধ্যে:

* requested changes
* reason
* supporting evidence

থাকতে পারে।

Correction limit:

**Maximum 3 requests**

Backend limit enforce করবে।

---

# 26. Withdrawal Request

```text id="f5in11"
POST /api/v1/user/complaints/:id/withdraw
```

এটি automatic delete করবে না।

Workflow:

```text
Request
 ↓
Review
 ↓
Withdrawn
```

---

# 27. Complaint Evidence Upload

Evidence upload-এর জন্য সরাসরি normal API body-তে large file পাঠানো হবে না।

Step 1:

```text id="q2u6nc"
POST /api/v1/user/complaints/:id/evidence/upload-session
```

Step 2:

Backend authorized upload session তৈরি করবে।

Step 3:

Client Google Drive evidence storage adapter-এ direct/resumable upload করবে।

Step 4:

File quarantine/malware scan process-এ যাবে।

Step 5:

Clean file private storage-এ যাবে।

---

# 28. Non-User Evidence Upload

Non-user complaint-এর জন্য corresponding public submission flow ব্যবহার হবে।

Authentication না থাকলেও upload authorization submission context-এর সঙ্গে tied থাকবে।

Malware/security/rate limit একইভাবে প্রযোজ্য।

---

# 29. Evidence Metadata

```text id="m1z8bx"
GET /api/v1/user/complaints/:id/evidence
```

User নিজের complaint-এর অনুমোদিত evidence metadata দেখতে পারবে।

Internal storage key বা private permanent URL return করা যাবে না।

Private file access-এর জন্য backend authorized short-lived signed URL দিতে পারে।

---

# 30. Public Evidence

Approved public evidence user authentication ছাড়াই accessible হবে।

User page public evidence-এর জন্য একই public resource/source ব্যবহার করবে।

Private evidence:

* public endpoint-এ যাবে না
* unauthorized User দেখতে পারবে না

---

# 31. External Evidence Link

```text id="7qj2d9"
POST /api/v1/user/complaints/:id/evidence/external
```

External URL validation:

* allowed URL scheme
* safe host validation
* SSRF protection
* accessibility check

External link automatically verified হিসেবে গণ্য হবে না।

---

# 32. User Notifications

```text id="5anrhv"
GET  /api/v1/user/notifications
PATCH /api/v1/user/notifications/:id/read
```

Notification sensitive complaint details expose করবে না।

Relevant target URL থাকলে notification user-কে relevant content-এ নিয়ে যাবে।

---

# 33. User Messages

```text id="b5wt5i"
GET  /api/v1/user/messages
GET  /api/v1/user/messages/:conversationId
POST /api/v1/user/messages/:conversationId
```

User:

* message পড়তে পারবে
* reply করতে পারবে
* message edit করতে পারবে না
* message delete করতে পারবে না

---

# 34. Information Request

Admin user-এর কাছে additional information চাইলে notification/message তৈরি হবে।

User সেই message/conversation-এ reply করতে পারবে।

No fixed deadline required।

No response থাকলে complaint pending থাকতে পারে।

---

# 35. Admin API Boundary

All Admin APIs:

```text id="c3wv41"
/api/v1/admin/*
```

Authentication + Admin role + specific permission required।

User `/admin/*` access করতে পারবে না।

Frontend URL manually লিখলেও backend deny করবে।

---

# 36. Admin Dashboard

```text id="5dbfuj"
GET /api/v1/admin/dashboard
```

Permission অনুযায়ী operational summary।

Sensitive information permission-এর বাইরে return করা যাবে না।

---

# 37. Admin Complaint List

```text id="2r0r6f"
GET /api/v1/admin/complaints
```

Supported filters:

* status
* category
* district
* upazila
* priority
* sensitivity
* reviewer
* date
* risk flags

---

# 38. Admin Complaint Details

```text id="73i8i2"
GET /api/v1/admin/complaints/:id
```

Authorized Admin/Reviewer complaint-এর প্রয়োজনীয় internal data দেখতে পারবে।

Role/permission অনুযায়ী restricted fields apply হবে।

---

# 39. Complaint Assignment

```text id="xurkn0"
POST /api/v1/admin/complaints/:id/assign
PATCH /api/v1/admin/complaints/:id/assignment
```

Reviewer assignment controlled permission অনুযায়ী হবে।

---

# 40. Screening

```text id="n3vfrk"
POST /api/v1/admin/complaints/:id/screen
```

Screening outcome অনুযায়ী status update:

* Screening
* Needs More Information
* Rejected
* Evidence Review

ইত্যাদি হতে পারে।

---

# 41. Request More Information

```text id="x1xjg7"
POST /api/v1/admin/complaints/:id/request-information
```

এতে user notification/message তৈরি হবে।

Internal reviewer notes user-কে automatically পাঠানো যাবে না।

---

# 42. Admin Evidence Review

```text id="46wtr9"
GET  /api/v1/admin/evidence/:evidenceId
POST /api/v1/admin/evidence/:evidenceId/review
```

Reviewer evaluate করবে:

* file status
* relevance
* malware status
* credibility indicators
* available authenticity information

Upload ≠ proof।

---

# 43. Evidence Public Approval

```text id="s8xywm"
POST /api/v1/admin/evidence/:evidenceId/publication
```

Authorized Admin/Reviewer public approval দিতে পারবে।

Sensitive evidence হলে redaction/partial disclosure option থাকবে।

---

# 44. Evidence Redaction

```text id="qyw7z4"
POST /api/v1/admin/evidence/:evidenceId/redaction
```

Safe public version তৈরি/approve করা যাবে।

Raw sensitive evidence public URL-এ expose করা যাবে না।

---

# 45. Evidence Deletion

```text id="r6o07c"
POST /api/v1/admin/evidence/:evidenceId/delete
```

Authorization required।

Reason required।

Audit log বাধ্যতামূলক।

Legal hold থাকলে operation block হবে।

---

# 46. Complaint Verification

```text id="4q9nbo"
POST /api/v1/admin/complaints/:id/verify
```

Verification input:

* complaint information
* available evidence
* corroboration
* consistency
* reliable proof

Human reviewer final decision নেবে।

AI এই endpoint-এর final decision নিতে পারবে না।

---

# 47. Conflict of Interest

Reviewer conflict জানাতে পারবে:

```text id="iopmse"
POST /api/v1/admin/complaints/:id/conflict
```

Conflict থাকলে সেই reviewer final approval করতে পারবে না।

---

# 48. Public Disclosure Review

```text id="je6zwo"
POST /api/v1/admin/complaints/:id/publication-review
```

Authorized reviewer/admin decide করবে:

* publish
* withhold

Public disclosure-এর সময়:

* accused visibility
* victim visibility
* incident information
* evidence
* legal information

review করা হবে।

---

# 49. Public Report Creation/Update

```text id="gq8k2b"
POST  /api/v1/admin/complaints/:id/public-report
PATCH /api/v1/admin/public-reports/:id
```

Public Report হবে sanitized/public-safe representation।

Internal complaint সরাসরি public response হিসেবে return করা যাবে না।

---

# 50. Public Report Language Content

Admin/publication workflow-এর মাধ্যমে:

```text id="0e0d3f"
bn.title
bn.summary
bn.incidentStory
bn.legalSummary
bn.authorityActionSummary

en.title
en.summary
en.incidentStory
en.legalSummary
en.authorityActionSummary
```

maintain করা যাবে।

AI translation assist করতে পারবে।

Human review required।

---

# 51. Authority Action API

```text id="avq1qy"
POST  /api/v1/admin/complaints/:id/authority-actions
PATCH /api/v1/admin/complaints/:id/authority-actions/:actionId
```

Authority action-এর:

* authority
* action
* date
* reference
* verification
* public summary

maintain করা যাবে।

---

# 52. Legal Case API

```text id="l5b6eo"
POST  /api/v1/admin/complaints/:id/legal-cases
GET  /api/v1/admin/complaints/:id/legal-cases
PATCH /api/v1/admin/legal-cases/:id
```

Multiple legal cases support থাকবে।

Case number optional।

Multiple courts এবং authorities support থাকবে।

---

# 53. Legal Timeline

```text id="v9sxdp"
POST /api/v1/admin/legal-cases/:id/timeline
PATCH /api/v1/admin/legal-cases/:id/timeline/:eventId
```

Timeline historical context preserve করবে।

Public version approved summary হিসেবে প্রকাশ হবে।

---

# 54. Reporter Legal Update

Reporter public/legal update request করতে পারে:

```text id="iz0fl2"
POST /api/v1/user/complaints/:id/legal-update-request
```

Reporter-provided claim automatically verified হবে না।

Admin authorized review করবে।

Approved হলে public report update হবে।

---

# 55. Correction Review

```text id="2n3uh2"
GET  /api/v1/admin/corrections
GET  /api/v1/admin/corrections/:id
POST /api/v1/admin/corrections/:id/review
```

Correction status update করা যাবে:

```text
approved
rejected
```

Public correction history expose করা যাবে না।

Approved correction-এর পরে public report silently update হতে পারে।

---

# 56. Withdrawal Review

```text id="s5d0nq"
GET /api/v1/admin/withdrawals
POST /api/v1/admin/complaints/:id/withdrawal-review
```

Final status `withdrawn` হতে পারে।

Permanent deletion automatically হবে না।

---

# 57. User Management

```text id="k7l8nq"
GET  /api/v1/admin/users
GET  /api/v1/admin/users/:id
PATCH /api/v1/admin/users/:id/status
```

Specific permission required।

Admin user account-এর restricted management করতে পারবে।

---

# 58. Join Us Admin API

```text id="yqt8ja"
GET /api/v1/admin/join-us
GET /api/v1/admin/join-us/:id
```

Authorized Admin/Super Admin only।

Applicant publicভাবে এই endpoint access করতে পারবে না।

---

# 59. Join Us Internal Notes

```text id="4b5nky"
POST /api/v1/admin/join-us/:id/notes
PATCH /api/v1/admin/join-us/:id/notes/:noteId
```

Internal notes শুধুমাত্র authorized staff-এর জন্য।

Applicant-এর public view-তে যাবে না।

---

# 60. Join Us Documents

```text id="x2b2qd"
GET /api/v1/admin/join-us/:id/documents/:documentId
```

Authorized Admin/Super Admin permission required।

Private document-এর short-lived authorized access ব্যবহার হবে।

---

# 61. Join Us Export

```text id="0k73s6"
POST /api/v1/admin/join-us/export
```

Specific export permission required।

Admin এবং Super Admin allowed।

Export activity audit logged হবে।

---

# 62. Join Us Delete

```text id="p8z6ba"
DELETE /api/v1/admin/join-us/:id
```

**Super Admin only**

Explicit permission + critical action security requirements প্রযোজ্য।

Audit log mandatory।

---

# 63. Notification Administration

```text id="9r5f4y"
POST /api/v1/admin/users/:id/notifications
```

Admin User-কে direct notification পাঠাতে পারবে according to permission।

Sensitive details notification-এ যাবে না।

---

# 64. Admin Messaging

```text id="8qvjbt"
POST /api/v1/admin/users/:id/messages
GET /api/v1/admin/users/:id/messages
```

Complaint-specific communication হলে relevant complaint relationship থাকবে।

User reply করতে পারবে।

Message edit/delete করা যাবে না।

---

# 65. Admin Audit API

```text id="m5g8os"
GET /api/v1/admin/audit-logs
```

Audit log access specific permission-এর অধীনে থাকবে।

Public/User access নেই।

---

# 66. Super Admin API Boundary

All Super Admin APIs:

```text id="n69c38"
/api/v1/super-admin/*
```

Super Admin authentication + permission required।

Admin `/super-admin/*` access করতে পারবে না।

---

# 67. Admin Management

```text id="b9zrsv"
POST  /api/v1/super-admin/admins
GET   /api/v1/super-admin/admins
GET   /api/v1/super-admin/admins/:id
PATCH /api/v1/super-admin/admins/:id
```

Super Admin Admin account create/manage করবে।

---

# 68. Admin Permissions

```text id="w9b3tv"
GET  /api/v1/super-admin/admins/:id/permissions
PATCH /api/v1/super-admin/admins/:id/permissions
```

Granular permissions manage করা যাবে।

Critical permission changes:

* re-authentication
* 2FA
* audit log

require করবে।

---

# 69. Security Management

```text id="tde4wf"
GET /api/v1/super-admin/security
GET /api/v1/super-admin/security/logs
```

Security management শুধু appropriate privilege-এর জন্য।

---

# 70. Session Revocation

Privileged session revocation authorization policy অনুযায়ী:

```text id="es5vjj"
POST /api/v1/super-admin/security/sessions/:sessionId/revoke
```

অথবা authorized Admin security route থেকে permitted privileged session revoke করতে পারবে।

User active sessions list করার endpoint থাকবে না।

---

# 71. System Settings

```text id="kw1ry5"
GET  /api/v1/super-admin/system-settings
PATCH /api/v1/super-admin/system-settings/:key
```

Critical configuration:

* re-authentication
* 2FA
* audit
* authorization

require করতে পারে।

---

# 72. Financial Settings

```text id="5j7g7p"
GET  /api/v1/super-admin/financial-settings
PATCH /api/v1/super-admin/financial-settings
```

Only Super Admin।

Normal Admin sensitive payment/bank destination settings দেখতে পারবে না।

Critical financial change:

* re-authentication
* 2FA
* audit log

required।

---

# 73. Super Admin Audit

```text id="z11wr5"
GET /api/v1/super-admin/audit-logs
```

Audit log access explicit permission অনুযায়ী।

---

# 74. Authentication & Authorization Rules

Protected endpoint:

```text
Authentication
   ↓
Account Type
   ↓
Permission
   ↓
Object Ownership / Scope
   ↓
Action
```

শুধু role match যথেষ্ট নয়।

Object-level authorization required।

উদাহরণ:

```text
User A
   ↓
GET /api/v1/user/complaints/:id
   ↓
Complaint belongs to User A?
   ├── Yes → Allow
   └── No  → Deny
```

---

# 75. Public Data Sanitization

Public APIs কখনো internal MongoDB document সরাসরি return করবে না।

Flow:

```text
MongoDB
   ↓
Service
   ↓
Public Sanitization / DTO
   ↓
Public Response
```

শুধু approved whitelist fields return হবে।

---

# 76. User/Public Shared Report Response

একটি public report response দুই interface-এ ব্যবহারযোগ্য হবে:

```text
Public Website
      │
      ├── Reports
      └── Report Details

User Website
      │
      ├── Public Reports
      └── Public Report Details
```

দুই জায়গায় approved public information mismatch করা যাবে না।

---

# 77. API Response Format

Standard success response:

```text id="8y0y0x"
{
  "success": true,
  "data": {},
  "meta": {}
}
```

List response:

```text id="j5d9jy"
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

# 78. Error Response

Standard error:

```text id="qf4pjt"
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  },
  "requestId": "..."
}
```

Sensitive internal error details client-কে return করা যাবে না।

---

# 79. Important Error Types

Possible codes:

```text id="1jyaif"
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
RATE_LIMITED
ACCOUNT_REQUIRED
EMAIL_NOT_VERIFIED
COMPLAINT_LIMIT_REACHED
INVALID_CONTACT
INVALID_EVIDENCE
MALWARE_DETECTED
EVIDENCE_NOT_READY
PUBLICATION_NOT_APPROVED
CONFLICT_OF_INTEREST
CORRECTION_LIMIT_REACHED
```

---

# 80. Request ID

প্রতিটি API request-এর correlation/request ID থাকবে।

Security-sensitive action এবং audit trail-এর সঙ্গে request ID যুক্ত থাকবে।

Error response-এ request ID client-কে দেখানো যেতে পারে যাতে support/debugging করা সহজ হয়।

---

# 81. Validation

Backend validation mandatory।

Validate করতে হবে:

* input types
* required fields
* enum values
* dates
* Bangladesh location references
* email
* mobile
* URLs
* file metadata
* object ownership
* permissions

Frontend validation backend validation-এর replacement নয়।

---

# 82. Rate Limiting

Endpoint-specific rate limiting।

বিশেষ করে:

* login
* registration
* password reset
* OTP
* complaint submission
* evidence upload
* contact/support
* public API
* admin authentication
* sensitive admin operations

Suspicious traffic হলে:

* throttle
* cooldown
* temporary block

ব্যবহার করা যেতে পারে।

---

# 83. Security Middleware

Backend-এ applicable security middleware:

```text id="0d4x0u"
Helmet
CORS allowlist
CSRF protection
Rate limiting
Input validation
NoSQL injection protection
XSS protection
SSRF protection
Authentication
Authorization
Request ID
```

---

# 84. File Upload Security

Upload API:

```text
Authorization
   ↓
Upload Session
   ↓
Type/Size Validation
   ↓
Quarantine
   ↓
Malware Scan
   ↓
Permanent Private Storage
```

Unscanned file public করা যাবে না।

---

# 85. Evidence URL Security

Private evidence-এর জন্য:

```text id="r7djyp"
Backend authorization
      ↓
Short-lived signed URL
```

Permanent public raw URL ব্যবহার করা যাবে না।

Approved public evidence-এর জন্য public-safe resource ব্যবহার হবে।

---

# 86. Audit Requirements

Audit log required for:

* complaint verification
* publication approval
* evidence publication
* evidence deletion
* correction decision
* withdrawal decision
* Admin management
* permission changes
* critical settings changes
* financial settings changes
* privileged session/security operations
* Join Us export/delete

Public evidence viewing audit করা হবে না।

---

# 87. AI API Boundary

AI service ব্যবহার করা হলে:

```text
Service
  ↓
AI Assistance
  ↓
Human Review
  ↓
Final Decision
```

AI সরাসরি:

* verified status
* legal outcome
* conviction
* final public disclosure

নিজে set করতে পারবে না।

---

# 88. API Security Principle

API security কখনো frontend UI-এর ওপর নির্ভর করবে না।

এই request:

```text id="m0kyis"
GET /api/v1/admin/complaints
```

User frontend থেকে manually call করলেও backend:

```text
Authenticated?
Admin?
Required permission?
```

check করে তারপর response দেবে।

একইভাবে Admin:

```text
GET /api/v1/super-admin/*
```

call করলে backend deny করবে।

---

# 89. API Architecture Summary

```text
/api/v1
│
├── /public
│    ├── reports
│    ├── evidence
│    ├── statistics
│    ├── districts
│    └── content
│
├── /auth
│    ├── register
│    ├── login
│    ├── google
│    ├── facebook
│    ├── verify-email
│    ├── forgot-password
│    ├── reset-password
│    └── logout
│
├── /user
│    ├── profile
│    ├── complaints
│    ├── notifications
│    ├── messages
│    └── security
│
├── /admin
│    ├── complaints
│    ├── evidence
│    ├── corrections
│    ├── withdrawals
│    ├── users
│    ├── join-us
│    ├── messages
│    ├── notifications
│    └── audit-logs
│
└── /super-admin
     ├── admins
     ├── security
     ├── system-settings
     ├── financial-settings
     └── audit-logs
```

---

# 90. Final API Rules

1. `/api/v1` হবে API root।
2. Public, User, Admin এবং Super Admin boundary আলাদা থাকবে।
3. Backend authorization mandatory।
4. Public report-এর canonical data `publicReports`।
5. Public website এবং User website একই approved public report data ব্যবহার করবে।
6. User নিজের active sessions দেখতে পারবে না।
7. Non-user complaint allowed।
8. Non-user maximum 5 complaints।
9. Reporter ID public API-তে expose হবে না।
10. Complaint automatically public হবে না।
11. Evidence default private।
12. Evidence review ছাড়া public হবে না।
13. Sensitive evidence redact/withhold করা যাবে।
14. Public evidence viewer tracking থাকবে না।
15. Evidence publication approval audit হবে।
16. User নিজের complaint-এর permitted data দেখতে পারবে।
17. User অন্য User-এর complaint দেখতে পারবে না।
18. Internal reviewer notes public/User response-এ automaticভাবে যাবে না।
19. Correction maximum 3 requests।
20. Withdrawal automatic deletion নয়।
21. Legal update automatically public নয়।
22. External evidence automatically verified নয়।
23. AI final verification/legal/publication decision নিতে পারবে না।
24. Critical privileged actions re-authentication + 2FA + audit require করবে।
25. Sensitive/private database document সরাসরি API response হিসেবে expose করা যাবে না।
26. সব sensitive operation object-level authorization-এর অধীনে থাকবে।

---

## Document Status

**Document:** API-SPECIFICATION.md
**Version:** 1.0
**Status:** Frozen for implementation
**Parent:** PRD v1.0
**Database Reference:** DATABASE-SCHEMA.md v1.0

**Next Architecture Document:** Backend Architecture + Project Folder Structure
