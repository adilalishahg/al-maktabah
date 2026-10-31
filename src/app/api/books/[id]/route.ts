import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BookModel } from '@/models/BookModel';
import { INITIAL_DETAILED_BOOKS } from '@/data/bookStore';
import { verifyAdminRequest } from '@/lib/authGuard';
import { matchesBookSlug } from '@/utils/slug';
import { BookInputSchema } from '@/lib/validationSchemas';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await connectToDatabase();

    if (db) {
      let book = await BookModel.findOne({ id }).lean();
      if (!book) {
        // Try slug / title lookup
        const allBooks = await BookModel.find({}).lean();
        const matched = allBooks.find((b: any) => matchesBookSlug(b, id));
        if (matched) {
          book = matched;
        }
      }

      if (book) {
        return NextResponse.json(
          { success: true, data: book },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=1200',
            },
          }
        );
      }
    }

    // Fallback: check in-memory seed books
    const inMemory = INITIAL_DETAILED_BOOKS.find((b) => matchesBookSlug(b, id));
    if (inMemory) {
      return NextResponse.json(
        { success: true, data: inMemory },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=1200',
          },
        }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Book not found' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const parseResult = BookInputSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid update payload schema.',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const validated = parseResult.data;
    const db = await connectToDatabase();

    if (db) {
      const updated = await BookModel.findOneAndUpdate(
        { id },
        { ...validated, updatedAt: new Date().toISOString() },
        { new: true }
      ).lean();

      if (!updated) {
        return NextResponse.json(
          { success: false, message: 'Book not found to update' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Book updated successfully in MongoDB Atlas.',
        data: updated,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Book updated (In-memory fallback).',
      data: { ...body, id, updatedAt: new Date().toISOString() },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = await connectToDatabase();

    if (db) {
      const deleted = await BookModel.findOneAndDelete({ id }).lean();
      if (!deleted) {
        return NextResponse.json(
          { success: false, message: 'Book not found to delete' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Book successfully deleted from MongoDB Atlas.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Book deleted (In-memory fallback).',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
