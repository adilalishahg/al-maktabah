import crypto from 'crypto';

// Secret key for HMAC signing of administrative tokens
const ADMIN_SECRET =
  process.env.ADMIN_SECRET_KEY || 'al_maktabah_secret_hmac_key_1445_ah_waqf_digital';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@almaktabah.org').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'maktabah1445';

// 7 days token validity window
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Validates admin credentials and generates a signed HMAC token.
 */
export function validateCredentialsAndGenerateToken(email: string, pass: string): {
  success: boolean;
  token?: string;
  message?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();
  if (
    (normalizedEmail === ADMIN_EMAIL || normalizedEmail === 'admin') &&
    pass === ADMIN_PASSWORD
  ) {
    const timestamp = Date.now().toString();
    const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(timestamp).digest('hex');
    const token = `${timestamp}.${signature}`;
    return { success: true, token };
  }
  return { success: false, message: 'Invalid administrator credentials.' };
}

/**
 * Generates an administrative session token.
 */
export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(timestamp).digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Validates a signed HMAC administrative token.
 */
export function isValidAdminToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.trim().split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (7 days)
  if (Date.now() - timestamp > TOKEN_MAX_AGE_MS) {
    return false;
  }

  // Verify HMAC signature using timing-safe comparison to prevent timing attacks
  const expectedSignature = crypto.createHmac('sha256', ADMIN_SECRET).update(timestampStr).digest('hex');

  try {
    const provBuffer = Buffer.from(providedSignature, 'hex');
    const expBuffer = Buffer.from(expectedSignature, 'hex');
    if (provBuffer.length !== expBuffer.length) return false;
    return crypto.timingSafeEqual(provBuffer, expBuffer);
  } catch {
    return false;
  }
}

/**
 * Verifies if an incoming Next.js API Request is authorized by an administrator.
 * Inspects:
 * 1. Authorization: Bearer <token>
 * 2. x-admin-token: <token>
 * 3. Cookie: al_maktabah_admin_token=<token>
 */
export function verifyAdminRequest(request: Request): { authorized: boolean; message?: string } {
  // 1. Authorization header: Bearer <token>
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim();
    if (isValidAdminToken(token)) {
      return { authorized: true };
    }
  }

  // 2. Custom header: x-admin-token
  const customHeader = request.headers.get('x-admin-token');
  if (customHeader && isValidAdminToken(customHeader)) {
    return { authorized: true };
  }

  // 3. Cookie header inspection
  const cookieHeader = request.headers.get('cookie') || '';
  if (cookieHeader.includes('al_maktabah_admin_token=')) {
    const match = cookieHeader.match(/al_maktabah_admin_token=([^;]+)/);
    if (match && match[1] && isValidAdminToken(decodeURIComponent(match[1]))) {
      return { authorized: true };
    }
  }

  return {
    authorized: false,
    message: 'Unauthorized. Valid administrator authentication token required.',
  };
}

