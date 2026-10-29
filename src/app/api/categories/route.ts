import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/models/CategoryModel';
import { INITIAL_CATEGORIES } from '@/data/categoryStore';
import { verifyAdminRequest } from '@/lib/authGuard';

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
    if (!body || !body.name || !body.id) {
      return NextResponse.json(
        { success: false, message: 'Category Name and ID/Slug are required.' },
        { status: 400 }
      );
    }

    // Input sanitization
    const sanitizedId = String(body.id).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const sanitizedName = String(body.name).trim();
    const sanitizedArabicName = body.arabicName ? String(body.arabicName).trim() : '';

    const isConnected = await connectToDatabase();
    if (isConnected) {
      const updated = await CategoryModel.findOneAndUpdate(
        { id: sanitizedId },
        {
          id: sanitizedId,
          name: sanitizedName,
          arabicName: sanitizedArabicName,
          icon: body.icon || 'category',
          description: body.description ? String(body.description).trim() : '',
          volumeCount: typeof body.volumeCount === 'number' ? body.volumeCount : 0,
          tags: Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).trim()) : [],
          subBranches: Array.isArray(body.subBranches) ? body.subBranches.map((s: any) => String(s).trim()) : [],
          foundationTreatises: Array.isArray(body.foundationTreatises) ? body.foundationTreatises : [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return NextResponse.json({ success: true, category: updated, source: 'mongodb' });
    }

    return NextResponse.json({
      success: true,
      category: { ...body, id: sanitizedId, name: sanitizedName, arabicName: sanitizedArabicName },
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
