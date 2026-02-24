#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
MENU_JSON="$ROOT_DIR/src/data/menu.example.json"
CATEGORIES_JSON="$ROOT_DIR/src/data/categories.example.json"
SPECIALS_JSON="$ROOT_DIR/src/data/specials.example.json"
TRANSLATIONS_EN_JSON="$ROOT_DIR/src/data/translations.en.example.json"
TRANSLATIONS_ES_JSON="$ROOT_DIR/src/data/translations.es.example.json"
IMAGE_DIR="$ROOT_DIR/assets/menu-images"

JSONBIN_KEY=${JSONBIN_KEY:-""}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME:-"896279918126553"}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY:-""}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET:-""}

create_jsonbin() {
  local file=$1
  if [[ -z "$JSONBIN_KEY" ]]; then
    echo "JSONBIN_KEY is not set. Skipping JSONBin upload for $file."
    return 1
  fi
  curl -sS -X POST \
    -H "Content-Type: application/json" \
    -H "X-Master-Key: $JSONBIN_KEY" \
    -d "@$file" \
    https://api.jsonbin.io/v3/b
}

upload_cloudinary() {
  local file=$1
  local public_id=$2
  if [[ -z "$CLOUDINARY_API_KEY" || -z "$CLOUDINARY_API_SECRET" ]]; then
    echo "Cloudinary API credentials missing. Skipping upload for $file."
    return 1
  fi
  local timestamp
  timestamp=$(date +%s)
  local signature
  signature=$(printf 'public_id=%s&timestamp=%s%s' "$public_id" "$timestamp" "$CLOUDINARY_API_SECRET" | sha1sum | awk '{print $1}')
  curl -sS -X POST "https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload" \
    -F "file=@${file}" \
    -F "public_id=${public_id}" \
    -F "timestamp=${timestamp}" \
    -F "api_key=${CLOUDINARY_API_KEY}" \
    -F "signature=${signature}"
}

printf "\n== JSONBin uploads ==\n"
create_jsonbin "$MENU_JSON" || true
create_jsonbin "$CATEGORIES_JSON" || true
create_jsonbin "$SPECIALS_JSON" || true
create_jsonbin "$TRANSLATIONS_EN_JSON" || true
create_jsonbin "$TRANSLATIONS_ES_JSON" || true

printf "\n== Cloudinary uploads ==\n"
for file in "$IMAGE_DIR"/*.svg; do
  base=$(basename "$file" .svg)
  upload_cloudinary "$file" "bavarotti/${base}" || true
  echo "Uploaded $file"
done
