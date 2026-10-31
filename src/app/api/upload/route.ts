import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/authGuard';
import { validateUploadFile } from '@/lib/fileSecurity';

// Get upload signature parameters for direct browser-to-Cloudinary upload
// Protected: Only authenticated administrators can generate upload signatures
export async function GET(request: Request) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { configured: false, message: auth.message || 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'al-maktabah/books';

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const crypto = await import('crypto');
      const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      return NextResponse.json({
        configured: true,
        cloudName,
        apiKey,
        timestamp,
        signature,
        folder,
      });
    }

    return NextResponse.json({
      configured: false,
      message: 'Cloudinary credentials are not set in environment variables.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { configured: false, message: error.message || 'Signature generation error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Security Gate: Admin authentication required
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'al-maktabah/books';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Deep binary verification: Magic byte inspection & size constraint checks
    const validation = validateUploadFile(file, buffer);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Invalid or untrusted file upload.' },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if Cloudinary credentials exist for high-speed edge delivery
    if (cloudName && apiKey && apiSecret) {
      const base64Data = buffer.toString('base64');
      const mime = validation.mimeType || file.type || 'application/octet-stream';
      const dataUri = `data:${mime};base64,${base64Data}`;

      // Upload directly to Cloudinary REST endpoint
      const timestamp = Math.round(new Date().getTime() / 1000);
      const crypto = await import('crypto');
      const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      const cloudinaryForm = new URLSearchParams();
      cloudinaryForm.append('file', dataUri);
      cloudinaryForm.append('api_key', apiKey);
      cloudinaryForm.append('timestamp', timestamp.toString());
      cloudinaryForm.append('signature', signature);
      cloudinaryForm.append('folder', folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: cloudinaryForm,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
      }

      return NextResponse.json({
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        bytes: data.bytes,
        format: data.format,
        provider: 'Cloudinary CDN (Fast Edge Delivery)',
      });
    }

    // High performance local fallback if Cloudinary env is not set yet
    // Defend against memory exhaustion and Vercel/serverless 4.5MB payload limitations
    const MAX_LOCAL_FALLBACK_BYTES = 2.5 * 1024 * 1024; // 2.5 MB maximum for in-memory Data URLs
    if (file.size > MAX_LOCAL_FALLBACK_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message:
            `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the local in-memory fallback limit (2.5 MB). ` +
            `Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env for high-speed uploads up to 50MB, or paste a direct CDN URL.`,
        },
        { status: 413 }
      );
    }

    const base64 = buffer.toString('base64');
    const localDataUrl = `data:${validation.mimeType || file.type || 'application/octet-stream'};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: localDataUrl,
      fileName: file.name,
      size: file.size,
      mimeType: validation.mimeType,
      provider: 'Direct In-Memory Fallback (Add CLOUDINARY_CLOUD_NAME to .env for Production CDN)',
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
