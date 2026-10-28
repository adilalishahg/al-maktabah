'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DetailedBook, BookChapter } from '@/types/bookContent';

interface CodexPdfReaderProps {
  book: DetailedBook;
  pdfUrl?: string;
  initialPage?: number;
  externalPage?: number;
  externalScale?: number;
  hideHeader?: boolean;
  sidebarOpenExternal?: boolean;
  onToggleSidebarExternal?: () => void;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
  onJumpToChapter?: (chapter: BookChapter) => void;
  onSwitchToMatn?: () => void;
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

export const CodexPdfReader: React.FC<CodexPdfReaderProps> = ({
  book,
  pdfUrl,
  initialPage = 1,
  externalPage,
  externalScale,
  hideHeader = false,
  sidebarOpenExternal,
  onToggleSidebarExternal,
  onPageChange,
  onClose,
  onJumpToChapter,
  onSwitchToMatn,
}) => {
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

  // Determine active scale and active sidebar state
  const activeScale = externalScale !== undefined ? externalScale : internalScale;
  const isSidebarOpen = sidebarOpenExternal !== undefined ? sidebarOpenExternal : internalSidebarOpen;
  const toggleSidebar = () => {
    if (onToggleSidebarExternal) {
      onToggleSidebarExternal();
    } else {
      setInternalSidebarOpen((prev) => !prev);
    }
  };

  // Set default sidebar open on large desktop only if internal
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && sidebarOpenExternal === undefined) {
      setInternalSidebarOpen(true);
    }
  }, [sidebarOpenExternal]);

  // Active rendered pages tracking
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const effectivePdfUrl = pdfUrl || book.pdfUrl || '';
  const chapters = book.chapters || [];

  // Check if PDF URL is hosted on Cloudinary
  const isCloudinary = Boolean(effectivePdfUrl && effectivePdfUrl.includes('res.cloudinary.com'));

  const getCloudinaryPageUrl = useCallback((url: string, page: number) => {
    if (!url.includes('res.cloudinary.com')) return url;
    // Deliver high-res auto-optimized page image from Cloudinary
    return url
      .replace('/image/upload/', `/image/upload/w_1400,q_auto,f_auto/pg_${page}/`)
      .replace(/\.pdf$/i, '.jpg');
  }, []);

  // Filter chapters in sidebar
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

  // Find active chapter based on current page
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

      // If on Cloudinary, page images stream instantly without heavy client-side download!
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
        if (!pdfjs) throw new Error('PDF.js not available');

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

  // Render a specific page canvas (for non-Cloudinary / local blob URLs)
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

  // Jump to specific page
  const scrollToPage = useCallback(
    (pageNum: number) => {
      const clamped = Math.max(1, Math.min(pageNum, totalPages));
      setCurrentPage(clamped);
      setPageInputValue(String(clamped));
      onPageChange?.(clamped);

      if (viewMode === 'pdf') {
        const el = document.getElementById(`pdf-page-slot-${clamped}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    [totalPages, viewMode, onPageChange]
  );

  // Respond to externalPage changes from parent master bar
  useEffect(() => {
    if (externalPage !== undefined && externalPage !== currentPage) {
      scrollToPage(externalPage);
    }
  }, [externalPage, scrollToPage, currentPage]);

  // Set up intersection observer to detect current page as user scrolls
  useEffect(() => {
    if (viewMode !== 'pdf' || !containerRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute('data-page-num') || '1');
            setCurrentPage(pageNum);
            setPageInputValue(String(pageNum));
            onPageChange?.(pageNum);

            // If using PDF.js canvas, render when visible
            if (!isCloudinary && pdfDoc) {
              const canvas = entry.target.querySelector('canvas');
              if (canvas && !renderedPages.has(pageNum)) {
                renderPage(pageNum, canvas);
              }
            }
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '250px 0px',
        threshold: 0.15,
      }
    );

    observerRef.current = observer;

    // Observe all page slot elements
    const pageSlots = containerRef.current.querySelectorAll('.pdf-page-slot');
    pageSlots.forEach((slot) => observer.observe(slot));

    return () => observer.disconnect();
  }, [viewMode, totalPages, renderPage, renderedPages, isCloudinary, pdfDoc, onPageChange]);

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(pageInputValue);
    if (!isNaN(num)) {
      scrollToPage(num);
    }
  };

  const handleChapterClick = (chapter: BookChapter) => {
    scrollToPage(chapter.startPage);
    onJumpToChapter?.(chapter);
    // Auto close sidebar on mobile when chapter selected
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (onToggleSidebarExternal && sidebarOpenExternal) {
        onToggleSidebarExternal();
      } else {
        setInternalSidebarOpen(false);
      }
    }
  };

  return (
    <div
      className={`flex flex-col bg-[#141b17] text-[#e8f0ec] overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-screen'
          : hideHeader
            ? 'h-[calc(100dvh-9.5rem)] sm:h-[84vh] min-h-[500px] w-full rounded-2xl border border-[#cba72f]/40 shadow-xl'
            : 'h-[calc(100dvh-6.5rem)] sm:h-[86vh] min-h-[520px] w-full rounded-xl sm:rounded-2xl border border-[#cba72f]/40 shadow-2xl mt-2 sm:mt-4 mb-6'
      }`}
    >
      {/* Top Header & Navigation Bar (Fully Device-Responsive & Anti-Colliding) */}
      {!hideHeader && (
        <div className="bg-[#0e1411] px-2.5 sm:px-4 py-2 border-b border-[#25332a] flex flex-col md:flex-row md:items-center md:justify-between gap-2 shrink-0 select-none">
          {/* Top Row on Mobile / Left Group on Desktop */}
          <div className="flex items-center justify-between md:justify-start gap-2 min-w-0 w-full md:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-[#1f2b23] text-[#9eb5aa] hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Back to Catalog"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">arrow_back</span>
                </button>
              )}

              <button
                onClick={toggleSidebar}
                className={`px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                  isSidebarOpen
                    ? 'bg-[#cba72f] text-black font-bold shadow-md shadow-[#cba72f]/20'
                    : 'bg-[#1a251e] hover:bg-[#25332b] text-[#9eb5aa] border border-[#27372d]'
                }`}
                title="Toggle Chapters / Table of Contents"
              >
                <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                <span className="hidden sm:inline">Index &amp; Chapters</span>
                <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-[10px] font-mono font-bold">
                  {chapters.length}
                </span>
              </button>

              {/* Vertical Divider on Desktop */}
              <div className="hidden lg:block w-[1px] h-5 bg-[#25332a] mx-1 shrink-0" />

              {/* Book Title with Safe Margin */}
              <div className="min-w-0 truncate max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md">
                <h3 className="font-display text-xs sm:text-sm font-bold text-white truncate">
                  {book.title}
                </h3>
                <p className="font-arabic text-[10px] sm:text-[11px] text-[#cba72f] truncate leading-tight">
                  {book.arabicTitle}
                </p>
              </div>
            </div>

            {/* Mobile-only Fullscreen Toggle button on Top Row */}
            <div className="flex md:hidden items-center gap-1 shrink-0">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg hover:bg-[#1f2b23] text-[#9eb5aa] hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                <span className="material-symbols-outlined text-base">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Row on Mobile / Right Group on Desktop */}
          <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2.5 w-full md:w-auto pt-1.5 md:pt-0 border-t md:border-t-0 border-[#25332a]/70">
            {/* Dynamic Page Number & Quick Navigation Box */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-[#17221c] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl border border-[#27372d] shadow-inner shrink-0">
              <button
                onClick={() => scrollToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1 rounded hover:bg-[#25332b] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer text-[#a5bbb0]"
                title="Previous Page"
              >
                <span className="material-symbols-outlined text-sm sm:text-base">chevron_left</span>
              </button>

              <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 text-xs font-mono">
                <input
                  type="text"
                  value={pageInputValue}
                  onChange={(e) => setPageInputValue(e.target.value)}
                  className="w-9 sm:w-12 text-center py-0.5 px-0.5 bg-[#0b100d] border border-[#33443a] rounded text-[#f7eed4] font-bold text-xs focus:outline-none focus:border-[#cba72f]"
                />
                <span className="text-[#8ba295] text-[11px] sm:text-xs">/ {totalPages}</span>
                <button
                  type="submit"
                  className="hidden sm:inline px-1.5 py-0.5 bg-[#cba72f]/20 hover:bg-[#cba72f]/40 text-[#f7eed4] rounded text-[10px] font-bold cursor-pointer"
                >
                  Go
                </button>
              </form>

              <button
                onClick={() => scrollToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1 rounded hover:bg-[#25332b] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer text-[#a5bbb0]"
                title="Next Page"
              >
                <span className="material-symbols-outlined text-sm sm:text-base">chevron_right</span>
              </button>
            </div>

            {/* View Mode Switcher Toggle */}
            <div className="flex items-center bg-[#17221c] p-0.5 rounded-lg border border-[#27372d] text-xs shrink-0">
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  viewMode === 'pdf'
                    ? 'bg-[#cba72f] text-black font-bold shadow-xs'
                    : 'text-[#9eb5aa] hover:text-white'
                }`}
                title="Facsimile Manuscript Pages"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                <span className="hidden sm:inline">Codex ({totalPages})</span>
              </button>
              <button
                onClick={() => {
                  if (onSwitchToMatn) {
                    onSwitchToMatn();
                  } else {
                    setViewMode('text');
                  }
                }}
                className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  viewMode === 'text'
                    ? 'bg-[#cba72f] text-black font-bold shadow-xs'
                    : 'text-[#9eb5aa] hover:text-white'
                }`}
                title="Arabic Matn & Translation"
              >
                <span className="material-symbols-outlined text-sm">auto_stories</span>
                <span className="hidden sm:inline">Matn</span>
              </button>
            </div>

            {/* Interactive Zoom Controls (Always visible on mobile & desktop!) */}
            {viewMode === 'pdf' && (
              <div className="flex items-center bg-[#17221c] p-0.5 rounded-lg border border-[#27372d] text-xs shrink-0">
                <button
                  onClick={() => setInternalScale((s) => Math.max(0.6, Number((s - 0.15).toFixed(2))))}
                  className="p-1 text-[#9eb5aa] hover:text-white cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span
                  onClick={() => setInternalScale(1.0)}
                  className="text-[11px] font-mono px-1 sm:px-1.5 text-white font-bold cursor-pointer hover:underline"
                  title="Click to Reset Zoom (100%)"
                >
                  {Math.round(activeScale * 100)}%
                </span>
                <button
                  onClick={() => setInternalScale((s) => Math.min(2.5, Number((s + 0.15).toFixed(2))))}
                  className="p-1 text-[#9eb5aa] hover:text-white cursor-pointer"
                  title="Zoom In (+)"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            )}

            {/* Desktop Fullscreen Mode Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-[#1f2b23] text-[#9eb5aa] hover:text-white transition-colors cursor-pointer shrink-0"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader Studio'}
            >
              <span className="material-symbols-outlined text-base">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Dual Area: Sidebar Drawer + Reading Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/75 backdrop-blur-xs z-30 animate-fade-in"
            onClick={toggleSidebar}
          />
        )}

        {/* Left Table of Contents / Chapters Sidebar Drawer */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-4/5 max-w-xs md:max-w-sm md:static md:w-80 md:z-20
            bg-[#111814] border-r border-[#25332a] flex flex-col shrink-0 transition-transform duration-300 ease-in-out shadow-2xl
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}
          `}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-b border-[#25332a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#cba72f] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">menu_book</span>
                Treatise Chapters ({chapters.length})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8ba295] font-mono">1–{totalPages} Pgs</span>
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-lg hover:bg-[#1f2b23] text-[#8ba295] hover:text-white md:hidden cursor-pointer"
                  title="Close Chapters Drawer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#688274] text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Filter chapters or abwāb..."
                value={chapterFilter}
                onChange={(e) => setChapterFilter(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-[#0a0f0c] border border-[#25332a] text-xs text-white placeholder:text-[#556b60] focus:outline-none focus:border-[#cba72f]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
            {filteredChapters.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#688274]">
                No matching chapters found.
              </div>
            ) : (
              filteredChapters.map((ch, idx) => {
                const isActive = activeChapter?.number === ch.number;
                return (
                  <div
                    key={ch.id || idx}
                    onClick={() => handleChapterClick(ch)}
                    className={`p-2.5 rounded-xl text-xs transition-all cursor-pointer flex flex-col gap-1 border ${
                      isActive
                        ? 'bg-gradient-to-r from-[#0b3b2d] to-[#124b3b] text-white border-[#cba72f] shadow-md shadow-emerald-950/40 ring-1 ring-[#cba72f]/40'
                        : 'bg-[#151f19] text-[#c3d4cb] border-[#1e2a22] hover:bg-[#1c2921] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[#f7eed4] truncate">
                        {ch.number}. {ch.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-[#cba72f] shrink-0">
                        p.{ch.startPage}
                      </span>
                    </div>
                    {ch.arabicTitle && (
                      <p className="font-arabic text-right text-xs text-[#a9c9bb] leading-tight truncate">
                        {ch.arabicTitle}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Canvas Area (Full Width on Mobile with Pan & Zoom support) */}
        <main
          ref={containerRef}
          className="flex-1 overflow-x-auto overflow-y-auto bg-[#0a0e0c] p-1 sm:p-4 md:p-6 relative scroll-smooth w-full"
        >
          {viewMode === 'pdf' ? (
            /* Continuous PDF Page Stream */
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-3 sm:gap-6 w-full">
              {loadingDoc && (
                <div className="py-24 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full border-3 border-[#cba72f]/30 border-t-[#cba72f] animate-spin"></div>
                  <p className="text-xs text-[#9eb5aa]">Streaming PDF pages directly from codex...</p>
                </div>
              )}

              {loadError && !isCloudinary && (
                <div className="p-6 bg-rose-950/30 border border-rose-800 rounded-2xl text-center space-y-2 max-w-md">
                  <span className="material-symbols-outlined text-3xl text-rose-400">error</span>
                  <h4 className="font-title-md font-bold text-white">Could not stream PDF file directly</h4>
                  <p className="text-xs text-[#c3d4cb]">{loadError}</p>
                  <button
                    onClick={() => {
                      if (onSwitchToMatn) onSwitchToMatn();
                      else setViewMode('text');
                    }}
                    className="mt-2 px-4 py-2 bg-[#cba72f] text-black rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Read Extracted Matn & Chapters Instead
                  </button>
                </div>
              )}

              {(!loadingDoc || isCloudinary) && (
                <>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <div
                      key={pageNum}
                      id={`pdf-page-slot-${pageNum}`}
                      data-page-num={pageNum}
                      className="pdf-page-slot relative bg-[#fdfcf9] text-black rounded-lg sm:rounded-xl shadow-lg overflow-hidden min-h-[350px] flex flex-col items-center border border-[#d5c3aa] transition-transform w-full mx-auto"
                      style={{ maxWidth: `${820 * activeScale}px` }}
                    >
                      {/* Page Header Ribbon */}
                      <div className="w-full bg-[#f4ece1] text-[#3d2e1a] px-2.5 sm:px-4 py-1 text-[10px] sm:text-[11px] font-mono flex items-center justify-between border-b border-[#e2d5c3] select-none">
                        <span className="font-semibold truncate max-w-[180px] sm:max-w-[280px]">
                          {book.title}
                        </span>
                        <span className="font-bold bg-[#e2d5c3] px-1.5 py-0.2 rounded text-[#2c2010]">
                          p.{pageNum} / {totalPages}
                        </span>
                      </div>

                      {/* Continuous Surface: High-Res Cloudinary CDN Image OR Canvas */}
                      {isCloudinary ? (
                        <div className="w-full relative flex items-center justify-center bg-white min-h-[350px] overflow-hidden">
                          <img
                            src={getCloudinaryPageUrl(effectivePdfUrl, pageNum)}
                            alt={`Page ${pageNum} - ${book.title}`}
                            loading="lazy"
                            className="w-full h-auto object-contain block select-none"
                            style={{
                              transform: activeScale > 1.0 ? `scale(${activeScale})` : undefined,
                              transformOrigin: 'top center',
                            }}
                          />
                        </div>
                      ) : (
                        <canvas className="w-full h-auto object-contain block bg-white" />
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            /* Structured Matn & Parallel Text View */
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
              {activeChapter ? (
                <div className="bg-[#141d18] rounded-2xl p-4 sm:p-8 border border-[#2a3830] shadow-xl space-y-4 sm:space-y-6">
                  {/* Chapter Header */}
                  <div className="text-center pb-4 sm:pb-6 border-b border-[#2a3830] space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#cba72f]/15 text-[#cba72f] font-mono text-[11px] font-bold border border-[#cba72f]/30">
                      Chapter {activeChapter.number} • Starting on Page {activeChapter.startPage}
                    </span>
                    <h2 className="font-arabic text-2xl sm:text-3xl font-bold text-[#f7eed4] mt-1">
                      {activeChapter.arabicTitle}
                    </h2>
                    <h3 className="font-display text-sm sm:text-lg font-bold text-white">
                      {activeChapter.title}
                    </h3>
                  </div>

                  {/* Arabic Matn Box */}
                  <div
                    className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#19241e] to-[#0f1713] border-2 border-[#cba72f]/40 shadow-lg text-right"
                    dir="rtl"
                  >
                    <span className="block text-xs font-bold text-[#cba72f] mb-2 sm:mb-3 font-sans">
                      النص الأصلي بالتشكيل الكامل
                    </span>
                    <p className="font-arabic text-lg sm:text-2xl text-[#f3f9f5] leading-loose whitespace-pre-line font-medium">
                      {activeChapter.content || 'لا يوجد نص مدخل'}
                    </p>
                  </div>

                  {/* Urdu / English Translation */}
                  {activeChapter.translation && (
                    <div className="p-4 sm:p-5 rounded-xl bg-[#101713] border border-[#2a3830] space-y-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                        Translation / ترجمہ
                      </span>
                      <p className="text-xs sm:text-base text-[#dce7e1] leading-relaxed whitespace-pre-line">
                        {activeChapter.translation}
                      </p>
                    </div>
                  )}

                  {/* Scholarly Commentary & Notes */}
                  {activeChapter.notes && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-[#0c130f] border border-[#223026] text-xs text-[#9eb5aa] space-y-1">
                      <span className="font-bold text-[#cba72f] block">Scholarly Notes / حواشی:</span>
                      <p>{activeChapter.notes}</p>
                    </div>
                  )}

                  {/* Chapter Navigation Buttons */}
                  <div className="pt-3 sm:pt-4 flex items-center justify-between border-t border-[#2a3830]">
                    <button
                      onClick={() => {
                        const prevIdx = chapters.findIndex((c) => c.number === activeChapter.number) - 1;
                        if (prevIdx >= 0) handleChapterClick(chapters[prevIdx]);
                      }}
                      disabled={chapters.findIndex((c) => c.number === activeChapter.number) === 0}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#1e2a22] hover:bg-[#28382d] text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs text-[#8ba295] font-mono">
                      {activeChapter.number} / {chapters.length}
                    </span>
                    <button
                      onClick={() => {
                        const nextIdx = chapters.findIndex((c) => c.number === activeChapter.number) + 1;
                        if (nextIdx < chapters.length) handleChapterClick(chapters[nextIdx]);
                      }}
                      disabled={
                        chapters.findIndex((c) => c.number === activeChapter.number) === chapters.length - 1
                      }
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#cba72f] text-black text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-[#8ba295]">
                  Select a chapter from the sidebar to inspect its Matn and translation.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Sticky Bottom Indicator Pill */}
      <div className="bg-[#0b100d] px-3 sm:px-4 py-1.5 sm:py-2 border-t border-[#25332a] flex items-center justify-between text-xs text-[#8ba295] font-mono select-none">
        <div className="flex items-center gap-1.5 truncate max-w-[50%]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="text-[#cba72f] font-bold truncate text-[11px] sm:text-xs">
            {activeChapter ? `${activeChapter.number}. ${activeChapter.title}` : 'Codex Stream'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <span className="text-white font-bold bg-[#17221c] px-2 py-0.5 rounded border border-[#27372d] text-[11px]">
            p.{currentPage} / {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
};
