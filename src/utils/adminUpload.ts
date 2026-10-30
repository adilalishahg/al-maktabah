export async function uploadAsset(
  file: File,
  folder: string,
  getAuthHeaders: (extra?: Record<string, string>) => Record<string, string>
): Promise<{ url: string; provider: string }> {
  // 1. Try direct upload to Cloudinary (bypassing Vercel 4.5MB server payload limit)
  try {
    const paramRes = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
      headers: getAuthHeaders(),
    });
    if (paramRes.ok) {
      const config = await paramRes.json();
      if (config.configured && config.cloudName && config.apiKey && config.signature) {
        const directForm = new FormData();
        directForm.append('file', file);
        directForm.append('api_key', config.apiKey);
        directForm.append('timestamp', config.timestamp.toString());
        directForm.append('signature', config.signature);
        directForm.append('folder', config.folder);

        const cdnRes = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`, {
          method: 'POST',
          body: directForm,
        });

        if (!cdnRes.ok) {
          const errData = await cdnRes.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Cloudinary rejected upload (${cdnRes.status})`);
        }

        const cdnData = await cdnRes.json();
        if (cdnData.secure_url) {
          return {
            url: cdnData.secure_url,
            provider: 'Cloudinary CDN (Direct Edge Upload)',
          };
        }
      }
    }
  } catch (directErr: any) {
    console.warn('Direct upload notice:', directErr);
    if (directErr.message && !directErr.message.includes('fetch')) {
      throw directErr;
    }
  }

  // 2. If Cloudinary is not configured in Vercel, check Vercel payload limit (4.5 MB)
  const MAX_VERCEL_BYTES = 4.2 * 1024 * 1024;
  if (file.size > MAX_VERCEL_BYTES) {
    throw new Error(
      `PAYLOAD_TOO_LARGE: This file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.\n\n` +
        `Vercel serverless functions enforce a 4.5 MB request limit for server uploads.\n\n` +
        `To solve this:\n` +
        `1. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your Vercel Project Settings > Environment Variables for direct high-speed uploads up to 100MB+.\n\n` +
        `2. OR: Paste a direct URL to the PDF (from Google Drive, Archive.org, Dropbox, or any CDN) directly in the PDF field.`
    );
  }

  // 3. Fallback to /api/upload for small files (< 4.2 MB)
  const uploadForm = new FormData();
  uploadForm.append('file', file);
  uploadForm.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: uploadForm,
  });

  if (res.status === 413) {
    throw new Error(
      `Vercel payload limit (413): File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Add Cloudinary credentials to Vercel for unlimited direct uploads, or paste a direct PDF URL.`
    );
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    const text = await res.text();
    throw new Error(`Upload server error (${res.status}): ${text.slice(0, 150)}`);
  }

  if (data.success && data.url) {
    return {
      url: data.url,
      provider: data.provider || 'In-Memory Fallback',
    };
  }

  throw new Error(data.message || 'Upload failed');
}
