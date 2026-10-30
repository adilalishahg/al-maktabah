'use client';

import React from 'react';
import type { BookChapter } from '@/types/bookContent';

export interface ReaderTocDrawerProps {
  chapters: BookChapter[];
  currentChapterIndex: number;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onSelectChapter: (idx: number) => void;
}

export const ReaderTocDrawer: React.FC<ReaderTocDrawerProps> = ({
  chapters,
  currentChapterIndex,
  sidebarOpen,
  setSidebarOpen,
  onSelectChapter,
}) => {
  return (
    <aside
      className={`lg:col-span-4 bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm space-y-3 transition-all ${sidebarOpen ? 'block' : 'hidden lg:block'
        }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">toc</span>
          <h2 className="font-title-md font-bold text-sm text-primary">
            Table of Contents (فهرس الأبواب)
          </h2>
        </div>
        <span className="text-label-sm text-on-surface-variant font-mono">
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
                onSelectChapter(idx);
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-3 ${isSelected
                  ? 'bg-primary-container text-on-primary border-primary shadow-xs'
                  : 'bg-surface-container-low/40 hover:bg-surface-container border-surface-container text-on-surface'
                }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-label-xs font-bold uppercase ${isSelected ? 'text-tertiary-fixed' : 'text-tertiary'
                      }`}
                  >
                    Ch. {ch.number}
                  </span>
                  <span
                    className={`text-label-xs font-mono ${isSelected ? 'text-on-primary/70' : 'text-on-surface-variant'
                      }`}
                  >
                    p.{ch.startPage}
                  </span>
                </div>
                <div className="font-title-md font-semibold text-xs leading-snug truncate mt-0.5">
                  {ch.title}
                </div>
                <div
                  className={`font-arabic text-sm font-semibold truncate ${isSelected ? 'text-on-primary' : 'text-primary'
                    }`}
                >
                  {ch.arabicTitle}
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-sm shrink-0 ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'
                  }`}
              >
                chevron_right
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
