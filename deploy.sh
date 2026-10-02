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

echo "→ Running Prisma migrations on VPS..."
ssh $VPS "cd $REMOTE_DIR && npx prisma migrate deploy"

echo "→ Regenerating Prisma client on VPS..."
ssh $VPS "cd $REMOTE_DIR && npx prisma generate"

echo "→ Restarting PM2..."
ssh $VPS "pm2 restart sonaq"

echo "✓ Deploy completo — https://sonaq.com.ar"
