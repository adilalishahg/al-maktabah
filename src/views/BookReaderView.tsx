'use client';

import React, { useState, useEffect } from 'react';
import { DetailedBook, BookChapter } from '../types/bookContent';
import { ReaderTheme } from '../types/library';

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
    <div className="space-y-4 animate-fade-in pb-16">
      {/* Top Reader Navigation Bar */}
      <div className="sticky top-16 sm:top-20 z-40 bg-surface-container-lowest/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-surface-container shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left: Book Meta & TOC Drawer Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => onNavigate('browse-library')}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
            title="Back to Catalog"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            title="Table of Contents (Chapters)"
          >
            <span className="material-symbols-outlined text-base">list_alt</span>
            <span className="hidden sm:inline">Index &amp; Chapters</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {chapters.length}
            </span>
          </button>

          <div className="min-w-0 truncate">
            <h1 className="font-title-md font-bold text-xs sm:text-sm text-primary truncate">
              {book.title}
            </h1>
            <span className="text-[11px] text-tertiary font-arabic font-semibold truncate block">
              {book.arabicTitle}
            </span>
          </div>
        </div>

        {/* Center: Direct Page Number Jump Box */}
        <form onSubmit={handleJumpToPage} className="flex items-center gap-1.5 shrink-0 bg-surface-container-low px-2 py-1 rounded-lg border border-surface-container">
          <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Page:</span>
          <input
            type="number"
            min="1"
            max={book.pages || 5000}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            className="w-14 px-1.5 py-0.5 rounded bg-surface-container-lowest border border-surface-container text-xs text-center font-mono font-bold text-primary focus:outline-none focus:border-primary"
          />
          <span className="text-[11px] text-on-surface-variant font-mono">/ {book.pages}</span>
          <button
            type="submit"
            className="px-2 py-0.5 rounded bg-primary-container text-on-primary text-[10px] font-bold hover:bg-primary transition-colors cursor-pointer"
          >
            Go
          </button>
        </form>

        {/* Right: Typography Controls & Theme Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Font Size Scaling */}
          <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-surface-container">
            <button
              onClick={() => setFontSize(Math.max(16, fontSize - 2))}
              className="p-1 rounded text-on-surface hover:bg-surface-container text-xs font-bold"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="px-1.5 text-[11px] font-mono text-on-surface-variant">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(36, fontSize + 2))}
              className="p-1 rounded text-on-surface hover:bg-surface-container text-xs font-bold"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Translation Toggle */}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              showTranslation
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container text-on-surface-variant'
            }`}
            title="Toggle English Translation"
          >
            <span className="material-symbols-outlined text-sm">translate</span>
            <span className="hidden md:inline">English</span>
          </button>

          {/* Theme Palette */}
          <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-surface-container">
            <button
              onClick={() => onThemeChange('parchment')}
              className={`p-1 rounded ${theme === 'parchment' ? 'bg-surface-container-lowest shadow-xs' : ''}`}
              title="Light Parchment"
            >
              <span className="material-symbols-outlined text-sm text-tertiary-container">light_mode</span>
            </button>
            <button
              onClick={() => onThemeChange('sepia')}
              className={`p-1 rounded ${theme === 'sepia' ? 'bg-surface-container-lowest shadow-xs' : ''}`}
              title="Sepia Paper"
            >
              <span className="material-symbols-outlined text-sm text-tertiary">auto_stories</span>
            </button>
            <button
              onClick={() => onThemeChange('night')}
              className={`p-1 rounded ${theme === 'night' ? 'bg-surface-container-lowest shadow-xs' : ''}`}
              title="Night Emerald"
            >
              <span className="material-symbols-outlined text-sm text-primary-container">dark_mode</span>
            </button>
          </div>

          {/* Admin Edit Shortcut */}
          {onOpenAdminEdit && (
            <button
              onClick={() => onOpenAdminEdit(book)}
              className="p-1.5 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-colors"
              title="Edit in Admin Dashboard"
            >
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Table of Contents Drawer + Book Reading Canvas */}
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

        {/* Main Reading Canvas */}
        <main className={`space-y-6 ${sidebarOpen ? 'lg:col-span-8' : 'lg:col-span-8'}`}>
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 min-h-[500px]">
            {/* Chapter Header */}
            <div className="text-center pb-6 border-b border-surface-container/60 space-y-2">
              <span className="font-label-sm uppercase tracking-widest text-tertiary text-xs font-bold inline-block px-3 py-1 rounded-full bg-surface-container-low border border-surface-container">
                {book.title} • Chapter {activeChapter.number} of {chapters.length}
              </span>
              <h2 className="font-arabic text-3xl sm:text-4xl font-bold text-primary leading-relaxed">
                {activeChapter.arabicTitle}
              </h2>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-on-surface">
                {activeChapter.title}
              </h3>
              <div className="flex items-center justify-center gap-3 text-xs text-on-surface-variant font-mono pt-1">
                <span>Section Start: Page {activeChapter.startPage}</span>
                <span>•</span>
                <span>Authorized Matn</span>
              </div>
            </div>

            {/* Arabic Matn Text Rendering */}
            <div
              dir="rtl"
              style={{ fontSize: `${fontSize}px` }}
              className="font-arabic font-medium text-primary leading-[2.3] whitespace-pre-line selection:bg-tertiary-container selection:text-on-primary py-2 px-2 sm:px-4 text-justify"
            >
              {activeChapter.content}
            </div>

            {/* Optional English Translation */}
            {showTranslation && activeChapter.translation && (
              <div className="pt-6 border-t border-surface-container/60 space-y-2 bg-surface-container-low/40 p-5 sm:p-6 rounded-2xl border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm uppercase text-[11px] text-secondary font-bold tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">translate</span>
                    Authorized English Critical Translation
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">Parallel Matn</span>
                </div>
                <p className="font-body-md text-sm sm:text-base text-on-surface leading-relaxed whitespace-pre-line">
                  {activeChapter.translation}
                </p>
              </div>
            )}

            {/* Scholarly Notes & Commentary */}
            {showNotes && activeChapter.notes && (
              <div className="p-4 sm:p-5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant border-l-4 border-tertiary space-y-1">
                <span className="font-bold text-primary block text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-tertiary">history_edu</span>
                  Marginal Scholarly Commentary &amp; Isnād Notes:
                </span>
                <p className="leading-relaxed">{activeChapter.notes}</p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-surface-container text-xs">
              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedNotification ? 'done' : 'content_copy'}
                </span>
                <span>{copiedNotification ? 'Copied Matn!' : 'Copy Section Text'}</span>
              </button>

              <span className="text-on-surface-variant">
                Page {activeChapter.startPage} of {book.pages}
              </span>
            </div>
          </div>

          {/* Bottom Next/Prev Chapter Ribbon */}
          <div className="flex items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-surface-container shadow-xs">
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

            <span className="text-xs text-on-surface-variant font-medium hidden sm:inline">
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
    </div>
  );
};
