#!/usr/bin/env bash
set -euo pipefail

FILES=(
  "services/jobs/api/asyncapi.yaml"
  "services/billing/api/asyncapi.yaml"
  "services/payments/api/asyncapi.yaml"
)

for f in "${FILES[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing: $f"
    exit 1
  fi
done

echo "Validating AsyncAPI..."
npx -y @asyncapi/cli@latest validate services/jobs/api/asyncapi.yaml
npx -y @asyncapi/cli@latest validate services/billing/api/asyncapi.yaml
npx -y @asyncapi/cli@latest validate services/payments/api/asyncapi.yaml
echo "OK"
