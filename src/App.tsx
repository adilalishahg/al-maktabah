'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Book, CategoryScience, IsnadNode, ReaderTheme, WordAnalysis } from './types/library';
import { BOOKS, MANUSCRIPTS, PRIMARY_READING_SECTION } from './data/mockLibrary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { DetailedBook } from './types/bookContent';
import { HomeSettings } from './types/homeSettings';
import { getStoredBooks, getPublicLibraryBooks, saveStoredBooks } from './data/bookStore';
import { getStoredCategories } from './data/categoryStore';
import { getHomeSettings, saveHomeSettings } from './data/homeSettingsStore';

// Lazy-loaded secondary views (Dynamic Code Splitting for ultra-fast LCP)
const BrowseLibraryView = lazy(() => import('./views/BrowseLibraryView').then((m) => ({ default: m.BrowseLibraryView })));
const CategoriesView = lazy(() => import('./views/CategoriesView').then((m) => ({ default: m.CategoriesView })));
const ReaderStudioView = lazy(() => import('./views/ReaderStudioView').then((m) => ({ default: m.ReaderStudioView })));
const ManuscriptsView = lazy(() => import('./views/ManuscriptsView').then((m) => ({ default: m.ManuscriptsView })));
const LatestReleasesView = lazy(() => import('./views/LatestReleasesView').then((m) => ({ default: m.LatestReleasesView })));
const AboutView = lazy(() => import('./views/AboutView').then((m) => ({ default: m.AboutView })));
const BookReaderView = lazy(() => import('./views/BookReaderView').then((m) => ({ default: m.BookReaderView })));

// Lazy-loaded interactive modals (Only fetched on demand)
const CommandPalette = lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const BookDetailModal = lazy(() => import('./components/BookDetailModal').then((m) => ({ default: m.BookDetailModal })));
const DownloadModal = lazy(() => import('./components/DownloadModal').then((m) => ({ default: m.DownloadModal })));
const NarratorBiographyModal = lazy(() => import('./components/NarratorBiographyModal').then((m) => ({ default: m.NarratorBiographyModal })));
const MorphologyModal = lazy(() => import('./components/MorphologyModal').then((m) => ({ default: m.MorphologyModal })));

// Loading spinner for async views
const ViewLoadingFallback = () => (
  <div className="min-h-[55vh] flex flex-col items-center justify-center p-8 text-center animate-pulse">
    <div className="w-14 h-14 rounded-2xl bg-[#0f382c]/10 dark:bg-[#0f382c]/30 flex items-center justify-center mb-3 text-[#0f382c] dark:text-[#a2b7ad]">
      <span className="material-symbols-outlined text-3xl animate-spin">menu_book</span>
    </div>
    <div className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 font-serif">
      Loading Scholarly Codex &amp; Digital Waqf Repository...
    </div>
    <div className="text-xs text-gray-400 mt-1">جاري تحميل المخطوطة والبيانات العلمية</div>
  </div>
);

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('home');
  const [currentTheme, setCurrentTheme] = useState<ReaderTheme>('parchment');
  const [currentLang, setCurrentLang] = useState<'EN' | 'AR'>('EN');
  const [publicBooks, setPublicBooks] = useState<Book[]>(() => getPublicLibraryBooks());
  const [categories, setCategories] = useState<CategoryScience[]>(() => getStoredCategories());
  const [homeSettings, setHomeSettings] = useState<HomeSettings>(() => getHomeSettings());

  // Modals state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [selectedBookForModal, setSelectedBookForModal] = useState<Book | null>(null);
  const [downloadBook, setDownloadBook] = useState<Book | null>(null);
  const [selectedNarrator, setSelectedNarrator] = useState<IsnadNode | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordAnalysis | null>(null);

  // Active book for reader studio
  const [readerBook, setReaderBook] = useState<Book>(BOOKS[1]); // Mukhtasar Bukhari
  const [detailedReaderBook, setDetailedReaderBook] = useState<DetailedBook | null>(() => {
    const list = getStoredBooks();
    return list[0] || null;
  });
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>(undefined);
  const [searchFilterQuery, setSearchFilterQuery] = useState<string>('');
  const [isFetchingDb, setIsFetchingDb] = useState<boolean>(false);

  // Sync stored books & categories with public library on mount & storage event
  const syncFromApi = () => {
    setIsFetchingDb(true);
    // Fetch live from MongoDB backend
    fetch('/api/books')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const booksList: DetailedBook[] | null = Array.isArray(data)
          ? data
          : (Array.isArray(data?.data) ? data.data : null);

        if (booksList !== null) {
          saveStoredBooks(booksList);
          setPublicBooks(getPublicLibraryBooks());
        }
      })
      .catch((err) => console.warn('Public site API books sync notice:', err))
      .finally(() => setIsFetchingDb(false));

    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('al_maktabah_categories_v1', JSON.stringify(data));
          setCategories(data);
        }
      })
      .catch((err) => console.warn('Public site API categories sync notice:', err));

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          saveHomeSettings(data.data);
          setHomeSettings(data.data);
        }
      })
      .catch((err) => console.warn('Public site API settings sync notice:', err));
  };

  useEffect(() => {
    const syncLibrary = () => {
      setPublicBooks(getPublicLibraryBooks());
      setCategories(getStoredCategories());
      setHomeSettings(getHomeSettings());
    };
    window.addEventListener('storage', syncLibrary);
    window.addEventListener('al_maktabah_settings_updated', syncLibrary);
    syncFromApi();

    return () => {
      window.removeEventListener('storage', syncLibrary);
      window.removeEventListener('al_maktabah_settings_updated', syncLibrary);
    };
  }, []);

  // Apply theme to document body
  useEffect(() => {
    document.body.classList.remove('theme-sepia', 'theme-night');
    if (currentTheme === 'sepia') {
      document.body.classList.add('theme-sepia');
    } else if (currentTheme === 'night') {
      document.body.classList.add('theme-night');
    }
  }, [currentTheme]);

  // Scroll to top on navigation change and refresh books
  const navigateTo = (path: string) => {
    if (path === 'admin') {
      window.location.href = '/admin';
      return;
    }
    setPublicBooks(getPublicLibraryBooks());
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReader = (book?: Book) => {
    if (book) {
      setReaderBook(book);
      const stored = getStoredBooks();
      const detailed = stored.find(
        (b) => b.id === book.id || b.title.toLowerCase().trim() === book.title.toLowerCase().trim()
      );
      if (detailed) {
        setDetailedReaderBook(detailed);
        setActiveChapterId(undefined);
        navigateTo('book-viewer');

        // Stale-While-Revalidate: fetch complete full-text chapters from database in background
        fetch(`/api/books/${book.id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            if (json?.data?.chapters?.length) {
              setDetailedReaderBook(json.data);
            }
          })
          .catch(() => {});
        return;
      }

      // Universal fallback to BookReaderView
      const runtimeDetailed: DetailedBook = {
        id: book.id,
        title: book.title,
        arabicTitle: book.arabicTitle,
        author: book.author,
        authorHijriYear: book.authorHijriYear,
        discipline: book.discipline,
        disciplineName: book.disciplineName,
        coverImage: book.coverImage,
        description: book.description,
        pages: book.pages,
        sizeMb: book.sizeMb,
        edition: book.edition,
        volumes: book.volumes,
        verified: book.verified,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        formats: book.formats,
        chapters: [
          {
            id: 'ch-1',
            number: 1,
            title: 'Foundational Recension & Matn',
            arabicTitle: book.arabicTitle,
            startPage: 1,
            content: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.',
            translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds, and peace and blessings be upon the Messenger of Allah.',
            notes: 'Critical edition verified against Ottoman & Andalusian codices with full isnād transmission.',
          },
        ],
      };
      setDetailedReaderBook(runtimeDetailed);
      setActiveChapterId(undefined);
      navigateTo('book-viewer');

      // Fetch full codex from API if available
      fetch(`/api/books/${book.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data?.chapters?.length) {
            setDetailedReaderBook(json.data);
          }
        })
        .catch(() => {});
      return;
    }
    navigateTo('reader-studio');
  };

  const handleSearchQueryFromHome = (query: string) => {
    setSearchFilterQuery(query);
    navigateTo('browse-library');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${currentTheme === 'night'
        ? 'bg-[#0a1410] text-[#e5ede9]'
        : currentTheme === 'sepia'
          ? 'bg-[#f5ede1] text-[#26211a]'
          : 'bg-[#fbf9f5] text-[#1b1c1a]'
      }`}>
      {/* Fixed Sticky Header */}
      <Header
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        currentLang={currentLang}
        onLangChange={setCurrentLang}
      />

      {/* Main Content Viewport */}
      <main
        style={currentPath === 'book-viewer' ? { paddingTop: 'calc(var(--app-header-height, 108px) + 2px)' } : undefined}
        className={`flex-1 w-full pb-8 sm:pb-12 overflow-x-hidden ${
          currentPath === 'book-viewer' ? 'pt-0' : 'pt-20 sm:pt-24'
        }`}
      >
        <div className="w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8">
          {currentPath === 'home' && (
            <HomeView
              books={publicBooks}
              categories={categories}
              readingSection={homeSettings.readerSection || PRIMARY_READING_SECTION}
              homeSettings={homeSettings}
              onSelectBook={(book) => setSelectedBookForModal(book)}
              onOpenReader={handleOpenReader}
              onOpenDownload={(book) => setDownloadBook(book)}
              onOpenNarrator={(narrator) => setSelectedNarrator(narrator)}
              onOpenWordAnalysis={(word) => setSelectedWord(word)}
              onNavigate={navigateTo}
              onSearchQuery={handleSearchQueryFromHome}
            />
          )}

          <Suspense fallback={<ViewLoadingFallback />}>
            {currentPath === 'browse-library' && (
              <BrowseLibraryView
                books={publicBooks}
                categories={categories}
                onSelectBook={(book) => setSelectedBookForModal(book)}
                onOpenReader={handleOpenReader}
                onOpenDownload={(book) => setDownloadBook(book)}
                initialQuery={searchFilterQuery}
                isLoading={isFetchingDb}
                onRefresh={syncFromApi}
              />
            )}

            {currentPath === 'categories' && (
              <CategoriesView
                categories={categories}
                books={publicBooks}
                onSelectCategory={(catId) => {
                  setSearchFilterQuery(catId);
                  navigateTo('browse-library');
                }}
                onNavigate={navigateTo}
              />
            )}

            {currentPath === 'reader-studio' && (
              <ReaderStudioView
                initialBook={readerBook}
                allBooks={publicBooks}
                readingSection={homeSettings.readerSection || PRIMARY_READING_SECTION}
                onOpenNarrator={(narrator) => setSelectedNarrator(narrator)}
                onOpenWordAnalysis={(word) => setSelectedWord(word)}
                onNavigateHome={() => navigateTo('home')}
              />
            )}

            {currentPath === 'manuscripts' && (
              <ManuscriptsView manuscripts={MANUSCRIPTS} />
            )}

            {currentPath === 'latest-releases' && (
              <LatestReleasesView
                books={publicBooks}
                onSelectBook={(book) => setSelectedBookForModal(book)}
                onOpenReader={handleOpenReader}
                onOpenDownload={(book) => setDownloadBook(book)}
              />
            )}

            {currentPath === 'about' && <AboutView />}

            {currentPath === 'book-viewer' && detailedReaderBook && (
              <BookReaderView
                book={detailedReaderBook}
                initialChapterId={activeChapterId}
                onNavigate={navigateTo}
                onOpenAdminEdit={(b) => {
                  navigateTo('admin');
                }}
                theme={currentTheme}
                onThemeChange={setCurrentTheme}
              />
            )}
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Modals & Dialogs (Lazily loaded only when activated) */}
      <Suspense fallback={null}>
        {commandPaletteOpen && (
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            books={publicBooks}
            categories={categories}
            onSelectBook={(book) => setSelectedBookForModal(book)}
            onNavigate={navigateTo}
          />
        )}

        {selectedBookForModal && (
          <BookDetailModal
            book={selectedBookForModal}
            onClose={() => setSelectedBookForModal(null)}
            onOpenReader={handleOpenReader}
            onDownload={(book) => {
              setSelectedBookForModal(null);
              setDownloadBook(book);
            }}
          />
        )}

        {downloadBook && (
          <DownloadModal
            book={downloadBook}
            onClose={() => setDownloadBook(null)}
          />
        )}

        {selectedNarrator && (
          <NarratorBiographyModal
            narrator={selectedNarrator}
            onClose={() => setSelectedNarrator(null)}
          />
        )}

        {selectedWord && (
          <MorphologyModal
            word={selectedWord}
            onClose={() => setSelectedWord(null)}
          />
        )}
      </Suspense>
    </div>
  );
}
