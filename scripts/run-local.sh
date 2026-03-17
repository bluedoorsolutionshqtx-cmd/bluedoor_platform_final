#!/usr/bin/env bash
set -e

echo "Starting core services..."

pnpm -C services/auth start &
AUTH_PID=$!

pnpm -C services/core-api start &
CORE_PID=$!

wait $AUTH_PID $CORE_PID
