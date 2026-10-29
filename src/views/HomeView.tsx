import React, { useState, useMemo, useCallback } from 'react';
import { Book, CategoryScience, IsnadNode, ReaderTheme, ReadingSection, WordAnalysis } from '../types/library';
import { HomeSettings } from '../types/homeSettings';
import { DEFAULT_HOME_SETTINGS } from '../data/homeSettingsStore';

interface HomeViewProps {
  books: Book[];
  categories: CategoryScience[];
  readingSection: ReadingSection;
  homeSettings?: HomeSettings;
  onSelectBook: (book: Book) => void;
  onOpenReader: (book?: Book) => void;
  onOpenDownload: (book: Book) => void;
  onOpenNarrator: (narrator: IsnadNode) => void;
  onOpenWordAnalysis: (word: WordAnalysis) => void;
  onNavigate: (path: string) => void;
  onSearchQuery: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  books,
  categories,
  readingSection,
  homeSettings,
  onSelectBook,
  onOpenReader,
  onOpenDownload,
  onOpenNarrator,
  onOpenWordAnalysis,
  onNavigate,
  onSearchQuery
}) => {
  const sections = homeSettings?.sections || DEFAULT_HOME_SETTINGS.sections;
  const activeReader = homeSettings?.readerSection || readingSection;

  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [activeFeaturedTab, setActiveFeaturedTab] = useState('All Works');
  
  // Reader interactive state
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('parchment');
  const [readerFontSize, setReaderFontSize] = useState<number>(18);
  const [showParallelTranslation, setShowParallelTranslation] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeFootnoteOpen, setActiveFootnoteOpen] = useState<boolean>(true);
  const [shareToast, setShareToast] = useState<boolean>(false);

  // Newsletter state
  const [dispatchEmail, setDispatchEmail] = useState('');
  const [dispatchSubscribed, setDispatchSubscribed] = useState(false);

  const filterTabs = ['All Works', 'Most Read', 'Recently Digitized', 'Rare Manuscripts', 'Bilingual (Ar/En)'];

  const filteredBooks = useMemo(() => {
    let source = books;
    if (sections.featuredShelf.selectionMode === 'custom' && sections.featuredShelf.selectedBookIds.length > 0) {
      const customMatches = books.filter((b) => sections.featuredShelf.selectedBookIds.includes(b.id));
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
  }, [books, sections.featuredShelf, activeFeaturedTab]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      onSearchQuery(heroSearchInput);
      onNavigate('browse-library');
    }
  };

  const handleTagClick = (tag: string) => {
    onSearchQuery(tag);
    onNavigate('browse-library');
  };

  const handleShareHadith = () => {
    navigator.clipboard?.writeText(
      `Ṣaḥīḥ al-Bukhārī, Hadīth #1: “The reward of deeds depends upon the intentions...” [Al-Maktabah Digital Archives]`
    );
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchEmail) return;
    setDispatchSubscribed(true);
    setTimeout(() => {
      setDispatchEmail('');
      setDispatchSubscribed(false);
    }, 4500);
  };

  return (
    <div className="w-full">
      {/* Top Daily Ayah / Hadith Calligraphic Banner */}
      {sections.dailyBanner.enabled && (
        <div className="relative w-full overflow-hidden rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 border border-tertiary/40 bg-gradient-to-r from-surface-container-high/90 via-surface-container-lowest to-surface-container-high/90 shadow-md">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-tertiary-container/25 to-tertiary-container/30 text-gold-dark dark:text-gold-bright border border-tertiary/40 shadow-xs shrink-0">
                <span className="material-symbols-outlined text-lg">auto_stories</span>
              </span>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 min-w-0">
                <span className="font-arabic text-xl sm:text-2xl text-tertiary font-bold tracking-wide leading-none">
                  {sections.dailyBanner.arabicText || '« رَبِّ زِدْنِي عِلْمًا »'}
                </span>
                <span className="font-body-sm text-xs sm:text-sm text-on-surface-variant font-medium">
                  {sections.dailyBanner.translation || '“My Lord, increase me in knowledge.”'}{' '}
                  <span className="text-tertiary font-label-sm text-label-sm sm:text-xs font-bold tracking-wider ml-1 bg-tertiary-container/15 px-2 py-0.5 rounded-full border border-tertiary/20">
                    {sections.dailyBanner.reference || 'Surah Ṭā-Hā 20:114'}
                  </span>
                </span>
              </div>
            </div>
          </div>
          {/* Ambient subtle geometric watermark */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 pointer-events-none text-tertiary">
            <svg fill="currentColor" viewBox="0 0 100 100">
              <polygon points="50,0 62,38 100,38 69,62 81,100 50,75 19,100 31,62 0,38 38,38"></polygon>
            </svg>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {sections.heroSection.enabled && (
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
              Authentic Islamic Codices &amp; Scholarly Archives
              <span className="block font-display italic text-tertiary font-normal mt-1.5 text-2xl sm:text-3xl md:text-4xl">
                Open, Peer-Reviewed &amp; Preserved for Posterity.
              </span>
            </h1>
            <p className="font-body-lg text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Explore over 14,000 verified manuscripts, canonical Hadīth recensions with traced isnād chains, and foundational legal treatises in pristine typography with instant morphological apparatus.
            </p>
          </div>

          {/* Interactive Search Pill */}
          {/* <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl p-2 shadow-lg border border-surface-container-high focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-primary/20 transition-all duration-300">
            <form onSubmit={handleHeroSearchSubmit} className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1">
              <span className="material-symbols-outlined text-tertiary text-2xl shrink-0">menu_book</span>
              <input
                className="w-full bg-transparent border-0 focus:outline-none font-body-md text-sm sm:text-base text-on-surface placeholder:text-outline"
                placeholder="Search treatises, isnād chains, authors (e.g. Bukhari, Ghazali, Nawawi)..."
                type="text"
                value={heroSearchInput}
                onChange={(e) => setHeroSearchInput(e.target.value)}
              />
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-label-sm font-mono text-outline bg-surface-container border border-surface-container-high shrink-0">
                ⌘K
              </span>
              <button
                type="submit"
                className="shrink-0 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-title-md text-xs sm:text-sm font-bold hover:shadow-md hover:brightness-105 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Search</span>
                <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
              </button>
            </form>
            <div className="mt-2 pt-2 px-2 sm:px-3 flex items-center gap-2 bg-surface-container-low/60 rounded-xl py-1.5 border-t border-surface-container overflow-x-auto">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold shrink-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-tertiary">bolt</span>
                Direct Access:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap sm:flex-wrap">
                {['Sahih al-Bukhari', 'Ihya Ulum al-Din', 'Riyad as-Salihin', 'Tafsir Ibn Kathir', 'Usul al-Fiqh'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-2.5 py-0.5 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-white text-on-surface-variant font-label-sm text-xs transition-all shadow-2xs border border-surface-container hover:border-primary cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div> */}

          {/* Action Buttons */}
          {/* <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('browse-library')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-title-md text-sm font-bold shadow-md shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">local_library</span>
              <span>Explore 14,000+ Titles</span>
            </button>
            <button
              onClick={() => onOpenReader()}
              className="px-6 py-3.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-title-md text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer border border-tertiary/40 hover:border-tertiary"
            >
              <span className="material-symbols-outlined text-lg text-tertiary">chrome_reader_mode</span>
              <span>Launch Web Reader Studio</span>
            </button>
          </div> */}

          {/* Metrics Strip with Luxury Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all border border-surface-container group">
              <div className="flex items-center justify-between mb-1">
                <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
              </div>
              <div className="font-headline-sm text-xl sm:text-2xl font-extrabold text-primary">Verified+</div>
              {/* <div className="font-label-sm text-xs text-on-surface-variant font-medium mt-0.5">Verified Codices</div> */}
            </div>

            <div className="p-3.5 bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all border border-tertiary/30 group">
              <div className="flex items-center justify-between mb-1">
                <span className="material-symbols-outlined text-tertiary text-xl">volunteer_activism</span>
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary/40 group-hover:bg-tertiary transition-colors"></span>
              </div>
              <div className="font-headline-sm text-xl sm:text-2xl font-extrabold text-tertiary">100% Free</div>
              <div className="font-label-sm text-xs text-on-surface-variant font-medium mt-0.5">Waqf Endowment</div>
            </div>

            {/* <div className="p-3.5 bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all border border-surface-container group">
              <div className="flex items-center justify-between mb-1">
                <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
              </div>
              <div className="font-headline-sm text-xl sm:text-2xl font-extrabold text-primary">48</div>
              <div className="font-label-sm text-xs text-on-surface-variant font-medium mt-0.5">Disciplines Catalogued</div>
            </div> */}

            {/* <div className="p-3.5 bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all border border-surface-container group">
              <div className="flex items-center justify-between mb-1">
                <span className="material-symbols-outlined text-secondary text-xl">public</span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 group-hover:bg-secondary transition-colors"></span>
              </div>
              <div className="font-headline-sm text-xl sm:text-2xl font-extrabold text-secondary">1.2M+</div>
              <div className="font-label-sm text-xs text-on-surface-variant font-medium mt-0.5">Pages Digitized</div>
            </div> */}
          </div>
        </div>

        {/* Right Hero Column: 3D Showcase of Classic Volumes */}
        <div className="lg:col-span-5 relative flex items-center justify-center py-6 sm:py-10 select-none overflow-hidden sm:overflow-visible">
          {/* Ambient Multi-layer Glow Behind Stack */}
          <div className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-tertiary-container/15 filter blur-3xl pointer-events-none"></div>
          <div className="absolute w-56 sm:w-64 h-56 sm:h-64 rounded-full bg-primary/20 filter blur-2xl pointer-events-none"></div>
          
          <div className="relative w-full max-w-shelf-card xs:max-w-sm sm:max-w-md h-96 sm:h-[28rem] flex items-center justify-center scale-[0.92] xs:scale-95 sm:scale-100 origin-center">
            {/* Book 1: Al-Bidayah wan-Nihayah (Background, offset left) */}
            <div
              onClick={() => {
                const target = books.find(b => b.id === 'bidayah-wan-nihayah') || books[0];
                if (target) onSelectBook(target);
                else onNavigate('browse-library');
              }}
              className="absolute -left-2 sm:-left-4 top-4 sm:top-6 w-48 sm:w-56 h-72 sm:h-82 rounded-2xl bg-gradient-to-br from-emerald-dark via-emerald-deep to-primary text-tertiary-fixed shadow-2xl p-4 flex flex-col justify-between transform -rotate-12 hover:-rotate-4 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-tertiary/40 group"
            >
              {/* Gold foil corner ornament */}
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
                <p className="font-body-sm text-xs sm:text-sm font-semibold tracking-wide text-white">Al-Bidāyah wan-Nihāyah</p>
                <p className="font-label-sm text-label-sm text-tertiary-fixed">Ibn Kathīr (d. 774 AH)</p>
              </div>
              <div className="relative z-10 pt-2 flex justify-between items-center text-label-xs sm:text-xs text-gold-bright/80 border-t border-tertiary/30">
                <span>Vol. 1 of 14</span>
                <span>840 pgs • 4K OCR</span>
              </div>
            </div>

            {/* Book 2: Ihya Ulum al-Din (Middle, offset right) */}
            <div
              onClick={() => {
                const target = books.find(b => b.id === 'ihya-ulum-al-din') || books[0];
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
                <p className="font-body-sm text-xs sm:text-sm font-semibold tracking-wide text-white">Iḥyā’ ‘Ulūm al-Dīn</p>
                <p className="font-label-sm text-label-sm text-tertiary-fixed">Imām al-Ghazālī (d. 505 AH)</p>
              </div>
              <div className="relative z-10 pt-2 flex justify-between items-center text-label-xs sm:text-xs text-gold-bright/80 border-t border-tertiary/30">
                <span>Critical Recension</span>
                <span>1,120 pgs • Verified</span>
              </div>
            </div>

            {/* Book 3: Center Pedestal Book */}
            {(() => {
              const centerBook = sections.heroSection.centerBookId
                ? books.find(b => b.id === sections.heroSection.centerBookId) || books.find(b => b.id === 'riyad-salihin') || books[0]
                : books.find(b => b.id === 'riyad-salihin') || books[0];
              return (
                <div
                  onClick={() => {
                    if (centerBook) onOpenReader(centerBook);
                    else onNavigate('browse-library');
                  }}
                  className="relative z-20 w-60 sm:w-68 h-88 sm:h-reader-shelf rounded-2xl bg-gradient-to-b from-surface-container-lowest via-surface-container-low to-surface-container-lowest text-on-surface shadow-2xl p-5 flex flex-col justify-between transform hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 cursor-pointer border-2 border-tertiary/60 ring-2 ring-tertiary/20"
                >
                  {/* Ornate Inner Double Frame */}
                  <div className="absolute inset-2 rounded-xl border border-tertiary/30 pointer-events-none"></div>

                  <div className="relative z-10 flex justify-between items-center">
                    <span className="inline-flex items-center gap-1.5 font-label-sm text-xs px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-bold shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {centerBook?.disciplineName || 'Featured Codex'}
                    </span>
                    <span className="font-label-sm text-xs text-tertiary font-bold tracking-wider">
                      {centerBook?.authorHijriYear || '1445 AH Codex'}
                    </span>
                  </div>

                  <div className="relative z-10 my-auto text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-surface-container-high border border-tertiary/40 flex items-center justify-center text-tertiary shadow-xs">
                      <span className="material-symbols-outlined text-2xl text-gold-dark dark:text-gold-bright">menu_book</span>
                    </div>
                    <h2 className="font-arabic text-2xl sm:text-3xl text-primary font-bold leading-none">
                      {centerBook?.arabicTitle || 'رياض الصالحين'}
                    </h2>
                    <p className="font-display text-base sm:text-lg font-bold text-on-surface truncate">
                      {centerBook?.title || 'Riyāḍ aṣ-Ṣāliḥīn'}
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant font-medium line-clamp-1">
                      {centerBook?.description || 'The Gardens of the Righteous'}
                    </p>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-tertiary-container to-transparent mx-auto rounded"></div>
                    <p className="font-label-sm text-xs text-tertiary font-bold truncate">
                      {centerBook?.author || 'Imām Yaḥyā ibn Sharaf an-Nawawī'}
                    </p>
                  </div>

                  <div className="relative z-10 bg-surface-container-high/90 rounded-xl p-2.5 flex items-center justify-between text-on-surface-variant font-label-sm text-xs border border-tertiary/30 shadow-xs">
                    <div className="flex items-center gap-1.5 text-primary font-semibold">
                      <span className="material-symbols-outlined text-base text-primary">auto_stories</span>
                      <span>{centerBook?.pages || 720} Pages • Verified</span>
                    </div>
                    <span className="font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Read Live →
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
          
          {/* Physical Pedestal Shadow */}
          <div className="absolute bottom-2 w-72 sm:w-96 h-6 bg-black/15 blur-xl rounded-full pointer-events-none"></div>
        </div>
      </section>
      )}

      {/* Category Showcase Grid (Controlled from Admin) */}
      {sections.categoriesGrid.enabled && (
        <section className="py-8 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                <span className="font-label-sm text-xs uppercase tracking-wider text-tertiary font-bold">
                  Classification of Islamic Sciences (Tartīb al-‘Ulūm)
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary">
                {sections.categoriesGrid.title || 'Classified Sciences of Knowledge'}
              </h2>
              <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-xl">
                {sections.categoriesGrid.subtitle || 'Systematically organized primary sources across canonical jurisprudence, exegesis, transmitted prophetic traditions, and sacred theology.'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('categories')}
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 font-title-md text-sm font-bold text-primary hover:text-tertiary transition-colors cursor-pointer group"
            >
              <span>View All 28 Classifications</span>
              <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.slice(0, sections.categoriesGrid.maxDisplay || 6).map((cat, idx) => {
              const disciplineGradients = [
                'hover:border-emerald-500/50 hover:shadow-emerald-950/10',
                'hover:border-amber-500/50 hover:shadow-amber-950/10',
                'hover:border-sky-500/50 hover:shadow-sky-950/10',
                'hover:border-purple-500/50 hover:shadow-purple-950/10',
                'hover:border-teal-500/50 hover:shadow-teal-950/10',
                'hover:border-rose-500/50 hover:shadow-rose-950/10'
              ];
              const iconBg = [
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                'bg-sky-500/10 text-sky-600 dark:text-sky-400',
                'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                'bg-teal-500/10 text-teal-600 dark:text-teal-400',
                'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              ];
              const activeGrad = disciplineGradients[idx % disciplineGradients.length];
              const activeIcon = iconBg[idx % iconBg.length];

              return (
                <div
                  key={cat.id}
                  onClick={() => onNavigate('categories')}
                  className={`group relative bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-surface-container cursor-pointer overflow-hidden ${activeGrad}`}
                >
                  <span className="absolute -bottom-4 -right-2 font-arabic text-6xl text-on-surface/[0.03] select-none pointer-events-none group-hover:scale-105 transition-transform">
                    {cat.arabicName}
                  </span>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-2xs ${activeIcon}`}>
                        <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                      </span>
                      <span className="font-arabic text-xl sm:text-2xl text-tertiary font-bold">
                        {cat.arabicName}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-primary group-hover:text-tertiary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 font-label-sm">
                      {cat.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-surface-container-low text-label-sm text-on-surface-variant font-medium border border-surface-container">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 flex items-center justify-between text-on-surface-variant font-label-sm text-xs border-t border-surface-container relative z-10">
                    <span className="font-bold text-primary">{cat.volumeCount.toLocaleString()} Verified Volumes</span>
                    <span className="group-hover:translate-x-1 transition-transform text-tertiary font-bold flex items-center gap-1">
                      Explore Branch →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured & Recommended Books Shelf */}
      {sections.featuredShelf.enabled && (
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
              {sections.featuredShelf.title || 'Featured Critical Editions'}
            </h2>
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
              {sections.featuredShelf.subtitle || 'Rigorous recensions with isnād apparatus, academic footnotes, and dual-language parallel views.'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container-high rounded-xl overflow-x-auto border border-surface-container scrollbar-none">
            {filterTabs.map((tab) => (
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

        {/* 4 Rich Book Cards Grid */}
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
                  {/* Book Spine shadow overlay */}
                  <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none"></div>
                  {/* Bottom dark gradient for text legibility */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>

                  <div className="absolute top-2.5 left-3 flex gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-xs font-bold shadow-xs backdrop-blur-xs ${book.badgeColor || 'bg-primary-container text-on-primary'}`}>
                      {book.badge || book.disciplineName}
                    </span>
                  </div>
                  
                  {book.verified && (
                    <div className="absolute top-2.5 right-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs" title="Academic Council Verified">
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
                        <span key={i} className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-xs font-semibold border border-surface-container-high">
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
      )}

      {/* In-Browser Desktop Reading Experience Preview */}
      {sections.readerPreview.enabled && (
      <section className="py-8 sm:py-12" id="reader-preview">
        <div className="space-y-2 mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-low text-tertiary font-label-sm text-xs font-bold border border-tertiary/30">
            <span className="material-symbols-outlined text-sm text-tertiary">devices</span>
            <span>Zero Installation • Built-in Scholar Apparatus</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary">
            Next-Gen Scholarly Reading Interface
          </h2>
          <p className="font-body-md text-xs sm:text-base text-on-surface-variant">
            Seamless parallel translation, instant morphological breakdown, isnād node inspection, and synchronized vocalization in one distraction-free canvas.
          </p>
        </div>

        {/* Mockup Container with Gold Leaf Border */}
        <div className={`rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-tertiary/40 transition-colors ring-1 ring-tertiary/20 ${
          readerTheme === 'night' 
            ? 'bg-night-card text-night-text' 
            : readerTheme === 'sepia' 
              ? 'bg-parchment-canvas text-sepia-text' 
              : 'bg-surface-container-lowest text-on-surface'
        }`}>
          {/* Reader Toolbar */}
          <div className="bg-surface-container-low/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-surface-container">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-2xs"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-2xs"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-2xs"></span>
              </div>
              <span className="font-display text-xs sm:text-sm font-bold text-primary truncate max-w-xs sm:max-w-md">
                {activeReader.bookTitle} — Book {activeReader.chapterNumber}: {activeReader.chapterTitleEn}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 text-on-surface-variant">
              {/* Canvas Theme Selector */}
              <div className="hidden sm:flex items-center bg-surface-container rounded-lg p-0.5 gap-0.5 text-xs border border-surface-container-high">
                <button
                  onClick={() => setReaderTheme('parchment')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    readerTheme === 'parchment' ? 'bg-surface-container-lowest text-primary font-bold shadow-xs' : 'hover:text-on-surface'
                  }`}
                >
                  Parchment
                </button>
                <button
                  onClick={() => setReaderTheme('night')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    readerTheme === 'night' ? 'bg-surface-container text-white font-bold shadow-xs' : 'hover:text-on-surface'
                  }`}
                >
                  Night
                </button>
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    readerTheme === 'sepia' ? 'bg-sepia-border text-sepia-text font-bold shadow-xs' : 'hover:text-on-surface'
                  }`}
                >
                  Sepia
                </button>
              </div>

              {/* Font Sizer */}
              <div className="flex items-center bg-surface-container rounded-lg px-2 py-1 gap-1.5 border border-surface-container-high">
                <button
                  onClick={() => setReaderFontSize(Math.max(14, readerFontSize - 2))}
                  className="font-label-sm text-xs font-bold px-1 hover:text-primary cursor-pointer"
                  title="Smaller font"
                >
                  A-
                </button>
                <span className="text-xs text-outline/50">|</span>
                <button
                  onClick={() => setReaderFontSize(Math.min(26, readerFontSize + 2))}
                  className="font-label-sm text-xs font-bold px-1 hover:text-primary cursor-pointer"
                  title="Larger font"
                >
                  A+
                </button>
              </div>

              {/* Parallel Split Toggle */}
              <button
                onClick={() => setShowParallelTranslation(!showParallelTranslation)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  showParallelTranslation ? 'bg-primary-container text-on-primary shadow-xs' : 'hover:bg-surface-container'
                }`}
                title="Toggle Parallel Translation"
              >
                <span className="material-symbols-outlined text-lg">vertical_split</span>
              </button>

              {/* Audio Playback button */}
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isPlayingAudio ? 'bg-emerald-600 text-white animate-pulse shadow-xs' : 'hover:bg-surface-container'
                }`}
                title={isPlayingAudio ? "Pause Recitation" : "Listen to Recitation"}
              >
                <span className="material-symbols-outlined text-lg">
                  {isPlayingAudio ? 'pause' : 'volume_up'}
                </span>
              </button>

              {/* Admin Reader Controls Link */}
              <a
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tertiary-container/15 hover:bg-tertiary-container/30 text-gold-dark dark:text-gold-bright border border-tertiary/40 font-label-sm text-xs font-bold transition-colors"
                title="Change or customize this reader in Admin Portal"
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>Admin Control</span>
              </a>

              {/* Full Reader Studio View */}
              <button
                onClick={() => onOpenReader()}
                className="p-1.5 rounded-lg hover:bg-surface-container cursor-pointer text-primary font-bold"
                title="Open in Dedicated Reader Studio"
              >
                <span className="material-symbols-outlined text-lg">fullscreen</span>
              </button>
            </div>
          </div>

          {/* Reader Body (Dual Pane Preview) */}
          <div className="grid grid-cols-12 min-h-reader-shelf">
            {/* Left Marginalia Sidebar */}
            <div className="hidden md:block md:col-span-3 bg-surface-container-low/40 p-5 space-y-5 border-r border-surface-container">
              <div className="space-y-1">
                <p className="font-label-sm text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                  Table of Contents
                </p>
                <p className="font-display text-sm font-bold text-primary">
                  Hadīth #{activeReader.entryNumber} of {activeReader.totalEntries.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1.5 font-body-sm text-xs">
                <div className="p-2.5 rounded-xl bg-surface-container-lowest text-primary font-bold shadow-xs flex items-center justify-between border border-tertiary/40">
                  <span>1. {activeReader.chapterTitleEn}</span>
                  <span className="material-symbols-outlined text-xs text-tertiary">chevron_right</span>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-between cursor-pointer">
                  <span>2. The Book of Belief (Īmān)</span>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-between cursor-pointer">
                  <span>3. The Book of Knowledge (‘Ilm)</span>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-between cursor-pointer">
                  <span>4. The Book of Ablution (Wuḍū’)</span>
                </div>
              </div>

              {/* Chain of Transmission Snapshot */}
              <div className="pt-4 space-y-2.5 border-t border-surface-container">
                <div className="flex items-center justify-between">
                  <p className="font-label-sm text-xs uppercase tracking-wider font-bold text-tertiary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">hub</span>
                    Isnād Chain Nodes
                  </p>
                  <span className="text-label-xs text-on-surface-variant font-semibold">Inspect</span>
                </div>
                <div className="space-y-1 text-xs text-on-surface-variant">
                  {activeReader.isnadChain.slice(0, 4).map((node, i) => (
                    <div key={node.id}>
                      <button
                        onClick={() => onOpenNarrator(node)}
                        className="flex items-center gap-2 text-left hover:text-primary transition-colors cursor-pointer group py-0.5"
                      >
                        <span className={`w-2 h-2 rounded-full group-hover:scale-125 transition-transform ${
                          i === 0 ? 'bg-tertiary-container' : 'bg-primary'
                        }`}></span>
                        <span className="group-hover:underline truncate max-w-44 text-label-sm font-medium">{node.name}</span>
                      </button>
                      {i < 3 && <div className="ml-1 w-0.5 h-1.5 bg-outline-variant/60"></div>}
                    </div>
                  ))}
                  {activeReader.isnadChain.length > 0 && (
                    <>
                      <div className="ml-1 w-0.5 h-1.5 bg-outline-variant/60"></div>
                      <button
                        onClick={() => onOpenNarrator(activeReader.isnadChain[activeReader.isnadChain.length - 1])}
                        className="flex items-center gap-2 font-bold text-primary hover:text-tertiary transition-colors cursor-pointer text-left py-0.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-label-sm">{activeReader.isnadChain[activeReader.isnadChain.length - 1].name}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Center Reading Canvas */}
            <div className="col-span-12 md:col-span-9 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
              {isPlayingAudio && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-700 dark:text-emerald-300 shadow-xs">
                  <div className="flex items-center gap-3">
                    {/* Animated Audio Equalizer Bars */}
                    <div className="flex items-end gap-1 h-4">
                      <span className="w-1 bg-emerald-500 h-3 animate-pulse"></span>
                      <span className="w-1 bg-emerald-500 h-4 animate-bounce"></span>
                      <span className="w-1 bg-emerald-500 h-2 animate-pulse"></span>
                      <span className="w-1 bg-emerald-500 h-4 animate-bounce"></span>
                    </div>
                    <span>Recitation Active: <strong>{sections.readerPreview.audioReciter || 'Sheikh Mishary Rashid Alafasy'}</strong> ({activeReader.chapterTitleAr || activeReader.chapterTitleEn})</span>
                  </div>
                  <span className="font-mono text-xs font-bold shrink-0 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                    {sections.readerPreview.audioDuration || '00:42 / 01:15'}
                  </span>
                </div>
              )}

              <div className={`grid gap-6 ${showParallelTranslation ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Left Pane: English Vernacular & Scholarly Annotations */}
                {showParallelTranslation && (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 font-label-sm text-xs text-on-surface-variant flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-bold shadow-2xs">
                        {activeReader.englishHeading}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">• {activeReader.authenticityStatus}</span>
                    </div>

                    <div 
                      className="space-y-3 font-body-lg leading-relaxed"
                      style={{ fontSize: `${readerFontSize}px` }}
                    >
                      <p>
                        {activeReader.englishLeadText}{' '}
                        <span className="font-bold text-primary underline decoration-tertiary decoration-2">
                          {activeReader.englishHighlightText}
                        </span>
                      </p>
                      {activeReader.englishSubsequentText && (
                        <p className="font-body-md text-on-surface-variant">
                          {activeReader.englishSubsequentText}
                        </p>
                      )}
                    </div>

                    {/* Collapsible Scholarly Marginalia */}
                    {activeReader.footnotes && activeReader.footnotes.length > 0 && (
                      <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-surface-container">
                        <div 
                          onClick={() => setActiveFootnoteOpen(!activeFootnoteOpen)}
                          className="flex items-center justify-between text-tertiary font-title-md text-sm font-bold cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">notes</span>
                            <span>{activeReader.footnotes[0].code} — {activeReader.footnotes[0].title}</span>
                          </span>
                          <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1">
                            <span>{activeReader.footnotes[0].scholar} ({activeReader.footnotes[0].scholarDeathAH})</span>
                            <span className="material-symbols-outlined text-xs">
                              {activeFootnoteOpen ? 'expand_less' : 'expand_more'}
                            </span>
                          </span>
                        </div>
                        {activeFootnoteOpen && (
                          <p className="font-body-sm text-xs text-on-surface-variant pt-1 leading-relaxed border-t border-surface-container-high/60">
                            {activeReader.footnotes[0].text}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Right Pane: Classical Arabic (RTL, authentic spacing) */}
                <div className="space-y-4 text-right flex flex-col justify-between" dir="rtl" lang="ar">
                  <div className="inline-flex items-center gap-2 self-start font-label-sm text-xs text-tertiary">
                    <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">حَدِيثٌ صَحِيحٌ</span>
                    <span className="text-outline-variant">•</span>
                    <span className="font-bold">رَقْمُ الحَدِيثِ : {activeReader.entryNumber}</span>
                  </div>

                  <div className="space-y-4">
                    {activeReader.arabicLead && (
                      <p 
                        className="font-arabic text-primary leading-loose font-medium"
                        style={{ fontSize: `${Math.round(readerFontSize * 1.35)}px` }}
                      >
                        {activeReader.arabicLead}
                      </p>
                    )}

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-tertiary-container/15 to-transparent text-right border-2 border-tertiary/40 shadow-xs">
                      <p 
                        className="font-arabic font-bold text-primary leading-relaxed"
                        style={{ fontSize: `${Math.round(readerFontSize * 1.45)}px` }}
                      >
                        {activeReader.arabicMatn}
                      </p>
                    </div>

                    {/* Interactive Word Inspector strip */}
                    {activeReader.wordAnalyses && activeReader.wordAnalyses.length > 0 && (
                      <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant space-y-1.5 border border-surface-container" dir="ltr">
                        <div className="flex items-center justify-between text-tertiary font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">spellcheck</span>
                            Click Word for Root Morphology:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {activeReader.wordAnalyses.map((w, idx) => (
                            <button
                              key={idx}
                              onClick={() => onOpenWordAnalysis(w)}
                              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-primary font-arabic text-sm transition-all cursor-pointer border border-surface-container-high shadow-2xs hover:scale-105"
                            >
                              {w.arabic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-on-surface-variant font-label-sm text-xs" dir="ltr">
                    <button
                      onClick={handleShareHadith}
                      className="inline-flex items-center gap-1.5 text-primary hover:text-tertiary font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">share</span>
                      <span>{shareToast ? 'Hadith link copied!' : 'Share Hadith'}</span>
                    </button>
                    <span className="text-outline-variant font-mono text-label-sm">{activeReader.arabicSubtext}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Reader Nav Ribbon */}
              <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-body-sm text-xs sm:text-sm border-t border-surface-container">
                <button 
                  onClick={() => onOpenReader()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 hover:text-primary font-bold cursor-pointer py-2 px-3 rounded-xl bg-surface-container-low sm:bg-transparent"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Previous Section
                </button>
                <span className="font-label-sm text-xs text-center text-on-surface-variant/80 font-semibold">
                  Page {activeReader.currentPage} of {activeReader.totalPages} • {activeReader.chapterTitleAr || activeReader.chapterTitleEn}
                </span>
                <button 
                  onClick={() => onOpenReader()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 hover:text-primary font-bold cursor-pointer py-2 px-3 rounded-xl bg-surface-container-low sm:bg-transparent"
                >
                  Next Section <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* About Al-Maktabah & Scholarly Mission (2-Column Minimalist Layout) */}
      {sections.preservationSection.enabled && (
      <section className="py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Commitment to Waqf */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low text-primary font-label-sm text-xs font-bold border border-tertiary/30">
              <span className="material-symbols-outlined text-sm text-tertiary">verified</span>
              <span>Endowment for Eternity (Waqf Lillāh)</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary">
              Our Commitment to Classical Preservation
            </h2>
            <p className="font-body-lg text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Knowledge in Islam is a communal obligation (<em>Farḍ Kifāyah</em>) and a timeless continuous charity (<em>Ṣadaqah Jāriyah</em>). Al-Maktabah operates as an independent academic digital waqf:
            </p>
            <div className="space-y-3 font-body-md text-xs sm:text-sm text-on-surface-variant">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl shrink-0 mt-0.5">check_circle</span>
                <p>
                  <strong className="text-primary">No Paywalls, Ever:</strong> Every manuscript, critical edition, and translation is 100% open-access without subscription barriers or commercial advertisements.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl shrink-0 mt-0.5">check_circle</span>
                <p>
                  <strong className="text-primary">4K Ultra-High Density Digitization:</strong> Preserving fragile papyri, parchment codices, and rare Ottoman/Abbasid bindings before physical decay destroys them.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl shrink-0 mt-0.5">check_circle</span>
                <p>
                  <strong className="text-primary">Rigorously Authenticated by Council:</strong> Every text is cross-referenced with extant historical copies by seasoned specialists in traditional Islamic philology.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Feature Matrix */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2.5 border border-surface-container">
              <div className="w-11 h-11 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">copyright</span>
              </div>
              <h3 className="font-display text-base font-bold text-primary">Open Academic Licensing</h3>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Licensed under CC-BY-NC for research centers, university faculties, and educational initiatives globally.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2.5 border border-surface-container">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined text-2xl">spellcheck</span>
              </div>
              <h3 className="font-display text-base font-bold text-primary">Morphological Search</h3>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Search with full Arabic diacritics (<em>tashkīl</em>) or stripped bare roots with stem lemmatization support.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2.5 border border-surface-container">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-2xl">sync_alt</span>
              </div>
              <h3 className="font-display text-base font-bold text-primary">Cross-Referencing</h3>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Instant live bidirectional links connecting Hadith citations directly into corresponding Qur’anic verses.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2.5 border border-surface-container">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <span className="material-symbols-outlined text-2xl">offline_pin</span>
              </div>
              <h3 className="font-display text-base font-bold text-primary">Offline Bundles</h3>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Download entire library sections as compressed standalone packages for rural madrasas with no internet.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Scholarly Newsletter & Digest Strip */}
      {sections.newsletterSection.enabled && (
      <section className="py-8 sm:py-12">
        <div className="rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden bg-gradient-to-br from-emerald-deep via-emerald-dark to-emerald-deep border-2 border-tertiary/40 text-tertiary-fixed">
          {/* Decorative Arabesque Vector Overlay */}
          <div className="absolute -right-12 -top-12 w-64 h-64 opacity-10 pointer-events-none text-tertiary">
            <svg fill="currentColor" viewBox="0 0 100 100">
              <polygon points="50,0 62,38 100,38 69,62 81,100 50,75 19,100 31,62 0,38 38,38"></polygon>
            </svg>
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-tertiary-container/20 text-gold-bright border border-tertiary/40 font-label-sm text-xs uppercase font-bold tracking-wider">
              <span className="material-symbols-outlined text-sm">mark_email_read</span>
              The Monthly Scholarly Dispatch
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              Join 140,000+ Seekers &amp; Researchers of Sacred Knowledge
            </h2>
            <p className="font-body-md text-xs sm:text-sm text-tertiary-fixed max-w-xl mx-auto leading-relaxed">
              Receive monthly digests of newly digitized manuscripts, authenticated translations, paleographic findings, and academic reading roadmaps. No promotional spam.
            </p>

            {dispatchSubscribed ? (
              <div className="p-4 bg-emerald-500/30 border border-emerald-400 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg">
                <span className="material-symbols-outlined text-2xl text-emerald-300">check_circle</span>
                <span>Alhamdulillah! You have been enrolled in the Monthly Scholarly Dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleDispatchSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                <input
                  className="w-full sm:w-auto flex-1 px-4 py-3.5 rounded-xl bg-white/95 text-stone-900 placeholder:text-stone-500 font-body-sm text-sm focus:outline-none focus:ring-2 focus:ring-tertiary shadow-lg"
                  placeholder="scholar@university.edu"
                  type="email"
                  value={dispatchEmail}
                  onChange={(e) => setDispatchEmail(e.target.value)}
                  required
                />
                <button
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-leaf via-tertiary-fixed to-tertiary-container text-stone-950 font-title-md text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg font-extrabold shrink-0 cursor-pointer"
                  type="submit"
                >
                  <span>Subscribe</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </form>
            )}

            <div className="flex items-center justify-center gap-4 text-tertiary-fixed font-label-sm text-xs pt-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-tertiary">lock</span> 100% Privacy Protected
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-tertiary">history_edu</span> Academic Editorial Board
              </span>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
};

