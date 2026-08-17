#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/app"

if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo "Error: Could not find $APP_DIR/package.json." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed or is not available on PATH." >&2
  echo "Install Node.js 20.19 or newer, then run this script again." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or is not available on PATH." >&2
  exit 1
fi

cd "$APP_DIR"

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting PixelPlay..."
exec npm run dev -- "$@"
