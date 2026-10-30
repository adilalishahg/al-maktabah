'use client';

import React, { Suspense, lazy } from 'react';
import type { BookReaderViewProps } from '../types/views';
import { ScholarlyJsonLd } from '@/components/seo/ScholarlyJsonLd';
import { useBookReader } from '@/hooks/useBookReader';
import { ReaderMasterToolbar } from '@/components/reader/ReaderMasterToolbar';
import { ReaderTocDrawer } from '@/components/reader/ReaderTocDrawer';
import { ReaderMatnContentPane } from '@/components/reader/ReaderMatnContentPane';

// Lazy-load the heavy PDF rendering engine & canvas worker
const CodexPdfReader = lazy(() =>
  import('@/components/CodexPdfReader').then((m) => ({ default: m.CodexPdfReader }))
);

export const BookReaderView: React.FC<BookReaderViewProps> = ({
  book,
  initialChapterId,
  onNavigate,
  onOpenAdminEdit,
  theme,
  onThemeChange,
}) => {
  const {
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
    setPageInput,
    setSidebarOpen,
    handleJumpToPage,
    handlePageChange,
    handleNextChapter,
    handlePrevChapter,
    handleCopyText,
  } = useBookReader({ book, initialChapterId });

  return (
    <>
      <ScholarlyJsonLd book={book} />
      <div className="space-y-1.5 sm:space-y-2 animate-fade-in pb-6 pt-0.5">
        {/* Sleek Master Reader Toolbar (Device-Responsive: 2-Tier on Mobile, 1-Tier on Desktop) */}
        <ReaderMasterToolbar
          book={book}
          readingFormat={readingFormat}
          setReadingFormat={setReadingFormat}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          chaptersCount={chapters.length}
          pageInput={pageInput}
          setPageInput={setPageInput}
          handleJumpToPage={handleJumpToPage}
          handlePageChange={handlePageChange}
          zoomScale={zoomScale}
          setZoomScale={setZoomScale}
          setFontSize={setFontSize}
          theme={theme}
          onThemeChange={onThemeChange}
          onNavigate={onNavigate}
          onOpenAdminEdit={onOpenAdminEdit}
        />

        {/* Reader Body: Continuous Facsimile PDF Codex OR Classical Matn View */}
        {readingFormat === 'facsimile' ? (
          <div className="w-full">
            <Suspense
              fallback={
                <div className="h-[65vh] flex flex-col items-center justify-center gap-3 text-emerald-800 dark:text-emerald-400 bg-surface-container-lowest/50 rounded-2xl border border-surface-container p-8 animate-pulse">
                  <span className="material-symbols-outlined text-4xl animate-spin">menu_book</span>
                  <span className="font-serif text-sm tracking-wider uppercase font-semibold">
                    Loading Facsimile Manuscript Canvas...
                  </span>
                  <span className="text-xs text-gray-500 font-arabic">جاري تهيئة العارض الرقمي للمخطوطة</span>
                </div>
              }
            >
              <CodexPdfReader
                book={book}
                pdfUrl={book.pdfUrl}
                hideHeader={true}
                externalScale={zoomScale}
                externalPage={parseInt(pageInput, 10) || 1}
                sidebarOpenExternal={sidebarOpen}
                onToggleSidebarExternal={() => setSidebarOpen((prev) => !prev)}
                onPageChange={(p) => setPageInput(String(p))}
                onSwitchToMatn={() => setReadingFormat('matn')}
                onClose={() => onNavigate('browse-library')}
              />
            </Suspense>
          </div>
        ) : (
          /* Classical Matn View with Chapters Drawer */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <ReaderTocDrawer
              chapters={chapters}
              currentChapterIndex={currentChapterIndex}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              onSelectChapter={(idx) => setCurrentChapterIndex(idx)}
            />

            <ReaderMatnContentPane
              activeChapter={activeChapter}
              currentChapterIndex={currentChapterIndex}
              totalChapters={chapters.length}
              fontSize={fontSize}
              showTranslation={showTranslation}
              showNotes={showNotes}
              copiedNotification={copiedNotification}
              handleCopyText={handleCopyText}
              handlePrevChapter={handlePrevChapter}
              handleNextChapter={handleNextChapter}
            />
          </div>
        )}
      </div>
    </>
  );
};
