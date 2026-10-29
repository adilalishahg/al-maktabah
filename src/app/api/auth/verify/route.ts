import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/authGuard';

export async function GET(request: Request) {
  const check = verifyAdminRequest(request);
  if (check.authorized) {
    return NextResponse.json({ success: true, authenticated: true });
  }
  return NextResponse.json(
    { success: false, authenticated: false, message: check.message },
    { status: 401 }
  );
}

