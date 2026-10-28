import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    platform: 'Next.js App Router (Vercel Serverless Compatible)',
    service: 'Al-Maktabah Digital Archives Backend API',
    timestamp: new Date().toISOString(),
  });
}
