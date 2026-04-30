#!/usr/bin/env bash
set -euo pipefail

node -v >/dev/null
npm -v >/dev/null

echo "[cdxgen] using npx (no global install needed)"
npx --yes @cyclonedx/cdxgen@latest --version
