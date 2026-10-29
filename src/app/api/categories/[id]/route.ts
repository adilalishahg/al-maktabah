import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/models/CategoryModel';
import { BookModel } from '@/models/BookModel';
import { verifyAdminRequest } from '@/lib/authGuard';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Security Gate: Enforce verified administrator authorization
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const isConnected = await connectToDatabase();

    if (isConnected) {
      // Referential Integrity Gate: Check if books are attached to this discipline/category
      const associatedBooksCount = await BookModel.countDocuments({ discipline: id });
      if (associatedBooksCount > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot delete discipline "${id}". There are ${associatedBooksCount} book(s) cataloged under this category. Please reassign or remove them first.`,
          },
          { status: 409 }
        );
      }

      await CategoryModel.deleteOne({ id });
      return NextResponse.json({ success: true, message: `Category ${id} deleted from database` });
    }

    return NextResponse.json({ success: true, message: `Category ${id} deleted (local mode)` });
  } catch (error: any) {
    console.error('MongoDB Category DELETE Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
