#!/bin/bash
# Deploy script — builds locally (VPS cannot reliably run npm install or next build)
# then syncs build output and node_modules to server via rsync.
# Nunca correr npm install en la VPS: tiene 1 GB de RAM y un install la deja
# sin memoria (tiró prod y staging el 2026-09-27).
set -e

VPS="root@187.33.156.20"
REMOTE_DIR="/var/www/sonaq"

echo "→ Building locally..."
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
  echo "→ Running Prisma migrations on VPS..."
  ssh $VPS "cd $REMOTE_DIR && node_modules/.bin/prisma migrate deploy"

  echo "→ Regenerating Prisma client on VPS..."
  ssh $VPS "cd $REMOTE_DIR && node_modules/.bin/prisma generate"

  ssh $VPS "cd $REMOTE_DIR && git rev-parse HEAD > .prisma-deployed-sha"
fi

echo "→ Restarting PM2..."
ssh $VPS "pm2 restart sonaq"

echo "✓ Deploy completo — https://sonaq.com.ar"
