// Firebase Storage helpers for ZetaLab
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
let storage: admin.storage.Storage | null = null;

function getStorage(): admin.storage.Storage {
  if (!storage) {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'zetalab-product-builder.appspot.com'
      });
    }
    storage = admin.storage();
  }
  return storage;
}

/**
 * Upload data to Firebase Storage
 * @param relKey - Relative path/key in storage (e.g., "users/123/avatar.png")
 * @param data - Buffer, Uint8Array, or string to upload
 * @param contentType - MIME type of the content
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const bucket = getStorage().bucket();
  const key = normalizeKey(relKey);
  const file = bucket.file(key);

  // Convert data to Buffer if needed
  const buffer = typeof data === 'string'
    ? Buffer.from(data, 'utf-8')
    : Buffer.from(data);

  // Upload file
  await file.save(buffer, {
    contentType,
    metadata: {
      contentType,
    },
  });

  // Make file publicly accessible (optional - adjust based on your security needs)
  await file.makePublic();

  // Get public URL
  const url = `https://storage.googleapis.com/${bucket.name}/${key}`;

  return { key, url };
}

/**
 * Get a signed URL for a file in Firebase Storage
 * @param relKey - Relative path/key in storage
 * @returns Object with key and signed URL (valid for 1 hour)
 */
export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const bucket = getStorage().bucket();
  const key = normalizeKey(relKey);
  const file = bucket.file(key);

  // Check if file exists
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`File not found: ${key}`);
  }

  // Generate signed URL (valid for 1 hour)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });

  return { key, url };
}

/**
 * Delete a file from Firebase Storage
 * @param relKey - Relative path/key in storage
 */
export async function storageDelete(relKey: string): Promise<void> {
  const bucket = getStorage().bucket();
  const key = normalizeKey(relKey);
  const file = bucket.file(key);

  await file.delete();
}

/**
 * List files in a directory
 * @param prefix - Directory prefix (e.g., "users/123/")
 * @returns Array of file keys
 */
export async function storageList(prefix: string): Promise<string[]> {
  const bucket = getStorage().bucket();
  const normalizedPrefix = normalizeKey(prefix);

  const [files] = await bucket.getFiles({ prefix: normalizedPrefix });

  return files.map(file => file.name);
}

/**
 * Normalize storage key by removing leading slashes
 */
function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}
