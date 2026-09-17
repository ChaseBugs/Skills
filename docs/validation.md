# MVP validation record

Validated locally on Windows on 2026-09-17 with Node.js 22.23.2, MySQL 8.4.9 and the production Next.js build. Test data is synthetic.

## Passed

- TypeScript type checking and production compilation.
- Prettier format checks.
- Three domain test groups: expiry boundaries (including inclusive end dates and the 30-day threshold), upcoming/permanent/revoked status, and CSV escaping/formula handling.
- Thirty integration checks covering login/session invalidation, single HR role, legacy manager login rejection, company isolation, HR-only mutation/upload, duplicate IDs, invalid dates, cross-company associations, public profile/document access, SSN exclusion, evidence upload, verification, reporting authentication/pagination, read-only API keys, key revocation, label rendering, QR replacement, employee deactivation and cross-origin write rejection.
- Chrome desktop/browser checks: company selection persists across navigation; search; light/dark themes; every main route; employee detail; printable QR image; dialogs; mobile menu and public passport without horizontal overflow.
- End-to-end browser workflow: create an employee, add a qualification, upload diploma evidence, mark it verified.
- No uncaught browser errors during the successful workflow.

Visual review artifacts are kept locally in `.local/screenshots/overview-dark.png`, `overview-light.png`, `employee.png`, and `public-mobile.png`. They are intentionally excluded from source control.

## Not yet exercised in the client environment

- Deployment behind the client's IIS/HTTPS configuration and persistent Windows task/service.
- Excel desktop Power Query refresh. The matching Basic/Bearer API and pagination were tested, and the Power Query template is provided.
- Physical helmet-label printing and phone-camera scanning of the final HTTPS domain.
- Production host malware scanning, backup restore, high-volume load, and final client visual acceptance.

These are deployment/pilot checks, not claims of completed production setup. The local preview is ready for review; no external production deployment was performed.
