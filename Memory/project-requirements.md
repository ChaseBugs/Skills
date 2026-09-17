# Project requirements memory

Updated: 2026-09-17.

## Purpose and sources

Build a skills and certification management system for multiple companies. An employee helmet label contains a QR code, name, and photograph. Scanning it opens the employee's competencies and diplomas. Some competencies have a validity period.

Sources are client messages from Gregory Beghain supplied by the user on 2026-09-17, including the initial messages at 07:22–07:27 and answers at 08:05–08:13. Times are preserved as supplied; their timezone is unspecified.

Reference products:

- https://www.caq.net/en/skills-matrix-software
- https://merca.team/construction-btp/

References describe inspiration, not an instruction to reproduce all their features.

## Confirmed client answers

| Topic                | Confirmed requirement                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Employee information | Human Resources fills in employee information.                                                                          |
| Employee accounts    | Employees do not have accounts.                                                                                         |
| QR access            | Everyone can read the QR profile; no login or viewer access filtering.                                                  |
| Profile content      | Employee identity, competencies, and access to diplomas, following the original request.                                |
| File uploads         | Only HR can upload files.                                                                                               |
| SSN                  | It is a unique identifier. Further format and identity details were not supplied.                                       |
| Excel                | Excel connects to the application's API. Managers can extract data as needed for their own reporting.                   |
| Design               | The client has no design plan. The user subsequently selected `E:/Github/Mobile/Heyworks/Admin-UI` as the UI reference. |
| Server               | Windows Server, confirmed by the user on 2026-09-17.                                                                    |
| Database             | MySQL, confirmed by the user on 2026-09-17.                                                                             |
| Multiple companies   | The system serves multiple companies. Sharing and reporting boundaries are not yet defined.                             |
| Validity             | Competencies can have a validity period. Reminder rules are not confirmed.                                              |

## Client's latest wording

> [2026/9/17 8:05 AM] Human Resources will fill employees information
>
> [2026/9/17 8:06 AM] Employees don’t have any accounts
>
> [2026/9/17 8:06 AM] Qr can be read by everyone
>
> [2026/9/17 8:06 AM] No access filtering
>
> [2026/9/17 8:08 AM] SSN is a unique id
>
> [2026/9/17 8:08 AM] If you remember I want to connect excel to api
>
> [2026/9/17 8:08 AM] The manager will extract all data as he wants
>
> [2026/9/17 8:09 AM] I don’t have any plan for the design
>
> [2026/9/17 8:13 AM] Only hr can upload files

## Latest user clarification — HR only

The user explicitly requested a single HR role. The earlier mention of managers extracting data does not require a separate manager account. HR now handles employee management, uploads, verification and Excel reporting. Retire legacy manager access without promoting it to HR or changing employee records. Employees and QR viewers still have no accounts.

## Implementation implications

- Provide an HR management interface and a public mobile-friendly QR profile. Do not build employee registration or employee login.
- Keep QR viewing open. Management authentication and HR-only uploads are separate from public read access.
- Keep the name, photograph, and QR code together on printable helmet labels.
- QR URLs should resolve live records so changing qualifications does not normally require reprinting.
- Provide an API suitable for Excel data retrieval. Fixed Excel downloads alone do not fulfill the confirmed request.
- Do not equate Excel connecting to the API with Microsoft Graph writing to a workbook. The connection technology is still undecided.
- Do not assume "SSN" means Social Security Number. Retain it as the client's identifier term until its format and origin are clarified.
- Public QR viewing does not by itself specify that SSN, every internal HR field, or the bulk reporting API must be public.
- Follow the user-selected Heyworks Admin-UI visual reference. Final client review of the workforce-specific screens remains a later step.

## Open details, not confirmed requirements

- Company boundaries for management, reporting, shared workers, and transfers.
- SSN format, uniqueness across companies, origin, and public visibility.
- Qualification approval responsibility; HR-only upload does not establish an approval workflow.
- Proficiency levels, exact expiry rules, and whether reminders are required.
- Excel version/environment, connection method, API authentication, datasets, and refresh expectations.
- Hosting address/domain and region, languages, scale, offline needs, label dimensions, and delivery date. Windows Server itself is confirmed.

Do not repeatedly ask questions already answered above. Clarify remaining details only when needed for the next decision.

## MVP implementation choices

The user requested implementation of the MVP. Windows Server and MySQL are confirmed. The implementation uses React/Next.js and TypeScript for both the responsive interface and Node.js API, MySQL 8.4 for durable records, and a configurable private filesystem directory for photos and diplomas. Next.js route handlers replace the earlier NestJS proposal to keep the MVP a single deployable application. The supplied Heyworks Admin-UI provides the dark sidebar, teal accent, light/dark themes, card and table design language. Native mobile apps are not requested.

Pilot assumptions: company-scoped management/reporting; SSN uniqueness within each company, never public; HR performs verification; 30-day expiry dashboard; inclusive UTC validity dates; Excel Power Query with a revocable 90-day reporting key; browser printing for labels. These are implementation choices, not additional direct client statements. Email reminders, automated certificate verification, offline mode, and cross-company data transfers are not included.

See `../README.md`, `../docs/windows-server.md`, and `../docs/api.md` for operation and deployment. Local demo data is synthetic; credentials are stored only in ignored local files.

Skills matrices, reminders, audit history, verification workflows, and QR revocation are proposed features or engineering recommendations, not all explicitly confirmed client requirements. Refer to `../AGENTS.md` for development guidance.

## Theme behavior

The sidebar must switch with the selected light/dark theme, including its company selector, navigation, tip card, and account footer. Do not keep a permanently dark sidebar in light mode.

## Communication preferences

- The user and client are friends. Do not ask about budget or add budget questions unless the user explicitly requests it.
- Use short, natural wording in client messages.
- Keep initial questions to roughly five or six essentials rather than sending a long questionnaire.

## Maintenance

Update this file when the user supplies new client decisions. Preserve the distinction between direct client statements, implementation implications, and proposals. Keep `../AGENTS.md` consistent with confirmed requirements.
