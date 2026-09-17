# Skills — workforce credentials MVP

A working multi-company skills management application using **Next.js, TypeScript, MySQL 8.4 and Windows-compatible file storage**. Its dark sidebar, teal accents, light/dark themes, compact cards and tables follow the supplied Heyworks Admin-UI reference.

## Included

- HR-only sign-in with company memberships; employees have no accounts.
- HR employee creation/editing, photo upload, active/inactive status and unique employee ID/SSN per company.
- Competency catalogue, qualification records, optional expiry dates, HR verification and revocation.
- HR-only PDF/PNG/JPEG diploma uploads; live public passport access without sign-in.
- Overview with real database counts and 30-day expiry attention list.
- Searchable employee directory, skills matrix, document library and activity log.
- QR passport links, QR replacement, and printable name/photo/QR helmet labels.
- Company-scoped read-only API keys and a paginated Excel Power Query template.
- English/French interface, switchable from an EN/FR control in the workspace topbar, the login page, and the public passport page. The choice is stored in a cookie (so server-rendered pages like the public passport and printed label pick it up too) and in localStorage.
- MySQL migrations, synthetic seed data, operator account provisioning, and Windows/IIS deployment instructions.

The MVP is one Node.js application containing both frontend and API. There is no separate NestJS service. No data is stored only in browser memory; localStorage holds theme/company/language preferences only.

## Current local preview

Open **http://localhost:3100**.

Local-only HR-only sign-in details are in **`.local/demo-login.txt`**. These are randomly generated credentials, not committed defaults. The demo uses synthetic employees in two companies. Initials are placeholders until HR uploads actual photographs; there are no invented diplomas.

An isolated MySQL instance is configured on `127.0.0.1:3311`, using `.local/mysql-data`. The pre-existing system MySQL service was not modified. `.env.local` contains this application's connection details. To restart the development demo:

```powershell
powershell -File scripts/start-local.ps1
```

The local preview is not a public deployment. Before issuing real helmet labels, set `APP_URL` to the public HTTPS domain, restart the server, and print new labels.

## Set up on another machine

Prerequisites: Node.js 22, npm, and MySQL 8.4. Create an empty UTF-8 database and an application user that can run migrations in that database. Do not use a root account at runtime.

```powershell
npm ci
Copy-Item .env.example .env.local
# Edit .env.local: DATABASE_URL, APP_URL, UPLOAD_DIR and cookie settings.
npm run db:migrate
```

For synthetic demo data only, set a random `SEED_PASSWORD` of at least 16 characters and then run:

```powershell
npm run db:seed
npm run dev
```

Seeding skips a database that already contains a company. For a clean production company, do not seed; provision an HR account instead:

```powershell
$accountSecret = Read-Host 'New account password (at least 16 characters)' -AsSecureString
$env:ACCOUNT_PASSWORD = [System.Net.NetworkCredential]::new('', $accountSecret).Password
try {
  npm run account:create -- --company "Your Company" --name "HR User" --email "hr@yourcompany.com"
} finally {
  Remove-Item Env:ACCOUNT_PASSWORD
}
```

HR is the only account role. To grant an existing account membership in another company, use the same email and add `--existing-user` explicitly. The command refuses to overwrite existing memberships or passwords. Company/user provisioning is an operator CLI function in this MVP.

## Validation

```powershell
npm run typecheck
npm test
npm run build
# With the server running and a seeded development database:
npm run test:integration
npm run test:browser
```

Integration tests use the demo credentials from `.env.local`, create uniquely named test records, and clean those records up. Run them only against a development database. Browser tests use a locally installed Chrome and the synthetic Northstar Construction workspace. Screenshots are written to ignored `.local/screenshots/`.

## Scope and decisions

- MySQL and Windows Server are explicit user choices.
- Public QR access is intentional. SSN and internal email are excluded from public profiles.
- Management and Excel reporting stay company-scoped; no cross-company sharing workflow is assumed.
- Validity uses UTC calendar dates. A qualification remains valid through its expiry date. “Expiring soon” means 0–30 days remaining. Verification is separate from validity.
- Renewals are new qualification records. The matrix selects the strongest current record; the profile retains all history. Dashboard counts describe qualification records, not task authorization or regulatory compliance.
- HR verification is a pilot workflow, not automatic issuer verification.
- Excel reads JSON through Power Query using Basic or Bearer API-key authentication. The key is revocable, company-scoped, and expires in 90 days. Actual Excel desktop refresh remains to be tested in the client's Excel environment.
- Label dimensions default to 105 mm wide and remain subject to the client's printer/helmet requirements.
- No offline mode, email/SMS reminders, spreadsheet import, automated scheduling, employee login, self-service password reset, or billing is included.
- Uploads enforce type signatures and a 10 MB limit. They are not malware-scanned in the application; production host scanning and backups must be configured by the operator.
- The workspace loads a company's records in one request for this pilot. Large deployments should add server-side filtering/pagination before increasing the dataset substantially.
- English/French covers interface copy (`lib/i18n.ts`). Data entered by HR (employee names, competency names/categories, activity log descriptions) is stored and shown as entered, in whichever language it was typed.

See [Windows deployment](docs/windows-server.md), [API reference](docs/api.md), and [requirements memory](Memory/project-requirements.md).

Migration `002_hr_only.sql` removes legacy manager memberships and revokes their sessions/reporting keys. User rows remain for audit history; accounts without HR membership cannot sign in. Existing HR accounts and employee records are preserved.
