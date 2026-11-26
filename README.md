# JonoShor — জনস্বর

> **Document. Verify. Protect. Inform.**

JonoShor (জনস্বর) is a structured human rights documentation and public reporting platform for Bangladesh. It enables ordinary people to safely submit, track, and — where approved — publicly share accounts of rights violations, abuse, and serious incidents.

---

## Project Description

JonoShor is **not** a court, a law-enforcement substitute, a vigilante platform, or a political propaganda tool.

Core distinction:

> **অভিযোগ ≠ প্রমাণিত অপরাধ**
> **Complaint ≠ Proven Crime**
> **Verified Report ≠ Legal Outcome**

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, Hybrid SSR/CSR), React 18, Tailwind CSS |
| Backend | Node.js (ESM), Express.js, Swagger OpenAPI 3.0 (`/api-docs`) |
| Database | MongoDB (Atlas) |
| Storage | Google Drive API (Quarantine → Clean → Public Vaults) |
| Frontend Hosting | Cloudflare Pages / Node Hosting |
| Backend Hosting | Render |

---

## Repository Structure

```text
JonoShor/
├── frontend/         # Next.js 14 App Router Frontend (Port 3000)
├── backend/          # Express.js REST API + Swagger Docs (Port 5000)
├── docs/             # Project specifications & Security Audit report
├── PROJECT_STATUS.md # Current operational status & command guide
├── .env.example      # Environment variable template (no secrets)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

---

## Documentation

All approved specification documents are in `docs/`:

| Document | Description |
|---|---|
| [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) | **Current Project Status, Architecture & Complete Operational Guide** |
| `PRD.md` | Frozen Product Requirements Document |
| `DATABASE-SCHEMA.md` | Frozen Database Specification |
| `API-SPECIFICATION.md` | Frozen API Specification |
| `Backend Architecture + Project Structure` | Backend Architecture & Project Structure |
| `FRONTEND-ARCHITECTURE.md` | Frontend Architecture Specification |
| `SECURITY.md` | Security Specification |
| `DEVELOPMENT-ROADMAP.md` | Implementation Roadmap |
| `Instructions.md` | AI Coding Instructions & Rules |

> **Source of Truth:** All implementation must follow the documents in `docs/`. Do not invent features, roles, APIs, or collections not defined there.

---

## Account Types

| Type | Description |
|---|---|
| User | Registered platform user |
| Admin | Operational review/verification staff |
| Super Admin | Highest-privilege system administrator |

**Reporter** is a separate identity concept (not an account type). A Reporter can be a registered User or an anonymous non-user.

---

## Key Rules

- Non-user reporters may submit a maximum of **5 complaints** before an account is required.
- Evidence is **private by default** and goes through quarantine → malware scan → review before any public disclosure.
- Reporter identity is **always private**. Reporter ID is never exposed publicly.
- Public reports are **sanitized versions** of internal complaints — the raw complaint document is never publicly exposed.
- Both the public website and the logged-in user interface draw from the **same canonical `publicReports` data source**.
- Messages between Admin and User are **immutable** (no edit or delete).
- Correction requests are limited to **3 per complaint**.
- Withdrawal is a **review workflow**, not automatic permanent deletion.

---

## Local Development & Super Admin Bootstrap

### 1. Prerequisites
- Node.js (v20+ recommended)
- MongoDB instance (MongoDB Atlas or local MongoDB)

### 2. Initial Setup
```bash
# Install dependencies across monorepo
npm install
```

### 3. Bootstrap Initial Super Admin
Super Admin account creation is restricted and **cannot** be done through public registration APIs or web interfaces.

Run the secure CLI bootstrap script:
```bash
# From repository root
npm run bootstrap:super-admin

# Or from backend directory
cd backend
npm run bootstrap:super-admin
```

**Bootstrap Security Rules:**
- **Single Execution:** The bootstrap utility checks the database first. If any Super Admin already exists, the script safely aborts and will not create a duplicate.
- **Argon2id Hashing:** Passwords are never stored in plaintext and are hashed using Argon2id.
- **Mandatory 2FA (TOTP):** The command generates an Authenticator QR code and secret key in the terminal. You must scan it and verify a 6-digit TOTP code before the account is activated.
- **Non-Interactive / CI Option:** For automated environments, environment variables `BOOTSTRAP_SUPERADMIN_NAME`, `BOOTSTRAP_SUPERADMIN_EMAIL`, `BOOTSTRAP_SUPERADMIN_PASSWORD`, and `BOOTSTRAP_SKIP_PROMPT=1` can be passed.

### 4. Running the Platform
```bash
# Start backend API + Swagger UI (http://localhost:5000/api-docs)
npm run dev:backend

# Start Next.js frontend application (http://localhost:3000)
npm run dev:frontend
```

### 5. Accessing Super Admin Console
1. Navigate to: `http://localhost:3000/super-admin/login` (or `http://localhost:3000/login` for citizens and `/admin/login` for admins).
2. Enter your bootstrapped Super Admin email and password.
3. Enter the 6-digit TOTP code from your Authenticator app.
4. You will be redirected to the root executive console: `http://localhost:3000/super-admin/dashboard`.

---

## License

See `LICENSE` file when added.

---

*JonoShor (জনস্বর) — Public Voice Platform*
