#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-main}"
ENV_FILE="${2:-.env.prod}"

echo "[onprem-deploy] Using branch: $BRANCH"
echo "[onprem-deploy] Using env file: $ENV_FILE"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[onprem-deploy] ERROR: env file '$ENV_FILE' not found."
  exit 1
fi

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

pnpm install
pnpm build

export $(grep -v '^#' "$ENV_FILE" | xargs)

if command -v pm2 >/dev/null 2>&1; then
  echo "[onprem-deploy] Starting via PM2"
  pm2 start ecosystem.config.js --env production || pm2 restart ecosystem.config.js --env production
  pm2 save
else
  echo "[onprem-deploy] PM2 not found. Start services manually:"
  echo "  pnpm --filter @bluedoor/core-api start"
  echo "  pnpm --filter @bluedoor/client start"
fi

echo "[onprem-deploy] On-prem deployment script completed."
