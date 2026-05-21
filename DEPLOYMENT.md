# Deployment

## Required Environment Variables

Render production service must have these variables:

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=...
AUTH_SECRET=...
NODE_ENV=production
APP_URL=https://universitet-bilim-resurslari-yagona.onrender.com
NEXT_PUBLIC_APP_URL=https://universitet-bilim-resurslari-yagona.onrender.com
NEXT_PUBLIC_API_URL=https://universitet-bilim-resurslari-yagona.onrender.com
```

Optional storage variables:

```bash
STORAGE_PROVIDER=local
UPLOAD_DIR=/var/data/uploads
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_REGION=
```

Render Build Command:

```bash
npm install && npm run build
```

Render Start Command:

```bash
node scripts/render-start.mjs
```

Required environment variables are listed in `.env.example` and `render.yaml`.

Production database flow:

```bash
npx prisma generate --schema prisma/schema.prisma
npx prisma migrate deploy --schema prisma/schema.prisma
npm run db:seed
```

The start script runs migrations and seeds only when the database has zero users.

## Render Manual Recovery Steps

1. Open the web service environment and confirm `DATABASE_URL` is present.
2. Confirm the build command is `npm install && npm run build`.
3. Confirm the start command is `node scripts/render-start.mjs`.
4. Run `npx prisma migrate deploy --schema prisma/schema.prisma` against the production database if migrations are pending.
5. Run `npm run db:seed` once if the database is empty.
6. Use `Manual Deploy -> Clear build cache & deploy`.
7. After deploy, verify:
   - `/api/health`
   - `/uz`
   - `/uz/catalog`
   - `/uz/kafedralar`

If login fails on Render, open Logs and check database connectivity, auth configuration, Prisma migration output, and whether the users table was seeded.
