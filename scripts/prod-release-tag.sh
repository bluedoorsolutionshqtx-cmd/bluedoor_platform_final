#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 v1.2.3"
  exit 1
fi

echo "[prod-release-tag] Tagging version $VERSION on main"

git fetch origin main
git checkout main
git pull origin main

pnpm lint
pnpm test
pnpm build

git tag -a "$VERSION" -m "BlueDoor platform $VERSION"
git push origin main
git push origin "$VERSION"

echo "[prod-release-tag] Tag pushed. CI/CD will run prod pipeline for $VERSION."
