import { useState, useEffect, useCallback } from 'react';
import type { DetailedBook, BookChapter } from '@/types/bookContent';

export interface UseBookReaderOptions {
  book: DetailedBook;
  initialChapterId?: string;
}

export interface UseBookReaderReturn {
  chapters: BookChapter[];
  currentChapterIndex: number;
  activeChapter: BookChapter;
  readingFormat: 'facsimile' | 'matn';
  zoomScale: number;
  fontSize: number;
  showTranslation: boolean;
  showNotes: boolean;
  pageInput: string;
  sidebarOpen: boolean;
  copiedNotification: boolean;
  setCurrentChapterIndex: (index: number) => void;
  setReadingFormat: (format: 'facsimile' | 'matn') => void;
  setZoomScale: (scale: number | ((prev: number) => number)) => void;
  setFontSize: (size: number | ((prev: number) => number)) => void;
  setShowTranslation: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowNotes: (show: boolean | ((prev: boolean) => boolean)) => void;
  setPageInput: (input: string) => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  handleJumpToPage: (e: React.FormEvent) => void;
  handlePageChange: (pageNum: number) => void;
  handleNextChapter: () => void;
  handlePrevChapter: () => void;
  handleCopyText: () => void;
}

const DEFAULT_CHAPTER: BookChapter = {
  id: 'c1',
  number: 1,
  title: 'Chapter 1',
  arabicTitle: 'الفصل الأول',
  startPage: 1,
  content: 'لا يوجد نص مدخل بعد.',
};

/**
 * Custom hook encapsulating all navigation, zoom, font, and chapter logic
 * for the Scholarly Book Reader View.
 */
export function useBookReader({ book, initialChapterId }: UseBookReaderOptions): UseBookReaderReturn {
  const chapters = book.chapters || [];

  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(() => {
    if (initialChapterId) {
      const idx = chapters.findIndex((c) => c.id === initialChapterId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const [readingFormat, setReadingFormat] = useState<'facsimile' | 'matn'>('facsimile');
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [fontSize, setFontSize] = useState<number>(22);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [pageInput, setPageInput] = useState<string>('1');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const activeChapter: BookChapter = chapters[currentChapterIndex] || DEFAULT_CHAPTER;

  // Sync page input when active chapter changes
  useEffect(() => {
    setPageInput(String(activeChapter.startPage || 1));
  }, [currentChapterIndex, activeChapter]);

  // Jump to specific page and update chapter index
  const handleJumpToPage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const targetPage = parseInt(pageInput, 10);
      if (isNaN(targetPage) || targetPage < 1) return;

      let bestIdx = 0;
      for (let i = 0; i < chapters.length; i++) {
        if (chapters[i].startPage <= targetPage) {
          bestIdx = i;
        } else {
          break;
        }
      }
      setCurrentChapterIndex(bestIdx);
    },
    [pageInput, chapters]
  );

  const handlePageChange = useCallback(
    (pageNum: number) => {
      setPageInput(String(pageNum));
      let bestIdx = 0;
      for (let i = 0; i < chapters.length; i++) {
        if (chapters[i].startPage <= pageNum) {
          bestIdx = i;
        } else {
          break;
        }
      }
      setCurrentChapterIndex(bestIdx);
    },
    [chapters]
  );

  const handleNextChapter = useCallback(() => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentChapterIndex, chapters.length]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentChapterIndex]);

  const handleCopyText = useCallback(() => {
    const textToCopy = `${activeChapter.arabicTitle}\n\n${activeChapter.content}\n\n— ${book.title} (p. ${activeChapter.startPage})`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  }, [activeChapter, book.title]);

  return {
    chapters,
    currentChapterIndex,
    activeChapter,
    readingFormat,
    zoomScale,
    fontSize,
    showTranslation,
    showNotes,
    pageInput,
    sidebarOpen,
    copiedNotification,
    setCurrentChapterIndex,
    setReadingFormat,
    setZoomScale,
    setFontSize,
    setShowTranslation,
    setShowNotes,
    setPageInput,
    setSidebarOpen,
    handleJumpToPage,
    handlePageChange,
    handleNextChapter,
    handlePrevChapter,
    handleCopyText,
  };
}

