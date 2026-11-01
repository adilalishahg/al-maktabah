import type { Metadata } from 'next';
import { BookSlugClientView } from './BookSlugClientView';
import { connectToDatabase } from '@/lib/mongodb';
import { BookModel } from '@/models/BookModel';
import { INITIAL_DETAILED_BOOKS } from '@/data/bookStore';
import { BOOKS } from '@/data/mockLibrary';
import { matchesBookSlug } from '@/utils/slug';
import type { DetailedBook } from '@/types/bookContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBookBySlug(slug: string): Promise<DetailedBook | null> {
  try {
    const db = await connectToDatabase();
    let found: any = null;
    if (db) {
      found = await BookModel.findOne({ id: slug }).lean();
      if (!found) {
        found = await BookModel.findOne({ slug }).lean();
      }
      if (!found) {
        const all = await BookModel.find({}).lean();
        found = all.find((b: any) => matchesBookSlug(b, slug));
      }
    }
    if (!found) {
      found = INITIAL_DETAILED_BOOKS.find((b) => matchesBookSlug(b, slug));
    }
    if (!found) {
      const publicMatch = BOOKS.find((b) => matchesBookSlug(b, slug));
      if (publicMatch) {
        found = {
          id: publicMatch.id,
          title: publicMatch.title,
          arabicTitle: publicMatch.arabicTitle,
          author: publicMatch.author,
          authorHijriYear: publicMatch.authorHijriYear,
          discipline: publicMatch.discipline,
          disciplineName: publicMatch.disciplineName,
          coverImage: publicMatch.coverImage,
          pdfUrl: publicMatch.pdfUrl,
          description: publicMatch.description,
          pages: publicMatch.pages,
          sizeMb: publicMatch.sizeMb,
          edition: publicMatch.edition,
          volumes: publicMatch.volumes,
          verified: publicMatch.verified,
          published: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          formats: publicMatch.formats,
          chapters: [
            {
              id: 'ch-1',
              number: 1,
              title: 'Foundational Recension & Matn',
              arabicTitle: publicMatch.arabicTitle,
              startPage: 1,
              content: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.',
              translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds, and peace and blessings be upon the Messenger of Allah.',
              notes: 'Critical edition verified against primary codices with full isnād transmission.',
            },
          ],
        };
      }
    }
    if (found) {
      return JSON.parse(JSON.stringify(found));
    }
  } catch (err) {
    console.warn('Could not query database on server for slug:', slug, err);
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let bookTitle = 'Sacred Manuscript & Facsimile Reader';
  let bookDesc = 'Read authentic classical Islamic manuscripts with isnād transmission graphs and digital facsimile matn.';

  const found = await getBookBySlug(slug);
  if (found) {
    bookTitle = `${found.title} ${found.arabicTitle ? `(${found.arabicTitle})` : ''}`;
    bookDesc = found.description || bookDesc;
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
  const initialBook = await getBookBySlug(slug);
  return <BookSlugClientView slug={slug} initialBook={initialBook} />;
}
