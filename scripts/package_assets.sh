#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
OUT_FILE="$ROOT_DIR/assets/bavarotti-assets.tar.gz"

tar -czf "$OUT_FILE" -C "$ROOT_DIR/assets" menu-images -C "$ROOT_DIR" scripts/upload_jsonbin_cloudinary.sh

echo "Created package: $OUT_FILE"
