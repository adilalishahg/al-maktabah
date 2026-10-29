import type { BookChapter } from './bookContent';

/**
 * Result schema returned by cryptographic & binary magic byte file validators.
 */
export interface FileValidationResult {
  valid: boolean;
  mimeType?: string;
  error?: string;
}

/**
 * Result schema returned by PDF analysis & OCR extraction heuristics.
 */
export interface ExtractedBookData {
  title: string;
  arabicTitle: string;
  author: string;
  authorHijriYear: string;
  discipline: string;
  disciplineName: string;
  description: string;
  totalPages: number;
  chapters: BookChapter[];
}
