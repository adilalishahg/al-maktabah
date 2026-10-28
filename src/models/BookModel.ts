import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChapter {
  id: string;
  number: number;
  title: string;
  arabicTitle: string;
  startPage: number;
  content: string;
  translation: string;
  notes: string;
}

export interface IBookDocument extends Document {
  id: string;
  title: string;
  arabicTitle: string;
  author: string;
  authorHijriYear: string;
  discipline: string;
  disciplineName: string;
  coverImage: string;
  pdfUrl?: string;
  description: string;
  pages: number;
  sizeMb: number;
  edition: string;
  volumes: number;
  verified: boolean;
  published: boolean;
  formats: string[];
  chapters: IChapter[];
  createdAt: string;
  updatedAt: string;
}

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
