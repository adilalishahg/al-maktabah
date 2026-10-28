import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/models/CategoryModel';
import { INITIAL_CATEGORIES } from '@/data/categoryStore';

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
      return NextResponse.json(categories);
    }
  } catch (error) {
    console.error('MongoDB Categories GET Error:', error);
  }

  // Graceful fallback to initial categories
  return NextResponse.json(INITIAL_CATEGORIES);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.name || !body.id) {
      return NextResponse.json(
        { success: false, message: 'Category Name and ID/Slug are required.' },
        { status: 400 }
      );
    }

    const isConnected = await connectToDatabase();
    if (isConnected) {
      const updated = await CategoryModel.findOneAndUpdate(
        { id: body.id },
        {
          id: body.id,
          name: body.name,
          arabicName: body.arabicName || '',
          icon: body.icon || 'category',
          description: body.description || '',
          volumeCount: body.volumeCount || 0,
          tags: body.tags || [],
          subBranches: body.subBranches || [],
          foundationTreatises: body.foundationTreatises || [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return NextResponse.json({ success: true, category: updated, source: 'mongodb' });
    }

    return NextResponse.json({ success: true, category: body, source: 'local' });
  } catch (error: any) {
    console.error('MongoDB Category POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save category' },
      { status: 500 }
    );
  }
}
