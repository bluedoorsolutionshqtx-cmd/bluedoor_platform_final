#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="${ROOT:-$HOME/bluedoor_platform_final}"
APPS=(client crew manager admin)

say(){ printf "\n%s\n" "$*"; }

app_pubdir() { echo "$ROOT/apps/$1/public"; }
app_jsdir() { echo "$ROOT/apps/$1/public/js"; }

need_app_public(){
  local app="$1"
  local pub
  pub="$(app_pubdir "$app")"
  [ -d "$pub" ] || { echo "SKIP $app (no public/ at $pub)"; return 1; }
  return 0
}
