#!/usr/bin/env bash
set -euo pipefail

ART="${1:-dist/bluedoor_platform-src.tar.gz}"
SHA="${2:-dist/bluedoor_platform-src.tar.gz.sha256}"

echo "[verify] sha256..."
sha256sum -c "$SHA"
echo "[verify] OK"
