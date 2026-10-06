# JonoShor

## DEVELOPMENT-ROADMAP.md

### Implementation Roadmap — v1.0

> **Project:** JonoShor (জনস্বর)
> **Purpose:** Frozen specifications থেকে implementation-এর জন্য master development sequence।
>
> **Source of Truth:**
> `PRD.md`
> `DATABASE-SCHEMA.md`
> `API-SPECIFICATION.md`
> `BACKEND-ARCHITECTURE.md`
> `PROJECT-STRUCTURE.md`
> `SECURITY.md`
> `FRONTEND-ARCHITECTURE.md`
>
> এই roadmap কোনো নতুন product requirement তৈরি করে না। Frozen specifications-এ যা approved আছে, শুধু সেটাই implement করা হবে।

---

# 1. Development Philosophy

JonoShor একবারে পুরো application build করবে না।

Implementation হবে:

```text id="r9q6ko"
Foundation
   ↓
Security
   ↓
Data
   ↓
Authentication
   ↓
Core Complaint System
   ↓
Evidence
   ↓
Review & Verification
   ↓
Public Reports
   ↓
User Experience
   ↓
Admin
   ↓
Super Admin
   ↓
Organization
   ↓
Communication
   ↓
Statistics/Search
   ↓
Testing
   ↓
Production
```

প্রতিটি phase-এর শেষে test/verification হবে।

---

# 2. Priority Levels

## P0 — Foundation & Security

System দাঁড় করানোর ভিত্তি।

## P1 — Core Platform

Complaint থেকে public report পর্যন্ত মূল functionality।

## P2 — Organization

Join Us এবং organization-related capabilities।

## P3 — Financial

Donation/payment-related functionality।

## P4 — Optimization

Search, analytics, automation এবং AI assistance।

---

# 3. Phase 0 — Repository & Documentation Setup

### Goal

Project-এর initial repository এবং documentation structure তৈরি করা।

### Tasks

```text id="bvr1b0"
[ ] Create JonoShor repository
[ ] Create root folder structure
[ ] Add docs/
[ ] Add PRD.md
[ ] Add DATABASE-SCHEMA.md
[ ] Add API-SPECIFICATION.md
[ ] Add BACKEND-ARCHITECTURE.md
[ ] Add PROJECT-STRUCTURE.md
[ ] Add SECURITY.md
[ ] Add FRONTEND-ARCHITECTURE.md
[ ] Add DEVELOPMENT-ROADMAP.md
[ ] Add README.md
[ ] Add .gitignore
[ ] Add .env.example
[ ] Initialize Git
```

### Completion Criteria

Project opens cleanly and documentation structure is available before application coding begins.

---

# 4. Phase 1 — Monorepo Initialization

### Goal

Frontend এবং Backend-এর runnable base তৈরি করা।

### Tasks

```text id="sdllj8"
[ ] Initialize root package
[ ] Initialize frontend
[ ] Initialize backend
[ ] Configure Vite
[ ] Configure Tailwind
[ ] Configure ESLint
[ ] Configure Prettier
[ ] Configure Node.js
[ ] Configure Express
[ ] Configure development scripts
[ ] Configure production scripts
```

### Output

```text id="b80uix"
JonoShor
├── frontend/
└── backend/
```

### Completion Criteria

Frontend এবং backend আলাদাভাবে local environment-এ start করতে পারবে।

---

# 5. Phase 2 — Backend Foundation

### Goal

Express application-এর clean architecture তৈরি করা।

### Tasks

```text id="rh9tq2"
[ ] app.js
[ ] server.js
[ ] config/
[ ] routes/
[ ] controllers/
[ ] services/
[ ] repositories/
[ ] models/
[ ] middlewares/
[ ] validators/
[ ] integrations/
[ ] jobs/
[ ] utils/
[ ] constants/
[ ] error handling
[ ] request ID
[ ] structured logging
```

### Completion Criteria

একটি basic health endpoint কাজ করবে।

Example:

```text
GET /api/v1/health
```

Response:

```text id="m8n8ku"
{
  "success": true
}
```

---

# 6. Phase 3 — MongoDB Foundation

### Goal

MongoDB Atlas connection এবং database layer তৈরি করা।

### Tasks

```text id="nn0eeu"
[ ] MongoDB connection
[ ] Environment configuration
[ ] Connection error handling
[ ] Graceful shutdown
[ ] Mongoose configuration
[ ] Base schema conventions
[ ] Index strategy
```

তারপর approved models একে একে তৈরি করা হবে।

Core sequence:

```text id="m6n2oi"
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
correctionRequests
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

### Completion Criteria

Application MongoDB Atlas-এ successfully connect করবে এবং test model read/write করতে পারবে।

---

# 7. Phase 4 — Bangladesh Location Data

### Goal

Complaint-এর structured location system প্রস্তুত করা।

### Tasks

```text id="44zv1m"
[ ] Division reference
[ ] District data
[ ] Upazila/Thana data
[ ] Bangla names
[ ] English names
[ ] IDs/references
[ ] Active state
[ ] Seed script
[ ] Search/filter support
```

### Completion Criteria

UI থেকে:

```text
Division
 ↓
District
 ↓
Upazila/Thana
```

ঠিকভাবে select করা যাবে।

---

# 8. Phase 5 — Authentication Foundation

### Goal

User/Admin/Super Admin authentication তৈরি করা।

### Tasks

```text id="vtttmh"
[ ] User registration
[ ] Email validation
[ ] Email verification
[ ] Login
[ ] Logout
[ ] Password hashing with Argon2id
[ ] Password reset
[ ] Secure cookies
[ ] Session creation
[ ] Refresh token rotation
[ ] Refresh token revocation
```

### Social Authentication

```text id="d8z3vk"
[x] Google Login
[ ] Facebook Login
```

### Completion Criteria

User register → verify → login → authenticated request সফল হবে।

---

# 9. Phase 6 — Admin & Super Admin Authentication

### Goal

Privileged account authentication secure করা।

### Tasks

```text id="d7xr0e"
[ ] Admin authentication
[ ] Super Admin authentication
[ ] Mandatory 2FA
[ ] Admin session handling
[ ] Privileged authentication middleware
[ ] Re-authentication mechanism
```

### Completion Criteria

Admin/Super Admin authentication 2FA ছাড়া সম্পূর্ণ হবে না।

---

# 10. Phase 7 — RBAC & Authorization

### Goal

User/Admin/Super Admin boundary enforce করা।

### Tasks

```text id="w4j5be"
[ ] Role middleware
[ ] Permission middleware
[ ] Object-level authorization
[ ] User ownership checks
[ ] Admin permissions
[ ] Super Admin protection
[ ] Forbidden responses
```

### Mandatory Tests

```text id="ew0x6h"
[ ] User → User API = allowed
[ ] User → Admin API = denied
[ ] User → Super Admin API = denied
[ ] Admin → Admin API = allowed with permission
[ ] Admin → Super Admin API = denied
[ ] Super Admin → Super Admin API = allowed
```

---

# 11. Phase 8 — Security Baseline

### Goal

Application-এর core security controls enable করা।

### Tasks

```text id="q7f1qv"
[ ] Helmet
[ ] CSP
[ ] HSTS
[ ] CORS allowlist
[ ] CSRF protection
[ ] Rate limiting
[ ] Input validation
[ ] NoSQL injection protection
[ ] XSS protection
[ ] SSRF protection
[ ] Request IDs
[ ] Secure error handling
[ ] Security logging
[ ] Audit logging
```

### Completion Criteria

Security test suite-এর baseline pass করতে হবে।

---

# 12. Phase 9 — Reporter System

### Goal

User এবং non-user Reporter architecture তৈরি করা।

### Tasks

```text id="d8e4on"
[ ] Reporter creation
[ ] Reporter lookup
[ ] User → Reporter link
[ ] Non-user Reporter
[ ] Persistent Reporter identity
[ ] Reporter contact validation
[ ] Reporter visibility
[ ] Account linking without new Reporter ID
```

### Non-User Limit

```text id="8kaf4b"
Maximum = 5 complaints
```

Enforcement:

```text
IP
+
Browser/Session Signals
+
Security Signals
+
Rate Limiting
```

### Completion Criteria

Non-user 6th complaint-এর সময় account requirement correctly enforce হবে।

---

# 13. Phase 10 — Complaint Submission

### Goal

Platform-এর core complaint functionality।

### User Flow

```text id="uyv16m"
User
 ↓
Complaint Form
 ↓
Validation
 ↓
Reporter
 ↓
Complaint
 ↓
Submitted
```

### Non-User Flow

```text id="r3hs79"
Visitor
 ↓
Security Check
 ↓
Reporter
 ↓
Complaint
 ↓
Submitted
```

### Tasks

```text id="r4a4yd"
[ ] Complaint model
[ ] Category
[ ] Secondary categories
[ ] Incident date/range
[ ] Incident description
[ ] Location
[ ] Accused
[ ] Victims
[ ] Contact requirement
[ ] Sensitivity
[ ] Priority
[ ] Risk flags
[ ] Status
[ ] Status history
```

### Completion Criteria

Valid complaint safely database-এ তৈরি হবে।

---

# 14. Phase 11 — Complaint User Dashboard

### Goal

Registered user নিজের complaints manage/track করতে পারবে।

### Tasks

```text id="0bphjr"
[ ] My Complaints
[ ] Complaint details
[ ] Status
[ ] Status timeline
[ ] Information requests
[ ] Permitted evidence
[ ] Public report section
[ ] Legal/authority public updates
```

### Important

User অন্য user's complaint access করতে পারবে না।

User active sessions দেখতে পারবে না।

---

# 15. Phase 12 — Complaint Review & Screening

### Goal

Admin review pipeline চালু করা।

### Tasks

```text id="66fxgk"
[ ] Complaint queue
[ ] Screening
[ ] Request more information
[ ] Rejection
[ ] Pending state
[ ] Reviewer assignment
[ ] Conflict declaration
[ ] Internal reviewer notes
```

### Completion Criteria

Submitted complaint Admin review pipeline-এ properly প্রবেশ করবে।

---

# 16. Phase 13 — Evidence Infrastructure

### Goal

Secure large-file evidence system।

### Tasks

```text id="7fhv22"
[ ] GCS integration
[ ] Upload session
[ ] Direct/resumable upload
[ ] Quarantine
[ ] Malware scanning
[ ] Evidence metadata
[ ] SHA-256
[ ] Private storage
[ ] Signed URL
[ ] External evidence link
[ ] SSRF-safe URL validation
```

### Supported Types

```text id="lron1o"
Image
PDF
Video
Audio
Document
External Link
```

---

# 17. Phase 14 — Evidence Review

### Goal

Admin/Reviewer evidence review system।

### Tasks

```text id="w0w2xa"
[ ] Evidence review
[ ] Malware status
[ ] Relevance review
[ ] Credibility assessment
[ ] Review decision
[ ] Reject evidence
[ ] Sensitive evidence marking
```

### Rule

```text
Uploaded Evidence ≠ Proven Evidence
```

---

# 18. Phase 15 — Public Evidence

### Goal

Approved evidence safely public করা।

### Tasks

```text id="hbua9o"
[ ] Public approval
[ ] Redaction
[ ] Safe public version
[ ] Public evidence access
[ ] Public evidence API
```

### Non-Negotiable

```text
Private Evidence
      ↓
Review
      ↓
Approved?
 ├── No → Private
 └── Yes
      ↓
Public Safe Version
```

Public evidence viewer tracking থাকবে না।

---

# 19. Phase 16 — Verification

### Goal

Human-reviewed verification system।

### Tasks

```text id="tz28cr"
[ ] Reviewer verification workspace
[ ] Verification decision
[ ] Verification reasoning
[ ] Evidence assessment
[ ] Corroboration
[ ] Consistency review
[ ] Conflict check
[ ] Verification status
```

AI assistance optional।

Final decision human reviewer-এর।

---

# 20. Phase 17 — Public Disclosure Review

### Goal

Verified complaint থেকে safe public report তৈরি করা।

### Review Areas

```text id="9yha6n"
Reporter visibility
Victim visibility
Accused visibility
Incident details
Evidence
Authority actions
Legal information
```

### Tasks

```text id="bcfg8p"
[ ] Disclosure review
[ ] Field visibility
[ ] Victim safety review
[ ] Sensitive-data redaction
[ ] Public-safe transformation
```

---

# 21. Phase 18 — Public Reports

### Goal

Public report system চালু করা।

### Tasks

```text id="8s2y1m"
[ ] PublicReport model
[ ] Public report creation
[ ] Public report update
[ ] Report listing
[ ] Report details
[ ] Search/filter
[ ] Public-safe API
```

### Language

```text
bn
en
```

### Important

Public Report কখনো raw complaint document নয়।

---

# 22. Phase 19 — Public/User Shared Reports

### Goal

Public এবং logged-in User interface-এর approved public data consistency নিশ্চিত করা।

Canonical source:

```text
publicReports
```

Architecture:

```text id="k8jjf0"
                 publicReports
                      │
               ┌──────┴──────┐
               ▼             ▼
            Public          User
```

### Acceptance Criteria

একটি approved report:

* Public Reports page-এ থাকবে
* User area-তেও একই approved public information থাকবে
* আলাদা duplicate dataset থাকবে না

Public report-এর approved evidence-ও একইভাবে consistent থাকবে।

---

# 23. Phase 20 — Legal & Authority Tracking

### Goal

Complaint-এর legal progression document করা।

### Tasks

```text id="6eu5jm"
[ ] Legal case creation
[ ] Multiple cases
[ ] Case number
[ ] Authorities
[ ] Multiple courts
[ ] Legal status
[ ] Arrest status
[ ] Bail status
[ ] Investigation status
[ ] Timeline
[ ] Outcomes
[ ] Official references
[ ] Public legal summary
[ ] Authority action
```

### Rule

Reporter-provided legal claim automatically verified হবে না।

---

# 24. Phase 21 — Corrections & Withdrawals

### Tasks

```text id="p4v6ng"
[ ] Correction request
[ ] Maximum 3 requests
[ ] Correction review
[ ] Evidence review
[ ] Approved update
[ ] Withdrawal request
[ ] Withdrawal review
[ ] Withdrawn status
```

Public correction history show করা হবে না।

Public report approved correction-এর পরে silently update হতে পারে।

---

# 25. Phase 22 — Notifications

### Goal

System communication চালু করা।

### Tasks

```text id="gb2dhh"
[ ] Notification model
[ ] In-app notification
[ ] Email notification
[ ] Read/unread
[ ] Safe notification content
[ ] Target URL
[ ] Email delivery status
[ ] Security notifications
```

Sensitive complaint details notification body-তে থাকবে না।

---

# 26. Phase 23 — Messaging

### Goal

Admin ↔ User communication।

### Tasks

```text id="a1llyh"
[ ] Conversation
[ ] Admin message
[ ] User reply
[ ] Full history
[ ] Read/unread
[ ] Complaint-linked communication
```

Messages:

* Edit করা যাবে না
* Delete করা যাবে না

Admin-to-Admin chat current version-এ থাকবে না।

---

# 27. Phase 24 — User Profile & Settings

### Tasks

```text id="dvklp3"
[ ] Profile
[ ] Email
[ ] Mobile
[ ] External links
[ ] Language preference
[ ] Profile photo
[ ] Account settings
```

### Important

Public User profile তৈরি হবে না।

Account deletion feature থাকবে না।

Active sessions viewer থাকবে না।

---

# 28. Phase 25 — Join Us

### Goal

Private organization-interest submission system।

### Tasks

```text id="0h25um"
[ ] Join Us form
[ ] Valid email
[ ] Contact information
[ ] Profession
[ ] Secondary profession
[ ] Contribution roles
[ ] Supporting references
[ ] Portfolio/LinkedIn
[ ] CV
[ ] Recommendation letter
[ ] Work experience
[ ] Supporting documents
[ ] Duplicate detection
[ ] Admin notes
[ ] Confirmation email
```

Collection:

```text
joinUsSubmissions
```

Google Sheets নয়।

---

# 29. Phase 26 — Join Us Admin Management

### Tasks

```text id="9q8h7q"
[ ] Admin Join Us list
[ ] Submission details
[ ] Document review
[ ] Internal notes
[ ] Export
[ ] Access control
[ ] Super Admin-only delete
```

Fixed automatic retention নেই।

Applicant public member profile পাবে না।

---

# 30. Phase 27 — Public Content/CMS Foundation

Public platform content manage করার জন্য approved content architecture implement করা।

Potential content:

```text id="7d2krs"
About
Mission
How It Works
FAQ
Safety
Terms
Privacy
Code of Conduct
Announcements
```

Public content User area-এর applicable public views-এও consistent থাকবে।

---

# 31. Phase 28 — Statistics

### Goal

Public statistics চালু করা।

### Tasks

```text id="le9frf"
[ ] Total submitted count
[ ] Verified reports
[ ] Category statistics
[ ] District statistics
[ ] Time trends
[ ] Legal status
[ ] Authority actions
```

Statistics raw sensitive individual data expose করবে না।

---

# 32. Phase 29 — Search & Performance

### Tasks

```text id="q4f3z8"
[ ] Public report search
[ ] Keyword indexing
[ ] Filters
[ ] Pagination
[ ] Sorting
[ ] Database indexes
[ ] API performance
[ ] Frontend performance
[ ] Upload performance
```

---

# 33. Phase 30 — Donation / Financial System

**P3**

এই phase core complaint platform stable হওয়ার পরে শুরু হবে।

### Tasks

```text id="2v8nlo"
[ ] Donation interface
[ ] Payment integration
[ ] Donation records
[ ] Bank/payment configuration
[ ] Crypto donation configuration
[ ] Financial permissions
[ ] Super Admin controls
[ ] Financial audit
```

### Critical Rule

Sensitive financial destination configuration:

**Super Admin only**

Critical changes:

**Re-authentication + 2FA + Audit**

---

# 34. Phase 31 — AI Assistance

**P4**

Core system stable হওয়ার পরে।

### Potential Assistance

```text id="xx4fap"
[ ] Classification
[ ] Duplicate detection
[ ] Summarization
[ ] Translation
[ ] Moderation assistance
[ ] Pattern detection
```

AI final decision-maker হবে না।

---

# 35. Phase 32 — Security Hardening

Production-এর আগে দ্বিতীয় security pass।

### Checklist

```text id="q5jmwt"
[ ] Authentication review
[ ] Authorization review
[ ] Object-level access review
[ ] CSRF
[ ] CORS
[ ] CSP
[ ] HSTS
[ ] Rate limiting
[ ] Brute-force protection
[ ] SSRF
[ ] XSS
[ ] NoSQL injection
[ ] File upload security
[ ] GCS permissions
[ ] Signed URLs
[ ] Secret scanning
[ ] Dependency audit
[ ] Audit log integrity
[ ] Security log review
```

---

# 36. Phase 33 — Testing

## Unit Testing

Services এবং utilities:

```text id="s9a4c9"
[ ] Complaint rules
[ ] Reporter rules
[ ] 5-limit
[ ] Correction limit
[ ] Validation
[ ] Permission logic
[ ] Sanitization
[ ] Public report transformation
```

---

## Integration Testing

```text id="jq6lxa"
[ ] MongoDB
[ ] Authentication
[ ] GCS
[ ] Email
[ ] OAuth
[ ] AI integration
```

যেখানে applicable।

---

## API Testing

সব প্রধান API endpoint test করতে হবে।

---

# 37. Phase 34 — Security Testing

Mandatory scenarios:

```text id="zdwtj8"
[ ] User accesses another User complaint
[ ] User accesses Admin API
[ ] Admin accesses Super Admin API
[ ] Unauthorized evidence access
[ ] Private evidence public URL attempt
[ ] Malicious file
[ ] Scanner failure
[ ] SSRF attempt
[ ] NoSQL injection
[ ] XSS
[ ] Login brute-force
[ ] 5-limit bypass attempt
[ ] Correction-limit bypass
[ ] Unauthorized Join Us access
[ ] Unauthorized financial settings access
```

সব expected denial/allow behavior verify করতে হবে।

---

# 38. Phase 35 — UX & Accessibility Testing

Test:

```text id="xnd4eb"
[ ] Mobile
[ ] Tablet
[ ] Desktop
[ ] Keyboard navigation
[ ] Form usability
[ ] Error messages
[ ] Bangla UI
[ ] English UI
[ ] Complaint form simplicity
[ ] Evidence upload UX
[ ] Public report readability
```

---

# 39. Phase 36 — Data Integrity Testing

Test:

```text id="1h7i1h"
[ ] Reporter account linking
[ ] Complaint references
[ ] Evidence references
[ ] Legal case relationships
[ ] Public report relationship
[ ] Correction relationship
[ ] Notification relationship
[ ] Message relationship
```

---

# 40. Phase 37 — Backup & Recovery

### Tasks

```text id="d01u5k"
[ ] MongoDB backup
[ ] Backup verification
[ ] Restore test
[ ] GCS recovery planning
[ ] Recovery documentation
[ ] RPO
[ ] RTO
```

Actual RPO/RTO organization-এর capacity অনুযায়ী নির্ধারিত হবে।

---

# 41. Phase 38 — Monitoring & Observability

### Tasks

```text id="4z4qdd"
[ ] API health monitoring
[ ] Database monitoring
[ ] GCS monitoring
[ ] Upload monitoring
[ ] Malware scan monitoring
[ ] Authentication failure monitoring
[ ] Suspicious activity monitoring
[ ] Error monitoring
[ ] Latency monitoring
[ ] Job/queue monitoring
```

---

# 42. Phase 39 — Production Configuration

### Frontend

Cloudflare Pages।

### Backend

Render।

### Database

MongoDB Atlas।

### Storage

Google Cloud Storage।

### Tasks

```text id="7c9wo4"
[ ] Production environment variables
[ ] HTTPS
[ ] CORS production origin
[ ] Secure cookies
[ ] Production CSP
[ ] Production GCS permissions
[ ] Database production access
[ ] Monitoring
[ ] Backup
```

---

# 43. Phase 40 — Production Readiness Audit

Production deployment-এর আগে:

```text id="y3a8ov"
[ ] PRD compliance
[ ] Database compliance
[ ] API compliance
[ ] Backend architecture compliance
[ ] Frontend architecture compliance
[ ] Security compliance
[ ] Role separation
[ ] Public/User consistency
[ ] Evidence safety
[ ] Legal information safety
[ ] Join Us privacy
[ ] Backup
[ ] Monitoring
[ ] Test suite
```

---

# 44. Recommended Implementation Order

সব phase একই গুরুত্বের নয়।

সবচেয়ে practical sequence:

```text id="n4dr8m"
P0
│
├── Phase 0  Documentation
├── Phase 1  Repository
├── Phase 2  Backend Foundation
├── Phase 3  MongoDB
├── Phase 4  Location
├── Phase 5  Authentication
├── Phase 6  Privileged Authentication
├── Phase 7  RBAC
└── Phase 8  Security
        │
        ▼
P1
│
├── Phase 9  Reporter
├── Phase 10 Complaint
├── Phase 11 User Complaint Dashboard
├── Phase 12 Screening
├── Phase 13 Evidence Infrastructure
├── Phase 14 Evidence Review
├── Phase 15 Public Evidence
├── Phase 16 Verification
├── Phase 17 Disclosure
├── Phase 18 Public Reports
├── Phase 19 Public/User Consistency
├── Phase 20 Legal
├── Phase 21 Corrections/Withdrawal
├── Phase 22 Notifications
└── Phase 23 Messaging
        │
        ▼
P2
│
├── Phase 24 User Profile
├── Phase 25 Join Us
├── Phase 26 Join Us Admin
└── Phase 27 Public Content
        │
        ▼
P3
│
└── Phase 30 Financial
        │
        ▼
P4
│
├── Phase 28 Statistics
├── Phase 29 Search/Performance
└── Phase 31 AI
        │
        ▼
Release
│
├── Phase 32 Security Hardening
├── Phase 33 Testing
├── Phase 34 Security Testing
├── Phase 35 UX Testing
├── Phase 36 Data Integrity
├── Phase 37 Backup/Recovery
├── Phase 38 Monitoring
├── Phase 39 Production
└── Phase 40 Final Audit
```

---

# 45. Dependency Rules

কোনো phase-এর prerequisite অসম্পূর্ণ থাকলে dependent phase শুরু করা যাবে না।

উদাহরণ:

```text id="d0kruy"
RBAC
 ↓
Admin Review
```

RBAC complete না হলে Admin review build করা যাবে না।

```text id="b3g3kn"
GCS + Malware Scan
 ↓
Public Evidence
```

Evidence security complete না হলে public evidence launch করা যাবে না।

```text id="e27s4s"
Verification
 +
Disclosure Review
 ↓
Public Reports
```

---

# 46. Definition of Done

কোনো feature “Done” হবে যখন:

```text id="onp6to"
Code
 ↓
Validation
 ↓
API
 ↓
Authorization
 ↓
UI
 ↓
Error Handling
 ↓
Tests
 ↓
Security Check
 ↓
Documentation
```

সব complete।

শুধু frontend visually কাজ করলে feature complete ধরা হবে না।

---

# 47. AI Coding Assistant Rules

Gemini/Copilot/অন্যান্য coding AI-কে implementation-এর সময়:

1. প্রথমে relevant documentation read করতে হবে।
2. PRD override করা যাবে না।
3. Database schema override করা যাবে না।
4. API specification override করা যাবে না।
5. Role boundary পরিবর্তন করা যাবে না।
6. নতুন collection নিজের থেকে বানানো যাবে না।
7. unnecessary ID architecture তৈরি করা যাবে না।
8. Public/User data duplicate করা যাবে না।
9. Public evidence viewer tracking যোগ করা যাবে না।
10. User active-session viewer তৈরি করা যাবে না।
11. Join Us-কে User collection-এ merge করা যাবে না।
12. Google Sheets ব্যবহার করা যাবে না।
13. Python/অন্য framework introduce করা যাবে না।
14. Existing completed feature ভাঙা যাবে না।
15. আগে project analyze, তারপর targeted implementation করতে হবে।

---

# 48. Recommended AI Coding Workflow

প্রতিটি implementation task-এর জন্য:

```text id="4z3du9"
Read Relevant Docs
        ↓
Inspect Existing Code
        ↓
Identify Dependencies
        ↓
Implement Small Scope
        ↓
Run Tests
        ↓
Security Check
        ↓
Verify Existing Features
        ↓
Commit
```

AI যেন একবারে পুরো project rewrite না করে।

---

# 49. Git Strategy

Feature-based commits ব্যবহার করা উচিত।

Examples:

```text id="1e7nq1"
feat: initialize backend
feat: add mongodb connection
feat: implement user authentication
feat: add reporter system
feat: implement complaint submission
feat: add evidence upload
feat: add complaint verification
feat: add public reports
```

Security fix:

```text
fix: prevent unauthorized complaint access
fix: secure evidence access
fix: enforce non-user complaint limit
```

---

# 50. Milestone Structure

## Milestone 1 — Foundation

```text id="fybfz4"
Repository
Backend
Database
Auth
RBAC
Security
```

## Milestone 2 — Core Human Rights Platform

```text id="a28x2t"
Reporter
Complaint
Evidence
Review
Verification
Public Reports
Legal Tracking
```

## Milestone 3 — User & Organization

```text id="3woc5h"
Dashboard
Notifications
Messages
Join Us
Public Content
```

## Milestone 4 — Growth

```text id="bdbtki"
Statistics
Search
Donation
AI
```

## Milestone 5 — Production

```text id="4a7x7z"
Testing
Security Hardening
Backup
Monitoring
Deployment
Final Audit
```

---

# 51. Final Implementation Gate

JonoShor production-ready বলা যাবে শুধু তখন যখন:

```text id="8f2h38"
PRD
✓
Database
✓
API
✓
Backend
✓
Frontend
✓
Security
✓
Testing
✓
Backup
✓
Monitoring
✓
Deployment
✓
Final Audit
✓
```

সব complete হবে।

---

# 52. Frozen Architecture Dependency Chain

```text id="2t3d2u"
PRD
 ↓
DATABASE-SCHEMA
 ↓
API-SPECIFICATION
 ↓
BACKEND-ARCHITECTURE
 ↓
FRONTEND-ARCHITECTURE
 ↓
SECURITY
 ↓
DEVELOPMENT-ROADMAP
 ↓
IMPLEMENTATION
```

এই chain-এর উপরের document পরিবর্তন হলে নিচের impacted document review করতে হবে।

---

# 53. Final Rule

Development-এর সময় লক্ষ্য হবে:

> **Build exactly what has been agreed, not what the coding assistant thinks would be better.**

কোনো নতুন feature, security behavior, database structure অথবা permission model দরকার হলে সেটা আগে specification-এ update হবে, তারপর code-এ যাবে।

---

## Document Status

**Document:** DEVELOPMENT-ROADMAP.md
**Project:** JonoShor / জনস্বর
**Version:** 1.0
**Status:** Frozen for implementation
**Purpose:** Master implementation sequence
