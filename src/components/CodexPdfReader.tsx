'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DetailedBook, BookChapter } from '@/types/bookContent';

interface CodexPdfReaderProps {
  book: DetailedBook;
  pdfUrl?: string;
  initialPage?: number;
  onClose?: () => void;
  onJumpToChapter?: (chapter: BookChapter) => void;
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
  onClose,
  onJumpToChapter,
}) => {
  const [totalPages, setTotalPages] = useState<number>(book.pages || 631);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageInputValue, setPageInputValue] = useState<string>(String(initialPage));
  const [scale, setScale] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [chapterFilter, setChapterFilter] = useState<string>('');
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loadingDoc, setLoadingDoc] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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
        const viewport = page.getViewport({ scale });
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
    [pdfDoc, scale, isCloudinary]
  );

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
  }, [viewMode, totalPages, renderPage, renderedPages, isCloudinary, pdfDoc]);

  // Jump to specific page
  const scrollToPage = (pageNum: number) => {
    const clamped = Math.max(1, Math.min(pageNum, totalPages));
    setCurrentPage(clamped);
    setPageInputValue(String(clamped));

    if (viewMode === 'pdf') {
      const el = document.getElementById(`pdf-page-slot-${clamped}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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
  };

  return (
    <div
      className={`flex flex-col bg-[#141b17] text-[#e8f0ec] overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-screen'
          : 'h-[88vh] min-h-[640px] w-full rounded-2xl border border-[#cba72f]/40 shadow-2xl'
      }`}
    >
      {/* Top Header & Navigation Bar */}
      <div className="bg-[#0e1411] px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#25332a] flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
        {/* Left: Book Meta & Sidebar Toggle */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              sidebarOpen
                ? 'bg-[#cba72f] text-black font-bold shadow-md shadow-[#cba72f]/20'
                : 'hover:bg-[#1f2b23] text-[#9eb5aa]'
            }`}
            title="Toggle Chapters / Table of Contents"
          >
            <span className="material-symbols-outlined text-base">format_list_bulleted</span>
            <span className="hidden md:inline">Index &amp; Chapters</span>
            <span className="px-1.5 py-0.2 bg-black/20 rounded-full text-[10px]">
              {chapters.length}
            </span>
          </button>

          <div className="min-w-0 truncate">
            <h3 className="font-display text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {book.title}
            </h3>
            <p className="font-arabic text-[11px] sm:text-xs text-[#cba72f] truncate">
              {book.arabicTitle}
            </p>
          </div>
        </div>

        {/* Center: Dynamic Page Number & Quick Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#17221c] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#27372d] shadow-inner">
          <button
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-[#25332b] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer text-[#a5bbb0]"
            title="Previous Page"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#8ba295] hidden sm:inline">Page</span>
            <input
              type="text"
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              className="w-12 text-center py-0.5 px-1 bg-[#0b100d] border border-[#33443a] rounded text-[#f7eed4] font-bold focus:outline-none focus:border-[#cba72f]"
            />
            <span className="text-[#8ba295]">/ {totalPages}</span>
            <button
              type="submit"
              className="px-2 py-0.5 bg-[#cba72f]/20 hover:bg-[#cba72f]/40 text-[#f7eed4] rounded text-[10px] font-bold cursor-pointer"
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
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>

        {/* Right: View Mode & Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#17221c] p-0.5 rounded-lg border border-[#27372d] text-xs">
            <button
              onClick={() => setViewMode('pdf')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'pdf'
                  ? 'bg-[#cba72f] text-black font-bold shadow-xs'
                  : 'text-[#9eb5aa] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              <span className="hidden sm:inline">Facsimile Codex ({totalPages} Pgs)</span>
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'text'
                  ? 'bg-[#cba72f] text-black font-bold shadow-xs'
                  : 'text-[#9eb5aa] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">auto_stories</span>
              <span className="hidden sm:inline">Matn &amp; Translation</span>
            </button>
          </div>

          {/* Zoom controls for PDF */}
          {viewMode === 'pdf' && (
            <div className="hidden lg:flex items-center bg-[#17221c] p-0.5 rounded-lg border border-[#27372d]">
              <button
                onClick={() => setScale((s) => Math.max(0.7, s - 0.15))}
                className="p-1 text-[#9eb5aa] hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <span className="text-[11px] font-mono px-1.5 text-white">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
                className="p-1 text-[#9eb5aa] hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          )}

          {/* Fullscreen Mode Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-[#1f2b23] text-[#9eb5aa] hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader Studio'}
          >
            <span className="material-symbols-outlined text-base">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-rose-950/60 text-[#9eb5aa] hover:text-rose-300 transition-colors cursor-pointer"
              title="Close Reader"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Area: Sidebar + Reading Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Table of Contents / Chapters Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 sm:w-80 md:w-88 bg-[#111814] border-r border-[#25332a] flex flex-col shrink-0 animate-fade-in z-20">
            <div className="p-3 border-b border-[#25332a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#cba72f] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  Treatise Chapters ({chapters.length})
                </span>
                <span className="text-[10px] text-[#8ba295] font-mono">1–{totalPages} Pgs</span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#688274] text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter chapters or topics..."
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
        )}

        {/* Main Canvas Area */}
        <main
          ref={containerRef}
          className="flex-1 overflow-y-auto bg-[#0a0e0c] p-3 sm:p-6 relative scroll-smooth"
        >
          {viewMode === 'pdf' ? (
            /* Continuous PDF Page Stream */
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
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
                    onClick={() => setViewMode('text')}
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
                      className="pdf-page-slot relative bg-[#fdfcf9] text-black rounded-xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col items-center border border-[#d5c3aa] transition-transform w-full"
                      style={{ maxWidth: `${820 * scale}px` }}
                    >
                      {/* Page Header Ribbon */}
                      <div className="w-full bg-[#f4ece1] text-[#3d2e1a] px-4 py-1.5 text-[11px] font-mono flex items-center justify-between border-b border-[#e2d5c3] select-none">
                        <span className="font-semibold truncate max-w-[250px]">{book.title}</span>
                        <span className="font-bold bg-[#e2d5c3] px-2 py-0.5 rounded text-[#2c2010]">
                          Page {pageNum} of {totalPages}
                        </span>
                      </div>

                      {/* Continuous Surface: High-Res Cloudinary CDN Image OR Canvas */}
                      {isCloudinary ? (
                        <div className="w-full relative flex items-center justify-center bg-white min-h-[500px]">
                          <img
                            src={getCloudinaryPageUrl(effectivePdfUrl, pageNum)}
                            alt={`Page ${pageNum} - ${book.title}`}
                            loading="lazy"
                            className="w-full h-auto object-contain block select-none pointer-events-none"
                            style={{ transformOrigin: 'top center' }}
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
            <div className="max-w-3xl mx-auto space-y-6">
              {activeChapter ? (
                <div className="bg-[#141d18] rounded-2xl p-6 sm:p-8 border border-[#2a3830] shadow-xl space-y-6">
                  {/* Chapter Header */}
                  <div className="text-center pb-6 border-b border-[#2a3830] space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cba72f]/15 text-[#cba72f] font-mono text-xs font-bold border border-[#cba72f]/30">
                      Chapter {activeChapter.number} • Starting on Page {activeChapter.startPage}
                    </span>
                    <h2 className="font-arabic text-3xl font-bold text-[#f7eed4] mt-2">
                      {activeChapter.arabicTitle}
                    </h2>
                    <h3 className="font-display text-lg font-bold text-white">
                      {activeChapter.title}
                    </h3>
                  </div>

                  {/* Arabic Matn Box */}
                  <div
                    className="p-6 rounded-2xl bg-gradient-to-br from-[#19241e] to-[#0f1713] border-2 border-[#cba72f]/40 shadow-lg text-right"
                    dir="rtl"
                  >
                    <span className="block text-xs font-bold text-[#cba72f] mb-3 font-sans">
                      النص الأصلي بالتشكيل الكامل
                    </span>
                    <p className="font-arabic text-xl sm:text-2xl text-[#f3f9f5] leading-loose whitespace-pre-line font-medium">
                      {activeChapter.content || 'لا يوجد نص مدخل'}
                    </p>
                  </div>

                  {/* Urdu / English Translation */}
                  {activeChapter.translation && (
                    <div className="p-5 rounded-xl bg-[#101713] border border-[#2a3830] space-y-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                        Translation / ترجمہ
                      </span>
                      <p className="text-sm sm:text-base text-[#dce7e1] leading-relaxed whitespace-pre-line">
                        {activeChapter.translation}
                      </p>
                    </div>
                  )}

                  {/* Scholarly Commentary & Notes */}
                  {activeChapter.notes && (
                    <div className="p-4 rounded-xl bg-[#0c130f] border border-[#223026] text-xs text-[#9eb5aa] space-y-1">
                      <span className="font-bold text-[#cba72f] block">Scholarly Notes / حواشی:</span>
                      <p>{activeChapter.notes}</p>
                    </div>
                  )}

                  {/* Chapter Navigation Buttons */}
                  <div className="pt-4 flex items-center justify-between border-t border-[#2a3830]">
                    <button
                      onClick={() => {
                        const prevIdx = chapters.findIndex((c) => c.number === activeChapter.number) - 1;
                        if (prevIdx >= 0) handleChapterClick(chapters[prevIdx]);
                      }}
                      disabled={chapters.findIndex((c) => c.number === activeChapter.number) === 0}
                      className="px-4 py-2 rounded-xl bg-[#1e2a22] hover:bg-[#28382d] text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                      ← Previous Chapter
                    </button>
                    <span className="text-xs text-[#8ba295] font-mono">
                      {activeChapter.number} of {chapters.length}
                    </span>
                    <button
                      onClick={() => {
                        const nextIdx = chapters.findIndex((c) => c.number === activeChapter.number) + 1;
                        if (nextIdx < chapters.length) handleChapterClick(chapters[nextIdx]);
                      }}
                      disabled={
                        chapters.findIndex((c) => c.number === activeChapter.number) === chapters.length - 1
                      }
                      className="px-4 py-2 rounded-xl bg-[#cba72f] text-black text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                      Next Chapter →
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
      <div className="bg-[#0b100d] px-4 py-2 border-t border-[#25332a] flex items-center justify-between text-xs text-[#8ba295] font-mono select-none">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[#cba72f] font-bold truncate">
            {activeChapter ? `${activeChapter.number}. ${activeChapter.title}` : 'Continuous Codex Stream'}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline">Continuous Reader Active</span>
          <span className="text-white font-bold bg-[#17221c] px-2 py-0.5 rounded border border-[#27372d]">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
};
