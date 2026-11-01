/**
 * Al-Maktabah (المكتبة) — Cloudinary URL Normalization & Download Utilities
 * Preserves high-speed edge delivery while mitigating Cloudinary ACL delivery restrictions.
 */

/**
 * Validates whether a given URL is hosted on Cloudinary's media network.
 */
export function isCloudinaryUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com');
}

/**
 * Parses Cloudinary URL components: cloudName, resourceType, version, publicId, and extension.
 */
export function parseCloudinaryUrl(url: string): {
  cloudName: string;
  resourceType: 'image' | 'raw' | 'video' | 'auto';
  version?: string;
  publicId: string;
  extension?: string;
} | null {
  if (!isCloudinaryUrl(url)) return null;

  try {
    // Format: https://res.cloudinary.com/<cloudName>/<resourceType>/<deliveryType>/[transformations]/[v<version>/]<publicId>
    const match = url.match(
      /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|raw|video|auto)\/upload\/(?:(?:[a-zA-Z0-9_,:-]+)\/)?(?:v(\d+)\/)?(.+?)(?:\.([a-zA-Z0-9]+))?$/
    );

    if (!match) return null;

    return {
      cloudName: match[1],
      resourceType: match[2] as 'image' | 'raw' | 'video' | 'auto',
      version: match[3],
      publicId: match[4] + (match[5] && match[2] === 'raw' ? `.${match[5]}` : ''),
      extension: match[5],
    };
  } catch {
    return null;
  }
}

/**
 * Generates an optimal direct downloadable URL for Cloudinary assets.
 * 
 * 1. For PDFs served via /image/upload/, injects the `fl_attachment` flag or converts to /raw/upload/.
 * 2. Injects a sanitized filename into the Content-Disposition header.
 */
export function getDownloadablePdfUrl(url: string, filename?: string): string {
  if (!url || typeof url !== 'string') return '';
  if (!isCloudinaryUrl(url)) return url;

  const safeFilename = filename
    ? filename.replace(/[\/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').trim()
    : '';

  const attachmentFlag = safeFilename
    ? `fl_attachment:${encodeURIComponent(safeFilename)}`
    : 'fl_attachment';

  // If already tagged with fl_attachment, return as is
  if (url.includes('fl_attachment')) {
    return url;
  }

  // Inject fl_attachment immediately after /upload/
  if (url.includes('/image/upload/')) {
    return url.replace('/image/upload/', `/image/upload/${attachmentFlag}/`);
  }

  if (url.includes('/raw/upload/')) {
    return url.replace('/raw/upload/', `/raw/upload/${attachmentFlag}/`);
  }

  return url;
}

/**
 * Converts an image-based Cloudinary PDF URL to raw resource format.
 * Useful when switching asset handling to raw documents.
 */
export function convertCloudinaryToRaw(url: string): string {
  if (!isCloudinaryUrl(url)) return url;
  if (!url.includes('/image/upload/')) return url;

  // Convert /image/upload/ -> /raw/upload/
  return url.replace('/image/upload/', '/raw/upload/');
}

/**
 * Normalizes any stored manuscript PDF URL.
 * Ensures consistent protocol (HTTPS) and clean format.
 */
export function normalizeCloudinaryPdfUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim();

  // Upgrade insecure http to https
  if (cleaned.startsWith('http://res.cloudinary.com/')) {
    cleaned = cleaned.replace('http://', 'https://');
  }

  return cleaned;
}
