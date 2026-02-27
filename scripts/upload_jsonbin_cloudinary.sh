#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
MENU_JSON="$ROOT_DIR/src/data/menu.example.json"
CATEGORIES_JSON="$ROOT_DIR/src/data/categories.example.json"
SPECIALS_JSON="$ROOT_DIR/src/data/specials.example.json"
TRANSLATIONS_EN_JSON="$ROOT_DIR/src/data/translations.en.example.json"
TRANSLATIONS_ES_JSON="$ROOT_DIR/src/data/translations.es.example.json"
IMAGE_DIR="$ROOT_DIR/assets/menu-images"

JSONBIN_KEY=${JSONBIN_KEY:-'$2a$10$b9XVv6TdZxzoc6670euh1.kNzyBb11RrtyFdl4e27b2cxzFPwK/mu'}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME:-"896279918126553"}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY:-""}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET:-""}

create_jsonbin() {
  local file=$1
  local out=$2
  curl -sS -X POST \
    -H "Content-Type: application/json" \
    -H "X-Master-Key: $JSONBIN_KEY" \
    -d "@$file" \
    https://api.jsonbin.io/v3/b > "$out"
}

read_bin_id() {
  local file=$1
  python - "$file" <<'PY'
import json,sys
with open(sys.argv[1]) as f:
    d=json.load(f)
print((d.get('metadata') or {}).get('id',''))
PY
}

write_env_example() {
  local menu_id=$1
  local categories_id=$2
  local specials_id=$3
  local en_id=$4
  local es_id=$5

  cat > "$ROOT_DIR/.env.example" <<ENV
VITE_RESTAURANT_NAME="Bavarotti"
VITE_WHATSAPP_NUMBER="15551234567"
VITE_ADMIN_OTP="123456"
VITE_JSONBIN_API_KEY="$JSONBIN_KEY"
VITE_JSONBIN_MENU_URL="https://api.jsonbin.io/v3/b/${menu_id}"
VITE_JSONBIN_CATEGORIES_URL="https://api.jsonbin.io/v3/b/${categories_id}"
VITE_JSONBIN_SPECIALS_URL="https://api.jsonbin.io/v3/b/${specials_id}"
VITE_JSONBIN_TRANSLATIONS_EN_URL="https://api.jsonbin.io/v3/b/${en_id}"
VITE_JSONBIN_TRANSLATIONS_ES_URL="https://api.jsonbin.io/v3/b/${es_id}"
ENV
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
    -F "signature=${signature}" >/dev/null
}

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

echo "== JSONBin uploads =="
set +e
create_jsonbin "$MENU_JSON" "$tmpdir/menu.json"
menu_status=$?
create_jsonbin "$CATEGORIES_JSON" "$tmpdir/categories.json"
categories_status=$?
create_jsonbin "$SPECIALS_JSON" "$tmpdir/specials.json"
specials_status=$?
create_jsonbin "$TRANSLATIONS_EN_JSON" "$tmpdir/en.json"
en_status=$?
create_jsonbin "$TRANSLATIONS_ES_JSON" "$tmpdir/es.json"
es_status=$?
set -e

if [[ $menu_status -ne 0 || $categories_status -ne 0 || $specials_status -ne 0 || $en_status -ne 0 || $es_status -ne 0 ]]; then
  echo "JSONBin upload failed. Check network/proxy and API key."
  exit 1
fi

MENU_ID=$(read_bin_id "$tmpdir/menu.json")
CATEGORIES_ID=$(read_bin_id "$tmpdir/categories.json")
SPECIALS_ID=$(read_bin_id "$tmpdir/specials.json")
EN_ID=$(read_bin_id "$tmpdir/en.json")
ES_ID=$(read_bin_id "$tmpdir/es.json")

if [[ -z "$MENU_ID" || -z "$CATEGORIES_ID" || -z "$SPECIALS_ID" || -z "$EN_ID" || -z "$ES_ID" ]]; then
  echo "JSONBin returned empty IDs."
  exit 1
fi

write_env_example "$MENU_ID" "$CATEGORIES_ID" "$SPECIALS_ID" "$EN_ID" "$ES_ID"

echo "Uploaded BIN IDs:"
echo "MENU=$MENU_ID"
echo "CATEGORIES=$CATEGORIES_ID"
echo "SPECIALS=$SPECIALS_ID"
echo "TRANSLATIONS_EN=$EN_ID"
echo "TRANSLATIONS_ES=$ES_ID"

echo "Updated .env.example with uploaded BIN IDs."

echo "== Cloudinary uploads (optional) =="
for file in "$IMAGE_DIR"/*.svg; do
  base=$(basename "$file" .svg)
  upload_cloudinary "$file" "bavarotti/${base}" || true
done
