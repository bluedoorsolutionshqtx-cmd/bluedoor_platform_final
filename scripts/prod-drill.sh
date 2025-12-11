#!/usr/bin/env bash
set -euo pipefail

: "${PROD_API_BASE:=https://api.bluedoorsolutionsllc.com}"
: "${PROD_CLIENT_BASE:=https://client.bluedoorsolutionsllc.com}"

echo "[prod-drill] Starting production health drill"

check_endpoint() {
  local name="$1"
  local url="$2"
  echo "[prod-drill] Checking $name → $url"
  http_code="$(curl -sS -o /dev/null -w '%{http_code}' "$url")"
  if [[ "$http_code" != "200" && "$http_code" != "302" ]]; then
    echo "[prod-drill] ERROR: $name returned HTTP $http_code"
    exit 1
  fi
}

check_endpoint "API health"   "$PROD_API_BASE/health"
check_endpoint "Client root"  "$PROD_CLIENT_BASE/"

echo "[prod-drill] Core endpoints healthy."
echo "[prod-drill] NOTE: add additional workflow-specific checks here (login, job create, etc.)."
