#!/usr/bin/env bash
set -euo pipefail

BIN_DIR="${BIN_DIR:-/usr/local/bin}"
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
  x86_64|amd64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) echo "[cosign] Unsupported arch: $ARCH"; exit 1 ;;
esac

if [[ "$OS" != "linux" && "$OS" != "darwin" ]]; then
  echo "[cosign] Unsupported OS: $OS"
  exit 1
fi

URL="https://github.com/sigstore/cosign/releases/latest/download/cosign-${OS}-${ARCH}"

echo "[cosign] downloading: $URL"
tmp="$(mktemp)"
curl -fsSL "$URL" -o "$tmp"

chmod +x "$tmp"
sudo mkdir -p "$BIN_DIR"
sudo mv "$tmp" "$BIN_DIR/cosign"

echo "[cosign] installed: $BIN_DIR/cosign"
cosign version
