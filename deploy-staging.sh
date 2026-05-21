#!/bin/bash
# Deploy staging — builds locally with .env.staging, syncs to /var/www/sonaq-staging/
# Run: bash deploy-staging.sh
set -e

VPS="root@187.33.155.194"
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

echo "→ Installing Linux-specific native packages..."
ssh $VPS "cd $REMOTE_DIR && npm install @parcel/watcher-linux-x64-glibc --no-save 2>/dev/null || true"

echo "→ Running Prisma migrations on VPS (staging DB)..."
ssh $VPS "cd $REMOTE_DIR && set -a && source .env.staging && set +a && npx prisma migrate deploy"

echo "→ Regenerating Prisma client on VPS..."
ssh $VPS "cd $REMOTE_DIR && npx prisma generate"

echo "→ Restarting PM2 (sonaq-staging)..."
ssh $VPS "pm2 restart sonaq-staging --update-env"

echo "✓ Deploy staging completo — https://staging.sonaq.com.ar"
