import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BookModel } from '@/models/BookModel';
import { INITIAL_DETAILED_BOOKS } from '@/data/bookStore';
import { BOOKS } from '@/data/mockLibrary';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase() || '';
    const admin = searchParams.get('admin') === 'true';

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
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { arabicTitle: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } },
          { disciplineName: { $regex: query, $options: 'i' } },
        ];
      }

      const books = await BookModel.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json({
        success: true,
        source: 'MongoDB Atlas',
        count: books.length,
        data: books,
      });
    }

    // When MongoDB is not connected, return empty list without loading mock data
    return NextResponse.json({
      success: true,
      source: 'No Database Connection',
      count: 0,
      data: [],
      message: 'MongoDB is not connected. Add MONGODB_URI to .env.local to load live codices from database.',
    });
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
    const body = await request.json();

    if (!body.title || !body.author) {
      return NextResponse.json(
        { success: false, message: 'Missing required book title or author.' },
        { status: 400 }
      );
    }

    const bookData = {
      ...body,
      id: body.id || 'book-' + Date.now(),
      updatedAt: new Date().toISOString(),
      createdAt: body.createdAt || new Date().toISOString(),
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
          message: 'Codex saved and indexed successfully in MongoDB Atlas.',
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
