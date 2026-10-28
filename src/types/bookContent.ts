export interface BookChapter {
  id: string;
  number: number;
  title: string;
  arabicTitle: string;
  startPage: number;
  content: string; // Full formatted Arabic or bilingual text
  translation?: string;
  notes?: string;
}

export interface DetailedBook {
  id: string;
  title: string;
  arabicTitle: string;
  author: string;
  authorHijriYear: string;
  discipline: string;
  disciplineName: string;
  coverImage: string;
  pdfUrl?: string;
  audioUrl?: string;
  description: string;
  pages: number;
  sizeMb: number;
  edition: string;
  volumes: number;
  verified: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  chapters: BookChapter[];
  formats: string[];
}
