'use client';

import React from 'react';
import type { Book } from '@/types/library';
import type { HeroSectionConfig } from '@/types/homeSettings';

export interface HomeHeroSectionProps {
  hero: HeroSectionConfig;
  books: Book[];
  onSelectBook: (book: Book) => void;
  onOpenReader: (book?: Book) => void;
  onNavigate: (path: string) => void;
}

export const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({
  hero,
  books,
  onSelectBook,
  onOpenReader,
  onNavigate,
}) => {
  const centerBook = hero.centerBookId
    ? books.find((b) => b.id === hero.centerBookId) || books.find((b) => b.id === 'riyad-salihin') || books[0]
    : books.find((b) => b.id === 'riyad-salihin') || books[0];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pb-8 sm:pb-12">
      {/* Left Hero Column */}
      <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
        <div className="inline-flex items-center gap-2.5 self-start px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-xs border border-tertiary/30">
          <span className="font-arabic text-sm sm:text-base text-tertiary font-bold">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
          <span className="font-label-sm text-label-xs sm:text-xs uppercase tracking-widest text-primary font-bold">
            Autonomous Waqf Digital Repository
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-display-hero xl:text-display-xl text-primary tracking-tight font-extrabold leading-[1.18]">
            {hero.headline || 'Authentic Islamic Codices & Scholarly Archives'}
            <span className="block font-display italic text-tertiary font-normal mt-1.5 text-2xl sm:text-3xl md:text-4xl">
              {hero.subheadline || 'Open, Peer-Reviewed & Preserved for Posterity.'}
            </span>
          </h1>
          <p className="font-body-lg text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            {hero.description ||
              'Explore over 14,000 verified manuscripts, canonical Hadīth recensions with traced isnād chains, and foundational legal treatises in pristine typography with instant morphological apparatus.'}
          </p>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all border border-surface-container group">
            <div className="flex items-center justify-between mb-1">
              <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
            </div>
            <div className="font-headline-sm text-xl sm:text-2xl font-extrabold text-primary">Verified+</div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all border border-tertiary/30 group">
            <div className="flex items-center justify-between mb-1">
              <span className="material-symbols-outlined text-tertiary text-xl">volunteer_activism</span>
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary/40 group-hover:bg-tertiary transition-colors"></span>
            </div>
            <div className="font-headline-sm text-xl sm:text-2xl font-extrabold text-tertiary">100% Free</div>
            <div className="font-label-sm text-xs text-on-surface-variant font-medium mt-0.5">Waqf Endowment</div>
          </div>
        </div>
      </div>

      {/* Right Hero Column: 3D Showcase */}
      <div className="lg:col-span-5 relative flex items-center justify-center py-6 sm:py-10 select-none overflow-hidden sm:overflow-visible">
        <div className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-tertiary-container/15 filter blur-3xl pointer-events-none"></div>
        <div className="absolute w-56 sm:w-64 h-56 sm:h-64 rounded-full bg-primary/20 filter blur-2xl pointer-events-none"></div>

        <div className="relative w-full max-w-shelf-card xs:max-w-sm sm:max-w-md h-96 sm:h-[28rem] flex items-center justify-center scale-[0.92] xs:scale-95 sm:scale-100 origin-center">
          {/* Book 1: Al-Bidayah wan-Nihayah */}
          <div
            onClick={() => {
              const target = books.find((b) => b.id === 'bidayah-wan-nihayah') || books[0];
              if (target) onSelectBook(target);
              else onNavigate('browse-library');
            }}
            className="absolute -left-2 sm:-left-4 top-4 sm:top-6 w-48 sm:w-56 h-72 sm:h-82 rounded-2xl bg-gradient-to-br from-emerald-dark via-emerald-deep to-primary text-tertiary-fixed shadow-2xl p-4 flex flex-col justify-between transform -rotate-12 hover:-rotate-4 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-tertiary/40 group"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-tertiary-container/40 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 opacity-15 bg-tertiary-fixed/10 bg-repeat"></div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="font-label-sm text-label-xs sm:text-xs px-2.5 py-0.5 rounded-full bg-tertiary-container/20 text-gold-bright border border-tertiary/40 font-bold uppercase tracking-wider">
                Tārīkh Codex
              </span>
              <span className="material-symbols-outlined text-gold-bright text-base sm:text-lg">bookmark</span>
            </div>
            <div className="relative z-10 text-center space-y-1 my-auto">
              <div className="w-9 h-9 mx-auto rounded-full border border-tertiary/50 flex items-center justify-center text-gold-bright mb-1">
                <span className="material-symbols-outlined text-base">history_edu</span>
              </div>
              <p className="font-arabic text-xl sm:text-2xl text-gold-bright font-bold leading-tight drop-shadow-sm">
                البداية والنهاية
              </p>
              <p className="font-body-sm text-xs sm:text-sm font-semibold tracking-wide text-white">
                Al-Bidāyah wan-Nihāyah
              </p>
              <p className="font-label-sm text-label-sm text-tertiary-fixed">Ibn Kathīr (d. 774 AH)</p>
            </div>
            <div className="relative z-10 pt-2 flex justify-between items-center text-label-xs sm:text-xs text-gold-bright/80 border-t border-tertiary/30">
              <span>Vol. 1 of 14</span>
              <span>840 pgs • 4K OCR</span>
            </div>
          </div>

          {/* Book 2: Ihya Ulum al-Din */}
          <div
            onClick={() => {
              const target = books.find((b) => b.id === 'ihya-ulum-al-din') || books[0];
              if (target) onSelectBook(target);
              else onNavigate('browse-library');
            }}
            className="absolute -right-2 sm:-right-4 top-8 sm:top-12 w-52 sm:w-60 h-78 sm:h-86 rounded-2xl bg-gradient-to-br from-secondary via-on-secondary-fixed to-secondary-fixed-dim text-tertiary-fixed shadow-2xl p-4 flex flex-col justify-between transform rotate-12 hover:rotate-4 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-tertiary/40 group"
          >
            <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-tertiary-container/40 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 opacity-15 bg-tertiary/10 bg-repeat"></div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="font-label-sm text-label-xs sm:text-xs px-2.5 py-0.5 rounded-full bg-tertiary-container/20 text-gold-bright border border-tertiary/40 font-bold uppercase tracking-wider">
                Tazkiyah Canon
              </span>
              <span className="material-symbols-outlined text-gold-bright text-base sm:text-lg">workspace_premium</span>
            </div>
            <div className="relative z-10 text-center space-y-1 my-auto">
              <div className="w-9 h-9 mx-auto rounded-full border border-tertiary/50 flex items-center justify-center text-gold-bright mb-1">
                <span className="material-symbols-outlined text-base">psychology</span>
              </div>
              <p className="font-arabic text-xl sm:text-2xl text-gold-bright font-bold leading-tight drop-shadow-sm">
                إحياء علوم الدين
              </p>
              <p className="font-body-sm text-xs sm:text-sm font-semibold tracking-wide text-white">
                Iḥyā’ ‘Ulūm al-Dīn
              </p>
              <p className="font-label-sm text-label-sm text-tertiary-fixed">Imām al-Ghazālī (d. 505 AH)</p>
            </div>
            <div className="relative z-10 pt-2 flex justify-between items-center text-label-xs sm:text-xs text-gold-bright/80 border-t border-tertiary/30">
              <span>Critical Recension</span>
              <span>1,120 pgs • Verified</span>
            </div>
          </div>

          {/* Book 3: Center Pedestal Book */}
          {centerBook && (
            <div
              onClick={() => {
                onOpenReader(centerBook);
              }}
              className="relative z-20 w-60 sm:w-68 h-88 sm:h-reader-shelf rounded-2xl bg-gradient-to-b from-surface-container-lowest via-surface-container-low to-surface-container-lowest text-on-surface shadow-2xl p-5 flex flex-col justify-between transform hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 cursor-pointer border-2 border-tertiary/60 ring-2 ring-tertiary/20"
            >
              <div className="absolute inset-2 rounded-xl border border-tertiary/30 pointer-events-none"></div>

              <div className="relative z-10 flex justify-between items-center">
                <span className="inline-flex items-center gap-1.5 font-label-sm text-xs px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {centerBook.disciplineName || 'Featured Codex'}
                </span>
                <span className="font-label-sm text-xs text-tertiary font-bold tracking-wider">
                  {centerBook.authorHijriYear || '1445 AH Codex'}
                </span>
              </div>

              <div className="relative z-10 my-auto text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-surface-container-high border border-tertiary/40 flex items-center justify-center text-tertiary shadow-xs">
                  <span className="material-symbols-outlined text-2xl text-gold-dark dark:text-gold-bright">menu_book</span>
                </div>
                <h2 className="font-arabic text-2xl sm:text-3xl text-primary font-bold leading-none">
                  {centerBook.arabicTitle}
                </h2>
                <p className="font-display text-base sm:text-lg font-bold text-on-surface truncate">
                  {centerBook.title}
                </p>
                <p className="font-label-sm text-xs text-tertiary font-medium">
                  {centerBook.author}
                </p>
              </div>

              <div className="relative z-10 pt-2 border-t border-surface-container flex items-center justify-between text-xs font-semibold">
                <span className="text-on-surface-variant font-mono">
                  {centerBook.pages} pgs • {centerBook.edition}
                </span>
                <span className="text-primary flex items-center gap-1 font-bold">
                  Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

