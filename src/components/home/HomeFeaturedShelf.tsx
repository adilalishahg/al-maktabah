'use client';

import React, { useState, useMemo } from 'react';
import type { Book } from '@/types/library';
import type { FeaturedShelfConfig } from '@/types/homeSettings';

export interface HomeFeaturedShelfProps {
  shelfConfig: FeaturedShelfConfig;
  books: Book[];
  onSelectBook: (book: Book) => void;
  onOpenReader: (book?: Book) => void;
  onOpenDownload: (book: Book) => void;
}

const FILTER_TABS = [
  'All Works',
  'Most Read',
  'Recently Digitized',
  'Rare Manuscripts',
  'Bilingual (Ar/En)',
];

export const HomeFeaturedShelf: React.FC<HomeFeaturedShelfProps> = ({
  shelfConfig,
  books,
  onSelectBook,
  onOpenReader,
  onOpenDownload,
}) => {
  const [activeFeaturedTab, setActiveFeaturedTab] = useState('All Works');

  const filteredBooks = useMemo(() => {
    let source = books;
    if (shelfConfig.selectionMode === 'custom' && shelfConfig.selectedBookIds.length > 0) {
      const customMatches = books.filter((b) => shelfConfig.selectedBookIds.includes(b.id));
      if (customMatches.length > 0) source = customMatches;
    }

    switch (activeFeaturedTab) {
      case 'Most Read':
        return source.filter((b) => b.rating >= 4.9);
      case 'Recently Digitized':
        return source.filter((b) => b.pages > 500);
      case 'Rare Manuscripts':
        return source.filter((b) => b.formats.includes('Critical PDF'));
      case 'Bilingual (Ar/En)':
        return source.filter(
          (b) =>
            b.badge?.includes('English') ||
            b.badge?.includes('Bilingual') ||
            b.formats.includes('English Translation')
        );
      default:
        return source.slice(0, 4);
    }
  }, [books, shelfConfig, activeFeaturedTab]);

  return (
    <section className="py-8 sm:py-12" id="featured-shelf">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-base sm:text-lg">verified</span>
            <span className="font-label-sm text-xs uppercase tracking-wider text-tertiary font-bold">
              Scholarly Academic Canon
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary">
            {shelfConfig.title || 'Featured Critical Editions'}
          </h2>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
            {shelfConfig.subtitle ||
              'Rigorous recensions with isnād apparatus, academic footnotes, and dual-language parallel views.'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-high rounded-xl overflow-x-auto border border-surface-container scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFeaturedTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-title-md text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                activeFeaturedTab === tab
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-xs border border-tertiary/30'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {books.length === 0 ? (
        <div className="py-12 px-6 text-center bg-surface-container-lowest rounded-2xl border-2 border-dashed border-tertiary/40 max-w-xl mx-auto space-y-3">
          <span className="material-symbols-outlined text-3xl text-tertiary">library_books</span>
          <h3 className="font-title-md font-bold text-primary">No Codices in Database Yet</h3>
          <p className="text-xs text-on-surface-variant">
            When an administrator adds books via the Admin Portal, featured titles will appear here.
          </p>
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:bg-primary transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            <span>Open Admin Portal</span>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="group bg-surface-container-lowest rounded-2xl shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden border border-surface-container hover:border-tertiary/50"
            >
              {/* Cover with Book Spine effect */}
              <div
                className="relative h-60 bg-surface-container-high overflow-hidden cursor-pointer"
                onClick={() => onSelectBook(book)}
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={book.coverImage}
                  alt={book.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                <div className="absolute top-2.5 left-3 flex gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-xs font-bold shadow-xs backdrop-blur-xs ${
                      book.badgeColor || 'bg-primary-container text-on-primary'
                    }`}
                  >
                    {book.badge || book.disciplineName}
                  </span>
                </div>

                {book.verified && (
                  <div className="absolute top-2.5 right-3">
                    <span
                      className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs"
                      title="Academic Council Verified"
                    >
                      <span className="material-symbols-outlined text-sm">verified</span>
                    </span>
                  </div>
                )}

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                  <span className="flex items-center gap-1 font-bold text-gold-bright">
                    ★ {book.rating || 4.9}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-label-sm">
                    {book.pages} pgs • {book.sizeMb} MB
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-tertiary">
                    <span className="font-arabic text-base sm:text-lg font-bold truncate">
                      {book.arabicTitle}
                    </span>
                    <span className="text-label-xs font-mono text-outline font-semibold shrink-0 bg-surface-container px-2 py-0.5 rounded border border-surface-container-high">
                      {book.authorHijriYear?.split('(')[0]?.trim() || '1445 AH'}
                    </span>
                  </div>
                  <h3
                    onClick={() => onSelectBook(book)}
                    className="font-display text-base font-bold text-primary group-hover:text-tertiary transition-colors line-clamp-1 cursor-pointer"
                  >
                    {book.title}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1">
                    {book.author}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {book.formats.slice(0, 3).map((fmt, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-xs font-semibold border border-surface-container-high"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 grid grid-cols-2 gap-2 border-t border-surface-container">
                  <button
                    onClick={() => onOpenReader(book)}
                    className="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-base text-primary">chrome_reader_mode</span>
                    <span>Read</span>
                  </button>
                  <button
                    onClick={() => onOpenDownload(book)}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-primary to-primary-container hover:brightness-105 text-on-primary font-title-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    <span>Get</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
