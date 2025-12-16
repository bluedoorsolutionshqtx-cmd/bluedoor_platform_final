#!/usr/bin/env bash
set -e

echo "Starting core services..."
pnpm -C services/auth start &
pnpm -C services/core-api start &
pnpm -C services/notify start &
pnpm -C services/scheduling-routing start &
wait
