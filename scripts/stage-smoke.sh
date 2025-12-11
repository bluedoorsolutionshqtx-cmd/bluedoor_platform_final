#!/usr/bin/env bash
set -euo pipefail

: "${STAGE_API_BASE:=https://stage.api.bluedoorsolutionsllc.com}"
: "${STAGE_CLIENT_BASE:=https://stage.client.bluedoorsolutionsllc.com}"

echo "[stage-smoke] API base: $STAGE_API_BASE"
echo "[stage-smoke] Client base: $STAGE_CLIENT_BASE"

check_endpoint() {
  local name="$1"
  local url="$2"
  echo "[stage-smoke] Checking $name → $url"
  http_code="$(curl -sS -o /dev/null -w '%{http_code}' "$url")"
  if [[ "$http_code" != "200" && "$http_code" != "302" ]]; then
    echo "[stage-smoke] ERROR: $name returned HTTP $http_code"
    exit 1
  fi
}

check_endpoint "API health"   "$STAGE_API_BASE/health"
check_endpoint "Client root"  "$STAGE_CLIENT_BASE/"

echo "[stage-smoke] Stage smoke tests passed."
