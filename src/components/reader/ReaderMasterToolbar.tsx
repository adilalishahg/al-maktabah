'use client';

import React from 'react';
import type { DetailedBook } from '@/types/bookContent';
import type { ReaderTheme } from '@/types/library';

export interface ReaderMasterToolbarProps {
  book: DetailedBook;
  readingFormat: 'facsimile' | 'matn';
  setReadingFormat: (format: 'facsimile' | 'matn') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  chaptersCount: number;
  pageInput: string;
  setPageInput: (val: string) => void;
  handleJumpToPage: (e: React.FormEvent) => void;
  handlePageChange: (pageNum: number) => void;
  zoomScale: number;
  setZoomScale: (scale: number | ((prev: number) => number)) => void;
  setFontSize: (size: number | ((prev: number) => number)) => void;
  theme?: ReaderTheme;
  onThemeChange?: (theme: ReaderTheme) => void;
  onNavigate: (path: string) => void;
  onOpenAdminEdit?: (book: DetailedBook) => void;
  isStandaloneRoute?: boolean;
}

export const ReaderMasterToolbar: React.FC<ReaderMasterToolbarProps> = ({
  book,
  readingFormat,
  setReadingFormat,
  sidebarOpen,
  setSidebarOpen,
  chaptersCount,
  pageInput,
  setPageInput,
  handleJumpToPage,
  handlePageChange,
  zoomScale,
  setZoomScale,
  setFontSize,
  theme,
  onThemeChange,
  onNavigate,
  onOpenAdminEdit,
  isStandaloneRoute = false,
}) => {
  return (
    <div
      style={!isStandaloneRoute ? { top: 'calc(var(--app-header-height, 0px) + 2px)' } : undefined}
      className={`z-30 !mt-0 bg-surface-container-lowest/95 backdrop-blur-md p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-surface-container shadow-xs select-none w-full shrink-0 ${
        isStandaloneRoute ? 'relative' : 'sticky'
      }`}
    >
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
              className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${sidebarOpen
                  ? 'bg-primary text-on-primary ring-2 ring-primary/20'
                  : 'bg-surface-container hover:bg-surface-container-high text-primary'
                }`}
              title="Table of Contents (Chapters)"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">menu_book</span>
              <span className="hidden sm:inline">Index &amp; Chapters</span>
              <span className="bg-primary-container text-on-primary px-1.5 py-0.2 rounded-full text-label-xs font-mono font-bold">
                {chaptersCount}
              </span>
            </button>

            <div className="hidden lg:block w-px h-5 bg-surface-container shrink-0 mx-0.5" />

            <div className="min-w-0 truncate">
              <h1 className="font-title-md font-bold text-xs sm:text-sm text-primary truncate max-w-32 sm:max-w-xs md:max-w-sm">
                {book.title}
              </h1>
              <span className="text-label-xs sm:text-label-sm text-tertiary font-arabic truncate block leading-tight">
                {book.arabicTitle}
              </span>
            </div>
          </div>

          {/* Mobile-only Mode Switcher on Top Row */}
          <div className="flex md:hidden items-center bg-surface-container-low rounded-xl p-0.5 border border-surface-container shrink-0">
            <button
              onClick={() => setReadingFormat('facsimile')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${readingFormat === 'facsimile'
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
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${readingFormat === 'matn'
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
              const prev = Math.max(1, parseInt(pageInput || '1', 10) - 1);
              handlePageChange(prev);
            }}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface cursor-pointer"
            title="Previous Page"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          <form onSubmit={handleJumpToPage} className="flex items-center gap-1 text-xs font-mono">
            <span className="text-label-sm text-on-surface-variant uppercase font-semibold">P.</span>
            <input
              type="number"
              min="1"
              max={book.pages || 5000}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-12 px-1.5 py-0.5 rounded bg-surface-container-lowest border border-surface-container text-xs text-center font-mono font-bold text-primary focus:outline-none focus:border-primary"
            />
            <span className="text-label-sm text-on-surface-variant">/ {book.pages || 631}</span>
            <button
              type="submit"
              className="px-2 py-0.5 rounded bg-primary-container text-on-primary text-label-xs font-bold hover:bg-primary cursor-pointer"
            >
              Go
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              const next = Math.min(book.pages || 631, parseInt(pageInput || '1', 10) + 1);
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
                const prev = Math.max(1, parseInt(pageInput || '1', 10) - 1);
                handlePageChange(prev);
              }}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface cursor-pointer"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-xs">chevron_left</span>
            </button>
            <form onSubmit={handleJumpToPage} className="flex items-center gap-1 text-label-xs font-mono">
              <span className="text-on-surface-variant font-bold">P.</span>
              <input
                type="number"
                min="1"
                max={book.pages || 5000}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="w-9 px-1 py-0.5 rounded bg-surface-container-lowest border border-surface-container text-label-xs text-center font-mono font-bold text-primary focus:outline-none"
              />
              <span className="text-on-surface-variant text-label-xs">/{book.pages || 631}</span>
            </form>
            <button
              type="button"
              onClick={() => {
                const next = Math.min(book.pages || 631, parseInt(pageInput || '1', 10) + 1);
                handlePageChange(next);
              }}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface cursor-pointer"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </button>
          </div>

          {/* Desktop Mode Switcher */}
          <div className="hidden md:flex items-center bg-surface-container-low rounded-xl p-0.5 border border-surface-container shrink-0">
            <button
              onClick={() => setReadingFormat('facsimile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${readingFormat === 'facsimile'
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
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${readingFormat === 'matn'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
                }`}
              title="Digitized Arabic Matn & Translation"
            >
              <span className="material-symbols-outlined text-sm">auto_stories</span>
              <span>Matn</span>
            </button>
          </div>

          {/* Interactive Zoom Controls */}
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
              className="px-1 text-label-sm font-mono font-bold text-primary cursor-pointer hover:underline"
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
              className="hidden sm:inline-block px-1.5 py-0.5 text-label-xs rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant cursor-pointer ml-0.5 font-semibold"
              title="Fit to Width (100%)"
            >
              Fit
            </button>
          </div>

          {/* Theme Selector */}
          {onThemeChange && (
            <div className="flex items-center bg-surface-container-low rounded-xl p-0.5 border border-surface-container shrink-0">
              <button
                onClick={() => onThemeChange('parchment')}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${theme === 'parchment' ? 'bg-surface-container-lowest shadow-xs text-primary' : 'text-on-surface-variant'
                  }`}
                title="Light Theme"
              >
                <span className="material-symbols-outlined text-sm text-tertiary">light_mode</span>
              </button>
              <button
                onClick={() => onThemeChange('sepia')}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${theme === 'sepia' ? 'bg-surface-container-lowest shadow-xs text-primary' : 'text-on-surface-variant'
                  }`}
                title="Sepia Paper"
              >
                <span className="material-symbols-outlined text-sm text-tertiary">auto_stories</span>
              </button>
              <button
                onClick={() => onThemeChange('night')}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${theme === 'night' ? 'bg-surface-container-lowest shadow-xs text-primary' : 'text-on-surface-variant'
                  }`}
                title="Dark Emerald"
              >
                <span className="material-symbols-outlined text-sm text-primary">dark_mode</span>
              </button>
            </div>
          )}

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
  );
};
