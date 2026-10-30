'use client';

import React from 'react';
import type { BookChapter } from '@/types/bookContent';

export interface ReaderMatnContentPaneProps {
  activeChapter: BookChapter;
  currentChapterIndex: number;
  totalChapters: number;
  fontSize: number;
  showTranslation: boolean;
  showNotes: boolean;
  copiedNotification: boolean;
  handleCopyText: () => void;
  handlePrevChapter: () => void;
  handleNextChapter: () => void;
}

export const ReaderMatnContentPane: React.FC<ReaderMatnContentPaneProps> = ({
  activeChapter,
  currentChapterIndex,
  totalChapters,
  fontSize,
  showTranslation,
  showNotes,
  copiedNotification,
  handleCopyText,
  handlePrevChapter,
  handleNextChapter,
}) => {
  return (
    <main className="lg:col-span-8 space-y-6">
      {/* Active Chapter Card */}
      <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Chapter Meta Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-surface-container">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-label-sm font-bold font-mono px-2 py-0.5 rounded bg-surface-container text-tertiary uppercase">
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
          Chapter {currentChapterIndex + 1} of {totalChapters}
        </span>

        <button
          onClick={handleNextChapter}
          disabled={currentChapterIndex === totalChapters - 1}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            currentChapterIndex === totalChapters - 1
              ? 'opacity-40 cursor-not-allowed bg-surface-container text-on-surface-variant'
              : 'bg-primary-container hover:bg-primary text-on-primary cursor-pointer'
          }`}
        >
          <span>Next Chapter</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </main>
  );
};
