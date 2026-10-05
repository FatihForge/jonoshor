# JonoShor

## SECURITY.md

### Frozen Security Specification — v1.0

> **Source of Truth:** PRD v1.0 + DATABASE-SCHEMA.md v1.0 + API-SPECIFICATION.md v1.0 + approved subsequent corrections.
>
> **Purpose:** Platform-এর confidentiality, integrity, availability, accountability এবং user/victim safety নিশ্চিত করা।
>
> Security controls product requirements-এর সঙ্গে conflict করতে পারবে না।

---

# 1. Security Principles

Platform security-এর মূল লক্ষ্য:

**Protect → Verify → Control Access → Audit → Respond**

Security architecture পাঁচটি মূল principle অনুসরণ করবে:

1. Least Privilege
2. Defense in Depth
3. Secure by Default
4. Object-Level Authorization
5. Auditability

---

# 2. Security Boundaries

System-এর চারটি access boundary:

```text
Public
User
Admin
Super Admin
```

Authorization backend-এ enforce হবে।

Frontend-এর:

* hidden button
* hidden page
* disabled menu
* route guard

কোনোটিই একা security mechanism নয়।

---

# 3. Account Separation

Account collections আলাদা:

```text
users
admins
superAdmins
```

এক role-এর account অন্য role-এর privilege inherit করবে না।

---

# 4. Authentication

Supported authentication:

* Email/password
* Google Login
* Facebook Login

Authentication-এর পরে secure session mechanism ব্যবহার হবে।

---

# 5. Password Security

Password:

* কখনো plaintext হিসেবে store হবে না
* decryptable format-এ রাখা হবে না
* Argon2id hashing ব্যবহার করবে
* secure password validation অনুসরণ করবে

Password কখনো:

* log
* audit record
* API response
* client storage

এ রাখা যাবে না।

---

# 6. Session Security

Session server-side tracking থাকবে।

Stored sensitive session/token values raw form-এ রাখা যাবে না।

Session record-এ প্রয়োজনীয় security information থাকতে পারে:

* account
* account type
* session reference
* token hash/reference
* IP
* User-Agent
* device information
* creation time
* last activity
* expiry
* revocation state

### User Session Visibility

**User নিজের active sessions দেখতে পারবে না।**

Active-session management privileged internal functionality হিসেবে থাকবে।

---

# 7. Refresh Token Security

Refresh token:

* rotating হবে
* hashed/reference form-এ store হবে
* expiry থাকবে
* revocation support করবে
* replacement chain maintain করতে পারবে

Raw refresh token database-এ রাখা যাবে না।

---

# 8. Admin Authentication

Admin-এর জন্য:

**Mandatory 2FA**

Login security:

```text
Credentials
 ↓
Authentication
 ↓
2FA
 ↓
Session Creation
```

Failed authentication security logging-এর অধীনে থাকবে।

---

# 9. Super Admin Authentication

Super Admin-এর জন্য:

**Mandatory 2FA**

Critical action:

```text
Authentication
 ↓
Permission
 ↓
Re-authentication
 ↓
2FA Confirmation
 ↓
Action
 ↓
Audit Log
```

---

# 10. Critical Actions

নিম্ন ধরনের critical action-এর জন্য enhanced security required:

* Admin creation
* Admin permission changes
* Critical system settings
* Financial settings
* Privileged security actions
* Sensitive evidence deletion
* Evidence publication where applicable
* Other destructive/irreversible privileged actions

Controls:

* explicit permission
* re-authentication
* 2FA
* audit logging

---

# 11. RBAC

Granular Role-Based Access Control থাকবে।

Authorization:

```text
Authentication
    ↓
Account Type
    ↓
Permission
    ↓
Object / Resource Scope
    ↓
Action
```

Role match একাই যথেষ্ট নয়।

---

# 12. Object-Level Authorization

Resource ownership এবং scope verify করতে হবে।

Example:

```text
User A
 ↓
GET Complaint X
 ↓
Complaint X belongs to User A?
 ├── YES → Allow
 └── NO  → Deny
```

একইভাবে Admin-এর জন্য specific permission এবং allowed scope verify হবে।

---

# 13. Route-Level Protection

Protected route groups:

```text
/api/v1/user/*
/api/v1/admin/*
/api/v1/super-admin/*
```

### User

শুধু User routes এবং public resources।

### Admin

শুধু Admin routes এবং permitted public resources।

### Super Admin

Super Admin routes এবং permitted lower-level resources।

---

# 14. Privilege Escalation Protection

নিম্ন কোনো client-side technique access control bypass করতে পারবে না:

* URL modification
* API modification
* request replay
* hidden UI access
* manually crafted HTTP request
* modified frontend JavaScript

Backend সব privileged request independently verify করবে।

---

# 15. Complaint Privacy

Complaint defaultভাবে private থাকবে।

New complaint:

```text
Submitted
 ↓
Internal Review
 ↓
Verification
 ↓
Disclosure Decision
```

Approval ছাড়া public report তৈরি করা যাবে না।

---

# 16. Reporter Privacy

Reporter identity default private।

Reporter public করার সিদ্ধান্ত নিতে পারে যেখানে policy অনুমতি দেয়।

কিন্তু internal Reporter ID:

**সবসময় private।**

Reporter technical metadata public হবে না।

---

# 17. Anonymous / Non-User Security

Anonymous submission allowed হলেও:

**Anonymous ≠ Untraceable**

System reasonably available security signals ব্যবহার করতে পারে:

* IP
* browser/session signals
* security identifiers
* request patterns
* rate-limit signals

এগুলো abuse prevention/security investigation-এর জন্য ব্যবহৃত হবে।

অযথা duplicate metadata store করা যাবে না।

---

# 18. Non-User Complaint Limit

Non-user reporter:

**Maximum 5 complaints**

enforce করার সময় শুধু IP ব্যবহার করা হবে না।

Combined signals:

```text
IP
+
Browser/Session Signals
+
Security Signals
+
Rate Limiting
```

ব্যবহার করা হবে।

Legitimate shared-network users অযথা block না করার জন্য system শুধু একটি signal-এর ভিত্তিতে final decision না নেওয়ার চেষ্টা করবে।

---

# 19. Contact Validation

Anonymous complaint-এর ক্ষেত্রেও valid contact requirement থাকবে।

Required:

**Mobile OR Email**

Email ব্যবহার করলে:

* valid format
* verification/validation
* fake/disposable/invalid address prevention

প্রয়োগ করতে হবে।

---

# 20. Rate Limiting

Endpoint-specific rate limits থাকবে।

Sensitive endpoints:

* Login
* Registration
* Password reset
* OTP
* Complaint submission
* Evidence upload
* Contact/support
* Public APIs
* Admin authentication
* Sensitive Admin actions

---

# 21. Abuse Response

System abuse অনুযায়ী বিভিন্ন response নিতে পারবে:

```text
Normal
 ↓
Rate Limit
 ↓
Throttle
 ↓
Cooldown
 ↓
Temporary Block
```

Confirmed brute-force/automated abuse হলে stronger restriction প্রয়োগ করা যেতে পারে।

Legitimate user unnecessarily block করা যাবে না।

---

# 22. Cloudflare Protection

Public-facing infrastructure-এ প্রয়োজন অনুযায়ী:

* Cloudflare WAF
* rate limiting
* bot protection
* Turnstile/CAPTCHA

ব্যবহার করা যেতে পারে।

এগুলো backend authorization-এর replacement নয়।

---

# 23. CSRF Protection

Cookie-based authentication ব্যবহৃত হলে state-changing requests-এর জন্য CSRF protection প্রয়োগ করতে হবে।

বিশেষ করে:

* POST
* PATCH
* DELETE
* critical state-changing requests

protect করতে হবে।

---

# 24. CORS

CORS allowlist ব্যবহার করতে হবে।

Production environment-এ wildcard origin ব্যবহার করা যাবে না যেখানে credentialed access প্রয়োজন।

Allowed frontend origins configuration-এর মাধ্যমে নির্ধারিত হবে।

---

# 25. Security Headers

Applicable security headers ব্যবহার করতে হবে:

* Helmet
* Content Security Policy
* HSTS
* appropriate frame restrictions
* MIME sniffing protection
* secure referrer policy

Exact production policy deployment-এর সময় environment অনুযায়ী কঠোর করা হবে।

---

# 26. Input Validation

Client-side validation এবং server-side validation দুটোই থাকবে।

কিন্তু:

**Backend validation authoritative।**

Validate করতে হবে:

* required fields
* type
* length
* enum
* dates
* locations
* email
* mobile
* URLs
* file metadata
* IDs/references

---

# 27. NoSQL Injection Protection

MongoDB input-এর ক্ষেত্রে:

* unsafe operators prevent করতে হবে
* query input sanitize করতে হবে
* arbitrary query object গ্রহণ করা যাবে না
* repository layer controlled queries ব্যবহার করবে

---

# 28. XSS Protection

User-generated text যেমন complaint description, messages, external metadata ইত্যাদি নিরাপদভাবে handle করতে হবে।

Public output render করার আগে context-appropriate escaping/sanitization করতে হবে।

Raw HTML user input হিসেবে trusted হবে না।

---

# 29. SSRF Protection

External evidence links-এর জন্য SSRF protection mandatory।

URL validation:

```text
User URL
 ↓
Scheme Validation
 ↓
Host Validation
 ↓
Private/Internal Address Protection
 ↓
Safe Fetch/Check
```

Internal service/IP access allow করা যাবে না যেখানে unnecessary।

---

# 30. File Upload Security

File upload কখনো inherently trusted নয়।

Process:

```text
Upload Request
 ↓
Authorization
 ↓
Metadata Validation
 ↓
Quarantine
 ↓
Malware Scan
 ↓
Clean?
 ├── NO → Reject/Quarantine
 └── YES → Private Storage
```

---

# 31. Malware Scanner Failure

যদি malware scanner:

* fail করে
* unavailable হয়
* result না দেয়

তাহলে file trusted/accepted/public করা যাবে না।

**Fail Closed**

approach ব্যবহার হবে।

---

# 32. Evidence Security

Evidence default private।

MongoDB:

* metadata
* storage reference
* hash
* status

রাখবে।

Actual evidence file:

**Google Cloud Storage**

এ থাকবে।

---

# 33. Evidence Integrity

Evidence metadata-তে SHA-256 hash রাখা হবে।

Additional information:

* original filename
* MIME type
* size
* upload timestamp
* uploader
* storage object key
* scan status
* review status

Evidence integrity metadata evidence authenticity-এর automatic proof নয়।

---

# 34. Signed URLs

Private evidence access:

```text
Authorized Request
 ↓
Permission Check
 ↓
Short-Lived Signed URL
```

Permanent public URL ব্যবহার করা যাবে না।

---

# 35. Public Evidence Security

Public-approved evidence login ছাড়াই দেখা যাবে।

কিন্তু public evidence:

* approved version
* redacted version, যেখানে necessary

হতে হবে।

Raw sensitive file public করা যাবে না।

---

# 36. Public Evidence Viewer Tracking

**Public evidence কে দেখেছে তা track করা হবে না।**

তাই public viewer tracking-এর জন্য আলাদা access-log collection/system থাকবে না।

তবে:

**কোন Admin/Reviewer evidence public করার approval দিয়েছে**

তা audit log-এ থাকবে।

---

# 37. Evidence Deletion Security

Evidence deletion:

```text
Delete Request
 ↓
Permission Check
 ↓
Legal Hold Check
 ↓
Confirmation / Critical Security Check
 ↓
Delete
 ↓
Audit
```

Required audit fields:

* actor
* reason
* timestamp
* evidence
* action result

---

# 38. Legal Hold

Legal hold থাকলে evidence deletion block করা যাবে।

Legal/audit-related required records automaticভাবে permanently delete করা যাবে না।

---

# 39. Public Report Sanitization

Public Report তৈরি হবে:

```text
Internal Complaint
 ↓
Verification
 ↓
Disclosure Review
 ↓
Safety Review
 ↓
Sanitization
 ↓
Public Report
```

Internal document সরাসরি client-কে expose করা যাবে না।

---

# 40. Sensitive Victim Protection

Additional protection apply করতে হবে:

* minors
* sexual violence victims
* vulnerable victims
* high-risk persons
* highly sensitive cases

Victim identifying fields public না-ও হতে পারে।

Publication-এর পরে visibility update করা সম্ভব হবে।

---

# 41. Accused Information Security

Accused information automatically public নয়।

Publication review-এর সময় নির্ধারণ হবে:

* কোন information public হবে
* কোন information private থাকবে
* কোন identifying detail redact হবে

Platform complaint-এর ভিত্তিতে legally established guilt imply করবে না।

---

# 42. Legal Information Security

Legal information public করার আগে approved public-safe version প্রয়োজন।

Private legal documents default private।

Sensitive sections redact করা যাবে।

Reporter-provided legal information:

**Unverified claim হিসেবে treat করা হবে যতক্ষণ না authorized review/official source পাওয়া যায়।**

---

# 43. Audit Logs

Audit log এবং Security log আলাদা।

Audit log important accountability action record করবে।

যেমন:

* complaint verification
* publication decision
* evidence publication
* evidence deletion
* correction approval/rejection
* withdrawal decision
* Admin creation
* permission changes
* critical settings
* financial changes
* Join Us export/delete
* privileged security actions

---

# 44. Audit Log Integrity

Critical audit records:

* append-only behavior
* unauthorized modification protection
* controlled access

রাখবে।

Audit log সাধারণ User-এর জন্য accessible নয়।

---

# 45. Security Logs

Security events separate `securityLogs` collection-এ থাকবে।

উদাহরণ:

* failed login
* suspicious request pattern
* brute-force signal
* rate-limit event
* cooldown
* temporary block
* privileged security event

---

# 46. Sensitive Data in Logs

Never log:

* password
* raw authentication token
* refresh token
* 2FA secret
* OAuth secret
* GCS private credential
* API secret
* sensitive evidence content

Personal information-ও যতটা সম্ভব minimized থাকবে।

---

# 47. Request / Correlation ID

প্রতিটি relevant request-এর unique request/correlation ID থাকবে।

এই ID connect করতে পারে:

```text
Request
 ↓
Application Log
 ↓
Security Log
 ↓
Audit Log
 ↓
Error
```

Support/debugging-এর জন্য safe request ID client-কে return করা যেতে পারে।

---

# 48. Re-authentication

Critical operation-এর আগে account identity পুনরায় verify করা যাবে।

বিশেষ করে:

* financial changes
* critical security changes
* privileged configuration
* sensitive administrative action

---

# 49. Two-Factor Authentication

Mandatory:

```text
Admin
Super Admin
```

User-এর জন্য mandatory নয়।

Privileged action-এ 2FA confirmation পুনরায় প্রয়োজন হতে পারে।

---

# 50. Admin Permission Security

Admin granular permissions পাবে।

একজন Admin-এর permission:

* grant
* change
* revoke

করা হলে relevant audit log তৈরি হবে।

Critical permission modification enhanced security-এর অধীনে থাকবে।

---

# 51. Super Admin Security

Super Admin highest privilege হলেও unrestricted invisible action model হবে না।

Critical actions:

* explicit permission
* re-authentication
* 2FA
* audit

এর অধীনে থাকবে।

---

# 52. User Account Security

User নিজের:

* password
* profile data
* language preference
* permitted account settings

manage করতে পারবে।

User account deletion feature নেই।

---

# 53. User Session Privacy

User active session list দেখতে পারবে না।

তাই frontend-এ:

```text
Active Sessions
Device Sessions
Login Sessions List
```

জাতীয় user-facing dashboard feature থাকবে না।

---

# 54. Admin Session Revocation

Privileged session revoke করার administrative capability permission-controlled হবে।

User নিজে active session inventory দেখতে পারবে না।

Privileged security operation audit করা হবে।

---

# 55. Account Enumeration Protection

Authentication-related response এমনভাবে তৈরি করা উচিত যাতে unnecessaryভাবে:

* email registered কি না
* account exists কি না
* internal identity information

reveal না করে।

বিশেষ করে password reset flow-এ generic response ব্যবহার করা উচিত।

---

# 56. Authentication Brute-Force Protection

Login:

```text
Attempt
 ↓
Rate Limit
 ↓
Risk Evaluation
 ↓
Cooldown / Temporary Block when necessary
```

করতে পারবে।

Repeated failed authentication `securityLogs`-এ record হতে পারে।

---

# 57. Email Security

Email verification এবং password reset links:

* time-limited
* single-use where appropriate
* secure random token
* stored hashed/reference form where feasible

হবে।

---

# 58. OAuth Security

Google/Facebook authentication:

* provider authorization flow
* state protection
* callback validation
* account linking protection

অনুসরণ করবে।

OAuth client secrets server-side রাখবে।

---

# 59. Environment Secret Security

Sensitive credentials কখনো Git repository-তে থাকবে না।

`.env`:

```text
ignored
```

হবে।

Repository-তে থাকবে:

```text
.env.example
```

কিন্তু real secret থাকবে না।

---

# 60. Production Secret Handling

Production secrets hosting/platform secret manager/environment configuration-এ থাকবে।

Source code-এ:

* password
* MongoDB URI
* OAuth secret
* GCS credential
* email secret
* AI API key

hard-code করা যাবে না।

---

# 61. Data Exposure Control

API response-এর জন্য explicit DTO/serializer/whitelist ব্যবহার করতে হবে।

Sensitive fields automatically JSON serialization-এ চলে যাওয়া যাবে না।

বিশেষ attention:

* reporter identity
* security metadata
* internal notes
* reviewer information
* private evidence metadata
* private legal documents
* financial configuration

---

# 62. Admin Internal Notes

Internal reviewer/admin notes:

* public নয়
* সাধারণ User-এর জন্য automatic নয়
* public report-এ যাবে না

কেবল policy/permission অনুযায়ী expose করা যাবে।

---

# 63. Join Us Security

Join Us private collection।

Contains potentially sensitive:

* contact information
* profession
* social links
* portfolio
* CV
* recommendation documents
* work experience
* internal notes

Access শুধুমাত্র authorized Admin/Super Admin।

---

# 64. Join Us Export Security

Export:

* specific permission required
* authorized Admin/Super Admin
* audit logged

হবে।

Export file secure handling অনুসরণ করবে।

---

# 65. Join Us Delete Security

Delete:

**Super Admin only**

Critical operation security:

* permission
* re-authentication
* 2FA
* audit

প্রযোজ্য।

---

# 66. Data Retention

সব data-এর retention একই হবে না।

Complaint/legal/audit records policy অনুযায়ী retained থাকবে।

Account deletion না থাকায় User account এবং associated records retention rules অনুযায়ী maintain হবে।

Join Us-এর fixed automatic retention period নেই।

---

# 67. Backups

Production MongoDB data backup ব্যবস্থা থাকতে হবে।

Backup:

* secure
* access-controlled
* encrypted where supported
* monitored

হবে।

Backup restore testing periodic basis-এ করা উচিত।

---

# 68. Recovery

Critical infrastructure failure হলে recovery planning থাকবে।

Relevant targets:

* Recovery Point Objective (RPO)
* Recovery Time Objective (RTO)

Implementation/deployment stage-এ organization-এর actual capacity অনুযায়ী নির্ধারিত হবে।

---

# 69. Availability Security

Security শুধু confidentiality নয়; availability-ও গুরুত্বপূর্ণ।

Protection:

* rate limiting
* resource controls
* upload controls
* monitoring
* backup
* graceful error handling

ব্যবহার করবে।

---

# 70. Monitoring

Monitor করা হবে:

* authentication failures
* suspicious requests
* API errors
* unusual traffic
* database health
* storage health
* upload failures
* malware scanner status
* queue/job backlog
* high latency
* infrastructure availability

---

# 71. Security Alerts

Security alerts হতে পারে:

* repeated failed login
* probable brute-force
* unusual administrative activity
* suspicious upload activity
* repeated malicious file attempts
* unusual privileged actions
* security configuration changes

Appropriate Admin/Super Admin notification/security workflow ব্যবহার করা হবে।

---

# 72. Error Security

Client-কে কখনো expose করা যাবে না:

* stack trace
* database query
* internal filesystem path
* credentials
* secret
* private object storage key
* internal infrastructure details

Safe human-readable error response দিতে হবে।

---

# 73. HTTP Security

Production environment-এ:

* HTTPS mandatory
* secure cookies
* HttpOnly cookies
* appropriate SameSite configuration
* HSTS

ব্যবহার করতে হবে।

---

# 74. Cookie Security

Authentication cookies:

* Secure
* HttpOnly
* appropriate SameSite
* narrow scope where possible

হবে।

JavaScript থেকে sensitive authentication cookie access করা যাবে না।

---

# 75. Database Security

MongoDB Atlas:

* credential-protected access
* least-privilege database users
* network access controls যেখানে appropriate
* encrypted transport
* backup configuration

ব্যবহার করবে।

Application user কখনো direct MongoDB access পাবে না।

---

# 76. GCS Security

Google Cloud Storage:

* private-by-default bucket/object access
* application-controlled access
* no unrestricted bucket access
* signed URL for private retrieval
* lifecycle policy যেখানে applicable

অনুসরণ করবে।

---

# 77. File Metadata Privacy

Evidence metadata-এর private fields public response-এ leak করা যাবে না।

বিশেষ করে:

* GCS object key
* internal upload path
* uploader account identifiers
* internal scanner data

public API response-এ যাবে না।

---

# 78. Public/User Consistency Security

Public এবং User page একই approved public-report source ব্যবহার করবে।

```text
publicReports
      ↓
Public API
      ↓
Public Page

publicReports
      ↓
Public API / Shared Public Data Layer
      ↓
User Page
```

User account থাকার কারণে public information কম/বেশি হবে না।

Private User data public source-এ merge করা যাবে না।

---

# 79. AI Security

AI service-এ data পাঠানোর আগে data minimization এবং authorization policy apply করতে হবে।

AI-কে unnecessary sensitive information পাঠানো যাবে না।

AI output trusted evidence বা legal truth হিসেবে treat করা যাবে না।

Human review required।

---

# 80. Dependency Security

Project dependencies:

* regularly audited
* unnecessary packages avoided
* known vulnerable dependency হলে update/mitigate করা
* lockfile maintained

হবে।

---

# 81. Development Security

Developer/AI coding assistant:

* secrets commit করবে না
* test data-তে real victim data ব্যবহার করবে না
* real evidence local repository-তে রাখবে না
* production credentials local source code-এ রাখবে না
* security middleware bypass করবে না
* role boundary পরিবর্তন করবে না

---

# 82. Security Testing

Security test cover করবে:

### Authentication

* invalid credentials
* brute-force
* reset-token misuse
* OAuth callback abuse

### Authorization

* User → Admin access
* Admin → Super Admin access
* cross-user complaint access
* unauthorized evidence access
* unauthorized Join Us access

### Input Security

* NoSQL injection
* XSS
* SSRF
* malformed request
* invalid file upload

### Evidence

* malicious file
* scanner failure
* private object access
* signed URL misuse
* redacted/public version separation

### Business Abuse

* non-user 5-limit bypass attempts
* repeated complaint abuse
* correction-limit bypass
* duplicate submission abuse

---

# 83. Security Review Checklist

Before production release:

```text
[ ] HTTPS
[ ] Secure cookies
[ ] Argon2id
[ ] 2FA for Admin/Super Admin
[ ] RBAC
[ ] Object-level authorization
[ ] Rate limiting
[ ] CSRF
[ ] CORS
[ ] Helmet/security headers
[ ] CSP
[ ] HSTS
[ ] Input validation
[ ] NoSQL injection protection
[ ] XSS protection
[ ] SSRF protection
[ ] File validation
[ ] Malware scan
[ ] Private GCS
[ ] Signed URLs
[ ] Audit logs
[ ] Security logs
[ ] Request IDs
[ ] Secret protection
[ ] Backup
[ ] Restore testing
[ ] Monitoring
[ ] Security tests
```

---

# 84. Security Incident Response

Security incident হলে সাধারণ flow:

```text
Detect
 ↓
Contain
 ↓
Investigate
 ↓
Remediate
 ↓
Audit
 ↓
Recover
```

Incident data এবং actions যথাযথ security/audit log-এ থাকবে।

---

# 85. Security vs Privacy

দুইটি আলাদা concern:

### Security

Unauthorized access ঠেকানো।

### Privacy

Authorized system-এর মধ্যেও কোন data কে কতটা দেখতে পারবে তা নিয়ন্ত্রণ করা।

এই platform-এ দুটোই mandatory।

---

# 86. Non-Negotiable Security Rules

1. Backend authorization mandatory।
2. Frontend hiding security নয়।
3. User/Admin/Super Admin strict separation।
4. User নিজের active sessions দেখতে পারবে না।
5. Admin/Super Admin 2FA mandatory।
6. Critical actions re-authentication + 2FA require করবে।
7. Password plaintext নয়।
8. Raw tokens log/store করা যাবে না।
9. Reporter ID private।
10. Anonymous ≠ completely untraceable।
11. Non-user 5-complaint limit bypass করা যাবে না।
12. Complaint default private।
13. Public report approved/sanitized data থেকে তৈরি হবে।
14. Public এবং User page একই approved public report information দেখাবে।
15. Evidence default private।
16. Malware-scanned না হওয়া file trusted নয়।
17. Private evidence signed URL authorization-এর মাধ্যমে access হবে।
18. Public evidence viewing track করা হবে না।
19. Evidence publication approval audit হবে।
20. Sensitive evidence redact/withhold করা যাবে।
21. Internal reviewer notes public নয়।
22. Legal update automatically public নয়।
23. Join Us private collection।
24. Join Us deletion Super Admin only।
25. Financial destination settings Super Admin only।
26. Critical financial changes audit + re-authentication + 2FA require করবে।
27. Public/User/Admin APIs internal documents directly expose করবে না।
28. Secrets Git-এ থাকবে না।
29. AI final legal/verification decision নিতে পারবে না।
30. Security controls product requirements-এর বাইরে নতুন user-facing behavior invent করবে না।

---

# 87. Final Security Architecture

```text
                         INTERNET
                            │
                            ▼
                       CLOUDFLARE
                     WAF / Protection
                            │
                            ▼
                        FRONTEND
                            │
                            ▼
                         API
                            │
             ┌──────────────┴──────────────┐
             │                             │
      Authentication                 Security
             │                       Middleware
             │                             │
             └──────────────┬──────────────┘
                            ▼
                     Authorization
                            │
                    ┌───────┴───────┐
                    │               │
                 Resource        Permission
                 Ownership
                    │               │
                    └───────┬───────┘
                            ▼
                        Services
                            │
                 ┌──────────┼───────────┐
                 │          │           │
                 ▼          ▼           ▼
              MongoDB      GCS        External
              Atlas                    Services
                 │          │
                 └──────┬───┘
                        ▼
                 Audit / Security
                     Logging
```

---

## Document Status

**Document:** SECURITY.md
**Version:** 1.0
**Status:** Frozen for implementation
**Parent:** PRD v1.0
**Database:** DATABASE-SCHEMA.md v1.0
**API:** API-SPECIFICATION.md v1.0
**Architecture:** BACKEND-ARCHITECTURE.md + PROJECT-STRUCTURE.md v1.0
