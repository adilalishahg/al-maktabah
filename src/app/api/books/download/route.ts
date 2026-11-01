import { NextResponse } from 'next/server';
import { getDownloadablePdfUrl, isCloudinaryUrl } from '@/lib/cloudinary';

/**
 * Server-Side PDF Download Proxy Route
 * 
 * Ensures 100% reliable document downloads across mobile browsers without exposing
 * CDN ACL quirks, browser ERR_INVALID_RESPONSE errors, or CORS issues.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    const title = searchParams.get('title') || 'Manuscript';

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing target URL parameter (?url=...).' },
        { status: 400 }
      );
    }

    // SSRF & Protocol Security Defense
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format provided.' },
        { status: 400 }
      );
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { success: false, message: 'Protocol forbidden. Only HTTP/HTTPS is allowed.' },
        { status: 403 }
      );
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const ALLOWED_CDN_DOMAINS = [
      'res.cloudinary.com',
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'archive.org',
    ];

    const isDomainAllowed =
      ALLOWED_CDN_DOMAINS.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      ) ||
      (process.env.NEXT_PUBLIC_SITE_URL &&
        hostname === new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname);

    if (!isDomainAllowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Host "${hostname}" is not an authorized CDN domain for manuscript downloads.`,
        },
        { status: 403 }
      );
    }

    // Sanitize title for RFC 6266 Content-Disposition header
    const cleanTitle = title
      .replace(/[/\\?%*:|"<>]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || 'Manuscript';

    const safeAsciiTitle = cleanTitle.replace(/[^\x20-\x7E]/g, '') || 'Treatise';
    const utf8Filename = `Al-Maktabah-${encodeURIComponent(cleanTitle)}.pdf`;
    const asciiFilename = `Al-Maktabah-${safeAsciiTitle}.pdf`;

    // Candidate URL resolution sequence
    // 1. Normalized URL with Cloudinary fl_attachment flag
    // 2. Raw URL if originally under image/upload/
    // 3. Fallback to original URL
    const candidateUrls: string[] = [];

    if (isCloudinaryUrl(targetUrl)) {
      candidateUrls.push(getDownloadablePdfUrl(targetUrl, cleanTitle));
      if (targetUrl.includes('/image/upload/')) {
        candidateUrls.push(targetUrl.replace('/image/upload/', '/raw/upload/'));
      }
    }
    candidateUrls.push(targetUrl);

    // Remove duplicates
    const uniqueCandidates = Array.from(new Set(candidateUrls));

    let upstreamResponse: Response | null = null;
    let upstreamError = '';

    for (const candidate of uniqueCandidates) {
      try {
        const res = await fetch(candidate, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/pdf,application/octet-stream,*/*',
          },
          redirect: 'follow',
        });

        if (res.ok) {
          upstreamResponse = res;
          break;
        } else {
          const cldError = res.headers.get('x-cld-error') || '';
          upstreamError = `CDN HTTP ${res.status}${cldError ? ` (${cldError})` : ''}`;
        }
      } catch (fetchErr: any) {
        upstreamError = fetchErr.message || 'Upstream network fetch error';
      }
    }

    if (!upstreamResponse || !upstreamResponse.ok || !upstreamResponse.body) {
      const isCloudinaryAclError =
        upstreamError.includes('deny or ACL failure') || upstreamError.includes('401');

      return NextResponse.json(
        {
          success: false,
          error: 'UPSTREAM_FETCH_FAILED',
          message: isCloudinaryAclError
            ? 'Cloudinary security policy restricts direct PDF delivery under image/upload. To enable in Cloudinary: Open Management Console > Settings > Security > Check "Allow delivery of PDF and ZIP files".'
            : `Unable to download manuscript from CDN: ${upstreamError}`,
          targetUrl,
        },
        { status: 502 }
      );
    }

    // Stream the binary PDF chunk-by-chunk to the client
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set(
      'Content-Disposition',
      `attachment; filename="${asciiFilename}"; filename*=UTF-8''${utf8Filename}`
    );
    headers.set(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=43200'
    );

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Download Proxy Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal download proxy error.' },
      { status: 500 }
    );
  }
}
