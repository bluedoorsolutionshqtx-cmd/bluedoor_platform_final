#!/usr/bin/env bash
set -euo pipefail

BLOB="${1:-}"
SIG="${2:-}"

if [[ -z "$BLOB" || -z "$SIG" ]]; then
  echo "Usage: $0 dist/file dist/file.sig"
  exit 1
fi

REPO="bluedoorsolutionshqtx-cmd/bluedoor_platform"
ISSUER="https://token.actions.githubusercontent.com"

echo "[cosign] verify-blob $BLOB"
cosign verify-blob \
  --signature "$SIG" \
  --certificate-oidc-issuer "$ISSUER" \
  --certificate-identity-regexp "https://github.com/${REPO}/.github/workflows/.*@refs/heads/.*" \
  "$BLOB"

echo "[cosign] OK"
