#!/data/data/com.termux/files/usr/bin/bash
set -e
source "$(dirname "$0")/_common.sh"

APP="${1:-}"
[ -n "$APP" ] || { echo "Usage: $0 <client|crew|manager|admin>"; exit 2; }

need_app_public "$APP" || exit 0

PUB="$(app_pubdir "$APP")"
JSD="$(app_jsdir "$APP")"
IDX="$PUB/index.html"

mkdir -p "$JSD"

# Create minimal main.js if missing
[ -f "$JSD/main.js" ] || cat > "$JSD/main.js" <<'JS'
console.log("BlueDoor app booted");
JS

if [ -f "$IDX" ]; then
  # ensure config.js loads first (non-module)
  if ! grep -q 'src="/config.js"' "$IDX"; then
    sed -i 's#</head>#  <script src="/config.js"></script>\n</head>#' "$IDX" || true
  fi
  # ensure module main.js loads
  if ! grep -q 'src="/js/main.js"' "$IDX"; then
    sed -i 's#</body>#  <script type="module" src="/js/main.js"></script>\n</body>#' "$IDX" || true
  fi
  echo "OK: patched $APP index.html"
else
  echo "WARN: $IDX not found; created js only"
fi
