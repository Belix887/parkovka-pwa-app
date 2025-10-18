param(
  [switch]$SkipDb
)

$ErrorActionPreference = "Stop"

Write-Host "==> Creating .env.local if missing"
if (-not (Test-Path ".env.local")) {
  if (Test-Path "env.template") {
    Copy-Item "env.template" ".env.local"
  } elseif (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env.local"
  } else {
    throw "No env template found. Create .env.local with DATABASE_URL and JWT_SECRET."
  }
}

if (-not $SkipDb) {
  Write-Host "==> Starting Postgres (docker compose)"
  docker compose up -d db
}

Write-Host "==> Installing dependencies"
if (Test-Path "package-lock.json") {
  npm ci
} else {
  npm install
}

Write-Host "==> Generating Prisma client"
npm run prisma:generate

Write-Host "==> Applying migrations"
npm run prisma:migrate

Write-Host "==> Seeding database"
npm run seed

Write-Host "==> Starting Next.js dev server"
npm run dev
