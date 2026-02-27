# Upload helper scripts

## upload_jsonbin_cloudinary.sh

Uploads the JSON example files to JSONBin and the placeholder menu images to Cloudinary.

### Required environment variables

```bash
JSONBIN_KEY=<jsonbin-master-key>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
```

The Cloudinary cloud name defaults to `896279918126553` but can be overridden with `CLOUDINARY_CLOUD_NAME`.


## package_assets.sh

Creates `assets/bavarotti-assets.tar.gz` locally with menu image SVGs + upload script.
