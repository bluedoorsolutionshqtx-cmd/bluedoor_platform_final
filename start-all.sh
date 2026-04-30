#!/data/data/com.termux/files/usr/bin/bash

echo "=== BlueDoor Boot ==="

# --- START POSTGRES ---
echo "[1/5] Postgres..."
pg_ctl -D $PREFIX/var/lib/postgresql start >/dev/null 2>&1

# --- START REDIS ---
echo "[2/5] Redis..."
redis-server --daemonize yes >/dev/null 2>&1

# --- CLEAN OLD PROCESSES ---
echo "[3/5] Cleaning old services..."
pkill node >/dev/null 2>&1

BASE=~/bluedoor_platform_final/bluedoor_control_plane/services/control-plane

# --- START SERVICES (ORDER MATTERS FOR VISIBILITY) ---
echo "[4/5] Starting services..."

(cd $BASE/contract-service && npm start) &
(cd $BASE/registry-service && npm start) &
(cd $BASE/policy-service && npm start) &
(cd $BASE/risk-engine && npm start) &
(cd $BASE/approval-service && npm start) &
(cd $BASE/execution-service && npm start) &
(cd $BASE/audit-service && npm start) &
(cd $BASE/memory-service && npm start) &

# --- WAIT FOR SERVICES ---
sleep 4

# --- TEST PIPELINE ---
echo "[5/5] Testing pipeline..."
redis-cli publish action.requested '{"boot":"auto"}' >/dev/null

echo "=== System Running ==="
