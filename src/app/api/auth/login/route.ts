import { NextResponse } from 'next/server';
import { validateCredentialsAndGenerateToken } from '@/lib/authGuard';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const result = validateCredentialsAndGenerateToken(email, password);

    if (!result.success || !result.token) {
      return NextResponse.json(
        { success: false, message: result.message || 'Invalid administrator credentials.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      token: result.token,
      message: 'Authentication successful.',
    });

    // Set hardened httpOnly cookie to prevent XSS-based token exfiltration
    response.cookies.set('al_maktabah_admin_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
