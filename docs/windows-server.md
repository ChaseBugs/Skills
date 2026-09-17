# Windows Server deployment

This is a Windows-compatible deployment plan and configuration, not a claim that the client's production server has been configured. The application was built and exercised locally on Windows against MySQL 8.4.

## Layout

- Node.js runs the built Next.js application on `127.0.0.1:3100`.
- IIS terminates HTTPS and forwards requests to Node using Application Request Routing (ARR) and URL Rewrite.
- MySQL stores company, employee, authentication, qualification and document metadata.
- `UPLOAD_DIR` points to persistent storage outside the IIS website directory.
- Use a dedicated Windows account for Node, with read access to the application/config and write access to `.next` runtime cache and the upload directory.

Example directories:

```text
C:\Apps\Skills\             application, node_modules, .next, .env.local
C:\Sites\SkillsProxy\      IIS site containing only web.config
C:\ProgramData\Skills\uploads\
C:\ProgramData\Skills\logs\
```

Never use the repository root as IIS's public static directory. Do not copy `.local` or local demo credentials to production.

## Installation

1. Install Node.js 22 and MySQL 8.4. Install IIS with ARR and URL Rewrite on the server.
2. Create a MySQL database using `utf8mb4`. Use a migration account for schema creation and a restricted runtime account for SELECT, INSERT, UPDATE and DELETE on this database. Keep MySQL on localhost or a private network.
3. Copy the source, run `npm ci`, and create `.env.local` from `.env.example`.
4. Set `DATABASE_URL` (URL-encode special characters in credentials), `APP_URL=https://your-hostname`, `UPLOAD_DIR=C:/ProgramData/Skills/uploads`, and `COOKIE_SECURE=true`.
5. Run `npm run db:migrate` with the migration credentials, then configure the runtime connection. MySQL DDL auto-commits: back up before migrations and inspect a failed migration before retrying.
6. Provision the initial HR accounts with `npm run account:create` as shown in README. Do not seed demo data in a production database.
7. Run `npm run typecheck`, `npm test`, and `npm run build`.
8. Start the application with `powershell -File scripts/start-production.ps1`. Check `http://127.0.0.1:3100/api/health` locally.

## IIS configuration

1. Create an IIS website with a dedicated hostname and valid HTTPS certificate. Its physical directory should be `C:\Sites\SkillsProxy`, not the application directory.
2. Enable ARR proxy support at the server level in IIS Manager. Install/enable URL Rewrite.
3. Copy `deploy/web.config` to that IIS website directory. It redirects HTTP to HTTPS and proxies to loopback Node. It limits requests to 11 MB, allowing multipart overhead around the application's 10 MB file limit.
4. Ensure IIS **Anonymous Authentication** is enabled for the proxy site. Do not enable IIS Basic or Windows authentication for the whole site: public QR pages must open without a login, and reporting Basic credentials must reach the application.
5. Pass through the Authorization header. Check this with the reporting endpoint before testing Excel.
6. Keep Node bound to loopback. Expose only HTTPS (and HTTP for redirect if used) to clients. Configure request-rate limits, request timeouts and log retention at IIS according to the deployment's traffic.
7. Use a host-specific binding. Do not trust arbitrary Host or forwarded headers to generate QR links: the app uses `APP_URL`.

## Keep Node running

Use the organization's Windows service wrapper or Task Scheduler. For a Task Scheduler deployment:

- Run under the dedicated application account, whether or not the user is logged in.
- Trigger on system startup with a delay so MySQL is ready.
- Program: `powershell.exe`.
- Arguments: `-NoProfile -WindowStyle Hidden -File "C:\Apps\Skills\scripts\start-production.ps1"`.
- Start in: `C:\Apps\Skills`.
- Restart on failure; do not impose a time limit on this long-running task.
- Send process output to the organization's log collector or service wrapper log directory.

These instructions do not register a task or service automatically. The local test database is not a production Windows service.

## Operational checks

- Sign in as HR; add a worker, upload a real photo and a test diploma, and verify the public passport in an unauthenticated browser.
- Confirm HR can only manage assigned companies and anonymous users cannot upload or edit records.
- Generate a label with the real HTTPS domain and scan a physical print from a phone.
- Connect Excel using the reporting key. Revoke the key and verify refresh then fails.
- Confirm a deactivated worker's QR profile is unavailable.
- Back up MySQL **and** the upload directory as one logical dataset. Test restoration, including document retrieval and login, on a separate instance.
- Configure host-level malware scanning for uploads. The application performs signature/size checks but is not an antivirus engine.
- Monitor `/api/health`, Node/IIS failures, disk usage and backup results. Never log Authorization headers or session cookies.
- Remove expired rows from `sessions`, `api_tokens`, and old `login_attempts` periodically. Expired credentials are rejected even before cleanup.

## Updating

Back up data, stop the application task/service, deploy source and lockfile, run `npm ci`, apply reviewed migrations, run `npm run build`, and restart. Keep the same upload directory and runtime configuration. Do not delete uploads or reinitialize the database as part of an update.
