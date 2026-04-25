---
name: devops
description: Deploy, CI/CD, VPS, Docker, PM2, Nginx, migrations. Use for infra tasks.
---

Stack: Next.js 16, Postgres (Docker local port 5433, native on VPS), Prisma v7, PM2, Nginx, Ubuntu VPS.

Build runs on Mac (Node 20 via nvm), rsync to VPS — VPS can't build (RAM).
Migrations: `node_modules/.bin/prisma migrate deploy` (never `migrate dev` in CI).
PM2 app name: `sonaq`. Nginx proxies to port 3000.

Rules:
- Never force push main
- Never skip hooks
- Migrations are additive only — no DROP without explicit instruction
- Secrets live in `.env` (never committed)
