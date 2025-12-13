#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:-dist}"
ART="bluedoor_platform-src.tar.gz"
SBOM="sbom.cdx.json"

mkdir -p "$OUT_DIR"

echo "[pack] tarball..."
tar -czf "$OUT_DIR/$ART" \
  --exclude=.git \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.railway \
  .

echo "[hash] tarball sha256..."
( cd "$OUT_DIR" && sha256sum "$ART" > "$ART.sha256" )

echo "[sbom] CycloneDX (cdxgen)..."
npx --yes @cyclonedx/cdxgen@latest -t nodejs -o "$OUT_DIR/$SBOM" .

echo "[hash] sbom sha256..."
( cd "$OUT_DIR" && sha256sum "$SBOM" > "$SBOM.sha256" )

echo "[done] artifacts:"
ls -la "$OUT_DIR"
