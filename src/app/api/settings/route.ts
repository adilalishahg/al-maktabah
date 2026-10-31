import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SettingsModel } from '@/models/SettingsModel';
import { DEFAULT_HOME_SETTINGS } from '@/data/homeSettingsStore';
import { verifyAdminRequest } from '@/lib/authGuard';
import { HomeSettingsInputSchema } from '@/lib/validationSchemas';

// In-memory fallback if MongoDB is not connected
let memorySettings = { ...DEFAULT_HOME_SETTINGS };

export async function GET() {
  try {
    const db = await connectToDatabase();

    if (db) {
      const doc = await SettingsModel.findOne({ key: 'home_settings' }).lean();
      if (doc && doc.data) {
        return NextResponse.json(
          {
            success: true,
            source: 'MongoDB Atlas',
            data: doc.data,
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
            },
          }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        source: db ? 'MongoDB Initializing' : 'Server Memory / Fallback',
        data: memorySettings,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('API /api/settings GET Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error', data: memorySettings },
      { status: 200 } // Graceful fallback
    );
  }
}

export async function POST(request: Request) {
  try {
    // Security Gate: Enforce verified administrator authorization
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = HomeSettingsInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid homepage settings schema payload.',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const payload = {
      ...memorySettings,
      ...parseResult.data,
      sections: {
        ...memorySettings.sections,
        ...parseResult.data.sections,
      },
      updatedAt: new Date().toISOString(),
    } as typeof memorySettings;

    memorySettings = payload;

    const db = await connectToDatabase();

    if (db) {
      await SettingsModel.findOneAndUpdate(
        { key: 'home_settings' },
        {
          key: 'home_settings',
          data: payload,
          updatedAt: payload.updatedAt,
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        source: 'MongoDB Atlas',
        data: payload,
        message: 'Settings successfully saved to database.',
      });
    }

    return NextResponse.json({
      success: true,
      source: 'Server Memory',
      data: payload,
      message: 'Settings saved locally in session.',
    });
  } catch (error: any) {
    console.error('API /api/settings POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

