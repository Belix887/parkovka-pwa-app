# Deployment Notes

## Prisma engines on Windows

The development environment could not download Prisma binaries from the default
`prisma-builds.vercel.app` mirror (404). To work around this, set the following
environment variable before running Prisma commands:

```powershell
$env:PRISMA_ENGINES_MIRROR = "https://binaries.prisma.sh"
```

After setting the mirror, run:

```powershell
npx prisma generate
```

If you have Docker and PostgreSQL running locally, you can apply the migration:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/parkovka"
npx prisma migrate dev --name add_spot_moderation
```

> Note: the Docker daemon is not available in the current environment, so the
> migration command cannot be executed here. Run it in your deployment
> environment after starting the database.

## New admin surface

- Pages:
  - `/admin/owner-verifications`
  - `/admin/spots`
- API routes:
  - `/api/admin/owner-verifications`
  - `/api/admin/owner-verifications/[id]`
  - `/api/admin/spots/moderation`
  - `/api/admin/spots/[id]/moderation`

Ensure that the admin role is granted to at least one user. The seeding script
creates `admin@example.com` with password `admin123`.

