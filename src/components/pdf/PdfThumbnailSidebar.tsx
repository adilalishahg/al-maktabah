'use client';

import React from 'react';
import type { BookChapter } from '@/types/bookContent';

export interface PdfThumbnailSidebarProps {
  chapters: BookChapter[];
  filteredChapters: BookChapter[];
  activeChapter: BookChapter | null;
  chapterFilter: string;
  setChapterFilter: (val: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  totalPages: number;
  handleChapterClick: (chapter: BookChapter) => void;
}

export const PdfThumbnailSidebar: React.FC<PdfThumbnailSidebarProps> = ({
  chapters,
  filteredChapters,
  activeChapter,
  chapterFilter,
  setChapterFilter,
  isSidebarOpen,
  toggleSidebar,
  totalPages,
  handleChapterClick,
}) => {
  return (
    <>
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
          bg-night-surface border-r border-night-border flex flex-col shrink-0 transition-transform duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-night-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">menu_book</span>
              Treatise Chapters ({chapters.length})
            </span>
            <div className="flex items-center gap-2">
              <span className="text-label-xs text-emerald-highlight font-mono">1–{totalPages} Pgs</span>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg hover:bg-emerald-surface text-emerald-highlight hover:text-white md:hidden cursor-pointer"
                title="Close Chapters Drawer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Filter chapters or abwāb..."
              value={chapterFilter}
              onChange={(e) => setChapterFilter(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-night-canvas border border-night-border text-xs text-white placeholder:text-outline focus:outline-none focus:border-tertiary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {filteredChapters.length === 0 ? (
            <div className="text-center py-8 text-xs text-outline">
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
                      ? 'bg-gradient-to-r from-emerald-dark to-emerald-surface text-white border-tertiary shadow-md shadow-emerald-950/40 ring-1 ring-tertiary/40'
                      : 'bg-night-surface text-night-text border-night-border hover:bg-emerald-surface hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-tertiary-fixed truncate">
                      {ch.number}. {ch.title}
                    </span>
                    <span className="text-label-xs font-mono px-1.5 py-0.5 rounded bg-black/40 text-tertiary shrink-0">
                      p.{ch.startPage}
                    </span>
                  </div>
                  {ch.arabicTitle && (
                    <p className="font-arabic text-right text-xs text-emerald-highlight leading-tight truncate">
                      {ch.arabicTitle}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
