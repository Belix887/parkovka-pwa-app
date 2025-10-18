# Parkovka — Local Quickstart (Windows)

This guide lets you run the app locally tonight with Dockerized Postgres.

## Prerequisites
- Docker Desktop (with WSL2 backend)
- Node.js 20+
- PowerShell

## 1) Prepare environment
Copy env template:

```bash
Copy-Item env.template .env.local -Force
```

Ensure in `.env.local`:
- `DATABASE_URL=postgresql://parkovka:parkovka@localhost:5432/parkovka?schema=public`
- Set `JWT_SECRET` to any strong random string for local use

## 2) One-command bootstrap
From the `parkovka-app` folder:

```bash
./start-local.ps1
```

This will:
- Start Postgres via Docker Compose
- Install dependencies
- Generate Prisma client
- Apply migrations
- Seed demo data (users and one parking spot)
- Start Next.js dev server

Open `http://localhost:3000`.

Demo accounts:
- owner@example.com / owner123
- renter@example.com / renter123

## Manual commands (optional)
If you need to run pieces by hand:

```bash
# Start DB
npm run db:up

# Generate prisma
npm run prisma:generate

# Apply migrations
npm run prisma:migrate

# Seed
npm run seed

# Start dev
npm run dev
```

## Production notes
- Change `JWT_SECRET` and use a managed Postgres (update `DATABASE_URL`).
- Use `npm run build && npm run start` in production.
