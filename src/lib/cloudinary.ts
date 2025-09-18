import { v2 as cloudinary } from 'cloudinary';

// Ensure env vars exist at runtime
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('Cloudinary env vars missing: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function uploadInvoicePdf(buffer: Buffer, publicId: string): Promise<string> {
  // Upload from buffer using upload_stream
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: 'invoices',
        public_id: publicId,
        resource_type: 'raw', // for non-image files like PDFs
        format: 'pdf',
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    upload.end(buffer);
  });
}


