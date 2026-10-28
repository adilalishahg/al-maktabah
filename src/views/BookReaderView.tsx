'use client';

import React, { useState, useEffect } from 'react';
import { DetailedBook, BookChapter } from '../types/bookContent';
import { ReaderTheme } from '../types/library';
import { CodexPdfReader } from '@/components/CodexPdfReader';

interface BookReaderViewProps {
  book: DetailedBook;
  initialChapterId?: string;
  onNavigate: (path: string) => void;
  onOpenAdminEdit?: (book: DetailedBook) => void;
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
}

export const BookReaderView: React.FC<BookReaderViewProps> = ({
  book,
  initialChapterId,
  onNavigate,
  onOpenAdminEdit,
  theme,
  onThemeChange,
}) => {
  const chapters = book.chapters || [];
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
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

  const activeChapter: BookChapter = chapters[currentChapterIndex] || {
    id: 'c1',
    number: 1,
    title: 'Chapter 1',
    arabicTitle: 'الفصل الأول',
    startPage: 1,
    content: 'لا يوجد نص مدخل بعد.',
  };

  useEffect(() => {
    setPageInput(String(activeChapter.startPage || 1));
  }, [currentChapterIndex, activeChapter]);

  // Jump to specific page
  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPage = parseInt(pageInput);
    if (isNaN(targetPage) || targetPage < 1) return;

    // Find closest chapter that starts at or before targetPage
    let bestIdx = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].startPage <= targetPage) {
        bestIdx = i;
      } else {
        break;
      }
    }
    setCurrentChapterIndex(bestIdx);
  };

  const handlePageChange = (pageNum: number) => {
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
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyText = () => {
    const textToCopy = `${activeChapter.arabicTitle}\n\n${activeChapter.content}\n\n— ${book.title} (p. ${activeChapter.startPage})`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="mt-1 sm:mt-2 space-y-3 sm:space-y-4 animate-fade-in pb-16">
      {/* Sleek Master Reader Toolbar (Device-Responsive: 2-Tier on Mobile, 1-Tier on Desktop) */}
      <div className="sticky top-[86px] sm:top-[106px] z-30 bg-surface-container-lowest/95 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-surface-container shadow-md select-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
          {/* Group 1: Navigation, Chapter TOC Drawer Button & Book Title */}
          <div className="flex items-center justify-between md:justify-start gap-1.5 sm:gap-2.5 min-w-0 w-full md:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <button
                onClick={() => onNavigate('browse-library')}
                className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
                title="Back to Catalog"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">arrow_back</span>
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
                  sidebarOpen
                    ? 'bg-primary text-on-primary ring-2 ring-primary/20'
                    : 'bg-surface-container hover:bg-surface-container-high text-primary'
                }`}
                title="Table of Contents (Chapters)"
              >
                <span className="material-symbols-outlined text-sm sm:text-base">menu_book</span>
                <span className="hidden sm:inline">Index &amp; Chapters</span>
                <span className="bg-primary-container text-on-primary px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold">
                  {chapters.length}
                </span>
              </button>

              <div className="hidden lg:block w-[1px] h-5 bg-surface-container shrink-0 mx-0.5" />

              <div className="min-w-0 truncate">
                <h1 className="font-title-md font-bold text-xs sm:text-sm text-primary truncate max-w-[130px] sm:max-w-xs md:max-w-sm">
                  {book.title}
                </h1>
                <span className="text-[10px] sm:text-[11px] text-tertiary font-arabic truncate block leading-tight">
                  {book.arabicTitle}
                </span>
              </div>
            </div>

            {/* Mobile-only Mode Switcher on Top Row */}
            <div className="flex md:hidden items-center bg-surface-container-low rounded-xl p-0.5 border border-surface-container shrink-0">
              <button
                onClick={() => setReadingFormat('facsimile')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  readingFormat === 'facsimile'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Facsimile Continuous Manuscript"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                <span className="hidden xs:inline">Codex</span>
              </button>
              <button
                onClick={() => setReadingFormat('matn')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  readingFormat === 'matn'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Digitized Arabic Matn & Translation"
              >
                <span className="material-symbols-outlined text-sm">auto_stories</span>
                <span className="hidden xs:inline">Matn</span>
              </button>
            </div>
          </div>

          {/* Group 2: Center Page Jump Box on Desktop */}
          <div className="hidden md:flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-xl border border-surface-container shrink-0">
            <button
              type="button"
              onClick={() => {
                const prev = Math.max(1, parseInt(pageInput || '1') - 1);
                handlePageChange(prev);
              }}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface cursor-pointer"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            <form onSubmit={handleJumpToPage} className="flex items-center gap-1 text-xs font-mono">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold">P.</span>
              <input
                type="number"
                min="1"
                max={book.pages || 5000}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="w-12 px-1.5 py-0.5 rounded bg-surface-container-lowest border border-surface-container text-xs text-center font-mono font-bold text-primary focus:outline-none focus:border-primary"
              />
              <span className="text-[11px] text-on-surface-variant">/ {book.pages || 631}</span>
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-primary-container text-on-primary text-[10px] font-bold hover:bg-primary cursor-pointer"
              >
                Go
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                const next = Math.min(book.pages || 631, parseInt(pageInput || '1') + 1);
                handlePageChange(next);
              }}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface cursor-pointer"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          {/* Group 3: Row 2 on Mobile (Page Jump + Zoom + Themes) / Right Group on Desktop */}
          <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2.5 pt-1.5 md:pt-0 border-t md:border-t-0 border-surface-container/70 w-full md:w-auto">
            {/* Mobile Page Jump Controls */}
            <div className="flex md:hidden items-center gap-0.5 bg-surface-container-low px-1.5 py-0.5 rounded-xl border border-surface-container shrink-0">
              <button
                type="button"
                onClick={() => {
                  const prev = Math.max(1, parseInt(pageInput || '1') - 1);
                  handlePageChange(prev);
                }}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface cursor-pointer"
                title="Previous Page"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              <form onSubmit={handleJumpToPage} className="flex items-center gap-1 text-xs font-mono">
                <input
                  type="number"
                  min="1"
                  max={book.pages || 5000}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className="w-10 px-1 py-0.5 rounded bg-surface-container-lowest border border-surface-container text-xs text-center font-mono font-bold text-primary focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-on-surface-variant">/ {book.pages || 631}</span>
                <button
                  type="submit"
                  className="px-1.5 py-0.5 rounded bg-primary-container text-on-primary text-[10px] font-bold hover:bg-primary cursor-pointer"
                >
                  Go
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  const next = Math.min(book.pages || 631, parseInt(pageInput || '1') + 1);
                  handlePageChange(next);
                }}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface cursor-pointer"
                title="Next Page"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            {/* Desktop Mode Switcher */}
            <div className="hidden md:flex items-center bg-surface-container-low rounded-xl p-0.5 border border-surface-container shrink-0">
              <button
                onClick={() => setReadingFormat('facsimile')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  readingFormat === 'facsimile'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Facsimile Continuous Manuscript"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                <span>Codex ({book.pages || 631})</span>
              </button>
              <button
                onClick={() => setReadingFormat('matn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  readingFormat === 'matn'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Digitized Arabic Matn & Translation"
              >
                <span className="material-symbols-outlined text-sm">auto_stories</span>
                <span>Matn</span>
              </button>
            </div>

            {/* Interactive Zoom Controls (Always Visible on Mobile & Desktop) */}
            <div className="flex items-center bg-surface-container-low rounded-xl px-1 py-0.5 border border-surface-container shadow-xs shrink-0">
              <button
                onClick={() => {
                  setZoomScale((s) => Math.max(0.6, Number((s - 0.15).toFixed(2))));
                  setFontSize((f) => Math.max(16, f - 2));
                }}
                className="p-1 rounded text-on-surface hover:bg-surface-container cursor-pointer transition-colors"
                title="Zoom Out (-)"
              >
                <span className="material-symbols-outlined text-sm">zoom_out</span>
              </button>

              <span
                onClick={() => {
                  setZoomScale(1.0);
                  setFontSize(22);
                }}
                className="px-1 text-[11px] font-mono font-bold text-primary cursor-pointer hover:underline"
                title="Click to Reset Zoom (100%)"
              >
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                onClick={() => {
                  setZoomScale((s) => Math.min(2.5, Number((s + 0.15).toFixed(2))));
                  setFontSize((f) => Math.min(36, f + 2));
                }}
                className="p-1 rounded text-on-surface hover:bg-surface-container cursor-pointer transition-colors"
                title="Zoom In (+)"
              >
                <span className="material-symbols-outlined text-sm">zoom_in</span>
              </button>

              <button
                onClick={() => {
                  setZoomScale(1.0);
                  setFontSize(22);
                }}
                className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant cursor-pointer ml-0.5 font-semibold"
                title="Fit to Width (100%)"
              >
                Fit
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center bg-surface-container-low rounded-xl p-0.5 border border-surface-container shrink-0">
              <button
                onClick={() => onThemeChange('parchment')}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  theme === 'parchment' ? 'bg-surface-container-lowest shadow-xs text-primary' : 'text-on-surface-variant'
                }`}
                title="Light Theme"
              >
                <span className="material-symbols-outlined text-sm text-tertiary">light_mode</span>
              </button>
              <button
                onClick={() => onThemeChange('sepia')}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  theme === 'sepia' ? 'bg-surface-container-lowest shadow-xs text-primary' : 'text-on-surface-variant'
                }`}
                title="Sepia Paper"
              >
                <span className="material-symbols-outlined text-sm text-tertiary">auto_stories</span>
              </button>
              <button
                onClick={() => onThemeChange('night')}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  theme === 'night' ? 'bg-surface-container-lowest shadow-xs text-primary' : 'text-on-surface-variant'
                }`}
                title="Dark Emerald"
              >
                <span className="material-symbols-outlined text-sm text-primary">dark_mode</span>
              </button>
            </div>

            {/* Admin Edit Shortcut */}
            {onOpenAdminEdit && (
              <button
                onClick={() => onOpenAdminEdit(book)}
                className="p-1.5 rounded-xl bg-surface-container-low text-primary hover:bg-surface-container border border-surface-container transition-colors cursor-pointer shrink-0"
                title="Edit in Admin Dashboard"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reader Body: Continuous Facsimile PDF Codex OR Classical Matn View */}
      {readingFormat === 'facsimile' ? (
        <div className="w-full">
          <CodexPdfReader
            book={book}
            pdfUrl={book.pdfUrl}
            hideHeader={true}
            externalScale={zoomScale}
            externalPage={parseInt(pageInput) || 1}
            sidebarOpenExternal={sidebarOpen}
            onToggleSidebarExternal={() => setSidebarOpen(!sidebarOpen)}
            onPageChange={(p) => setPageInput(String(p))}
            onSwitchToMatn={() => setReadingFormat('matn')}
            onClose={() => onNavigate('browse-library')}
          />
        </div>
      ) : (
        /* Classical Matn View with Chapters Drawer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chapters / Table of Contents Sidebar */}
          <aside
            className={`lg:col-span-4 bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm space-y-3 transition-all ${
              sidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">toc</span>
                <h2 className="font-title-md font-bold text-sm text-primary">
                  Table of Contents (فهرس الأبواب)
                </h2>
              </div>
              <span className="text-[11px] text-on-surface-variant font-mono">
                {chapters.length} Chapters
              </span>
            </div>

            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {chapters.map((ch, idx) => {
                const isSelected = idx === currentChapterIndex;
                return (
                  <div
                    key={ch.id || idx}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-primary-container text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-low/40 hover:bg-surface-container border-surface-container text-on-surface'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-tertiary-fixed' : 'text-tertiary'}`}>
                          Ch. {ch.number}
                        </span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                          p.{ch.startPage}
                        </span>
                      </div>
                      <div className="font-title-md font-semibold text-xs leading-snug truncate mt-0.5">
                        {ch.title}
                      </div>
                      <div className={`font-arabic text-sm font-semibold truncate ${isSelected ? 'text-on-primary' : 'text-primary'}`}>
                        {ch.arabicTitle}
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-sm shrink-0 ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                      chevron_right
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main Book Reader Canvas */}
          <main className="lg:col-span-8 space-y-6">
            {/* Active Chapter Card */}
            <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Chapter Meta Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-surface-container">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-surface-container text-tertiary uppercase">
                      Chapter {activeChapter.number}
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">
                      Page {activeChapter.startPage}
                    </span>
                  </div>
                  <h2 className="font-title-md font-bold text-lg sm:text-xl text-primary">
                    {activeChapter.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    title="Copy Text to Clipboard"
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedNotification ? 'check' : 'content_copy'}
                    </span>
                    <span className="hidden sm:inline">
                      {copiedNotification ? 'Copied' : 'Copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Arabic Heading */}
              <div className="text-right" dir="rtl">
                <h3 className="font-arabic text-2xl sm:text-3xl font-bold text-primary leading-snug">
                  {activeChapter.arabicTitle}
                </h3>
              </div>

              {/* Primary Arabic Matn Box */}
              <div
                dir="rtl"
                className="font-arabic text-primary leading-[2.4] text-right p-6 sm:p-8 rounded-2xl bg-surface-container-low/30 border border-surface-container font-medium whitespace-pre-line tracking-wide"
                style={{ fontSize: `${fontSize}px` }}
              >
                {activeChapter.content || 'لا يوجد نص مدخل لهذا الباب بعد.'}
              </div>

              {/* English Translation Stream */}
              {showTranslation && activeChapter.translation && (
                <div className="p-6 rounded-2xl bg-surface-container-low/50 border border-surface-container space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tertiary">
                    <span className="material-symbols-outlined text-sm">translate</span>
                    <span>Translation / ترجمة</span>
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line">
                    {activeChapter.translation}
                  </p>
                </div>
              )}

              {/* Scholarly Footnotes & Commentary */}
              {showNotes && activeChapter.notes && (
                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-dashed border-surface-container space-y-1.5 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1.5 font-bold text-primary">
                    <span className="material-symbols-outlined text-sm">notes</span>
                    <span>Footnotes &amp; Isnād Notes (تنبيهات الإسناد)</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{activeChapter.notes}</p>
                </div>
              )}
            </div>

            {/* Bottom Chapter Pager Navigation */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
              <button
                onClick={handlePrevChapter}
                disabled={currentChapterIndex === 0}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentChapterIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-surface-container text-on-surface-variant'
                    : 'bg-surface-container hover:bg-surface-container-high text-primary cursor-pointer'
                }`}
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Previous Chapter</span>
              </button>

              <span className="text-xs font-mono font-semibold text-on-surface-variant">
                Chapter {currentChapterIndex + 1} of {chapters.length}
              </span>

              <button
                onClick={handleNextChapter}
                disabled={currentChapterIndex === chapters.length - 1}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentChapterIndex === chapters.length - 1
                    ? 'opacity-40 cursor-not-allowed bg-surface-container text-on-surface-variant'
                    : 'bg-primary-container hover:bg-primary text-on-primary cursor-pointer'
                }`}
              >
                <span>Next Chapter</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};
