# Bavarotti Micro-Website

A frontend-only, WhatsApp-first menu and ordering experience for an Italian + Dominican seafood + Mexican concept. Content is fully driven by JSONBin and Cloudinary.

## Stack

- React 18 + Vite + TypeScript
- Cloudflare Pages compatible
- No backend, no auth, no payments

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your JSONBin + WhatsApp values.

| Variable | Purpose |
| --- | --- |
| `VITE_RESTAURANT_NAME` | Restaurant name in WhatsApp messages |
| `VITE_WHATSAPP_NUMBER` | Phone number in international format |
| `VITE_ADMIN_OTP` | Hardcoded OTP for admin console |
| `VITE_JSONBIN_API_KEY` | JSONBin master key for updates |
| `VITE_JSONBIN_*_URL` | JSONBin bin URLs for menu, categories, specials, translations |

## Content Sources

### JSON Schemas

- `src/schemas/menu.schema.json`
- `src/schemas/categories.schema.json`
- `src/schemas/specials.schema.json`
- `src/schemas/translations.schema.json`

### Example JSON

- `src/data/menu.example.json`
- `src/data/categories.example.json`
- `src/data/specials.example.json`
- `src/data/translations.en.example.json`
- `src/data/translations.es.example.json`

Optional local demo data is mirrored in `public/data` for quick previews without JSONBin.

### JSONBin Usage

1. Create bins for each JSON dataset.
2. Paste the example JSON as a starting point.
3. Use the bin URL in the corresponding `VITE_JSONBIN_*_URL` variable.
4. The Admin console (footer link) lets you paste updated JSON and save directly to JSONBin with your master key.

## WhatsApp Ordering Flow

1. Guests add items to the local cart.
2. The “Order via WhatsApp” button opens `https://wa.me/` with a prefilled message containing the restaurant name, selected items, and current language.
3. No checkout or online payment is required.

## Cloudinary Images

Menu, specials, and hero images use public Cloudinary URLs. To add more images, upload to Cloudinary and paste the public URL into your JSON data.

## Asset Bundle (Placeholder Images + Upload Script)

Run `scripts/upload_jsonbin_cloudinary.sh` to upload JSON and placeholder menu images. It expects JSONBin and Cloudinary credentials (see `assets/README.md`).

Build it locally with `bash scripts/package_assets.sh` (kept out of git to avoid binary-file PR issues).

## Deploy to Cloudflare Pages

1. Push the repo to GitHub.
2. Create a Cloudflare Pages project.
3. Set build command to `npm run build`.
4. Set build output directory to `dist`.
5. Add the same environment variables from `.env.example` in Cloudflare Pages.
6. Deploy.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview production build
