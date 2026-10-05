# JonoShor — Instructions

## 1. Project Identity

Project Name:

**JonoShor**

বাংলা:

**জনস্বর**

“Human Rights / Public Voice Platform” is only the project description/category. It is NOT the project name.

All code, folder names, documentation references, UI labels where appropriate, package metadata, and project-specific naming must use:

**JonoShor / জনস্বর**

---

# 2. Source of Truth

Before writing or changing code, read the relevant project documentation.

Primary source of truth:

```text
docs/PRD.md
docs/DATABASE-SCHEMA.md
docs/API-SPECIFICATION.md
docs/BACKEND-ARCHITECTURE.md
docs/PROJECT-STRUCTURE.md
docs/FRONTEND-ARCHITECTURE.md
docs/SECURITY.md
docs/DEVELOPMENT-ROADMAP.md
```

These documents represent the approved product and technical requirements.

Do NOT replace them with your own architecture preferences.

---

# 3. Priority Rule

When deciding how to implement something:

```text
Latest explicit user decision
        ↓
Frozen PRD
        ↓
Database Schema
        ↓
API Specification
        ↓
Architecture Documents
        ↓
Security Specification
        ↓
Development Roadmap
        ↓
Existing Code
        ↓
Your implementation judgment
```

Never reverse this priority.

A later explicit user correction overrides an older decision.

---

# 4. No Guessing

Do not invent:

* features
* fields
* collections
* APIs
* roles
* permissions
* workflows
* identifiers
* dashboards
* user-facing behaviors

unless they are required to implement an already-approved requirement.

When an implementation detail is technically necessary but not explicitly specified, choose the smallest sensible implementation that does NOT change product behavior.

---

# 5. Existing Project Protection

Before changing code:

1. Inspect the existing project structure.
2. Read relevant files.
3. Understand current implementation.
4. Identify dependencies.
5. Make the smallest targeted change.

Do NOT rewrite the whole project unnecessarily.

Do NOT replace working features just because you prefer another implementation.

Do NOT break existing functionality while implementing a new feature.

---

# 6. Technology Restrictions

Use:

### Frontend

* HTML5
* Tailwind CSS
* Vanilla JavaScript
* Vite

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* MongoDB Atlas

### Storage

* Google Cloud Storage

Do NOT introduce without explicit approval:

* Python
* Django
* Flask
* Next.js
* other backend frameworks
* React
* unrelated frameworks
* Google Sheets as database

---

# 7. Strict Role Separation

There are three account types:

```text
User
Admin
Super Admin
```

They are strictly separated.

Frontend:

```text
pages/
├── public/
├── user/
├── admin/
└── superAdmin/
```

Backend:

```text
routes/
├── public/
├── auth/
├── user/
├── admin/
└── superAdmin/
```

Backend authorization is mandatory.

Frontend route hiding is NOT security.

---

# 8. User Rules

A normal User:

* can access User functionality
* can access approved public information
* can manage their own permitted information
* can submit/track their own complaints according to policy

A User:

* cannot access Admin APIs
* cannot access Super Admin APIs
* cannot access another user's complaint
* cannot view active sessions
* cannot view internal reviewer notes unless explicitly permitted by policy

There must NOT be an “Active Sessions” viewer in the User interface.

---

# 9. Admin Rules

Admin functionality is under:

```text
/api/v1/admin/*
```

Admin access requires:

```text
Authentication
+
Admin account
+
Required permission
```

Admins have granular permissions.

Admin must NOT access Super Admin functionality unless explicitly changed in the specification.

---

# 10. Super Admin Rules

Super Admin functionality is under:

```text
/api/v1/super-admin/*
```

Super Admin has the highest privilege.

Critical actions require:

```text
Permission
+
Re-authentication
+
2FA
+
Audit Log
```

---

# 11. Public/User Information Consistency

This is a mandatory rule.

Approved public information shown on the Public website must also be accessible on the logged-in User website.

Canonical public report source:

```text
publicReports
```

Do NOT create duplicate public-report data for Public and User pages.

Architecture:

```text
              publicReports
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Public              User
       Website            Website
```

User login must NOT cause public information to become different, reduced, or hidden.

---

# 12. Complaint Rules

Complaint uses MongoDB's built-in:

```text
_id
```

as the internal database identity.

Do NOT unnecessarily create duplicate IDs for the same complaint.

Complaint is a claim/report.

Remember:

```text
Complaint ≠ Proven Crime
Verified Report ≠ Legal Outcome
```

Do not casually label an accused person as a criminal/offender without appropriate legal basis.

---

# 13. Anonymous / Non-User Complaints

Anonymous/non-user complaints are allowed.

Non-user Reporter:

* can submit without account
* maximum 5 complaints
* after 5 complaints, account/login is required
* cannot track complaints without account
* Reporter ID remains private

Limit enforcement must NOT rely on IP alone.

Use appropriate combinations of:

* IP
* browser/session signals
* security signals
* rate limiting

Do not make impossible claims that anonymous submissions are completely untraceable.

---

# 14. Reporter Rules

Reporter is separate from User.

A Reporter can be:

```text
user
non_user
```

If a non-user later creates an account:

**link the existing Reporter to the account.**

Do NOT create a new Reporter ID.

Reporter identity is private by default.

Reporter may choose to make their identity public according to the approved policy.

Reporter ID itself must always remain private.

---

# 15. Evidence Rules

Evidence is private by default.

Approved flow:

```text
Upload
 ↓
Quarantine
 ↓
Malware Scan
 ↓
Private Storage
 ↓
Review
 ↓
Public Approval
 ↓
Public-Safe Version
```

Uploading evidence does NOT mean the evidence is proven authentic.

Do NOT automatically trust external evidence links.

Private evidence must use authorization and short-lived signed URLs.

---

# 16. Public Evidence Rules

Public evidence requires authorized review/approval.

Sensitive evidence may:

* remain private
* be partially redacted
* be published only as a safe public version

Approved public evidence can be viewed without login.

**Do NOT track who viewed public evidence.**

Do NOT create a public evidence viewer-tracking system.

Audit who approved publication, not who viewed it.

---

# 17. Legal Information Rules

Do not combine:

```text
Platform Verification
Legal/Procedural Status
Legal Outcome
```

into one generic status.

Court conviction is NOT required before a platform report can be verified/published.

Legal information provided by a reporter must not automatically become verified public information.

Use official/reliable sources where applicable.

---

# 18. Victim Protection

Victim information is protected by default.

Apply stronger protection to:

* minors
* sexual violence victims
* highly sensitive cases
* vulnerable/high-risk persons

Do not publish identifying information unless approved for disclosure.

---

# 19. Public Report Rules

Public Report is a sanitized/public-safe representation.

Never expose the internal complaint document directly.

Use:

```text
Internal Complaint
      ↓
Verification
      ↓
Disclosure Review
      ↓
Sanitization
      ↓
Public Report
```

Public report supports:

```text
bn
en
```

Bangla must be natural and easy to understand.

English must be complete and independently understandable.

---

# 20. Join Us Rules

Join Us is NOT normal registration and NOT the User profile.

Use:

```text
joinUsSubmissions
```

MongoDB collection.

Do NOT use Google Sheets.

Join Us data is private.

Applicant:

* does not get a public member profile
* does not get a public member directory entry
* does not get a normal membership dashboard

Only authorized Admin/Super Admin can access according to permission.

Only Super Admin can delete Join Us data.

---

# 21. Messages

Admin ↔ User messaging is supported.

User can reply.

Messages:

* cannot be edited
* cannot be deleted

Full conversation history must remain available according to policy.

Admin-to-Admin internal chat is NOT part of the current version.

---

# 22. Corrections

Reporter can request correction.

Maximum:

**3 requests**

Workflow:

```text
Correction Request
 ↓
Review
 ↓
Evidence Review
 ↓
Approved Update
```

Do NOT display a public correction history.

Approved public changes may be applied silently.

Keep internal audit/history.

---

# 23. Withdrawal

Withdrawal is a request/review process.

```text
Request
 ↓
Review
 ↓
Withdrawn
```

Withdrawal is NOT automatic permanent deletion.

---

# 24. Security Rules

Use:

* Argon2id
* Secure HttpOnly cookies
* short-lived authentication
* rotating refresh tokens
* 2FA for Admin/Super Admin
* rate limiting
* CSRF protection
* CORS allowlist
* Helmet
* CSP
* HSTS
* input validation
* NoSQL injection protection
* XSS protection
* SSRF protection
* secure file validation
* private GCS
* signed URLs
* audit logs
* security logs

Never put secrets in Git.

Never log:

* passwords
* raw tokens
* secrets
* private credentials
* sensitive evidence content

---

# 25. API Rules

API root:

```text
/api/v1
```

Boundary:

```text
/api/v1/public
/api/v1/auth
/api/v1/user
/api/v1/admin
/api/v1/super-admin
```

Backend must independently validate:

* authentication
* account type
* permission
* object ownership/scope

---

# 26. Database Rules

Use only approved collections.

Do NOT create unnecessary collections.

Do NOT create duplicate data merely because different pages need the same information.

Approved core collections are defined in:

```text
DATABASE-SCHEMA.md
```

Follow that document exactly.

---

# 27. Development Workflow

For every coding task:

```text
1. Read relevant documentation
2. Inspect existing code
3. Identify affected files
4. Identify dependencies
5. Implement minimum required change
6. Run validation/tests
7. Check security
8. Check existing features
9. Report exactly what changed
```

Do not perform unrelated refactoring unless explicitly requested.

---

# 28. Before Editing

Before modifying a feature, answer internally:

```text
Which document defines this requirement?
Which role owns this feature?
Which API is involved?
Which collection is involved?
What data is public?
What data is private?
What existing code depends on this?
```

Then implement.

---

# 29. Testing Requirement

A feature is NOT complete merely because the UI appears to work.

Completion requires:

```text
Code
 ↓
Validation
 ↓
API
 ↓
Authorization
 ↓
Error Handling
 ↓
Testing
 ↓
Security Check
 ↓
Existing Feature Check
```

---

# 30. Change Discipline

When asked to implement a feature:

* implement only the requested scope
* preserve existing behavior
* avoid unnecessary rewrites
* do not rename unrelated files
* do not change unrelated APIs
* do not change database structure without specification
* do not change user roles/permissions without specification

---

# 31. If Documentation and Code Conflict

Do NOT silently change the documentation.

Do NOT silently change the approved requirement.

Identify the conflict and use the latest explicit user-approved decision as the authority.

---

# 32. Completion Report

After each implementation task, report:

```text
Implemented:
- ...

Files changed:
- ...

API changed:
- ...

Database changed:
- ...

Tests:
- ...

Security checks:
- ...

Anything not implemented:
- ...
```

Do not claim something was tested if it was not actually tested.

---

# 33. Final Rule

Build JonoShor exactly according to the approved specification.

Do not build what you think the project should be.

Do not invent requirements.

Do not simplify away important security/privacy rules.

Do not over-engineer unnecessarily.

Do not rewrite working parts without a reason.

**Analyze first. Implement second. Test third. Report accurately.**
