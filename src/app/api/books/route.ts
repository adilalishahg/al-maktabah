import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BookModel } from '@/models/BookModel';
import { INITIAL_DETAILED_BOOKS } from '@/data/bookStore';
import { BOOKS } from '@/data/mockLibrary';
import { verifyAdminRequest } from '@/lib/authGuard';
import { BookInputSchema } from '@/lib/validationSchemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase() || '';
    const admin = searchParams.get('admin') === 'true';
    const full = searchParams.get('full') === 'true';

    const db = await connectToDatabase();

    if (db) {
      const filter: any = {};
      if (!admin) {
        filter.published = { $ne: false };
      }
      if (category && category !== 'all') {
        filter.discipline = category;
      }
      if (query) {
        // ReDoS Defense: Escape all regex special characters to prevent ReDoS attacks
        const sanitized = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
          { title: { $regex: sanitized, $options: 'i' } },
          { arabicTitle: { $regex: sanitized, $options: 'i' } },
          { author: { $regex: sanitized, $options: 'i' } },
          { disciplineName: { $regex: sanitized, $options: 'i' } },
        ];
      }

      // Lean Projection Architecture: Exclude heavy chapter content blobs on catalog listing queries
      let queryBuilder = BookModel.find(filter).sort({ createdAt: -1 });
      if (!admin && !full) {
        queryBuilder = queryBuilder.select('-chapters.content -chapters.translation -chapters.notes');
      }

      const books = await queryBuilder.lean();
      return NextResponse.json(
        {
          success: true,
          source: 'MongoDB Atlas',
          count: books.length,
          data: books,
        },
        {
          headers: {
            'Cache-Control': admin
              ? 'no-store, no-cache, must-revalidate'
              : 'public, s-maxage=60, stale-while-revalidate=600',
          },
        }
      );
    }

    // When MongoDB is not connected, return empty list with fallback cache headers
    const fallbackCache = admin
      ? 'no-store, no-cache, must-revalidate'
      : 'public, s-maxage=60, stale-while-revalidate=600';

    return NextResponse.json(
      {
        success: true,
        source: 'No Database Connection',
        count: 0,
        data: [],
        message: 'MongoDB is not connected. Add MONGODB_URI to .env.local to load live codices from database.',
      },
      {
        headers: {
          'Cache-Control': fallbackCache,
        },
      }
    );
  } catch (error: any) {
    console.error('API /api/books GET Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
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
    const parseResult = BookInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid book schema payload.',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const validated = parseResult.data;
    const bookData = {
      ...validated,
      id: validated.id || 'book-' + Date.now(),
      updatedAt: new Date().toISOString(),
      createdAt: validated.createdAt || new Date().toISOString(),
    };

    const db = await connectToDatabase();

    if (db) {
      const saved = await BookModel.findOneAndUpdate(
        { id: bookData.id },
        bookData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();

      return NextResponse.json(
        {
          success: true,
          source: 'MongoDB Atlas',
          message: 'Book saved and indexed successfully in MongoDB Atlas.',
          data: saved,
        },
        { status: 201 }
      );
    }

    // Fallback response when MongoDB is not configured
    return NextResponse.json(
      {
        success: true,
        source: 'In-Memory Fallback',
        message: 'Book processed successfully. Provide MONGODB_URI in .env.local for permanent multi-device sync.',
        data: bookData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API /api/books POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Malformed JSON payload' },
      { status: 500 }
    );
  }
}
