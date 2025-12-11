#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-dev}"

echo "[dev-deploy] Using branch: $BRANCH"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

pnpm install
pnpm lint
pnpm test
pnpm build

echo "[dev-deploy] Commit and push any pending changes if needed."
echo "[dev-deploy] To trigger CI/Railway deploy, run:"
echo "  git push origin $BRANCH"
