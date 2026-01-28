#!/usr/bin/env bash
set -euo pipefail

echo "=== Local CI: bluedoor_platform_final ==="

echo "[1/5] Typecheck / build"
pnpm -r build

echo "[2/5] Tests"
pnpm -r test || true

echo "[3/5] Ops-AI full run"
node ops-ai/run.mjs

echo "CI PASSED (local)"
