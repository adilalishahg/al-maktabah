import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/models/CategoryModel';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isConnected = await connectToDatabase();
    if (isConnected) {
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
