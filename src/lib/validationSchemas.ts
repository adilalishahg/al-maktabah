import { z } from 'zod';

export const ChapterInputSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().min(1),
  title: z.string().min(1, 'Chapter title is required').max(300),
  arabicTitle: z.string().max(400).optional().default(''),
  startPage: z.number().int().min(1).optional().default(1),
  content: z.string().optional().default(''),
  translation: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const BookInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Book ID must contain only alphanumeric characters, dashes, or underscores.')
    .optional(),
  title: z.string().min(1, 'Book title is required').max(400),
  arabicTitle: z.string().max(500).optional().default(''),
  author: z.string().min(1, 'Author is required').max(300),
  authorHijriYear: z.string().max(100).optional().default('1445 AH'),
  discipline: z.string().min(1).max(100).optional().default('hadith'),
  disciplineName: z.string().max(150).optional().default('Prophetic Traditions'),
  coverImage: z.string().optional().default(''),
  pdfUrl: z.string().optional().default(''),
  description: z.string().max(5000).optional().default(''),
  pages: z.number().int().min(1).optional().default(100),
  sizeMb: z.number().min(0).optional().default(5.0),
  edition: z.string().max(200).optional().default('Academic Critical Edition'),
  volumes: z.number().int().min(1).optional().default(1),
  verified: z.boolean().optional().default(true),
  published: z.boolean().optional().default(true),
  formats: z.array(z.string()).optional().default(['PDF', 'EPUB', 'Searchable OCR']),
  chapters: z.array(ChapterInputSchema).optional().default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CategoryInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Category ID must contain only alphanumeric characters, dashes, or underscores.'),
  name: z.string().min(1, 'Category name is required').max(200),
  arabicName: z.string().max(300).optional().default(''),
  icon: z.string().max(100).optional().default('category'),
  description: z.string().max(2000).optional().default(''),
  volumeCount: z.number().int().min(0).optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  subBranches: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional().default(''),
        count: z.number().optional().default(0),
      })
    )
    .optional()
    .default([]),
  foundationTreatises: z.array(z.string()).optional().default([]),
});

export const HomeSettingsInputSchema = z.object({
  sections: z.object({
    dailyBanner: z.object({
      enabled: z.boolean(),
      arabicText: z.string().optional(),
      translation: z.string().optional(),
      reference: z.string().optional(),
    }).optional(),
    heroSection: z.object({
      enabled: z.boolean(),
      centerBookId: z.string().optional(),
      leftBookId: z.string().optional(),
      rightBookId: z.string().optional(),
    }).optional(),
    categoriesGrid: z.object({
      enabled: z.boolean(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      maxDisplay: z.number().optional(),
    }).optional(),
    featuredShelf: z.object({
      enabled: z.boolean(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      selectionMode: z.string().optional(),
      selectedBookIds: z.array(z.string()).optional(),
    }).optional(),
    readerPreview: z.object({
      enabled: z.boolean(),
      sourceMode: z.string().optional(),
      selectedBookId: z.string().optional(),
      selectedChapterId: z.string().optional(),
      audioActive: z.boolean().optional(),
      audioReciter: z.string().optional(),
      audioDuration: z.string().optional(),
    }).optional(),
    preservationSection: z.object({
      enabled: z.boolean(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
    }).optional(),
    newsletterSection: z.object({
      enabled: z.boolean(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
    }).optional(),
  }),
  readerSection: z.record(z.string(), z.any()).optional(),
  updatedAt: z.string().optional(),
});

