# JonoShor

## DATABASE-SCHEMA.md

### Frozen Database Specification — v1.0

> **Source of Truth:** Frozen PRD v1.0 + previously approved Q&A decisions + latest user corrections.
>
> **Important:** এই schema-তে নতুন product requirement যোগ করা যাবে না। পরবর্তী implementation অবশ্যই এই specification অনুসরণ করবে।

---

# 1. Database

**Database:** MongoDB
**Hosting:** MongoDB Atlas

Primary identifier:

```text
_id
```

MongoDB-এর built-in `_id` ব্যবহার করা হবে।

অপ্রয়োজনীয়ভাবে একই entity-এর জন্য multiple duplicate IDs রাখা হবে না।

---

# 2. Schema Conventions

সব collection-এ যেখানে প্রযোজ্য:

```text
_id
createdAt
updatedAt
```

থাকবে।

Sensitive/private fields public API response-এ automatically expose করা যাবে না।

Public response এবং internal database document একই জিনিস নয়।

---

# 3. `users`

Registered সাধারণ platform users।

```text
users
├── _id
├── fullName
├── email
├── mobile
├── passwordHash
├── authProviders[]
├── emailVerified
├── mobileVerified
├── profilePhoto
├── externalLinks[]
├── languagePreference
├── accountStatus
├── lastLoginAt
├── createdAt
└── updatedAt
```

### Field rules

`fullName`

* Required

`email`

* Required
* Unique
* Valid email

`mobile`

* Optional

`passwordHash`

* Only when password authentication is used
* Argon2id
* Never plaintext

`authProviders[]`

```text
email
google
facebook
```

`emailVerified`

* Boolean

`mobileVerified`

* Boolean
* Mobile OTP technically viable হলে ব্যবহার করা যাবে

`externalLinks[]`

* Optional
* User নিজে add করতে পারবে
* নিজের account থেকে পরে delete করার option থাকবে না
* Controlled admin correction/redaction প্রয়োজন হলে আলাদা authorized workflow থাকবে

`languagePreference`

```text
bn
en
auto
```

`accountStatus`

```text
active
suspended
blocked
```

### Important

User public profile থাকবে না।

Account deletion feature থাকবে না।

---

# 4. `admins`

Normal Admin accounts।

```text
admins
├── _id
├── fullName
├── email
├── mobile
├── passwordHash
├── permissions[]
├── twoFactorEnabled
├── accountStatus
├── createdBy
├── lastLoginAt
├── createdAt
└── updatedAt
```

### Rules

* Admin account normal public registration-এর মাধ্যমে তৈরি হবে না।
* Super Admin Admin account তৈরি করবে।
* Admin-এর granular permissions থাকবে।
* 2FA mandatory।

---

# 5. `superAdmins`

Highest-privilege accounts।

```text
superAdmins
├── _id
├── fullName
├── email
├── mobile
├── passwordHash
├── permissions[]
├── twoFactorEnabled
├── accountStatus
├── lastLoginAt
├── createdAt
└── updatedAt
```

### Rules

* Super Admin account creation restricted/manual।
* Public registration flow থেকে তৈরি হবে না।
* Mandatory 2FA।
* Critical action-এর জন্য re-authentication + 2FA required।

---

# 6. `roles`

Reusable role definitions।

```text
roles
├── _id
├── name
├── description
├── permissions[]
├── active
├── createdAt
└── updatedAt
```

---

# 7. `permissions`

System permission catalogue।

```text
permissions
├── _id
├── key
├── description
├── active
└── createdAt
```

Examples:

```text
complaint.read
complaint.review
complaint.verify
complaint.publish

evidence.read
evidence.review
evidence.publish
evidence.delete

user.read
user.manage

joinUs.read
joinUs.export

audit.read
security.read

system.manage
financial.manage
```

Actual permission assignment Admin/Super Admin authorization policy অনুযায়ী হবে।

---

# 8. `reporters`

Reporter identity User-এর থেকে আলাদা।

```text
reporters
├── _id
├── reporterType
├── accountId
├── contact
├── identityVisibility
├── nonUserComplaintCount
├── securityIdentifiers
├── createdAt
└── updatedAt
```

### `reporterType`

```text
user
non_user
```

### `accountId`

Optional।

Registered User হলে User collection-এর `_id` reference থাকবে।

Non-user reporter-এর ক্ষেত্রে initially null থাকতে পারে।

পরে account তৈরি করলে একই Reporter record-এর সঙ্গে link হবে।

নতুন Reporter record তৈরি হবে না।

### `contact`

At least one valid contact method:

```text
contact
├── email
└── mobile
```

Email বা mobile-এর অন্তত একটি required।

### `identityVisibility`

```text
private
public
```

Reporter নিজে identity public করার সিদ্ধান্ত নিতে পারে।

কিন্তু `reporterId`/Reporter record কখনো public হবে না।

### `nonUserComplaintCount`

Non-user complaints-এর 5-limit enforcement-এর জন্য।

### `securityIdentifiers`

Restricted/private security data।

ব্যবহার হতে পারে:

* IP-related signals
* browser/session signals
* abuse-prevention signals

Normal User/Public API-তে এই data expose করা যাবে না।

---

# 9. `complaints`

System-এর primary complaint record।

```text
complaints
├── _id
├── reporterId
├── submissionType
├── category
├── incident
├── location
├── accused[]
├── victims[]
├── sensitivity
├── priority
├── riskFlags[]
├── status
├── statusHistory[]
├── review
├── authorityActions[]
├── publication
├── withdrawal
├── correctionCount
├── createdAt
└── updatedAt
```

---

## 9.1 `submissionType`

```text
user
non_user
```

---

## 9.2 `category`

```text
category
├── primary
└── secondary[]
```

---

## 9.3 `incident`

```text
incident
├── startDate
├── endDate
├── datePrecision
├── ongoing
└── description
```

### `datePrecision`

```text
exact
approximate
unknown
range
ongoing
```

`description` হলো reporter-এর নিজের ভাষায় detailed incident explanation।

---

# 10. `location`

Complaint-এর মধ্যে structured location থাকবে।

```text
location
├── divisionId
├── districtId
├── upazilaId
└── freeTextLocation
```

Hierarchy:

```text
Division
   ↓
District
   ↓
Upazila/Thana
   ↓
Free-text location details
```

Bangla এবং English location names reference data থেকে আসবে।

---

# 11. `accused[]`

এক complaint-এ multiple accused থাকতে পারবে।

```text
accused[]
├── name
├── alias
├── fatherName
├── profession
├── role
├── organization
├── location
├── mobile
├── socialId
├── otherIdentifiers
└── visibility
```

`visibility` field-level বা grouped visibility control-এর মাধ্যমে public disclosure পরিচালনা করবে।

Accused-এর information automatically public হবে না।

---

# 12. `victims[]`

এক complaint-এ multiple victim থাকতে পারে।

```text
victims[]
├── name
├── age
├── ageCategory
├── gender
├── relationshipToIncident
├── minor
├── sensitivePerson
└── identityVisibility
```

Victim default protected।

Minor/sexual violence/high-risk/sensitive cases-এ stronger protection প্রযোজ্য।

---

# 13. `sensitivity`

Sensitivity এবং priority আলাদা field।

```text
sensitivity
├── level
└── determinedBy
```

System sensitivity determine করতে সাহায্য করবে।

Reporter sensitivity নিজের ইচ্ছায় set করবে না।

Admin final review করতে পারবে।

---

# 14. `priority`

```text
priority
├── level
└── determinedBy
```

Priority system নির্ধারণ করবে।

Admin final review করতে পারবে।

---

# 15. `riskFlags[]`

Internal-only flags:

```text
spam_suspected
duplicate_suspected
malicious_content
urgent_safety
high_risk_victim
legal_sensitivity
```

Public report-এ যাবে না।

---

# 16. Complaint Status

`status`

```text
draft
submitted
screening
needs_information
evidence_review
verification
verified
authority_referral
public_disclosure_review
published
withheld
resolved
closed
rejected
withdrawn
suspended
archived
```

---

# 17. `statusHistory[]`

Complaint-এর historical status tracking complaint document-এর ভেতরেই থাকবে।

```text
statusHistory[]
├── status
├── changedBy
├── changedAt
└── note
```

আলাদা status-history collection প্রয়োজন নেই।

---

# 18. `review`

Complaint verification/review data।

```text
review
├── assignedReviewerId
├── assignedAt
├── verificationStatus
├── verificationDecision
├── verificationReason
├── evidenceAssessment
├── corroborationAssessment
├── conflictOfInterest
├── reviewerNotes
├── verifiedBy
└── verifiedAt
```

Reviewer/Admin review করতে পারবে according to permission।

Conflicted reviewer final approval করতে পারবে না।

---

# 19. `authorityActions[]`

Complaint-এর সঙ্গে structured authority actions রাখা হবে।

```text
authorityActions[]
├── authorityType
├── authorityName
├── action
├── actionDate
├── reference
├── verified
├── notes
└── publicSummary
```

Authority type:

```text
police
court
government
other_legal_authority
```

Public summary সহজ ভাষায় লেখা হবে।

---

# 20. `publication`

Complaint-level public disclosure decision।

```text
publication
├── status
├── reviewedBy
├── reviewedAt
└── reason
```

Possible status:

```text
not_reviewed
approved
withheld
```

Public content সরাসরি complaint থেকে expose হবে না।

---

# 21. `withdrawal`

```text
withdrawal
├── requested
├── requestedAt
├── reviewedBy
├── reviewedAt
├── decision
└── reason
```

Withdrawal permanent database deletion নয়।

---

# 22. `correctionCount`

Complaint-level correction request count।

Maximum:

```text
3
```

Service layer এই limit enforce করবে।

---

# 23. `evidence`

Evidence আলাদা collection।

```text
evidence
├── _id
├── complaintId
├── uploaderId
├── type
├── originalFilename
├── mimeType
├── size
├── gcsObjectKey
├── sha256
├── uploadStatus
├── malwareScanStatus
├── reviewStatus
├── publicStatus
├── redactionStatus
├── deletionStatus
├── external
├── uploadedAt
└── updatedAt
```

---

# 24. Evidence `type`

```text
image
pdf
video
audio
document
external_link
```

---

# 25. Evidence Upload Status

```text
initiated
uploading
uploaded
quarantined
rejected
stored
deleted
```

---

# 26. Malware Scan Status

```text
pending
clean
malicious
failed
```

Scanner failure হলে file trusted হিসেবে গ্রহণ করা যাবে না।

---

# 27. Evidence Review Status

```text
pending
under_review
reviewed
rejected
```

Upload ≠ authenticity proof।

---

# 28. Evidence Public Status

```text
private
approved_public
withheld
```

Sensitive evidence হলে approved public version আলাদা হতে পারে।

---

# 29. `redactionStatus`

```text
none
required
completed
```

Redacted public version ব্যবহার করা যেতে পারে।

---

# 30. `external`

External evidence হলে:

```text
external
├── url
├── sourceType
├── accessibilityStatus
├── reviewStatus
├── checkedAt
└── checkedBy
```

### Accessibility status

```text
submitted
accessible
inaccessible
needs_review
```

External content automatically trusted নয়।

---

# 31. Evidence Delete

```text
deletionStatus
├── requested
├── deleted
├── blocked_by_legal_hold
```

Deletion authorization এবং audit trail বাধ্যতামূলক।

---

# 32. Evidence Access Rule

Private evidence:

**Authorization + signed URL**

Public-approved evidence:

**Anyone can view**

Public evidence-এর individual viewer tracking থাকবে না।

কোন admin/reviewer evidence public করেছে তা `auditLogs`-এ থাকবে।

---

# 33. `publicReports`

Internal complaint-এর sanitized public representation।

```text
publicReports
├── _id
├── complaintId
├── bn
├── en
├── category
├── location
├── incidentDate
├── verificationStatus
├── evidenceStatus
├── publicAccused[]
├── publicVictims[]
├── authorityActionSummary
├── legalSummary
├── caseStatus
├── legalOutcome
├── approvedEvidence[]
├── publicationStatus
├── publishedAt
└── updatedAt
```

---

# 34. Public Report Language

### `bn`

```text
bn
├── title
├── summary
├── incidentStory
├── legalSummary
└── authorityActionSummary
```

### `en`

```text
en
├── title
├── summary
├── incidentStory
├── legalSummary
└── authorityActionSummary
```

Bangla natural/simple হবে।

English independently understandable হবে।

---

# 35. Public Report Data Source Rule

Public Report-ই public information-এর approved source।

Public website এবং logged-in User area **একই approved public report data** ব্যবহার করবে।

অর্থাৎ:

```text
publicReports
      │
      ├── Public Page
      │
      └── User Page
```

Public Page এবং User Page-এর জন্য আলাদা duplicate public-report dataset রাখা হবে না।

User-এর account থাকলেও public information আলাদা হবে না।

---

# 36. `legalCases`

এক complaint-এর multiple legal cases support করবে।

```text
legalCases
├── _id
├── complaintId
├── caseNumber
├── caseType
├── authorities[]
├── courts[]
├── arrestStatus
├── bailStatus
├── investigationStatus
├── currentLegalStatus
├── outcomes[]
├── officialReferences[]
├── timeline[]
├── publicDisclosure
├── createdAt
└── updatedAt
```

`caseNumber` optional।

---

# 37. Legal Status

Legal status-এর মধ্যে current এবং historical information আলাদা করে maintain করা যাবে।

Examples:

```text
no_legal_case
unknown
under_investigation
case_filed
pending
trial
appeal
resolved
closed
```

Actual permitted values implementation-এর সময় controlled enum হিসেবে define হবে।

---

# 38. `timeline[]` — Legal Timeline

```text
timeline[]
├── date
├── eventType
├── description
├── source
├── reference
├── verified
└── publicSummary
```

Full history internalভাবে থাকবে।

Public report understandable summary দেখাবে।

---

# 39. `outcomes[]`

```text
outcomes[]
├── type
├── date
├── description
├── source
├── reference
└── verified
```

Reliable official/legal source থাকলে conviction/outcome public করা যাবে।

Current status এবং historical outcome—দুটিই preserve করা যাবে।

---

# 40. `authorities[]`

Legal case-এর সঙ্গে relevant authority references থাকতে পারে।

```text
authorities[]
├── type
├── name
└── reference
```

---

# 41. `courts[]`

একাধিক court support।

```text
courts[]
├── name
├── location
└── reference
```

---

# 42. `publicDisclosure`

Legal information-এর public-safe disclosure।

```text
publicDisclosure
├── approved
├── approvedBy
├── approvedAt
└── redactions[]
```

Legal documents default private।

---

# 43. `correctionRequests`

Correction আলাদা collection হবে।

```text
correctionRequests
├── _id
├── complaintId
├── requesterId
├── requestedChanges
├── reason
├── supportingEvidence[]
├── status
├── reviewedBy
├── reviewedAt
├── decisionReason
└── createdAt
```

Status:

```text
submitted
under_review
approved
rejected
```

Maximum 3 requests policy service layer-এ enforce হবে।

Public correction history expose হবে না।

---

# 44. `notifications`

```text
notifications
├── _id
├── recipientId
├── recipientType
├── type
├── title
├── message
├── targetUrl
├── read
├── emailStatus
├── createdAt
└── readAt
```

Sensitive complaint details notification body-তে থাকবে না।

---

# 45. Notification `type`

Examples:

```text
complaint_status
evidence_update
information_request
verification_update
authority_update
publication_update
legal_update
security
general
```

---

# 46. `messages`

User ↔ Admin communication।

```text
messages
├── _id
├── conversationId
├── complaintId
├── senderId
├── senderType
├── recipientId
├── body
├── attachmentEvidenceIds[]
├── read
├── createdAt
└── readAt
```

Message edit/delete করা যাবে না।

Conversation history retained থাকবে।

Admin-to-Admin chat current version-এ নেই।

---

# 47. `joinUsSubmissions`

Join Us সম্পূর্ণ separate private collection।

```text
joinUsSubmissions
├── _id
├── fullName
├── email
├── contactInformation
├── primaryProfession
├── secondaryProfessions[]
├── customProfession
├── primaryContributionRole
├── secondaryContributionRoles[]
├── contributionDetails
├── socialLinks[]
├── linkedin
├── portfolio
├── documents[]
├── submissionStatus
├── adminNotes
├── submittedAt
└── updatedAt
```

---

# 48. Join Us Documents

`documents[]` reference করতে পারে:

```text
cv
recommendation_letter
work_experience_document
other
```

Actual file private storage-এ থাকবে।

MongoDB-তে metadata/reference থাকবে।

---

# 49. Join Us Rules

`submissionStatus` বর্তমানে:

```text
submitted
```

Applicant:

* public member হবে না
* public profile পাবে না
* member dashboard পাবে না
* নিজের submission delete করতে পারবে না

Admin internal notes রাখতে পারবে।

Duplicate submission reject করা হবে।

---

# 50. Join Us Access Control

Read:

```text
authorized Admin
authorized Super Admin
```

Documents:

```text
authorized Admin
authorized Super Admin
```

Export:

```text
Admin + Super Admin
```

specific permission সাপেক্ষে।

Delete:

```text
Super Admin only
```

---

# 51. `sessions`

Internal session tracking থাকবে।

User active sessions **দেখতে পারবে না**।

```text
sessions
├── _id
├── accountId
├── accountType
├── sessionTokenHash
├── refreshTokenReference
├── ip
├── userAgent
├── deviceInfo
├── createdAt
├── lastActiveAt
├── expiresAt
└── revokedAt
```

Session security backend-এর internal capability।

---

# 52. `refreshTokens`

Rotating refresh-token management।

```text
refreshTokens
├── _id
├── tokenHash
├── accountId
├── accountType
├── sessionId
├── expiresAt
├── revokedAt
├── replacedBy
└── createdAt
```

Raw refresh token database-এ রাখা যাবে না।

---

# 53. `auditLogs`

Important accountability actions-এর audit trail।

```text
auditLogs
├── _id
├── actorId
├── actorType
├── action
├── resourceType
├── resourceId
├── previousValue
├── newValue
├── ip
├── userAgent
├── requestId
├── timestamp
└── metadata
```

Critical audit records append-only/immutable behavior অনুসরণ করবে।

Never log:

* passwords
* raw tokens
* secrets

---

# 54. `securityLogs`

Security events-এর জন্য separate collection।

```text
securityLogs
├── _id
├── eventType
├── accountId
├── ip
├── userAgent
├── deviceInfo
├── riskSignal
├── actionTaken
├── requestId
├── timestamp
└── metadata
```

Possible events:

```text
failed_login
suspicious_activity
rate_limit
cooldown
temporary_block
brute_force_signal
privileged_security_event
```

---

# 55. `districts`

Bangladesh district master data।

```text
districts
├── _id
├── divisionId
├── nameBn
├── nameEn
└── active
```

---

# 56. `upazilas`

Bangladesh upazila/thana master data।

```text
upazilas
├── _id
├── districtId
├── nameBn
├── nameEn
└── active
```

Division data static seed/reference data হিসেবেও maintain করা যেতে পারে; আলাদা collection বাধ্যতামূলক নয়।

---

# 57. `systemSettings`

System configuration।

```text
systemSettings
├── _id
├── key
├── value
├── category
├── updatedBy
├── updatedAt
└── version
```

Sensitive settings role-based access control-এর অধীনে থাকবে।

---

# 58. Financial Settings

Donation/payment/bank destination configuration সাধারণ Admin-এর কাছে expose করা যাবে না।

Sensitive financial configuration:

**Super Admin only**

Critical financial changes:

* Re-authentication
* 2FA
* Audit log

require করবে।

Normal Admin donation records দেখতে পারলেও sensitive destination configuration দেখতে পারবে না।

---

# 59. Indexing Strategy

Implementation-এর সময় performance-এর জন্য প্রধান index:

### `users`

```text
email: unique
mobile: appropriate unique index
```

### `admins`

```text
email: unique
```

### `superAdmins`

```text
email: unique
```

### `reporters`

```text
accountId
reporterType
```

### `complaints`

```text
reporterId
status
category.primary
location.districtId
location.upazilaId
createdAt
```

Search requirement অনুযায়ী keyword/text indexing পরে যোগ করা যাবে।

### `evidence`

```text
complaintId
publicStatus
malwareScanStatus
reviewStatus
```

### `publicReports`

```text
complaintId
publicationStatus
location.districtId
location.upazilaId
createdAt
```

### `legalCases`

```text
complaintId
caseNumber
currentLegalStatus
```

### `correctionRequests`

```text
complaintId
requesterId
status
```

### `notifications`

```text
recipientId
read
createdAt
```

### `messages`

```text
conversationId
complaintId
createdAt
```

### `joinUsSubmissions`

```text
email
submittedAt
submissionStatus
```

### `sessions`

```text
accountId
accountType
expiresAt
```

### `auditLogs`

```text
actorId
resourceType
resourceId
timestamp
requestId
```

### `securityLogs`

```text
accountId
ip
eventType
timestamp
requestId
```

---

# 60. Privacy Boundary

### Publicly Accessible

শুধু approved public data:

```text
publicReports
approvedEvidence
publicStatistics
publicContent
```

### User

```text
Public data
+
Own authorized/private data
```

### Admin

```text
Operational/review data
according to permission
```

### Super Admin

```text
Highest privilege
according to explicit permissions
```

Internal/private data কখনো শুধু frontend hiding-এর ওপর নির্ভর করে protect করা যাবে না।

Backend authorization mandatory।

---

# 61. Public/User Shared Data Rule

Public page এবং logged-in User page-এর জন্য approved public report data-এর canonical source:

```text
publicReports
```

একই report-এর দুইটি আলাদা public copy রাখা যাবে না।

```text
                   ┌── Public Website
publicReports ─────┤
                   └── User Website
```

ফলে public page এবং User page-এ approved information mismatch হবে না।

---

# 62. Complaint → Evidence → Legal → Public Relationship

```text
Reporter
   │
   ▼
Complaint
   │
   ├── Victims
   ├── Accused
   ├── Review
   ├── Authority Actions
   ├── Evidence
   │      └── GCS
   │
   ├── Legal Cases
   │
   └── Public Report
```

---

# 63. Important Non-Collections

Unnecessary duplicate collections তৈরি করা হবে না।

Complaint-এর সঙ্গে tightly coupled information:

* status history
* review information
* authority actions
* publication decision
* withdrawal information

complaint document-এর ভেতরেই থাকবে।

Public evidence viewer tracking-এর জন্য কোনো collection থাকবে না।

---

# 64. Security Metadata Rule

Technical/security metadata normal user-facing schema-এর অংশ হিসেবে expose করা যাবে না।

Sensitive metadata access:

```text
Privileged Backend
        ↓
Authorization
        ↓
Audit
```

হিসেবে controlled হবে।

---

# 65. Schema Implementation Rule

Developer/AI coding assistant:

* নিজের মতো নতুন collection তৈরি করবে না
* অপ্রয়োজনীয় ID তৈরি করবে না
* Public এবং User-এর জন্য duplicate data model তৈরি করবে না
* Admin permission bypass করবে না
* internal complaint সরাসরি public endpoint-এ return করবে না
* raw evidence public করবে না
* public evidence viewer tracking যোগ করবে না
* User active session viewer তৈরি করবে না
* Join Us-কে `users` collection-এ ঢুকাবে না
* Join Us-কে Google Sheets-এ পাঠাবে না

---

# 66. Final Collection List

Core MongoDB collections:

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

এটাই বর্তমান Frozen Database Architecture।

---

# 67. Final Principle

Schema-এর প্রতিটি field-এর উদ্দেশ্য থাকতে হবে।

যেখানে embedded data যথেষ্ট, সেখানে নতুন collection তৈরি করা হবে না।

যেখানে data independently managed, sensitive, reusable অথবা multiple relationship support করে, সেখানে separate collection ব্যবহার করা হবে।

Database structure-এর উদ্দেশ্য:

**Privacy + Verification + Accountability + Public Transparency**

একসঙ্গে maintain করা।

---

## Status

**Document:** DATABASE-SCHEMA.md
**Version:** 1.0
**Status:** Frozen for implementation
**Parent Specification:** PRD v1.0
**Next:** API Specification + Backend Route/Controller/Service Architecture
