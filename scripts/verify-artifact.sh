#!/usr/bin/env bash
set -euo pipefail

ART="${1:-}"
SHA="${2:-}"

if [[ -z "$ART" || -z "$SHA" ]]; then
  echo "Usage: $0 dist/bluedoor_platform-src.tar.gz dist/bluedoor_platform-src.tar.gz.sha256"
  exit 1
fi

echo "[verify] Checking: $ART"
sha256sum -c "$SHA"
echo "[verify] OK"
