#!/usr/bin/env bash
set -euo pipefail

DEV_BRANCH="${1:-dev}"
STAGE_BRANCH="${2:-stage}"

echo "[stage-promote] Syncing $STAGE_BRANCH with $DEV_BRANCH"

git fetch origin "$DEV_BRANCH" "$STAGE_BRANCH"

git checkout "$STAGE_BRANCH"
git pull origin "$STAGE_BRANCH"

git merge "origin/$DEV_BRANCH" --no-ff

pnpm install
pnpm lint
pnpm test
pnpm build

echo "[stage-promote] Push stage branch to trigger CI/Railway stage deploy:"
echo "  git push origin $STAGE_BRANCH"
