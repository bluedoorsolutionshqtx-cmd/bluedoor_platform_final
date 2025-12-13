#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:-dist}"
SBOM_NAME="${2:-sbom.cdx.json}"

mkdir -p "$OUT_DIR"

echo "[sbom] generating CycloneDX SBOM (cdxgen)..."
npx --yes @cyclonedx/cdxgen@latest -t nodejs -o "$OUT_DIR/$SBOM_NAME" .

echo "[sbom] written: $OUT_DIR/$SBOM_NAME"
