import React from 'react';
import { DetailedBook } from '@/types/bookContent';
import { Book } from '@/types/library';

interface ScholarlyJsonLdProps {
  book?: DetailedBook | Book;
  baseUrl?: string;
}

/**
 * Injects Schema.org scholarly semantic metadata for Google Academic & Search crawlers.
 */
export const ScholarlyJsonLd: React.FC<ScholarlyJsonLdProps> = ({
  book,
  baseUrl = 'https://al-maktabah.org',
}) => {
  // 1. Library & Digital Waqf Organization schema
  const librarySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Al-Maktabah (المكتبة)',
    alternateName: 'Al-Maktabah Digital Waqf & Islamic Archives',
    url: baseUrl,
    description:
      'Autonomous Academic Islamic Codex & Digital Waqf Repository preserving timeless classical treatises, Qur’anic exegesis, and authenticated hadith collections.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/browse-library?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Al-Maktabah Digital Waqf',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkk5vdhfETWDMXgUobuz8b7OFIRxT1RnZyf7NS9WywvGhN2DjXfBC38oWKpOPBa1Qs_m1ca4JDUU4MPkxVPn_Sc46Y9KuVauZl1My3j3Je5ikE7fJ0utasVbauXGLar-TbkdJmDkpxhfmPHXPvXvl3Bffa8uNNmdDFvmiUQbiT0GyDAuAJEGh7OHztOzMPqH7Ugw6p3FwSAO-cR9R2gvZLOgmsldiGILWTav5h_tWWlYQ6vJe9X8xI',
      },
    },
  };

  // 2. Specific Scholarly Codex Book schema (if book is provided)
  const bookSchema = book
    ? {
        '@context': 'https://schema.org',
        '@type': 'Book',
        '@id': `${baseUrl}/books/${book.id}`,
        name: book.title,
        alternateName: book.arabicTitle,
        url: `${baseUrl}/books/${book.id}`,
        image: book.coverImage,
        description: book.description,
        inLanguage: ['ar', 'en'],
        genre: book.disciplineName || book.discipline,
        numberOfPages: book.pages,
        bookEdition: book.edition || 'Critical Waqf Academic Edition',
        isAccessibleForFree: true,
        license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
        author: {
          '@type': 'Person',
          name: book.author,
          description: `Classical Islamic Scholar (${book.authorHijriYear || 'Historic AH'})`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Al-Maktabah Digital Waqf',
        },
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(librarySchema) }}
      />
      {bookSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
        />
      )}
    </>
  );
};

