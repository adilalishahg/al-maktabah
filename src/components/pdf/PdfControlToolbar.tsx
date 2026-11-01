'use client';

import React from 'react';
import type { DetailedBook } from '@/types/bookContent';

export interface PdfControlToolbarProps {
  book: DetailedBook;
  chaptersCount: number;
  currentPage: number;
  totalPages: number;
  pageInputValue: string;
  setPageInputValue: (val: string) => void;
  handlePageInputSubmit: (e: React.FormEvent) => void;
  scrollToPage: (pageNum: number) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  viewMode: 'pdf' | 'text';
  setViewMode: (mode: 'pdf' | 'text') => void;
  activeScale: number;
  setInternalScale: (scale: number | ((s: number) => number)) => void;
  isFullscreen: boolean;
  setIsFullscreen: (full: boolean | ((f: boolean) => boolean)) => void;
  onClose?: () => void;
  onSwitchToMatn?: () => void;
}

export const PdfControlToolbar: React.FC<PdfControlToolbarProps> = ({
  book,
  chaptersCount,
  currentPage,
  totalPages,
  pageInputValue,
  setPageInputValue,
  handlePageInputSubmit,
  scrollToPage,
  isSidebarOpen,
  toggleSidebar,
  viewMode,
  setViewMode,
  activeScale,
  setInternalScale,
  isFullscreen,
  setIsFullscreen,
  onClose,
  onSwitchToMatn,
}) => {
  return (
    <div className="bg-night-surface px-2.5 sm:px-4 py-2 border-b border-night-border flex flex-col md:flex-row md:items-center md:justify-between gap-2 shrink-0 select-none">
      {/* Top Row on Mobile / Left Group on Desktop */}
      <div className="flex items-center justify-between md:justify-start gap-2 min-w-0 w-full md:w-auto">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Back to Catalog"
              className="p-1 sm:p-1.5 rounded-lg hover:bg-emerald-surface text-emerald-highlight hover:text-white transition-colors cursor-pointer shrink-0"
              title="Back to Catalog"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl" aria-hidden="true">arrow_back</span>
            </button>
          )}

          <button
            onClick={toggleSidebar}
            aria-label="Toggle Chapters / Table of Contents"
            aria-expanded={isSidebarOpen}
            className={`px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
              isSidebarOpen
                ? 'bg-tertiary-container text-black font-bold shadow-md shadow-tertiary/20'
                : 'bg-emerald-card hover:bg-emerald-surface text-emerald-highlight border border-emerald-border'
            }`}
            title="Toggle Chapters / Table of Contents"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">format_list_bulleted</span>
            <span className="hidden sm:inline">Index &amp; Chapters</span>
            <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-label-xs font-mono font-bold">
              {chaptersCount}
            </span>
          </button>

          {/* Vertical Divider on Desktop */}
          <div className="hidden lg:block w-px h-5 bg-night-border mx-1 shrink-0" aria-hidden="true" />

          {/* Book Title with Safe Margin */}
          <div className="min-w-0 truncate max-w-36 sm:max-w-xs md:max-w-sm lg:max-w-md">
            <h3 className="font-display text-xs sm:text-sm font-bold text-white truncate">
              {book.title}
            </h3>
            <p className="font-arabic text-label-xs sm:text-label-sm text-tertiary truncate leading-tight" dir="rtl" lang="ar">
              {book.arabicTitle}
            </p>
          </div>
        </div>

        {/* Mobile-only Fullscreen Toggle button on Top Row */}
        <div className="flex md:hidden items-center gap-1 shrink-0">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1.5 rounded-lg hover:bg-emerald-surface text-emerald-highlight hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Row on Mobile / Right Group on Desktop */}
      <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2.5 w-full md:w-auto pt-1.5 md:pt-0 border-t md:border-t-0 border-night-border/70">
        {/* Dynamic Page Number & Quick Navigation Box */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-night-card px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl border border-emerald-border shadow-inner shrink-0" role="group" aria-label="Page Navigation">
          <button
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous Page"
            className="p-1 rounded hover:bg-emerald-surface disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer text-emerald-highlight"
            title="Previous Page"
          >
            <span className="material-symbols-outlined text-sm sm:text-base" aria-hidden="true">chevron_left</span>
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 text-xs font-mono" aria-label="Jump to page form">
            <input
              type="text"
              aria-label="Page number"
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              className="w-9 sm:w-12 text-center py-0.5 px-0.5 bg-night-canvas border border-emerald-border rounded text-tertiary-fixed font-bold text-xs focus:outline-none focus:border-tertiary"
            />
            <span className="text-emerald-highlight text-label-sm sm:text-xs" aria-hidden="true">/ {totalPages}</span>
            <button
              type="submit"
              aria-label="Go to entered page"
              className="hidden sm:inline px-1.5 py-0.5 bg-tertiary-container/20 hover:bg-tertiary-container/40 text-tertiary-fixed rounded text-label-xs font-bold cursor-pointer"
            >
              Go
            </button>
          </form>

          <button
            onClick={() => scrollToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next Page"
            className="p-1 rounded hover:bg-emerald-surface disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer text-emerald-highlight"
            title="Next Page"
          >
            <span className="material-symbols-outlined text-sm sm:text-base" aria-hidden="true">chevron_right</span>
          </button>
        </div>

        {/* View Mode Toggle: PDF Facsimile vs Text Transcript */}
        <div className="flex items-center bg-night-card p-0.5 rounded-lg border border-emerald-border shrink-0" role="tablist" aria-label="Format Mode">
          <button
            role="tab"
            aria-selected={viewMode === 'pdf'}
            aria-label="Manuscript Scan (Continuous PDF View)"
            onClick={() => setViewMode('pdf')}
            className={`px-2 py-1 rounded text-label-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              viewMode === 'pdf'
                ? 'bg-tertiary-container text-black font-bold shadow-xs'
                : 'text-emerald-highlight hover:text-white'
            }`}
            title="Manuscript Scan (Continuous PDF View)"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">picture_as_pdf</span>
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            role="tab"
            aria-selected={viewMode === 'text'}
            aria-label="Digitized Arabic Matn & Translation"
            onClick={() => {
              if (onSwitchToMatn) {
                onSwitchToMatn();
              } else {
                setViewMode('text');
              }
            }}
            className={`px-2 py-1 rounded text-label-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              viewMode === 'text'
                ? 'bg-tertiary-container text-black font-bold shadow-xs'
                : 'text-emerald-highlight hover:text-white'
            }`}
            title="Digitized Arabic Matn & Translation"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">auto_stories</span>
            <span className="hidden sm:inline">Matn</span>
          </button>
        </div>

        {/* Zoom Controls (Active in PDF mode) */}
        {viewMode === 'pdf' && (
          <div className="flex items-center bg-night-card rounded-lg px-1 sm:px-1.5 py-0.5 border border-emerald-border shrink-0" role="group" aria-label="Zoom Controls">
            <button
              onClick={() => setInternalScale((s) => Math.max(0.6, Number((s - 0.15).toFixed(2))))}
              aria-label="Zoom Out (-)"
              className="p-1 rounded hover:bg-emerald-surface text-emerald-highlight hover:text-white cursor-pointer"
              title="Zoom Out (-)"
            >
              <span className="material-symbols-outlined text-sm sm:text-base" aria-hidden="true">zoom_out</span>
            </button>
            <button
              type="button"
              onClick={() => setInternalScale(1.0)}
              aria-label={`Reset Zoom from ${Math.round(activeScale * 100)}% to 100%`}
              className="px-1 text-label-xs font-mono font-bold text-tertiary-fixed cursor-pointer hover:underline bg-transparent border-0"
              title="Reset Zoom to 100%"
            >
              {Math.round(activeScale * 100)}%
            </button>
            <button
              onClick={() => setInternalScale((s) => Math.min(2.5, Number((s + 0.15).toFixed(2))))}
              aria-label="Zoom In (+)"
              className="p-1 rounded hover:bg-emerald-surface text-emerald-highlight hover:text-white cursor-pointer"
              title="Zoom In (+)"
            >
              <span className="material-symbols-outlined text-sm sm:text-base" aria-hidden="true">zoom_in</span>
            </button>
            <button
              onClick={() => setInternalScale(1.0)}
              aria-label="Fit to Width"
              className="hidden lg:inline px-1.5 py-0.5 rounded text-label-xs font-semibold text-emerald-highlight hover:bg-emerald-surface hover:text-white cursor-pointer ml-1"
              title="Fit to Width"
            >
              Fit
            </button>
          </div>
        )}

        {/* Fullscreen Toggle on Desktop */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-emerald-surface text-emerald-highlight hover:text-white transition-colors cursor-pointer shrink-0"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>
      </div>
    </div>
  );
};

