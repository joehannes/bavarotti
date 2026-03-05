const sha1Hex = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const extractPublicId = (assetUrl: string) => {
  try {
    const { pathname } = new URL(assetUrl);
    const uploadToken = '/upload/';
    const uploadIndex = pathname.indexOf(uploadToken);
    if (uploadIndex < 0) {
      return null;
    }

    let tail = pathname.slice(uploadIndex + uploadToken.length);
    tail = tail.replace(/^v\d+\//, '');
    tail = tail.replace(/\.[^/.]+$/, '');
    return decodeURIComponent(tail);
  } catch {
    return null;
  }
};

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
};

export const uploadImageToCloudinary = async (file: File, config: CloudinaryConfig) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = config.folder ?? 'bavarotti';
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${config.apiSecret}`;
  const signature = await sha1Hex(signatureBase);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', config.apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('folder', folder);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.status}`);
  }

  return (await response.json()) as { secure_url: string };
};

export const deleteImageFromCloudinary = async (assetUrl: string, config: CloudinaryConfig) => {
  const publicId = extractPublicId(assetUrl);
  if (!publicId) {
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`;
  const signature = await sha1Hex(signatureBase);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', config.apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary delete failed: ${response.status}`);
  }
};
