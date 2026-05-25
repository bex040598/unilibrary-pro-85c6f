# ATMU Smart UniLibrary Enterprise

ATMU Smart UniLibrary Enterprise universitet elektron kutubxonasi, bosma kitoblar aylanishi, reading room bronlash, teacher-moderator workflow, admin boshqaruvi va audit/security loggingni birlashtirgan Next.js + Prisma platformasi.

## Features

- Public catalog with server-side search, filter, sort, pagination
- Resource detail with QR, citation, PDF preview, favorite, review, reservation, download tracking
- Teacher upload wizard with `DRAFT -> PENDING_REVIEW`
- Moderator review workspace with `APPROVED`, `REJECTED`, `NEEDS_REVISION`
- Departments directory with search, faculty filter, detail page, and real database-backed resources
- Reservation, pickup, loan, return, overdue, renewal workflows
- Reading room booking with overlap protection
- Admin CRUD APIs, audit logs, security logs, analytics, CSV export
- Notification center for workflow-driven events
- Role-specific dashboards for student, librarian, admin, and moderator
- Storage abstraction for `local` and `s3`
- PostgreSQL-first Prisma schema and Render Blueprint

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL for production
- SQLite for automated local test fallback only
- Vitest integration tests
- Recharts
- AWS S3 SDK compatible adapter

## Current Module Status

- `DONE`: Auth, RBAC core, ownership checks, catalog API, search/filter/sort/pagination, reservation workflow, loan workflow, renewal workflow, reading-room overlap protection, notifications backend, analytics API, test suite, build, lint
- `PARTIAL`: Admin CRUD UI breadth, full role-panel UX breadth, notification pages for every staff role, S3 live verification
- `BLOCKED`: Live PostgreSQL migration verification inside this Codex workspace because `docker`, `docker compose`, and `psql` are not installed here

## Folder Structure

```text
src/
  app/
  components/
  lib/
  server/
prisma/
scripts/
tests/
```

## Environment Variables

See [.env.example](./.env.example).

Required core variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `AUTH_SECRET` as optional alias
- `APP_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `STORAGE_PROVIDER`
- `UPLOAD_DIR`
- `MAX_UPLOAD_SIZE`

Optional S3 variables:

- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_REGION`

## Database Setup

### Production target

Production target is PostgreSQL. SQLite is retained only for local automated tests and constrained local fallback.

### Option A: Docker Compose

```powershell
docker compose up -d postgres
npm run db:migrate
npm run db:seed
```

Optional MinIO is included in `docker-compose.yml`:

```powershell
docker compose up -d minio
```

### Option B: Existing PostgreSQL server

1. Create a PostgreSQL database.
2. Put its connection string into `DATABASE_URL`.
3. Run:

```powershell
npm run db:migrate
npm run db:seed
```

## Prisma Commands

```powershell
npm run db:migrate
npm run db:seed
npm run db:reset
npm run db:studio
```

Notes:

- `db:migrate` uses PostgreSQL schema: `prisma/schema.prisma`
- `test` uses SQLite schema: `prisma/schema.sqlite.prisma`
- `db:seed` is development-safe and guarded against accidental production execution unless `ALLOW_PRODUCTION_SEED=true`
- SQLite test seed resets schema before seeding, so reruns do not fail on duplicates
- Render startup uses `scripts/render-start.mjs`: it verifies `DATABASE_URL`, runs `prisma migrate deploy`, checks connectivity, seeds automatically only when the database is empty, and then starts Next.js

## Windows Unicode Path Workaround

If your project is inside a path with Cyrillic or other Unicode characters, Prisma CLI may be unstable on Windows. This repository includes safe wrappers in `scripts/` that temporarily map the workspace to an ASCII drive letter.

If you still hit path issues, run:

```powershell
subst X: "C:\Users\User\OneDrive\Документы\Axborot Texnologiyalari va Menejment Universiteti"
cd X:\
```

Then rerun the needed command.

## Development

```powershell
npm install
npm run dev
```

## Quality Gates

```powershell
npm run lint
npm test
npm run build
```

Verified in this workspace:

- `npm run lint` - PASS
- `npm test` - PASS
- `npm run build` - PASS

## Default Development Logins

- `admin@atmu.uz / Admin12345!`
- `librarian@atmu.uz / Librarian12345!`
- `moderator@atmu.uz / Moderator12345!`
- `teacher@atmu.uz / Teacher12345!`
- `student@atmu.uz / Student12345!`
- `department@atmu.uz / Department12345!`

These are for development seed only. They must not be enabled automatically in production.

## Security Notes

- Passwords are hashed with `bcrypt`
- Auth uses signed HttpOnly cookie sessions
- `JWT_SECRET` is required
- RBAC and ownership checks run in server/API layer
- Protected file access is policy-controlled
- Upload validation checks extension, MIME type, size, magic number, checksum
- Antivirus scanning is currently a placeholder status in upload validation reports
- Audit logs and security logs are stored in the database
- Auth endpoints are rate-limited
- Security headers are applied in `middleware.ts`

## Storage Strategy

### Local

- `STORAGE_PROVIDER=local`
- Files are saved under `UPLOAD_DIR`
- Protected files are served through `/api/files/resources/[resourceId]`

### S3-compatible

- `STORAGE_PROVIDER=s3`
- Configure `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`
- The app generates signed read URLs for protected file delivery

## Testing

Current automated coverage includes:

- Auth integration
- Reservation and loan workflow integration
- Enterprise flow integration:
  - Teacher upload -> moderator approve -> catalog visibility
  - Reservation -> approve -> pickup -> loan
  - Overdue -> renewal -> librarian approve
  - Reading room booking -> check-in -> check-out
  - Admin role change
- RBAC regression coverage:
  - Guest private access denied
  - Student admin actions denied
  - Teacher cross-ownership denied
  - Department-head overreach denied
  - Moderator/librarian/admin privileged actions allowed
- Status transition unit tests

## Render Deployment

This repo now includes a PostgreSQL-first [render.yaml](./render.yaml).

Blueprint resources:

- Web service: `atmu-smart-unilibrary-enterprise`
- Render Postgres: `atmu-smart-unilibrary-db`

Recommended steps:

1. Push the repository to GitHub.
2. In Render select `New + -> Blueprint`.
3. Choose this repository.
4. Provide `APP_URL` during the first setup.
5. If you want object storage, set `STORAGE_PROVIDER=s3` and fill the S3 variables manually.
6. Deploy.

`render.yaml` references the database connection string from the managed Render Postgres instance using `fromDatabase`.

Render environment variables to set or verify:

- `DATABASE_URL`
- `JWT_SECRET`
- `AUTH_SECRET`
- `NODE_ENV=production`
- `APP_URL=https://your-service.onrender.com`
- `NEXT_PUBLIC_APP_URL=https://your-service.onrender.com`
- `NEXT_PUBLIC_API_URL=https://your-service.onrender.com/api`
- `STORAGE_PROVIDER=local` or `s3`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION` when using object storage

Recommended Render commands:

- Build Command: `npm install && npm run prisma:generate:postgres && npm run build`
- Start Command: `npm run start`

`npm run start` Render runtime ichida avtomatik ravishda `scripts/render-start.mjs` ga o‘tadi. Shu sabab Blueprint yoki qo‘lda yaratilgan service’larda alohida `start:render` yozish shart emas.

## Vercel Deployment

Frontend deployment on Vercel is possible, but only after moving uploads to S3-compatible storage and using managed PostgreSQL. Local disk-backed uploads are not a good fit for Vercel serverless runtime.

## Docker

Included files:

- [Dockerfile](./Dockerfile)
- [docker-compose.yml](./docker-compose.yml)

Compose services:

- `app`
- `postgres`
- `minio`

## Monitoring and Backup Recommendations

- Use `/api/health` or `/api/admin/health` for uptime probes
- Ship logs to a centralized log platform
- Add Sentry or OpenTelemetry in the next iteration
- Enable Render Postgres backups / PITR on paid plans
- Back up object storage or disk uploads separately from database backups
- Monitor failed logins, upload failures, and overdue growth

## Troubleshooting

- If Prisma fails on Windows under a Unicode path, use the built-in wrapper scripts or `subst X:`
- If `npm run db:migrate` fails, verify PostgreSQL is reachable from `DATABASE_URL`
- If homepage shows `Database connection problem`, open Render logs and verify the final runtime has `DATABASE_URL`, `JWT_SECRET`, and a successful `prisma migrate deploy`
- If `/api/health` returns `503`, inspect Render Postgres attachment, SSL mode in the connection string, and whether migrations were applied
- If `/uz/catalog` or `/uz/departments` fails, confirm the database is seeded and `npm run start:render` is the active start command

## Key Endpoints

Departments:

- `GET /api/departments`
- `GET /api/departments/[id]`
- `GET /api/departments/slug/[slug]`
- `POST /api/departments`
- `PATCH /api/departments/[id]`
- `DELETE /api/departments/[id]`

Student dashboard:

- `GET /api/student/profile`
- `GET /api/student/resources`
- `GET /api/student/borrowings`
- `GET /api/student/bookings`
- `GET /api/student/recommendations`
- `GET /api/student/notifications`

Librarian dashboard:

- `GET /api/librarian/profile`
- `GET /api/librarian/resources`
- `POST /api/librarian/resources`
- `PATCH /api/librarian/resources/[id]`
- `DELETE /api/librarian/resources/[id]`
- `GET /api/librarian/borrowings`
- `PATCH /api/librarian/borrowings/[id]/return`
- `GET /api/librarian/bookings`
- `PATCH /api/librarian/bookings/[id]/approve`
- `PATCH /api/librarian/bookings/[id]/reject`
- `GET /api/librarian/reports`

## Post-deploy Checklist

- `GET /api/health` returns `200`
- `GET /api/departments` returns seeded departments
- Student login redirects to `/uz/student/dashboard`
- Librarian login redirects to `/uz/librarian/dashboard`
- Admin login redirects to `/uz/admin/dashboard`
- Moderator login redirects to `/uz/moderator/dashboard`
- `Kafedralar` menu opens the real departments page
- Homepage no longer shows the old zero-stat hero panel
- `npm run build` passes in Render logs
- If `npm run db:seed` fails in production, confirm `ALLOW_PRODUCTION_SEED=true` only when intentionally seeding
- If upload access fails under `s3`, verify bucket credentials and endpoint format

## Known Gaps

- Admin UI supports real data and admin APIs, but not every entity has a polished modal-based CRUD experience yet
- Role-specific panels exist, but some routes still need deeper workflow UX to reach full enterprise breadth
- Live S3 verification and live PostgreSQL migration verification are blocked in this workspace because external infrastructure tools are unavailable here

## Next Improvements

- Finish full admin CRUD UX with dedicated forms and dialogs
- Expand staff notification center pages
- Add Playwright/browser E2E on top of API integration coverage
- Add richer exports such as Excel and PDF
- Add antivirus integration and background scanning pipeline
