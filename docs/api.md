# MVP API

Base path: `/api`. JSON responses are not cached. Internal writes require a signed-in session and an `Origin` matching `APP_URL`. HR permissions and company ownership are enforced on the server.

## Authentication

`POST /auth/login` accepts `{ "email": "...", "password": "..." }` and sets an HTTP-only, SameSite=Lax session cookie. Sessions expire in 12 hours. `POST /auth/logout` invalidates the session. Login attempts are limited per email over a 15-minute window.

## Workspace endpoints

| Method | Path                        | Access / purpose                                                                       |
| ------ | --------------------------- | -------------------------------------------------------------------------------------- |
| GET    | `/health`                   | Database availability; no sensitive details                                            |
| GET    | `/workspace?company=<uuid>` | Member; selected company records, current role, own reporting key metadata             |
| POST   | `/employees`                | HR; create with companyId, name, ssn, jobTitle, department, site, email, active        |
| PATCH  | `/employees/<id>`           | HR; replace editable profile fields, including active status                           |
| POST   | `/employees/<id>/rotate-qr` | HR; invalidate old QR and generate a new one                                           |
| POST   | `/competencies`             | HR; companyId, name, category, description                                             |
| POST   | `/qualifications`           | HR; employeeId, competencyId, issuer, validFrom, nullable expiresOn, verification      |
| PATCH  | `/qualifications/<id>`      | HR; verification (`PENDING`/`VERIFIED`) and/or revoked boolean                         |
| POST   | `/uploads`                  | HR; multipart file, employeeId, kind (`PHOTO`/`DIPLOMA`), qualificationId for diplomas |
| GET    | `/documents/<id>`           | Member of document's company                                                           |
| POST   | `/tokens`                   | Member; companyId and name; returns a read-only reporting key once                     |
| DELETE | `/tokens/<id>`              | Key owner; revoke key                                                                  |

File types: PNG/JPEG photos; PDF/PNG/JPEG diplomas. Maximum file size: 10 MB. Original filenames are metadata; generated storage names prevent path traversal.

## Public QR endpoints

`GET /public/<qr-token>` returns public employee name, job title, company name, photograph reference, qualifications and document metadata. SSN and employee email are excluded. The visible page is `/p/<qr-token>`.

`GET /public/<qr-token>/documents/<document-id>` serves only a document belonging to that employee. A revoked QR or inactive employee returns 404 for both profile and document access. Files are served with no-store and restrictive content headers. Scanning a code does not prove the viewer's identity; access is intentionally public.

## Excel reporting

Create a reporting key from **Excel connection**. Keys are company-scoped, read-only, expire after 90 days, and are stored only as SHA-256 hashes.

Supported authentication:

```http
Authorization: Bearer sk_<key>
```

Or HTTP Basic with username `token` and the reporting key as the password. Use HTTPS. Do not put keys in URLs, spreadsheets, screenshots or source control. Excel can store the Basic credential through its data-source credential dialog.

Datasets:

- `GET /reports/employees`: employee records including internal SSN; excludes QR tokens and photo references.
- `GET /reports/competencies`: company competency catalogue.
- `GET /reports/qualifications`: qualification records with employee name, SSN, department, site, verification, validity and document count.

Parameters: `page` (1-based, default 1) and `pageSize` (1–1000, default 1000).

```json
{ "data": [], "page": 1, "pageSize": 1000, "total": 0, "hasMore": false }
```

Follow `hasMore` until false. The ready-to-use pagination template is `public/excel/Skills.pq`, also downloadable in the application. Set its BaseUrl and Dataset, then select Basic authentication in Excel. Report pages are not a transactional snapshot across requests; refresh during quiet periods if records are changing rapidly.

API reads/Basic authentication/pagination have been tested over HTTP locally. The Power Query script must still be validated in the client's actual Excel installation and HTTPS deployment.

## Status codes

400 invalid input, 401 missing/expired authentication, 403 insufficient company/role access or bad request origin, 404 missing/unavailable record, 409 duplicate company identifier/name, 413 oversized upload, 429 login throttling, 500 unexpected server failure. Error body: `{ "error": "Readable message" }`.
