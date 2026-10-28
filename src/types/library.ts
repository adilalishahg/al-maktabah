export type Discipline = 
  | 'aqeedah'
  | 'tafsir'
  | 'hadith'
  | 'seerah'
  | 'fiqh'
  | 'tazkiyah'
  | 'linguistics'
  | 'history'
  | 'usul';

export type ReaderTheme = 'parchment' | 'sepia' | 'night';

export interface Book {
  id: string;
  title: string;
  arabicTitle: string;
  author: string;
  authorHijriYear: string;
  discipline: Discipline;
  disciplineName: string;
  disciplineArabic: string;
  pages: number;
  sizeMb: number;
  coverImage: string;
  pdfUrl?: string;
  badge?: string;
  badgeColor?: string;
  formats: ('PDF' | 'EPUB' | 'Searchable OCR' | 'Critical PDF' | 'Isnād Index' | 'English Translation' | 'Notes' | 'Full Ayah Map' | 'Bilingual')[];
  description: string;
  verified: boolean;
  edition: string;
  volumes: number;
  rating: number;
  readingTimeHours?: number;
  canonicalStatus?: string;
}

export interface IsnadNode {
  id: string;
  name: string;
  arabicName: string;
  rank: 'Companion' | 'Senior Tābi‘ī' | 'Tābi‘ī' | 'Atbā‘ at-Tābi‘īn' | 'Leading Imām';
  reliability: string;
  birthDeathAH: string;
  region: string;
  bio: string;
  teachers?: string[];
  students?: string[];
}

export interface WordAnalysis {
  arabic: string;
  root: string;
  transliteration: string;
  pos: 'Noun (Ism)' | 'Verb (Fi‘l)' | 'Particle (Ḥarf)' | 'Pronoun';
  meaning: string;
  morphologyNote: string;
}

export interface Footnote {
  id: string;
  code: string;
  title: string;
  scholar: string;
  scholarDeathAH: string;
  text: string;
}

export interface ReadingSection {
  id: string;
  bookId: string;
  bookTitle: string;
  bookTitleArabic: string;
  chapterNumber: number;
  chapterTitleEn: string;
  chapterTitleAr: string;
  entryNumber: number;
  totalEntries: number;
  narrator: string;
  authenticityStatus: string;
  englishHeading: string;
  englishLeadText: string;
  englishHighlightText: string;
  englishSubsequentText: string;
  arabicLead: string;
  arabicMatn: string;
  arabicSubtext: string;
  isnadChain: IsnadNode[];
  footnotes: Footnote[];
  wordAnalyses: WordAnalysis[];
  totalPages: number;
  currentPage: number;
}

export interface CategoryScience {
  id: Discipline | string;
  name: string;
  arabicName: string;
  icon: string;
  description: string;
  volumeCount: number;
  tags: string[];
  subBranches: {
    title: string;
    description: string;
    count: number;
  }[];
  foundationTreatises: string[];
}

export interface ManuscriptCodex {
  id: string;
  title: string;
  arabicTitle: string;
  callNumber: string;
  holdingRepository: string;
  location: string;
  eraHijri: string;
  eraCE: string;
  scriptStyle: string;
  folios: number;
  dimensions: string;
  scribeName: string;
  image: string;
  illuminationNotes: string;
  historicalSignificance: string;
}
