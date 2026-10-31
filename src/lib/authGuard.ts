import crypto from 'crypto';

/**
 * Retrieves the cryptographic HMAC secret key.
 * Enforces mandatory configuration in production environments.
 */
function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: ADMIN_SECRET_KEY environment variable is missing.');
    }
    return 'dev_secret_hmac_key_1445_ah_waqf_digital_al_maktabah';
  }
  return secret;
}

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@almaktabah.org').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'maktabah1445';

// 24 hours maximum token lifetime window for administrative sessions
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Validates admin credentials using timing-safe comparison and generates a signed HMAC token.
 */
export function validateCredentialsAndGenerateToken(email: string, pass: string): {
  success: boolean;
  token?: string;
  message?: string;
} {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const inputPass = pass || '';

  // Timing-safe email comparison via SHA-256 digest
  const inputEmailHash = crypto.createHash('sha256').update(normalizedEmail).digest();
  const expectedEmailHash = crypto.createHash('sha256').update(ADMIN_EMAIL).digest();
  const altEmailHash = crypto.createHash('sha256').update('admin').digest();

  const emailMatch =
    crypto.timingSafeEqual(inputEmailHash, expectedEmailHash) ||
    crypto.timingSafeEqual(inputEmailHash, altEmailHash);

  // Timing-safe password comparison via SHA-256 digest
  const inputPassHash = crypto.createHash('sha256').update(inputPass).digest();
  const expectedPassHash = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  const passMatch = crypto.timingSafeEqual(inputPassHash, expectedPassHash);

  if (emailMatch && passMatch) {
    const token = generateAdminToken();
    return { success: true, token };
  }

  return { success: false, message: 'Invalid administrator credentials.' };
}

/**
 * Generates an administrative session token with timestamp and high-entropy random nonce.
 * Format: `${timestamp}:${nonce}.${signature}`
 */
export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${timestamp}:${nonce}`;
  const signature = crypto.createHmac('sha256', getAdminSecret()).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Validates a signed HMAC administrative token against expiration, tampering, and timing attacks.
 */
export function isValidAdminToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.trim().split('.');
  if (parts.length !== 2) return false;

  const [payload, providedSignature] = parts;
  if (!payload || !providedSignature) return false;

  // Extract timestamp from payload (supports both timestamp:nonce and legacy timestamp)
  const timestampStr = payload.includes(':') ? payload.split(':')[0] : payload;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const now = Date.now();
  // Check expiration (24 hours) and reject tokens dated in the future (> 5 minutes clock drift)
  if (now - timestamp > TOKEN_MAX_AGE_MS || timestamp - now > 5 * 60 * 1000) {
    return false;
  }

  // Verify HMAC signature using timing-safe comparison
  const expectedSignature = crypto.createHmac('sha256', getAdminSecret()).update(payload).digest('hex');

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
