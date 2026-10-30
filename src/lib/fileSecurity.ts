/**
 * File Security & Magic Byte Inspector for Al-Maktabah
 * Validates codices, manuscripts, and asset uploads against spoofing and malicious payloads.
 */

import type { FileValidationResult } from '@/types/utils';

export type { FileValidationResult };

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50 Megabytes

const ALLOWED_EXTENSIONS = new Set(['pdf', 'epub', 'jpg', 'jpeg', 'png', 'webp']);

/**
 * Validates a file's size, extension, and binary magic bytes.
 */
export function validateUploadFile(file: File, buffer: Buffer): FileValidationResult {
  // 1. Size constraint check
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds the 50MB maximum permitted limit (${sizeInMb} MB uploaded).`,
    };
  }

  // 2. Extension validation
  const fileName = file.name || '';
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return {
      valid: false,
      error: 'File extension is required to establish codex mime-type.',
    };
  }

  const extension = fileName.substring(lastDot + 1).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      valid: false,
      error: `Invalid file format ".${extension}". Only canonical documents (.pdf, .epub) and manuscript imagery (.jpg, .jpeg, .png, .webp) are accepted.`,
    };
  }

  // 3. Binary Magic Byte Inspection
  if (buffer.length < 4) {
    return {
      valid: false,
      error: 'File corrupted: byte sequence too short.',
    };
  }

  // PDF Magic Bytes: %PDF- (0x25, 0x50, 0x44, 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    if (extension !== 'pdf') {
      return {
        valid: false,
        error: `Extension spoofing detected: file content is a PDF, but named with .${extension}`,
      };
    }
    return { valid: true, mimeType: 'application/pdf', detectedType: 'pdf' };
  }

  // JPEG Magic Bytes: 0xFF, 0xD8, 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    if (extension !== 'jpg' && extension !== 'jpeg') {
      return {
        valid: false,
        error: `Extension spoofing detected: file content is a JPEG, but named with .${extension}`,
      };
    }
    return { valid: true, mimeType: 'image/jpeg', detectedType: 'jpeg' };
  }

  // PNG Magic Bytes: 0x89, 0x50, 0x4E, 0x47 (89 'P' 'N' 'G')
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    if (extension !== 'png') {
      return {
        valid: false,
        error: `Extension spoofing detected: file content is a PNG, but named with .${extension}`,
      };
    }
    return { valid: true, mimeType: 'image/png', detectedType: 'png' };
  }

  // WebP Magic Bytes: RIFF....WEBP
  if (
    buffer[0] === 0x52 && // 'R'
    buffer[1] === 0x49 && // 'I'
    buffer[2] === 0x46 && // 'F'
    buffer[3] === 0x46 && // 'F'
    buffer.length >= 12 &&
    buffer[8] === 0x57 && // 'W'
    buffer[9] === 0x45 && // 'E'
    buffer[10] === 0x42 && // 'B'
    buffer[11] === 0x50 // 'P'
  ) {
    if (extension !== 'webp') {
      return {
        valid: false,
        error: `Extension spoofing detected: file content is a WebP image, but named with .${extension}`,
      };
    }
    return { valid: true, mimeType: 'image/webp', detectedType: 'webp' };
  }

  // EPUB / ZIP Magic Bytes: PK.. (0x50, 0x4B, 0x03, 0x04 or 0x50, 0x4B, 0x05, 0x06)
  if (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06)
  ) {
    if (extension !== 'epub') {
      return {
        valid: false,
        error: `Extension mismatch: archive byte signature detected with non-epub extension .${extension}`,
      };
    }
    return { valid: true, mimeType: 'application/epub+zip', detectedType: 'epub' };
  }

  return {
    valid: false,
    error: 'Unrecognized or unverified binary signature. Upload rejected for security reasons.',
  };
}

