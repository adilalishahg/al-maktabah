import type { Metadata } from 'next';
import { BookSlugClientView } from './BookSlugClientView';
import { connectToDatabase } from '@/lib/mongodb';
import { BookModel } from '@/models/BookModel';
import { INITIAL_DETAILED_BOOKS } from '@/data/bookStore';
import { BOOKS } from '@/data/mockLibrary';
import { matchesBookSlug } from '@/utils/slug';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let bookTitle = 'Sacred Codex & Facsimile Reader';
  let bookDesc = 'Read authentic classical Islamic codices with isnād transmission graphs and digital facsimile matn.';

  try {
    const db = await connectToDatabase();
    let found: any = null;
    if (db) {
      found = await BookModel.findOne({ id: slug }).lean();
      if (!found) {
        const all = await BookModel.find({}).lean();
        found = all.find((b: any) => matchesBookSlug(b, slug));
      }
    }
    if (!found) {
      found = INITIAL_DETAILED_BOOKS.find((b) => matchesBookSlug(b, slug));
    }
    if (!found) {
      found = BOOKS.find((b) => matchesBookSlug(b, slug));
    }
    if (found) {
      bookTitle = `${found.title} ${found.arabicTitle ? `(${found.arabicTitle})` : ''}`;
      bookDesc = found.description || bookDesc;
    }
  } catch {
    // fallback gracefully
  }

  return {
    title: `${bookTitle} | Al-Maktabah Digital Archives`,
    description: bookDesc,
    openGraph: {
      title: `${bookTitle} | Al-Maktabah Digital Archives`,
      description: bookDesc,
    },
  };
}

export default async function BookSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <BookSlugClientView slug={slug} />;
}

