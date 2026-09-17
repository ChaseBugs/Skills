# Project instructions

## Purpose

Build a multi-company employee competency and certification management platform with QR-accessible employee profiles. The working product concept is a digital skills passport for workers and a management dashboard for employers.

This file applies to the entire repository. A working MVP now exists. Windows Server and MySQL are confirmed user choices; implementation details and remaining pilot assumptions are recorded below and in Memory/project-requirements.md.

## Project structure

One Next.js 16 (App Router) application with TypeScript, serving both the UI and the API. No separate backend service.

- `app/` — routes. `page.tsx` (root), `login/page.tsx` (HR sign-in), `workspace/[[...view]]/page.tsx` (HR management SPA-style views), `p/[token]/page.tsx` (public QR profile), `label/[id]/page.tsx` (printable helmet label), `api/[...path]/route.ts` (single catch-all REST handler), `error.tsx`/`not-found.tsx`/`layout.tsx`/`globals.css`.
- `components/` — `workspace.tsx` (HR dashboard UI), `login.tsx`, `print-button.tsx`, `ui.tsx` (shared UI primitives).
- `lib/` — `domain.ts` (business rules: qualification validity, status derivation — keep logic here, not in pages), `data.ts` (data access), `db.ts` (MySQL pool/connection), `auth.ts` (sessions, password hashing, API keys), `api.ts` (shared API helpers/types).
- `migrations/` — sequential SQL migrations (`001_initial.sql`, `002_hr_only.sql`), run via `npm run db:migrate`.
- `scripts/` — operator/dev tooling: `migrate.ts`, `seed.ts` (synthetic demo data), `provision.ts` (create HR account, no seeding), `local-bootstrap.ts`, `start-local.ps1`, `start-production.ps1`.
- `tests/` — `domain.test.ts` (unit tests via `tsx --test`), `integration.ts` (hits a running server + seeded DB), `browser.ts` (Playwright/Chrome browser checks).
- `docs/` — `windows-server.md` (IIS/Windows deployment), `api.md` (API reference), `validation.md`.
- `Memory/project-requirements.md` — authoritative client-requirements record; read before planning.
- `deploy/web.config` — IIS reverse-proxy config for Windows Server hosting.
- `public/excel/Skills.pq` — Power Query template for the Excel integration.
- `.local/` — gitignored local-only state: demo credentials, local MySQL data/logs, screenshots. Never treat as shared or production data.
- `.env.example` / `.env.local` — configuration; `.env.local` is gitignored and machine-specific.

## Client communication preferences

- The user and client are friends. Do not ask the client about budget or include budget questions in drafted messages unless the user explicitly requests it.
- Keep client questions short, natural, and conversational. For initial discovery, prioritize five or six essential questions instead of a lengthy questionnaire.

## Client requirements

Read `Memory/project-requirements.md` before planning or implementation. It preserves the client's answers and distinguishes confirmed requirements from proposals. Later explicit client/user decisions supersede older assumptions.

The client has requested:

- Latest user clarification: only one account role, HR; no separate manager role.

- A skills management system serving multiple companies.
- Employee helmet labels containing a QR code, name, and photograph.
- Scanning a QR code to view an employee's competencies and access diplomas.
- Competencies that can have a validity period.
- Windows Server and MySQL are confirmed hosting/database choices.
- UI styling follows E:/Github/Mobile/Heyworks/Admin-UI.
- HR enters employee information and is the only role allowed to upload files.
- Employees have no accounts.
- QR profiles and their competencies/diplomas are publicly readable without login or viewer access filtering.
- SSN is a unique identifier; its format, uniqueness scope, and whether it is a government-issued identifier remain unspecified.
- Excel connects to the application's API so managers can extract data and create their own reports. A downloadable spreadsheet alone does not satisfy this requirement.
- The client has no design plan; design remains to be proposed.

Reference products:

- https://www.caq.net/en/skills-matrix-software
- https://merca.team/construction-btp/

Use these references for product context, not as authorization to reproduce every feature. Construction is the likely initial industry but remains unconfirmed.

## Proposed MVP

- Company workspaces and user membership.
- Employee directory with photo, internal employee reference, company, and active status.
- Competency catalogue and employee qualification records.
- HR-only certificate and diploma uploads with public viewing through QR profiles.
- Qualification verification, validity dates, and renewal history.
- QR generation and printable labels, including replacement and revocation.
- Responsive employee profile for phone-based scanning.
- Skills matrix with filters and qualification status indicators.
- Configurable expiry reminders.
- An API that Excel can connect to for flexible manager reporting; the connector and authentication mechanism remain to be selected.
- Role-based permissions and audit history for important changes.

HR is the only application account role, explicitly confirmed by the user. HR handles management, uploads, verification and Excel reporting. Employees and public QR viewers have no accounts. Do not add a separate manager, administrator or verifier role. Public viewing does not authorize administrative writes or unrestricted bulk reporting access.

Keep automated workforce scheduling, course delivery, payroll, attendance, subscription billing, AI features, and native mobile applications outside the MVP unless explicitly requested.

## Proposed technology and architecture

- Frontend: React, Next.js, and TypeScript, with responsive desktop and mobile layouts (implemented).
- Backend: Next.js Node.js route handlers and TypeScript REST API in one modular application. A separate NestJS service is not needed for this MVP.
- Database: MySQL 8.4, explicitly selected by the user.
- Documents and photos: configurable private filesystem storage on Windows Server for the MVP. Keep uploads outside public web roots.
- Authentication: server-side sessions in MySQL with hashed session tokens, scrypt password hashes, HR company memberships, and read-only reporting keys.
- Expiry status: computed live using inclusive UTC calendar dates; 30-day dashboard alerts. Email reminders and imports are deferred.
- QR output: qrcode-generated images and printable browser layouts (Print to PDF is supported).
- Hosting: Windows Server, explicitly selected by the user; Node.js behind IIS, with MySQL and persistent file storage. See docs/windows-server.md.

These are the current MVP implementation choices. Preserve the user-selected MySQL and Windows Server requirements. Avoid microservices and unnecessary infrastructure.

A normal phone camera should be able to open the QR profile URL. Do not require an installed mobile application for this workflow. Offline support is a separate requirement and must not be assumed from responsive web or PWA support.

## Data and domain rules

- Model companies, users, company memberships, employees, competencies, employee qualifications, document versions, QR credentials, and audit events as distinct concepts.
- Separate login accounts from employee records; employees do not have accounts.
- Use generated internal identifiers. Do not use SSN or another national identifier as a database primary key, public identifier, or QR value.
- Keep company ownership explicit on tenant-owned records and enforce it on the server.
- Do not infer cross-company employee sharing, record transfers, or global identity matching. Those rules require client clarification.
- Separate an uploaded document from a verified qualification. Uploading evidence does not automatically approve it.
- Track verification independently from validity. Support qualifications without expiry dates.
- Derive time-based status consistently from validity dates and the agreed timezone/date-boundary rules. Preserve renewals and revocations in history.
- Do not treat possession of a qualification as automatic authorization for every site or task.

## Access and QR behavior

- Put an opaque, unpredictable, revocable profile reference in each QR URL, not employee data or certificate contents.
- Resolve current information when the profile is opened, so renewals normally do not require reprinting a label.
- A QR code identifies a profile; it does not authenticate the viewer. Helmet labels can be copied or photographed.
- Allow anyone to open QR profiles and view competencies and diplomas without login or viewer access filtering, as confirmed by the client. Do not add an authentication gate to this workflow.
- Keep management writes protected and restrict all file uploads to HR. The public QR requirement does not establish that every internal HR field or the bulk reporting API is public.
- Check company membership and permissions for every protected API operation and file access. UI filtering is not an authorization boundary.
- Private file storage may serve documents through public QR endpoints or short-lived links without requiring viewer login. Protect upload operations and apply upload size/type validation and document scanning appropriate to deployment.
- Include import/export operations, background jobs, and reports in tenant isolation rules.
- MySQL company isolation is enforced by application authorization, tenant-scoped queries, and composite foreign keys; test these boundaries.
- Record important changes and approvals without logging sensitive identifiers, document contents, or access tokens.
- QR replacement must support revoking the old reference. Deactivated employee profiles must not imply current approval.

## Excel integration

The client confirmed that Excel must connect to the application's API, allowing managers to extract data as needed. Build for flexible data retrieval, not only fixed downloadable reports. Spreadsheet imports, workbook write-back, an add-in, and Microsoft Graph synchronization are not confirmed requirements.

Select the Excel connection method after confirming the Excel environment and authentication requirements. Power Query is a candidate, not an approved decision. Define accessible datasets, company scope, filtering, pagination, and refresh behavior. The phrase "all data" does not establish unrestricted cross-company or anonymous bulk access.

If spreadsheet imports or file exports are added, validate imports, handle duplicates deliberately, respect reporting permissions, and avoid spreadsheet formula injection from user-supplied values.

## Questions awaiting client answers

- What format and uniqueness scope does SSN use, is it government-issued, and which countries will use the system?
- Which internal HR fields belong on the public profile beyond the confirmed identity, competencies, and diplomas?
- Are company workspaces fully separate, or can contractors view subcontractor workers?
- Can employees belong to multiple companies or take their skills passport to another employer?
- Who verifies, rejects, and revokes qualifications? HR-only uploads are already confirmed.
- Are competencies binary, proficiency-based, or both? Is the catalogue shared or company-specific?
- Which qualifications expire, and what are the validity and reminder rules?
- Which Excel environment, API authentication, reporting datasets, and refresh behavior are needed?
- Is offline viewing required, and how should stale qualification information be presented?
- What label dimensions, printer formats, and batch-printing behavior are needed?
- Which HR, identity, or training systems must integrate with the platform?
- What are the expected company count, employee count, languages, and initial user roles?
- What hosting region, data retention, and employee departure rules apply?
- What are the deadline, pilot acceptance criteria, and commercial model?

Do not silently turn these unresolved questions into confirmed requirements. Continue independent work using clearly documented, reversible assumptions. Seek clarification before dependent decisions involving sensitive identity data, public disclosure, cross-company sharing, or external integration contracts.

## Development workflow

- Inspect the repository and applicable instructions before changing code. Preserve established conventions when they exist.
- Keep changes focused on the requested scope. Do not scaffold the entire product merely because this document describes it.
- Use supported dependency versions and the repository's package manager and lockfile. Do not invent setup commands before tooling exists.
- Keep business rules in testable domain/service code rather than duplicating them across pages, jobs, and exports.
- Validate external input on the server and return actionable errors.
- Keep secrets out of source control; document required configuration using placeholder values.
- Use migrations for schema changes and synthetic data for examples and development seeds.
- Build accessible interfaces with text labels for status, not color alone. Include loading, empty, error, and permission-denied states.
- Test authorization and tenant isolation, document access, QR revocation, qualification validity boundaries, and import correctness when implementing those behaviors.
- Run relevant lint, type checks, and tests using actual repository scripts. State what was checked and any remaining limitations.
- Keep setup documentation and architectural decisions current as implementation choices are made.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
