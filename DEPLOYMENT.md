# Deployment

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

If login fails on Render, open Logs and check database connectivity, auth configuration, Prisma migration output, and whether the users table was seeded.
