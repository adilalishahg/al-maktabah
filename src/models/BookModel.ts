import mongoose, { Schema, Model } from 'mongoose';
import type { IChapter, IBookDocument } from '@/types/models';

export type { IChapter, IBookDocument };

const ChapterSchema = new Schema<IChapter>(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    arabicTitle: { type: String, default: '' },
    startPage: { type: Number, default: 1 },
    content: { type: String, default: '' },
    translation: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const BookSchema = new Schema<IBookDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    arabicTitle: { type: String, default: '', trim: true },
    author: { type: String, required: true, trim: true },
    authorHijriYear: { type: String, default: '1445 AH' },
    discipline: { type: String, default: 'hadith', index: true },
    disciplineName: { type: String, default: 'Prophetic Traditions' },
    coverImage: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    pages: { type: Number, default: 100 },
    sizeMb: { type: Number, default: 5.0 },
    edition: { type: String, default: 'Academic Critical Edition' },
    volumes: { type: Number, default: 1 },
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

// Compound text index for fast multi-lingual full-text search across titles, authors, and matn text
BookSchema.index({
  title: 'text',
  arabicTitle: 'text',
  author: 'text',
  'chapters.content': 'text',
  'chapters.translation': 'text',
});

export const BookModel: Model<IBookDocument> =
  mongoose.models.Book || mongoose.model<IBookDocument>('Book', BookSchema);
