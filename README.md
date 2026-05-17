# ATMU Smart UniLibrary Enterprise

ATMU uchun enterprise darajadagi raqamli kutubxona platformasi: katalog, resource workflow, book copy circulation, reading-room reservation, role-based dashboards va boshqaruv API’lari.

## Features

- Locale-based public portal: `uz`, `ru`, `en`
- Server-side catalog search, filter, sort, pagination
- Resource detail page with metadata, QR, citation, reviews, similar resources
- Teacher resource workflow: `DRAFT -> PENDING_REVIEW -> APPROVED/REJECTED/NEEDS_REVISION`
- Librarian workflows: reservation approve/pickup, loan return, renewal review
- Reading room booking with overlap protection
- JWT cookie auth, RBAC, ownership checks, audit/security logs
- Admin health/settings endpoints and dashboard summaries
- Prisma-backed real database with migration SQL and development seed

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS
- Prisma ORM
- SQLite for current local runtime
- Vitest

## Current Architecture Status

- `DONE`: Next.js foundation, auth, RBAC, catalog API/UI, reservation workflow, loan return workflow, reading-room overlap protection, seed, lint, build, automated tests
- `PARTIAL`: Admin panel breadth, teacher upload UX depth, full role subpages, notification UI, production deployment hardening
- `BLOCKED`: Native `prisma migrate dev` and `prisma db seed` wrapper commands inside this non-interactive Windows/Unicode-path environment
- `PARTIAL`: PostgreSQL target architecture. Current workspace runs on SQLite because no local PostgreSQL server is available in this environment

## Folder Structure

```text
src/
  app/
  components/
  lib/
  server/
prisma/
tests/
```

## Environment

See [.env.example](./.env.example).

Important local variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_URL`
- `UPLOAD_DIR`
- `MAX_UPLOAD_SIZE`

## Database Setup

### Important Windows workaround

This workspace lives under a Unicode path. Prisma query/migrate commands were only reliable through a mapped ASCII drive.

Run this first in PowerShell:

```powershell
subst X: "C:\Users\User\OneDrive\Документы\Axborot Texnologiyalari va Menejment Universiteti"
cd X:\
```

### Apply schema

Interactive `prisma migrate dev` is blocked in this Codex environment, so the project currently uses generated migration SQL plus deploy:

```powershell
node .\node_modules\prisma\build\index.js migrate deploy
```

### Seed

Direct seed script:

```powershell
npx tsx .\prisma\seed.ts
```

Note: `npm run db:seed` / `prisma db seed` still does not execute correctly in this environment and is currently marked `BLOCKED`.

## Development

```powershell
subst X: "C:\Users\User\OneDrive\Документы\Axborot Texnologiyalari va Menejment Universiteti"
cd X:\
npm install
npm run lint
npm test
npm run build
npm run start
```

## Default Logins

- `admin@atmu.uz / Admin12345!`
- `librarian@atmu.uz / Librarian12345!`
- `moderator@atmu.uz / Moderator12345!`
- `teacher@atmu.uz / Teacher12345!`
- `student@atmu.uz / Student12345!`
- `department@atmu.uz / Department12345!`

## Security Notes

- Passwords hash with `bcrypt`
- HttpOnly auth cookie
- RBAC and ownership checks in server layer
- Security headers via `middleware.ts`
- In-memory rate limit for auth endpoints
- File type, size, and magic-number validation for uploads
- Audit and security logs are persisted in the database

## Deployment Notes

### Render

- `render.yaml` added for live deployment via Render Blueprint
- Current Render path is `PARTIAL`: it runs on SQLite with a persistent disk on a paid Render web service, which is acceptable for demo/live preview but not enterprise-grade production
- For true production, migrate to PostgreSQL before relying on long-term circulation data
- Set `APP_URL` in Render to the final `https://...onrender.com` URL after the first deploy
- Uploads are configured to persist under `/var/data/uploads`

Suggested flow:

```text
1. Push repo to GitHub
2. In Render open New + -> Blueprint
3. Select the GitHub repository
4. Render reads render.yaml automatically
5. Set APP_URL to the generated public URL
6. Deploy
```

### Vercel

- Possible for the frontend, but the current SQLite + local upload architecture is not ideal there
- Prefer Render until PostgreSQL and object storage migration is completed

### Docker

Current repo does not yet include a `Dockerfile` or `docker-compose.yml`. This remains `TODO`.

## Monitoring / Backup Recommendations

- Add uptime monitor for `/api/admin/health`
- Add structured log shipping
- Add Sentry/OpenTelemetry placeholder
- Backup PostgreSQL daily in production
- Store uploads in object storage with versioning

## Troubleshooting

- If Prisma reports path/open-file issues, use `subst X:` workaround
- If port `3000` is busy, stop the previous `node` process before `npm run start`
- If cookies look `Secure` on localhost, verify `APP_URL=http://localhost:3000`

## TODO / Future Improvements

- Replace SQLite with PostgreSQL and verify true `prisma migrate dev`
- Add missing CRUD modules: categories, faculties, departments, users, notifications
- Expand dashboards into full feature areas
- Add real upload wizard UX and moderation workspace
- Add CSV export, charts, and advanced reports
- Add full API/integration coverage for RBAC matrix
- Clean up the stray sibling directories created during Unicode path debugging
