#!/bin/bash
# Deploy staging — builds locally with .env.staging, syncs to /var/www/sonaq-staging/
# Run: bash deploy-staging.sh
set -e

VPS="root@187.33.156.20"
REMOTE_DIR="/var/www/sonaq-staging"

echo "→ Loading .env.staging..."
if [ ! -f .env.staging ]; then
  echo "✗ .env.staging not found. Copy .env.staging.example and fill in real values."
  exit 1
fi
# NEXT_PUBLIC_* vars must be present at build time — source before npm run build.
# Make sure no stale NEXT_PUBLIC_STAGING_BANNER is set in the current shell.
set -a; source .env.staging; set +a

echo "→ Building locally (staging)..."
npm run build

echo "→ Syncing code to VPS..."
ssh $VPS "cd $REMOTE_DIR && git pull"

echo "→ Syncing .next to VPS..."
rsync -az --delete .next/ $VPS:$REMOTE_DIR/.next/

echo "→ Syncing node_modules to VPS..."
rsync -az --delete node_modules/ $VPS:$REMOTE_DIR/node_modules/

echo "→ Checking Prisma changes on VPS..."
# Prisma solo corre en la VPS si prisma/ cambió desde el último deploy que migró
# bien (sha en .prisma-deployed-sha; si falta, corre). El 2026-10-06 un
# `npx prisma migrate deploy` sin migraciones pendientes dejó la VPS sin memoria
# y tiró prod. FORCE_PRISMA=1 lo fuerza. Binario directo, sin npx.
PRISMA_STATE=$(ssh $VPS "cd $REMOTE_DIR && if git diff --quiet \"\$(cat .prisma-deployed-sha 2>/dev/null)\" HEAD -- prisma/ 2>/dev/null; then echo unchanged; else echo changed; fi")

if [ "$PRISMA_STATE" = "unchanged" ] && [ "${FORCE_PRISMA:-0}" != "1" ]; then
  echo "→ prisma/ sin cambios — salteando migrate y generate"
else
  echo "→ Running Prisma migrations on VPS (staging DB)..."
  ssh $VPS "cd $REMOTE_DIR && set -a && source .env.staging && set +a && node_modules/.bin/prisma migrate deploy"

  echo "→ Regenerating Prisma client on VPS..."
  ssh $VPS "cd $REMOTE_DIR && node_modules/.bin/prisma generate"

  ssh $VPS "cd $REMOTE_DIR && git rev-parse HEAD > .prisma-deployed-sha"
fi

echo "→ Restarting PM2 (sonaq-staging)..."
ssh $VPS "pm2 restart sonaq-staging --update-env"

echo "✓ Deploy staging completo — https://staging.sonaq.com.ar"
