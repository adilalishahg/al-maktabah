import type { Book } from '@/types/library';
import type { DetailedBook } from '@/types/bookContent';

/**
 * Generates a clean, URL-safe slug from a book's title or custom id.
 */
export function getBookSlug(book: Partial<Book | DetailedBook>): string {
  // If the book has a custom human-readable id (not auto-generated 'book-12345'), use it
  if (
    book.id &&
    !book.id.startsWith('book-') &&
    !book.id.startsWith('node-') &&
    !book.id.startsWith('fn-') &&
    /^[a-z0-9-]+$/.test(book.id)
  ) {
    return book.id;
  }

  // Otherwise, create a clean slug from the English or transliterated title
  const source = book.title || book.id || 'book';
  const slug = source
    .toLowerCase()
    .normalize('NFD') // Normalize diacritics like Ṣaḥīḥ -> Sahih
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens

  return slug || 'book';
}

/**
 * Tests if a book matches a given route slug (by id, computed slug, or title).
 */
export function matchesBookSlug(book: Partial<Book | DetailedBook>, targetSlug: string): boolean {
  if (!targetSlug) return false;
  const normalizedTarget = decodeURIComponent(targetSlug).toLowerCase().trim();

  // 1. Direct ID match
  if (book.id && book.id.toLowerCase() === normalizedTarget) {
    return true;
  }

  // 2. Computed slug match
  const slug = getBookSlug(book);
  if (slug === normalizedTarget) {
    return true;
  }

  // 3. Title normalized slug match
  if (book.title) {
    const titleSlug = book.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (titleSlug === normalizedTarget) return true;

    // Direct comparison without hyphens
    const cleanTitle = book.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTarget = normalizedTarget.replace(/[^a-z0-9]/g, '');
    if (cleanTitle && cleanTarget && cleanTitle === cleanTarget) return true;
  }

  return false;
}

