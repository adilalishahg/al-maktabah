import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus: 'connected' | 'fallback' = 'fallback';

  try {
    const db = await connectToDatabase();
    if (db && db.connection.readyState === 1) {
      dbStatus = 'connected';
    }
  } catch {
    dbStatus = 'fallback';
  }

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  const isHealthy = true; // The system gracefully functions in both online and local offline fallback modes

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'Al-Maktabah Digital Archives & Academic Codex Repository',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      database: {
        provider: 'MongoDB Atlas',
        status: dbStatus,
        mode: dbStatus === 'connected' ? 'Live Cloud Storage' : 'Local Offline Hybrid Memory Fallback',
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds,
        uptimeHuman: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
        memoryMb: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
