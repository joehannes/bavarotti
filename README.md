# Bavarotti Micro-Website

A frontend-only, WhatsApp-first menu and ordering experience for an Italian + Dominican seafood + Mexican concept. Content is driven by JSONBin and image hosting on Cloudinary.

## Stack

- React 18 + Vite + TypeScript
- Cloudflare Pages compatible
- No backend, no online payments

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values.

| Variable | Purpose |
| --- | --- |
| `VITE_RESTAURANT_NAME` | Restaurant/brand label in navbar and WhatsApp text |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number in international format |
| `WHITE_ADMIN_OTP` / `white_admin_otp` | One-time password to unlock admin panel |
| `WHITE_JSONBIN_KEY` / `white_jsonbin_key` | JSONBin X-Master-Key for CRUD updates |
| `VITE_JSONBIN_*_URL` | JSONBin resource URLs for menu/categories/specials/translations |
| `WHITE_CLOUDINARY_API_TOKEN` / `white_cloudinary_api_token` | Cloudinary API token/key |
| `WHITE_CLOUDINARY_API_SECRET` / `white_cloudinary_api_secret` | Cloudinary API secret |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_FOLDER` | Optional Cloudinary upload folder (default `bavarotti`) |

> Backward compatibility: the app still accepts `VITE_ADMIN_OTP`, `VITE_JSONBIN_API_KEY`, and `VITE_CLOUDINARY_API_KEY` as fallbacks.

## Required Public Assets

Place these files in `/public`:

- `babawati_icon.jpeg` (navbar logo)
- `hero_desktop.jpg` (desktop hero background)
- `hero_mobile.jpg` (mobile hero background)

The app renders even if images are missing, but visual polish depends on these files.

## Admin Panel Features

Use the **Admin** button in footer:

1. Enter OTP (`WHITE_ADMIN_OTP` / `white_admin_otp`).
2. **Mobile-friendly Menu CRUD section**:
   - Edit many entries in one page (name keys, descriptions, prices, availability, image keys/URLs)
   - Create and delete menu entries
   - Upload image to Cloudinary directly per item
   - Delete currently assigned Cloudinary image
   - Save all menu entries back to JSONBin in one action
3. **Raw JSON editor**:
   - Update categories, specials, translations, or any JSONBin resource directly

### Security note

This is a frontend-only app. Cloudinary secret in browser code is convenient for owner-operated tools, but not secure for public untrusted admin access. For production-hard security, proxy uploads/signatures through a backend.

## UX/UI Enhancements Included

- Fixed, translucent top menu bar (logo + brand + order shortcut + language switch)
- Responsive hero background image (mobile/desktop)
- Lightweight parallax effect driven by scroll CSS var
- Refined spacing/typography/card styling
- Improved button visuals and states
- Cart now shows line totals and order total before WhatsApp checkout

## WhatsApp Ordering Flow

1. Guests add items to local cart.
2. Cart shows each line total and full total.
3. “Order via WhatsApp” opens `https://wa.me/` with a prefilled message (items + total + language).

## Deploy to Cloudflare Pages

1. Push repo to GitHub.
2. Create a Cloudflare Pages project.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add the same environment variables in Cloudflare Pages settings.
6. Deploy.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview production build
