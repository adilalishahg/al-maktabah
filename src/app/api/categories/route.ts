import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/models/CategoryModel';
import { INITIAL_CATEGORIES } from '@/data/categoryStore';
import { verifyAdminRequest } from '@/lib/authGuard';
import { CategoryInputSchema } from '@/lib/validationSchemas';

export async function GET() {
  try {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const count = await CategoryModel.countDocuments();
      if (count === 0) {
        // Auto-seed with default canonical Islamic categories
        await CategoryModel.insertMany(INITIAL_CATEGORIES);
      }
      const categories = await CategoryModel.find({}).lean();
      return NextResponse.json(categories, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
        },
      });
    }
  } catch (error) {
    console.error('MongoDB Categories GET Error:', error);
  }

  // Graceful fallback to initial categories
  return NextResponse.json(INITIAL_CATEGORIES, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
    },
  });
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
    const parseResult = CategoryInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid category schema payload.',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const validated = parseResult.data;
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const updated = await CategoryModel.findOneAndUpdate(
        { id: validated.id },
        validated,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return NextResponse.json({ success: true, category: updated, source: 'mongodb' });
    }

    return NextResponse.json({
      success: true,
      category: validated,
      source: 'local',
    });
  } catch (error: any) {
    console.error('MongoDB Category POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save category' },
      { status: 500 }
    );
  }
}
