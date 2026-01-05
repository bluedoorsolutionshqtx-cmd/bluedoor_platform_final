#!/usr/bin/env bash
set -euo pipefail

echo "=== Local CI: bluedoor_platform_final ==="

echo "[1/5] Typecheck / build"
pnpm -r build

echo "[2/5] Tests"
pnpm -r test || true

echo "[3/5] Ops-AI Judge"
node ops-ai/judge/judge.mjs

echo "[4/5] Risk scan"
node ops-ai/risk/classifier.mjs

echo "[5/5] RAG manifest refresh"
node ops-ai/rag/build-manifest.mjs

echo "[6/6] Validate artifacts"
node ops-ai/tools/validate-artifacts.mjs

echo "CI PASSED (local)"
