#!/data/data/com.termux/files/usr/bin/bash
set -e

# ---- HARD VALUES (NO PLACEHOLDERS) ----
ROOT="$HOME/bluedoor_platform_final"
APP="manager"
PUB="$ROOT/apps/manager/public"
JSD="$PUB/js"
IDX="$PUB/index.html"
# -------------------------------------

echo "Patching $APP app"
echo "Public dir: $PUB"

if [ ! -d "$PUB" ]; then
  echo "ERROR: $PUB does not exist"
  exit 1
fi

mkdir -p "$JSD"

if [ ! -f "$JSD/main.js" ]; then
  cat > "$JSD/main.js" <<'JS'
console.log("BlueDoor MANAGER app booted");
JS
  echo "Created js/main.js"
fi

if [ -f "$IDX" ]; then
  grep -q 'src="/config.js"' "$IDX" || \
    sed -i 's#</head>#  <script src="/config.js"></script>\n</head>#' "$IDX"

  grep -q 'src="/js/main.js"' "$IDX" || \
    sed -i 's#</body>#  <script type="module" src="/js/main.js"></script>\n</body>#'

  echo "index.html patched"
else
  echo "WARNING: index.html not found"
fi

echo "DONE: manager patch complete"
