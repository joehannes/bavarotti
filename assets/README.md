# Bavarotti Asset Bundle

This folder includes placeholder, beach-inspired SVG images generated for every menu item. These are intended as stand-ins until real food photography is available.

## Contents

- `menu-images/*.svg` — placeholder images for each menu entry (named by menu item id)

## Upload script

Use `scripts/upload_jsonbin_cloudinary.sh` to upload JSON and images. You will need to export the following environment variables first:

```bash
export JSONBIN_KEY="<your-jsonbin-master-key>"
export CLOUDINARY_API_KEY="<your-cloudinary-api-key>"
export CLOUDINARY_API_SECRET="<your-cloudinary-api-secret>"
```

The script posts JSON to JSONBin and uploads the SVGs to Cloudinary under the `bavarotti/` folder.

## Build the downloadable package

Run:

```bash
bash scripts/package_assets.sh
```

This creates `assets/bavarotti-assets.tar.gz` locally so GitHub PRs stay text-only.
