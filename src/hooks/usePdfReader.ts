import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { DetailedBook, BookChapter } from '@/types/bookContent';

export interface UsePdfReaderOptions {
  book: DetailedBook;
  pdfUrl?: string;
  initialPage?: number;
  externalPage?: number;
  externalScale?: number;
  sidebarOpenExternal?: boolean;
  onToggleSidebarExternal?: () => void;
  onPageChange?: (page: number) => void;
}

export interface UsePdfReaderReturn {
  totalPages: number;
  currentPage: number;
  pageInputValue: string;
  internalScale: number;
  activeScale: number;
  viewMode: 'pdf' | 'text';
  isSidebarOpen: boolean;
  chapterFilter: string;
  pdfDoc: any;
  loadingDoc: boolean;
  loadError: string | null;
  isFullscreen: boolean;
  isCloudinary: boolean;
  effectivePdfUrl: string;
  chapters: BookChapter[];
  filteredChapters: BookChapter[];
  activeChapter: BookChapter | null;
  renderedPages: Set<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setPageInputValue: (val: string) => void;
  setInternalScale: (scale: number | ((s: number) => number)) => void;
  setViewMode: (mode: 'pdf' | 'text') => void;
  setChapterFilter: (filter: string) => void;
  setIsFullscreen: (full: boolean | ((f: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  getCloudinaryPageUrl: (url: string, page: number) => string;
  scrollToPage: (pageNum: number) => void;
  renderPage: (pageNum: number, canvasEl: HTMLCanvasElement) => Promise<void>;
  handlePageInputSubmit: (e: React.FormEvent) => void;
}

// Dynamically load PDF.js from CDN
async function getPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('pdfjs-cdn-script');
    if (existing) {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      existing.addEventListener('load', () => resolve((window as any).pdfjsLib));
      return;
    }

    const script = document.createElement('script');
    script.id = 'pdfjs-cdn-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjs);
      } else {
        reject(new Error('PDF.js failed to initialize'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
    document.head.appendChild(script);
  });
}

/**
 * Custom hook encapsulating PDF.js canvas worker loading, Cloudinary multi-tier CDN
 * optimization, intersection observer page tracking, and viewport scaling.
 */
export function usePdfReader({
  book,
  pdfUrl,
  initialPage = 1,
  externalPage,
  externalScale,
  sidebarOpenExternal,
  onToggleSidebarExternal,
  onPageChange,
}: UsePdfReaderOptions): UsePdfReaderReturn {
  const [totalPages, setTotalPages] = useState<number>(book.pages || 631);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageInputValue, setPageInputValue] = useState<string>(String(initialPage));
  const [internalScale, setInternalScale] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf');
  const [internalSidebarOpen, setInternalSidebarOpen] = useState<boolean>(false);
  const [chapterFilter, setChapterFilter] = useState<string>('');
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loadingDoc, setLoadingDoc] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const activeScale = externalScale !== undefined ? externalScale : internalScale;
  const isSidebarOpen = sidebarOpenExternal !== undefined ? sidebarOpenExternal : internalSidebarOpen;

  const toggleSidebar = useCallback(() => {
    if (onToggleSidebarExternal) {
      onToggleSidebarExternal();
    } else {
      setInternalSidebarOpen((prev) => !prev);
    }
  }, [onToggleSidebarExternal]);

  // Set default sidebar open on large desktop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && sidebarOpenExternal === undefined) {
      setInternalSidebarOpen(true);
    }
  }, [sidebarOpenExternal]);

  const effectivePdfUrl = pdfUrl || book.pdfUrl || '';
  const chapters = book.chapters || [];
  const isCloudinary = Boolean(effectivePdfUrl && effectivePdfUrl.includes('res.cloudinary.com'));

  const getCloudinaryPageUrl = useCallback((url: string, page: number) => {
    if (!url.includes('res.cloudinary.com')) return url;
    return url
      .replace('/image/upload/', `/image/upload/w_1400,q_auto,f_auto/pg_${page}/`)
      .replace(/\.pdf$/i, '.jpg');
  }, []);

  const filteredChapters = useMemo(() => {
    if (!chapterFilter.trim()) return chapters;
    const q = chapterFilter.toLowerCase();
    return chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.arabicTitle.includes(q) ||
        String(c.startPage).includes(q)
    );
  }, [chapters, chapterFilter]);

  const activeChapter = useMemo(() => {
    if (!chapters || chapters.length === 0) return null;
    let found = chapters[0];
    for (const ch of chapters) {
      if (ch.startPage <= currentPage) {
        found = ch;
      } else {
        break;
      }
    }
    return found;
  }, [chapters, currentPage]);

  // Load PDF Document or initialize Cloudinary streaming
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!effectivePdfUrl) {
        setLoadingDoc(false);
        if (chapters.length > 0) {
          setViewMode('text');
        }
        return;
      }

      if (isCloudinary) {
        setLoadingDoc(false);
        setLoadError(null);
        setTotalPages(book.pages || 631);
        return;
      }

      setLoadingDoc(true);
      setLoadError(null);

      try {
        const pdfjs = await getPdfJs();
        if (!pdfjs) throw new Error('PDF.js runtime unavailable');
        if (isCancelled) return;

        const loadingTask = pdfjs.getDocument({
          url: effectivePdfUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setLoadingDoc(false);
        }
      } catch (err: any) {
        console.warn('PDF document load notice (switching to text view if needed):', err);
        if (!isCancelled) {
          setLoadError(err.message || 'Could not load PDF file directly');
          setLoadingDoc(false);
          if (chapters.length > 0) {
            setViewMode('text');
          }
        }
      }
    }

    loadPdf();
    return () => {
      isCancelled = true;
    };
  }, [effectivePdfUrl, isCloudinary, book.pages, chapters.length]);

  // Render a specific page canvas
  const renderPage = useCallback(
    async (pageNum: number, canvasEl: HTMLCanvasElement) => {
      if (!pdfDoc || !canvasEl || isCloudinary) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: activeScale });
        canvasEl.width = viewport.width;
        canvasEl.height = viewport.height;
        const ctx = canvasEl.getContext('2d');
        if (!ctx) return;

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };
        await page.render(renderContext).promise;
        setRenderedPages((prev) => new Set(prev).add(pageNum));
      } catch (e) {
        console.warn(`Render error on page ${pageNum}:`, e);
      }
    },
    [pdfDoc, activeScale, isCloudinary]
  );

  const scrollToPage = useCallback(
    (pageNum: number) => {
      const clamped = Math.max(1, Math.min(pageNum, totalPages));
      setCurrentPage(clamped);
      setPageInputValue(String(clamped));
      onPageChange?.(clamped);

      if (viewMode === 'pdf') {
        const el = document.getElementById(`pdf-page-slot-${clamped}`);
        if (el && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const targetTop = containerRef.current.scrollTop + (elRect.top - containerRect.top) - 8;
          containerRef.current.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth',
          });
        }
      }
    },
    [totalPages, viewMode, onPageChange]
  );

  // Sync externalPage changes
  useEffect(() => {
    if (externalPage !== undefined && externalPage !== currentPage) {
      scrollToPage(externalPage);
    }
  }, [externalPage, scrollToPage, currentPage]);

  // Intersection observer for current page as user scrolls
  useEffect(() => {
    if (viewMode !== 'pdf' || !containerRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute('data-page-num') || '1', 10);
            setCurrentPage(pageNum);
            setPageInputValue(String(pageNum));
            onPageChange?.(pageNum);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.35,
      }
    );

    observerRef.current = observer;
    const pageSlots = containerRef.current.querySelectorAll('.pdf-page-slot');
    pageSlots.forEach((slot) => observer.observe(slot));

    return () => observer.disconnect();
  }, [totalPages, viewMode, onPageChange, loadingDoc]);

  const handlePageInputSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const val = parseInt(pageInputValue, 10);
      if (!isNaN(val)) {
        scrollToPage(val);
      }
    },
    [pageInputValue, scrollToPage]
  );

  return {
    totalPages,
    currentPage,
    pageInputValue,
    internalScale,
    activeScale,
    viewMode,
    isSidebarOpen,
    chapterFilter,
    pdfDoc,
    loadingDoc,
    loadError,
    isFullscreen,
    isCloudinary,
    effectivePdfUrl,
    chapters,
    filteredChapters,
    activeChapter,
    renderedPages,
    containerRef,
    setPageInputValue,
    setInternalScale,
    setViewMode,
    setChapterFilter,
    setIsFullscreen,
    toggleSidebar,
    getCloudinaryPageUrl,
    scrollToPage,
    renderPage,
    handlePageInputSubmit,
  };
}

