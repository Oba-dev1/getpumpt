import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export type MediaType = 'hero' | 'gallery' | 'about' | 'logo' | 'favicon';

export async function uploadGymMedia(
  file: File,
  gymSlug: string,
  mediaType: MediaType
): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const timestamp = Date.now();
  const key = `gyms/${gymSlug}/${mediaType}/${timestamp}.${fileExtension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function deleteGymMedia(url: string): Promise<void> {
  if (!url || !process.env.R2_PUBLIC_URL) {
    throw new Error('Invalid URL or R2_PUBLIC_URL not configured');
  }

  const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');

  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });

  await s3Client.send(command);
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.',
    };
  }

  return { valid: true };
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['video/mp4', 'video/webm'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only MP4 and WebM are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 50MB limit.',
    };
  }

  return { valid: true };
}
