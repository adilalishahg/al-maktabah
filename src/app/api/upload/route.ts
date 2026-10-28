import { NextResponse } from 'next/server';

// Get upload signature parameters for direct browser-to-Cloudinary upload
// This completely bypasses Vercel's 4.5 MB serverless function payload limit!
export async function GET(request: Request) {
  try {
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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'al-maktabah/books';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if Cloudinary credentials exist
    if (cloudName && apiKey && apiSecret) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64Data}`;

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
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const localDataUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: localDataUrl,
      fileName: file.name,
      size: file.size,
      provider: 'Direct In-Memory CDN (Add CLOUDINARY_CLOUD_NAME to .env for Production CDN)',
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
