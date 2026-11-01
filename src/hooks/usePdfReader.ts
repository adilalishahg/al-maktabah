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
  pageAspectRatio: number;
  fitWidthScale: number;
  computedPageWidth: number;
  isMobile: boolean;
  setPageAspectRatio: React.Dispatch<React.SetStateAction<number>>;
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
  const [totalPages, setTotalPages] = useState<number>(book.pages);
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
  const renderTasksRef = useRef<Map<number, any>>(new Map());

  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') return window.innerWidth;
    return 800;
  });
  const [pageAspectRatio, setPageAspectRatio] = useState<number>(1.414);
  const [unscaledPageWidth, setUnscaledPageWidth] = useState<number>(800);

  const activeScale = externalScale !== undefined ? externalScale : internalScale;
  const isSidebarOpen = sidebarOpenExternal !== undefined ? sidebarOpenExternal : internalSidebarOpen;

  // Responsive mobile threshold
  const isMobile = containerWidth < 768;

  // Track container width via ResizeObserver and window resize events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      if (el.clientWidth > 0) {
        setContainerWidth(el.clientWidth);
      }
    };

    updateDimensions();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateDimensions();
      });
      ro.observe(el);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Compute available width accounting for safe padding (12px on mobile, 32px on desktop)
  const padding = isMobile ? 12 : 32;
  const availableWidth = Math.max(260, containerWidth - padding);

  // Dynamic Fit-To-Width scale for unscaled PDF page
  const fitWidthScale = unscaledPageWidth > 0 ? availableWidth / unscaledPageWidth : 1.0;

  // Dynamic CSS display width for page slot:
  // On mobile (< 768px): activeScale acts as zoom multiplier relative to fit-to-width.
  // 1.0 = 100% fits within screen width. Zooming in (> 1.0) allows horizontal panning.
  // On desktop (>= 768px): baseline is comfortable reading width (~800px) capped at availableWidth.
  const computedPageWidth = useMemo(() => {
    if (isMobile) {
      return Math.round(availableWidth * activeScale);
    }
    const baseline = Math.min(800, availableWidth);
    return Math.round(baseline * activeScale);
  }, [isMobile, availableWidth, activeScale]);

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
        setTotalPages(book.pages);
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

  // Cancel all in-flight render tasks when scaling or changing documents
  useEffect(() => {
    return () => {
      renderTasksRef.current.forEach((task) => {
        try {
          task.cancel();
        } catch {}
      });
      renderTasksRef.current.clear();
    };
  }, [pdfDoc, computedPageWidth]);

  // Render a specific page canvas with concurrency cancellation guard
  const renderPage = useCallback(
    async (pageNum: number, canvasEl: HTMLCanvasElement) => {
      if (!pdfDoc || !canvasEl || isCloudinary) return;

      // Cancel any active render task on this page before starting a new one
      const existingTask = renderTasksRef.current.get(pageNum);
      if (existingTask) {
        try {
          existingTask.cancel();
        } catch {}
        renderTasksRef.current.delete(pageNum);
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const unscaled = page.getViewport({ scale: 1.0 });

        if (unscaled.width > 0 && unscaled.height > 0) {
          setUnscaledPageWidth(unscaled.width);
          setPageAspectRatio(unscaled.height / unscaled.width);
        }

        const cssWidth = computedPageWidth;
        const cssHeight = Math.round(cssWidth * (unscaled.height / unscaled.width));
        const renderScale = cssWidth / unscaled.width;

        // DevicePixelRatio for crisp HiDPI Retina rendering (capped at 2.5)
        const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;
        const viewport = page.getViewport({ scale: renderScale * dpr });

        // Physical canvas buffer dimensions
        canvasEl.width = Math.floor(viewport.width);
        canvasEl.height = Math.floor(viewport.height);

        // Logical CSS styling dimensions
        canvasEl.style.width = `${cssWidth}px`;
        canvasEl.style.height = `${cssHeight}px`;

        const ctx = canvasEl.getContext('2d', { alpha: false });
        if (!ctx) return;

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };
        const renderTask = page.render(renderContext);
        renderTasksRef.current.set(pageNum, renderTask);

        await renderTask.promise;
        setRenderedPages((prev) => new Set(prev).add(pageNum));
      } catch (e: any) {
        if (e?.name !== 'RenderingCancelledException') {
          console.warn(`Render error on page ${pageNum}:`, e);
        }
      } finally {
        renderTasksRef.current.delete(pageNum);
      }
    },
    [pdfDoc, computedPageWidth, isCloudinary]
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
    pageAspectRatio,
    fitWidthScale,
    computedPageWidth,
    isMobile,
    setPageAspectRatio,
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

