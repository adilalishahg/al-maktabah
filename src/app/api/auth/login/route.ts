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

    // Set secure cookie as well for transparent browser API calls
    response.cookies.set('al_maktabah_admin_token', result.token, {
      httpOnly: false, // Accessible to client for header injection
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

