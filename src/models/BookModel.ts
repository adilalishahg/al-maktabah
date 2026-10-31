import mongoose, { Schema, Model } from 'mongoose';
import type { IChapter, IBookDocument } from '@/types/models';

export type { IChapter, IBookDocument };

const ChapterSchema = new Schema<IChapter>(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    arabicTitle: { type: String, default: '', trim: true, maxlength: 400 },
    startPage: { type: Number, default: 1, min: 1 },
    content: { type: String, default: '' },
    translation: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const BookSchema = new Schema<IBookDocument>(
  {
    id: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 400 },
    arabicTitle: { type: String, default: '', trim: true, maxlength: 500 },
    author: { type: String, required: true, trim: true, maxlength: 300 },
    authorHijriYear: { type: String, default: '1445 AH', trim: true, maxlength: 100 },
    discipline: { type: String, default: 'hadith', index: true, trim: true },
    disciplineName: { type: String, default: 'Prophetic Traditions', trim: true },
    coverImage: { type: String, default: '', trim: true },
    pdfUrl: { type: String, default: '', trim: true },
    description: { type: String, default: '', maxlength: 5000 },
    pages: { type: Number, default: 100, min: 1 },
    sizeMb: { type: Number, default: 5.0, min: 0 },
    edition: { type: String, default: 'Academic Critical Edition', trim: true },
    volumes: { type: Number, default: 1, min: 1 },
    verified: { type: Boolean, default: true },
    published: { type: Boolean, default: true, index: true },
    formats: { type: [String], default: ['PDF', 'EPUB', 'Searchable OCR'] },
    chapters: { type: [ChapterSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal catalog filtering and sort ordering
BookSchema.index({ published: 1, discipline: 1, createdAt: -1 });
BookSchema.index({ published: 1, createdAt: -1 });
BookSchema.index({ discipline: 1, createdAt: -1 });

// High-performance text index weighted for metadata search (excluding heavy chapter text blobs to preserve Atlas RAM)
BookSchema.index(
  {
    title: 'text',
    arabicTitle: 'text',
    author: 'text',
    disciplineName: 'text',
    description: 'text',
  },
  {
    weights: {
      title: 10,
      arabicTitle: 10,
      author: 5,
      disciplineName: 3,
      description: 1,
    },
    name: 'BookMetadataTextIndex',
  }
);

export const BookModel: Model<IBookDocument> =
  mongoose.models.Book || mongoose.model<IBookDocument>('Book', BookSchema);
