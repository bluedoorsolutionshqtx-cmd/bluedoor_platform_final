#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="${1:-$HOME/bluedoor_platform_final}"
APPS=("client" "crew" "manager" "admin")

echo "Repo root: $ROOT"
cd "$ROOT"

for app in "${APPS[@]}"; do
  APPDIR="apps/$app"
  PUBDIR="$APPDIR/public"
  JSDIR="$PUBDIR/js"

  [ -d "$PUBDIR" ] || { echo "SKIP $app (no public/)"; continue; }

  echo "=== $app ==="

  if [ -d "$JSDIR" ]; then
    mv "$JSDIR" "$PUBDIR/js.backup"
  fi

  mkdir -p "$JSDIR/lib" "$JSDIR/pages" "$JSDIR/components"

  echo "export const APP='$app';" > "$JSDIR/lib/app.js"

  cat > "$JSDIR/main.js" <<'JS'
console.log("BlueDoor frontend loaded");
JS

  IDX="$PUBDIR/index.html"
  if [ -f "$IDX" ] && ! grep -q '/js/main.js' "$IDX"; then
    sed -i 's#</body>#<script type="module" src="/js/main.js"></script>\n</body>#' "$IDX"
  fi

done

echo "DONE"
