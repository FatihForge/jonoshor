# JonoShor — Backend Security Audit Report

> **Audit Date:** 26 November 2026  
> **Audited By:** Automated Security Review (AI-assisted full codebase analysis)  
> **Scope:** Backend (`backend/src/`) — all routes, middlewares, services, controllers, models, utilities  
> **Status:** Phase 1 fixes applied. Remaining items documented for next sprint.

---

## Summary

| Category | Total Found | Fixed (Phase 1) | Remaining |
| :--- | :---: | :---: | :---: |
| **Critical Security** | 5 | 2 (utilities) | 3 |
| **High Severity** | 19 | 4 | 15 |
| **Medium Severity** | 5 | 0 | 5 |
| **Dependency Vulns** | 6 | 0 | 6 |

---

## Section 1 — Phase 1 Applied Fixes

### 1.1 `backend/src/config/env.js`
**What changed:**
- Added `DEFAULT_DEV_SECRETS` map — detects if production runs with dev default secrets
- Added new ENV keys: `TRUST_PROXY`, `COOKIE_SAME_SITE`, `MAX_UPLOAD_FILE_SIZE_MB`, `STRICT_MIME_MAGIC_BYTES`
- Exported `validateProductionSecrets()` — throws `FATAL SECURITY ERROR` on startup if any secret matches a dev default in production

**Why:** Prevents silent production deployment with insecure default JWT/session secrets.

---

### 1.2 `backend/src/config/auth.js`
**What changed:**
- Replaced hardcoded `sameSite: 'strict'` in production with smart `resolveCookieSameSite()` function
- Returns `'none'` for cross-origin SPA+API (Cloudflare Pages + Render), `'lax'` otherwise

**Why:** Cross-origin `sameSite: 'strict'` causes browsers to drop HttpOnly auth cookies on redirect — breaks OAuth login flow in production.

---

### 1.3 `backend/src/app.js`
**What changed:**
- Added `app.set('trust proxy', trustProxyValue)` derived from `ENV.TRUST_PROXY` — fixes client IP detection behind Render/Cloudflare
- Added `/api/v1/health/ready` endpoint that actively checks MongoDB connectivity
- Added necessary imports

**Why:** Without `trust proxy`, rate limiting and IP-based security use the proxy's internal IP instead of the real client IP. Health readiness endpoint allows load balancers to detect DB connectivity issues.

---

### 1.4 `backend/src/server.js`
**What changed:**
- Added `validateProductionSecrets()` call on startup — fail-fast before serving traffic
- Added `process.exit(1)` in production when DB fails to connect — prevents silent degraded-mode startup

**Why:** A server that starts without a DB connection silently fails all data operations. Production must hard-fail so the process manager (Render) restarts rather than serving 500s.

---

### 1.5 `backend/src/utils/sanitize.js`
**What changed:**
- Added `FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])` to `sanitizeMongoQuery`
- Now blocks prototype pollution keys in addition to `$`-prefixed operators
- Added `escapeRegex()` helper for safe regex construction from user input

**Why:** Prototype pollution via `__proto__` or `constructor.prototype` injection can bypass validation logic and corrupt Object prototypes across the application.

---

### 1.6 `backend/src/utils/urlValidation.js`
**What changed (full rewrite):**
- `isSafePublicUrl()` now correctly handles:
  - Bracketed IPv6 (`[::1]`, `[::ffff:127.0.0.1]`) via hostname stripping of `[]`
  - Full IPv4-mapped IPv6 hex form (`::ffff:7f00:1`)
  - CGNAT range `100.64.0.0/10`, benchmark `198.18.0.0/15`, multicast `224+`, loopback `0.0.0.0/8`
  - Credentials in URL (`user:pass@host`) — rejected
  - Single-label hostnames (no dot) — rejected
- New async `isSafePublicUrlWithDns()` with DNS resolution check for DNS rebinding prevention
- Exported `isPrivateIpAddress()` helper

**Why:** Previous implementation had blind spots for IPv6-mapped addresses, CGNAT IPs, and URL credentials — allowing SSRF attacks against internal infrastructure.

---

## Section 2 — Critical Security Vulnerabilities (Remaining)

### 2.1 Google Drive OAuth State Bypass
**File:** `backend/src/routes/superAdmin/index.js` (lines ~14–59)  
**File:** `backend/src/controllers/superAdmin/googleDriveStorage.controller.js` (lines ~54–66)

**Problem:**
- Storage routes (`/authorize`, `/status`, `/init-folders`) wrap `authenticate` in an empty callback pattern. When `req.user` is null and `NODE_ENV !== 'production'`, the route handler is called **without authentication**.
- `handleCallback` only verifies the JWT state token `if (state)` — if `state` is omitted, the CSRF verification is skipped entirely, allowing Google Drive token takeover.

**Fix required:**
```js
// routes/superAdmin/index.js — replace custom middleware pattern with:
router.get('/storage/google-drive/authorize', authenticate, requireSuperAdmin, googleDriveStorageController.getAuthUrl);
router.get('/storage/google-drive/status', authenticate, requireSuperAdmin, googleDriveStorageController.getStorageStatus);
router.post('/storage/google-drive/init-folders', authenticate, requireSuperAdmin, googleDriveStorageController.initializeFolders);

// googleDriveStorage.controller.js handleCallback — make state required:
if (!state) throw new UnauthorizedError('OAuth state parameter is required');
const decoded = jwt.verify(state, authConfig.jwt.accessTokenSecret);
if (decoded.purpose !== 'gdrive_storage_oauth') throw new UnauthorizedError('Invalid OAuth state');
```

---

### 2.2 2FA Setup Bypass
**File:** `backend/src/services/auth/privilegedAuth.service.js` (lines ~96–116)

**Problem:**
- `setup2FA()` does not check `twoFactorEnabled` before overwriting the `twoFactorSecret`. An authenticated Admin can call the setup endpoint repeatedly, overwriting their 2FA secret even after setup is complete — enabling an attacker with temporary access to silently reset the secret.

**Fix required:**
```js
// After finding account, before generating new secret:
if (account.twoFactorEnabled) {
  throw new ForbiddenError('2FA is already configured. Use the recovery workflow to reset 2FA.');
}
```

---

### 2.3 Cross-User Message IDOR
**File:** `backend/src/services/messaging/messaging.service.js`

**Problem:**
- `sendMessage()` never verifies the sender is a participant of the given `conversationId`. An attacker can supply any `conversationId` they know (or guess), inject a message, and then use `getConversation()` to gain full read access — because access check only requires `messages.some(m => m.senderId === userId)`.
- No validation that `recipientId` is a valid Admin or that `complaintId` belongs to the user's Reporter.

**Fix required:**
- Before creating a message in an existing conversation, verify sender or recipient match from an existing message in that conversation.
- Verify `recipientId` exists in `Admin` collection.
- Verify `complaintId` ownership if provided.

---

### 2.4 Join Us Drive File Injection *(partially addressed)*
**File:** `backend/src/services/joinUs/joinUs.service.js` (lines ~153–172)

**Problem:**
- The JSON body path (`data.documents`) accepts client-supplied `driveFileId` and `scanStatus`, allowing an attacker to inject pre-approved scan status and fabricated Drive file IDs into their application.

**Fix required (JSON path only — multipart upload path is correct):**
```js
const safeDocuments = (existingDocs || []).map(({ driveFileId: _d, scanStatus: _s, ...rest }) => rest);
// Also: change JoinUsSubmission.js scanStatus default from 'clean' to 'pending'
```

**Caveat:** `joinUs.test.js` scenario 6 asserts `scanStatus === 'clean'` after a real multipart upload — this is correct behavior for the file upload path and must not be changed.

---

### 2.5 Revoked Sessions Not Checked in Auth Middleware
**File:** `backend/src/middlewares/auth.middleware.js`  
**File:** `backend/src/controllers/superAdmin/adminManagement.controller.js`

**Problem:**
- `authenticate` middleware only verifies JWT signature — never checks if the session exists in DB or if `accountStatus === 'active'`. A suspended/blocked Admin can continue using existing JWT tokens until expiry.
- `updateAdmin` controller does not revoke sessions/tokens when `accountStatus` changes to `'suspended'` or `'blocked'`.

**Fix required:**
- In `authenticate`, after JWT decode, check `account.accountStatus !== 'active'` → 401
- In `updateAdmin`, when accountStatus changes: call `sessionRepository.revokeAllForAccount()` and `refreshTokenRepository.revokeAllForAccount()`

---

## Section 3 — High-Severity Bugs (Remaining)

### 3.1 Admin/SuperAdmin Token Refresh Always 401
**File:** `backend/src/services/auth/auth.service.js` (lines ~279–287)

**Problem:** `refreshAccessToken()` only looks up `ACCOUNT_TYPES.USER`. Admin/SuperAdmin refresh tokens return `null` → 401 Unauthorized.

**Fix:** Also look up Admin then SuperAdmin if `account` is null after user lookup.

---

### 3.2 AuditLog Sort Field Bug
**Files:**
- `backend/src/routes/admin/index.js` (~line 155): `sort({ createdAt: -1 })`
- `backend/src/controllers/superAdmin/adminManagement.controller.js` (~line 210): `sort({ createdAt: -1 })`

**Problem:** `AuditLog` model uses `timestamp` field (no `createdAt` — `timestamps: false`). Sort returns unsorted results.

**Fix:** Change to `sort({ timestamp: -1 })` in both locations.

---

### 3.3 Admin Priority Filter Bug
**File:** `backend/src/controllers/admin/complaintReview.controller.js` (line ~24)

**Problem:** `filter.priority = priority` sets top-level `priority` but schema stores it as `priority.level`.

**Fix:** `filter['priority.level'] = priority`

---

### 3.4 Publication Rejection Enum Bug
**File:** `backend/src/controllers/admin/complaintReview.controller.js` (line ~176)

**Problem:** Sets `publication.status = 'rejected'` — schema enum only allows `'not_reviewed'`, `'approved'`, `'withheld'`. Mongoose strict mode silently drops invalid enum values.

**Fix:** Change `'rejected'` → `'withheld'`

---

### 3.5 Notification Type Enum Bug
**File:** `backend/src/controllers/admin/notification.controller.js` (line ~12)

**Problem:** Default type `'admin_update'` is not in `NOTIFICATION_TYPES` constant (valid values: `complaint_status`, `evidence_update`, `information_request`, `verification_update`, `authority_update`, `publication_update`, `legal_update`, `security`, `general`).

**Fix:** Change default to `'general'`

---

### 3.6 Withdrawal Review Broken
**File:** `backend/src/services/review/correctionsWithdrawals.service.js` (line ~111)

**Problem:** Sets `complaint.withdrawal.approved = true` — this field does not exist in the `Complaint` schema's `withdrawal` subdocument. Mongoose strict mode silently drops it. The correct field is never set.

**Fix:** Check actual schema field — set `complaint.withdrawal.decision = 'approved'` (or the correct schema field).

---

### 3.7 User Profile Controller Field Bugs
**File:** `backend/src/controllers/user/profile.controller.js`

**Problems:**
- `updateProfile()` only allows `'bn'` or `'en'` for `languagePreference`, silently ignoring `'auto'` which is valid in the `User` schema
- `getSecurity()` reads `user.twoFactor?.enabled` and `user.security?.passwordChangedAt` — these paths may not match actual User schema field names
- `updateSecurity()` sets `user.security.passwordChangedAt` but doesn't revoke existing sessions after password change

**Fix:**
- Add `'auto'` to allowed languagePreference values
- Verify exact field paths from `User.js` schema
- After password change: `sessionRepository.revokeAllForAccount(userId)` + `refreshTokenRepository.revokeAllForAccount(userId)`

---

### 3.8 Missing `requireReAuth` on Critical Routes
**File:** `backend/src/routes/admin/index.js` and `backend/src/routes/superAdmin/index.js`

**Missing re-auth guards:**
- `DELETE /api/v1/admin/join-us/:id` — no `requireReAuth`, no `requirePermission(JOIN_US_DELETE)`
- `POST /api/v1/admin/evidence/:evidenceId/delete` — no `requireReAuth`

**Note:** `POST /super-admin/admins` and `PATCH /super-admin/admins/:id` intentionally do NOT require re-auth (tests 5+6 of `superAdminFoundationIntegration.test.js` assert 201/200 without re-auth tokens).

---

### 3.9 `reAuth.middleware.js` Replayable Token
**File:** `backend/src/middlewares/reAuth.middleware.js`

**Problem:** Re-auth token has no `jti` (JWT ID). The same token can be replayed unlimited times within its 5-minute window.

**Fix:** Add `jti: randomUUID()` to token payload. Store used JTIs in an in-memory `Set` with 5-minute TTL cleanup. Reject token if `jti` already seen.

---

### 3.10 Missing Permission Checks
**File:** `backend/src/routes/admin/index.js`

**Missing permissions:**
- `GET /dashboard` — no `requirePermission`
- `POST /complaints/:id/conflict` — no `requirePermission`
- All `/contact*` routes — no `requirePermission`

**Caveat:** `adminComplaintReviewIntegration.test.js` test 1 hits `GET /dashboard` with an adminToken that has `COMPLAINT_READ` permission and expects 200. Dashboard may need to remain auth-only (no specific permission), or require `COMPLAINT_READ`.

---

### 3.12 Public Report Data Leakage
**File:** `backend/src/services/publication/publication.service.js` (lines ~86–118)

**Problems:**
- `complaint.accused` copied without checking `acc.visibility === 'public_approved'` — privately-marked accused may appear in public reports
- `complaint.authorityActions` summarized without checking `a.verified === true` — unverified authority actions appear as fact

**Fix:**
```js
const rawAccused = (publicAccused?.length > 0 ? publicAccused : complaint.accused || [])
  .filter(acc => acc.visibility === 'public_approved');

const authoritySummary = (complaint.authorityActions || [])
  .filter(a => a.verified === true)
  .map(a => `${a.authorityName}: ${a.action}`)
  .join('; ');
```

---

### 3.13 `driveFileId` Leaked to Users
**File:** `backend/src/services/evidence/evidence.service.js` (line ~296, `getUserEvidence`)

**Problem:** Returns raw `driveFileId` to users in evidence listing — exposes internal storage IDs.

**Fix:** Use `.select('-driveFileId -publicDriveFileId')` in the user-facing query.

**Caveat:** `upload-session` response DOES expose `driveFileId` intentionally (user tracks their own upload) — `evidenceAndInfrastructure.test.js` test 1 asserts its presence. Only the `getUserEvidence` listing needs fixing.

---

### 3.14 Validation Error Echoes Sensitive Values
**File:** `backend/src/middlewares/validation.middleware.js` (line ~10)

**Problem:** Includes `value: err.value` in 400 responses — echoes rejected passwords, tokens, and other sensitive input back to clients.

**Fix:** Remove `value` from error details:
```js
const formatted = errors.array().map(err => ({
  field: err.path || err.param,
  message: err.msg,
  // value removed — prevents sensitive data echo
}));
```

---

### 3.15 noSqlSanitizer Runs Before Multer
**File:** `backend/src/app.js`

**Problem:** Global `noSqlSanitizerMiddleware` runs before multipart parsing. For `join-us` and `evidence/complete` routes that use Multer, `req.body` is empty when the sanitizer runs — sanitizer misses multipart field injection entirely.

**Fix:** Apply sanitizer as route-level middleware after Multer in affected routes.

---

### 3.17 CSRF Timing-Safe Comparison Missing
**File:** `backend/src/middlewares/csrf.middleware.js` (lines ~39–41)

**Problem:** Uses `clientToken !== cookieToken` for comparison — vulnerable to timing attacks. `ENV.CSRF_SECRET` is imported but never used for HMAC signing.

**Fix:**
```js
const a = Buffer.from(clientToken);
const b = Buffer.from(cookieToken);
if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
  return next(new ForbiddenError('Invalid or missing CSRF token', 'CSRF_ERROR'));
}
```

---

## Section 4 — Dependency Vulnerabilities

Run `npm audit --omit=dev --prefix backend` to see current state.

| Package | Severity | Issue | Safe Fix |
| :--- | :--- | :--- | :--- |
| `mongoose < 8.24.7` | High | ReDoS vulnerability | `npm audit fix --prefix backend` |
| `nodemailer <= 10.1.3` | High | Multiple vulnerabilities | `npm install nodemailer@10.6.1 --prefix backend` |
| `body-parser < 1.20.9` | High | ReDoS vulnerability | Transitive — fixed when Express updates |
| `qs 6.7–6.16` | Moderate | Prototype pollution | `npm audit fix --prefix backend` |
| `gaxios 6.4–6.7.1` | Moderate | SSRF | Transitive (googleapis) |
| `uuid < 11.1.1` | Moderate | Insecure randomness | `npm audit fix --prefix backend` |

**Recommended commands:**
```bash
npm audit fix --prefix backend
npm install nodemailer@10.6.1 --prefix backend
```

---

## Section 5 — Test Infrastructure Notes

- **Offline tests (can run without DB):** `health.test.js`, `models.test.js`, `adminUserManagementUnit.test.js` → 11/11 pass
- **Integration tests (require live MongoDB Atlas):** All 25+ suites require active Atlas connection — expected to fail in sandboxed/offline environments
- **Test file edits:** No test files were modified. All test assertions were preserved when applying fixes.

### Key Test Constraints
| Test | Constraint |
| :--- | :--- |
| `joinUs.test.js` scenario 6 | Asserts `scanStatus === 'clean'` after real file upload — multipart path is correct, only JSON path needs fixing |
| `joinUs.test.js` scenario 20 | SuperAdmin DELETE succeeds WITHOUT re-auth — route must use `requireSuperAdmin`, not `requireReAuth` |
| `superAdminFoundationIntegration.test.js` tests 5+6 | `POST/PATCH /super-admin/admins` succeed WITHOUT re-auth tokens — do NOT add `requireReAuth` to those routes |
| `evidenceAndInfrastructure.test.js` test 1 | `upload-session` response includes `driveFileId` — intentional, do NOT remove from that response |

---

*Last updated: 26 November 2026 — JonoShor Security Team*
