'use client';

import React from 'react';
import type { BookChapter } from '@/types/bookContent';
import type { CodexPdfReaderProps } from '@/types/components';
import { usePdfReader } from '@/hooks/usePdfReader';
import { PdfControlToolbar } from '@/components/pdf/PdfControlToolbar';
import { PdfThumbnailSidebar } from '@/components/pdf/PdfThumbnailSidebar';

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
  const {
    totalPages,
    currentPage,
    pageInputValue,
    setInternalScale,
    activeScale,
    viewMode,
    setViewMode,
    isSidebarOpen,
    chapterFilter,
    setChapterFilter,
    loadingDoc,
    loadError,
    isFullscreen,
    setIsFullscreen,
    isCloudinary,
    effectivePdfUrl,
    chapters,
    filteredChapters,
    activeChapter,
    renderedPages,
    containerRef,
    setPageInputValue,
    toggleSidebar,
    getCloudinaryPageUrl,
    scrollToPage,
    handlePageInputSubmit,
  } = usePdfReader({
    book,
    pdfUrl,
    initialPage,
    externalPage,
    externalScale,
    sidebarOpenExternal,
    onToggleSidebarExternal,
    onPageChange,
  });

  const handleChapterClick = (chapter: BookChapter) => {
    scrollToPage(chapter.startPage);
    onJumpToChapter?.(chapter);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (onToggleSidebarExternal && sidebarOpenExternal) {
        onToggleSidebarExternal();
      } else {
        toggleSidebar();
      }
    }
  };

  return (
    <div
      className={`flex flex-col bg-night-card text-night-text overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-screen'
          : hideHeader
            ? 'h-[calc(100dvh-var(--app-header-height,108px)-4.5rem)] min-h-[460px] w-full rounded-2xl border border-tertiary/40 shadow-xl'
            : 'h-[calc(100dvh-6.5rem)] sm:h-[86vh] min-h-reader-tall w-full rounded-xl sm:rounded-2xl border border-tertiary/40 shadow-2xl mt-2 sm:mt-4 mb-6'
      }`}
    >
      {/* Top Header & Navigation Bar */}
      {!hideHeader && (
        <PdfControlToolbar
          book={book}
          chaptersCount={chapters.length}
          currentPage={currentPage}
          totalPages={totalPages}
          pageInputValue={pageInputValue}
          setPageInputValue={setPageInputValue}
          handlePageInputSubmit={handlePageInputSubmit}
          scrollToPage={scrollToPage}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          viewMode={viewMode}
          setViewMode={setViewMode}
          activeScale={activeScale}
          setInternalScale={setInternalScale}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          onClose={onClose}
          onSwitchToMatn={onSwitchToMatn}
        />
      )}

      {/* Main Dual Area: Sidebar Drawer + Reading Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        <PdfThumbnailSidebar
          chapters={chapters}
          filteredChapters={filteredChapters}
          activeChapter={activeChapter}
          chapterFilter={chapterFilter}
          setChapterFilter={setChapterFilter}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          totalPages={totalPages}
          handleChapterClick={handleChapterClick}
        />

        {/* Main Canvas Area */}
        <main
          ref={containerRef}
          className="flex-1 overflow-x-auto overflow-y-auto bg-night-canvas p-1 sm:p-4 md:p-6 relative scroll-smooth w-full"
        >
          {viewMode === 'pdf' ? (
            /* Continuous PDF Page Stream */
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-3 sm:gap-6 w-full">
              {loadingDoc && (
                <div className="py-24 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full border-3 border-tertiary/30 border-t-tertiary animate-spin"></div>
                  <p className="text-xs text-emerald-highlight">Streaming PDF pages directly from codex...</p>
                </div>
              )}

              {loadError && !isCloudinary && (
                <div className="p-6 bg-rose-950/30 border border-rose-800 rounded-2xl text-center space-y-2 max-w-md">
                  <span className="material-symbols-outlined text-3xl text-rose-400">error</span>
                  <h4 className="font-title-md font-bold text-white">Could not stream PDF file directly</h4>
                  <p className="text-xs text-night-text">{loadError}</p>
                  <button
                    onClick={() => {
                      if (onSwitchToMatn) onSwitchToMatn();
                      else setViewMode('text');
                    }}
                    className="mt-3 px-4 py-2 bg-tertiary text-black font-bold text-xs rounded-xl shadow-lg hover:bg-tertiary-fixed cursor-pointer"
                  >
                    Switch to Arabic Matn Text View
                  </button>
                </div>
              )}

              {/* Render Every Page Slot */}
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === currentPage;

                return (
                  <div
                    key={pageNum}
                    id={`pdf-page-slot-${pageNum}`}
                    data-page-num={pageNum}
                    className={`pdf-page-slot transition-all duration-200 relative bg-night-card shadow-2xl rounded-sm overflow-hidden flex flex-col items-center border ${
                      isCurrent ? 'ring-2 ring-tertiary border-tertiary' : 'border-emerald-border'
                    }`}
                    style={{
                      width: `${Math.round(800 * activeScale)}px`,
                      minHeight: `${Math.round(1100 * activeScale)}px`,
                    }}
                  >
                    {/* Page Number Watermark Badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-label-xs font-mono text-tertiary-fixed border border-emerald-border z-10">
                      {pageNum} / {totalPages}
                    </div>

                    {/* High-Performance Cloudinary Auto-Streaming Image */}
                    {isCloudinary ? (
                      <img
                        src={getCloudinaryPageUrl(effectivePdfUrl, pageNum)}
                        alt={`Page ${pageNum} of ${book.title}`}
                        loading="lazy"
                        className="w-full h-auto object-contain select-none"
                      />
                    ) : (
                      /* Fallback PDF.js HTML5 Canvas */
                      <canvas
                        className={`w-full h-auto block ${!renderedPages.has(pageNum) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Digital Matn Text Transcript View */
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
              <div className="bg-night-surface p-6 sm:p-8 rounded-3xl border border-emerald-border space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-night-border">
                  <div>
                    <span className="text-label-xs font-mono text-tertiary uppercase">
                      Chapter {activeChapter?.number || 1} • Page {activeChapter?.startPage || 1}
                    </span>
                    <h2 className="font-arabic text-2xl font-bold text-tertiary-fixed mt-1">
                      {activeChapter?.arabicTitle || activeChapter?.title}
                    </h2>
                  </div>
                  {onSwitchToMatn && (
                    <button
                      onClick={onSwitchToMatn}
                      className="px-3 py-1.5 rounded-xl bg-tertiary text-black font-bold text-xs hover:bg-tertiary-fixed transition-colors cursor-pointer"
                    >
                      Open Full Matn Studio
                    </button>
                  )}
                </div>

                <div
                  dir="rtl"
                  className="font-arabic text-night-text leading-[2.6] text-right p-4 rounded-xl bg-night-canvas border border-night-border text-base whitespace-pre-line"
                >
                  {activeChapter?.content || 'لا يوجد نص مدخل لهذا الباب.'}
                </div>

                {activeChapter?.translation && (
                  <div className="p-4 rounded-xl bg-emerald-dark/30 border border-emerald-border space-y-1">
                    <span className="text-label-xs font-bold uppercase tracking-wider text-tertiary">
                      English Translation
                    </span>
                    <p className="text-xs sm:text-sm text-night-text leading-relaxed whitespace-pre-line">
                      {activeChapter.translation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
