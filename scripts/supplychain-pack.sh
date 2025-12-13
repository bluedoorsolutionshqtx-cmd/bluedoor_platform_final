#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:-dist}"
ART_NAME="${2:-bluedoor_platform-src.tar.gz}"

mkdir -p "$OUT_DIR"

echo "[pack] creating source tarball..."
tar -czf "$OUT_DIR/$ART_NAME" \
  --exclude=.git \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.railway \
  .

echo "[pack] sha256..."
( cd "$OUT_DIR" && sha256sum "$ART_NAME" > "$ART_NAME.sha256" )

echo "[pack] done:"
ls -la "$OUT_DIR"
