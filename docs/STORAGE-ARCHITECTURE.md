# JonoShor — Google Drive Evidence Storage Architecture

## 1. Overview
JonoShor utilizes a dedicated organization Google account integrated with the **Google Drive API (v3)** for evidence and document storage. This replaces direct cloud bucket dependencies with an application-managed, least-privilege Drive architecture isolated behind a unified Storage Adapter.

---

## 2. Principle of Least Privilege & OAuth 2.0 Scope
* **Approved Scope:** `https://www.googleapis.com/auth/drive.file`
* **Access Mode:** Server-side OAuth 2.0 with offline access (`access_type: 'offline'`, `prompt: 'consent'`).
* **Isolation:** The application can *only* access and manage files/folders created or opened by JonoShor. It has zero visibility or access to any unrelated files in the Google account.

---

## 3. Storage Hierarchy (Application-Managed)
The backend autonomously creates and maintains three isolated folders under the root directory:

```text
JonoShor_Evidence_Root/
├── 01_Quarantine/           <- Initial upload destination before malware inspection
├── 02_Private_Evidence/     <- Verified clean private evidence & identity files
└── 03_Public_Evidence/      <- Approved & redacted public evidence files
```

---

## 4. Evidence Security & Zero Viewer Tracking
* **Upload Pipeline:**
  `Upload -> Quarantine -> Real Malware Scan -> Private Storage (Clean) -> Administrative Review -> Public Approval / Redaction`
* **Private Evidence:**
  Never exposes direct Google Drive links. Access is gated by JWT authentication and verified complaint ownership:
  `GET /api/v1/user/complaints/:id/evidence/:evidenceId/download`
* **Public Evidence (Zero Viewer Tracking):**
  Public files are delivered via backend proxy stream:
  `GET /api/v1/public/evidence/:evidenceId/file`
  * Strips cookies and client session tokens.
  * Injects `Referrer-Policy: no-referrer` and `Cross-Origin-Resource-Policy: cross-origin`.
  * Client IP addresses and devices never communicate directly with Google Drive servers.

---

## 5. Malware Scanning Architecture
* **Binary & Magic-Byte Analysis:** Validates actual binary file headers against declared MIME types to block disguised executables (PE/MZ, ELF, Mach-O, Java class) and double-extension attacks.
* **Payload Inspection:** Scans PDF document streams for active script vectors (`/JavaScript`, `/Launch`, `/EmbeddedFiles`).
* **EICAR Detection:** Industry-standard test signature identification rejecting threats as `MALWARE_SCAN_STATUS.MALICIOUS`.
* **ClamAV Integration Adapter:** Pluggable TCP daemon (`INSTREAM` protocol) or CLI scanning when `CLAMAV_HOST` is configured.

---

## 6. Super Admin Storage Management Endpoints
* `GET /api/v1/super-admin/storage/google-drive/authorize` — Generates OAuth 2.0 authorization URL with signed state token.
* `GET /api/v1/super-admin/storage/google-drive/callback` — Handles authorization code exchange for offline refresh token.
* `GET /api/v1/super-admin/storage/google-drive/status` — Checks live configuration and folder IDs.
* `POST /api/v1/super-admin/storage/google-drive/init-folders` — Verifies or creates the application folder structure.
