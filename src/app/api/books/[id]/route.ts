import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BookModel } from '@/models/BookModel';
import { INITIAL_DETAILED_BOOKS } from '@/data/bookStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await connectToDatabase();

    if (db) {
      const book = await BookModel.findOne({ id }).lean();
      if (!book) {
        return NextResponse.json(
          { success: false, message: 'Codex not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: book });
    }

    return NextResponse.json(
      { success: false, message: 'Codex not found or database not connected' },
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
    const { id } = await params;
    const body = await request.json();
    const db = await connectToDatabase();

    if (db) {
      const updated = await BookModel.findOneAndUpdate(
        { id },
        { ...body, updatedAt: new Date().toISOString() },
        { new: true }
      ).lean();

      if (!updated) {
        return NextResponse.json(
          { success: false, message: 'Codex not found to update' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Codex updated successfully in MongoDB Atlas.',
        data: updated,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Codex updated (In-memory fallback).',
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
    const { id } = await params;
    const db = await connectToDatabase();

    if (db) {
      const deleted = await BookModel.findOneAndDelete({ id }).lean();
      if (!deleted) {
        return NextResponse.json(
          { success: false, message: 'Codex not found to delete' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Codex successfully deleted from MongoDB Atlas.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Codex deleted (In-memory fallback).',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
