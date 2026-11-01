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
    const limitParam = searchParams.get('limit');
    const selectParam = searchParams.get('select');

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
      if (selectParam) {
        queryBuilder = queryBuilder.select(selectParam.replace(/,/g, ' '));
      } else if (!admin && !full) {
        queryBuilder = queryBuilder.select('-chapters.content -chapters.translation -chapters.notes');
      }

      if (limitParam) {
        const limitNum = parseInt(limitParam, 10);
        if (limitNum > 0) {
          queryBuilder = queryBuilder.limit(limitNum);
        }
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

    // When MongoDB is not connected, return fallback in-memory codices with cache headers
    const fallbackCache = admin
      ? 'no-store, no-cache, must-revalidate'
      : 'public, s-maxage=60, stale-while-revalidate=600';

    const fallbackLimit = limitParam ? parseInt(limitParam, 10) : 6;
    const fallbackData = INITIAL_DETAILED_BOOKS.slice(0, fallbackLimit > 0 ? fallbackLimit : 6).map((b) => ({
      _id: b.id,
      id: b.id,
      title: b.title,
      arabicTitle: b.arabicTitle,
      author: b.author,
      discipline: b.discipline,
      disciplineName: b.disciplineName,
      pages: b.pages,
    }));

    return NextResponse.json(
      {
        success: true,
        source: 'Fallback Archive Codices',
        count: fallbackData.length,
        data: fallbackData,
        message: 'Serving fallback in-memory codices.',
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
