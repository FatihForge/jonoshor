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
| Frontend | HTML5, Tailwind CSS, Vanilla JavaScript, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Storage | Google Cloud Storage |
| Frontend Hosting | Cloudflare Pages |
| Backend Hosting | Render |

---

## Repository Structure

```text
JonoShor/
├── frontend/         # Frontend application (Vite + Tailwind + Vanilla JS)
├── backend/          # Backend API (Node.js + Express.js)
├── docs/             # Frozen project specification documents
├── .env.example      # Environment variable template (no secrets)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

---

## Documentation

All approved specification documents are in `docs/`:

| Document | Description |
|---|---|
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

## Local Development

> Prerequisites: Node.js, npm, MongoDB Atlas account, Google Cloud Storage bucket.

Setup instructions will be added during Phase 1 (Monorepo Initialization).

---

## License

See `LICENSE` file when added.

---

*JonoShor (জনস্বর) — Public Voice Platform*
