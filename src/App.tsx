'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { Book, CategoryScience, IsnadNode, ReaderTheme, WordAnalysis } from './types/library';
import { useAppTheme } from '@/hooks/useAppTheme';
import { BOOKS, MANUSCRIPTS, PRIMARY_READING_SECTION } from './data/mockLibrary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { DetailedBook } from './types/bookContent';
import { HomeSettings } from './types/homeSettings';
import { getStoredBooks, getPublicLibraryBooks, saveStoredBooks } from './data/bookStore';
import { getStoredCategories } from './data/categoryStore';
import { getHomeSettings, saveHomeSettings } from './data/homeSettingsStore';
import { getBookSlug } from './utils/slug';

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
    <div className="w-14 h-14 rounded-2xl bg-primary-container/10 dark:bg-primary-container/30 flex items-center justify-center mb-3 text-primary-container dark:text-emerald-highlight">
      <span className="material-symbols-outlined text-3xl animate-spin">menu_book</span>
    </div>
    <div className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 font-serif">
      Loading Scholarly Manuscript &amp; Digital Waqf Repository...
    </div>
    <div className="text-xs text-gray-400 mt-1">جاري تحميل المخطوطة والبيانات العلمية</div>
  </div>
);

export default function App() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState<string>('home');
  const {
    currentTheme,
    setTheme: setCurrentTheme,
    currentLang,
    setLang: setCurrentLang,
  } = useAppTheme();
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
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setCurrentPath(tab);
      }
    }
    syncFromApi();

    return () => {
      window.removeEventListener('storage', syncLibrary);
      window.removeEventListener('al_maktabah_settings_updated', syncLibrary);
    };
  }, []);

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
      const slug = getBookSlug(book);
      router.push(`/book/${slug}`);
      return;
    }
    router.push('/book/mukhtasar-bukhari');
  };

  const handleSearchQueryFromHome = (query: string) => {
    setSearchFilterQuery(query);
    navigateTo('browse-library');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${currentTheme === 'night'
      ? 'bg-night-canvas text-night-text'
      : currentTheme === 'sepia'
        ? 'bg-sepia-canvas text-sepia-text'
        : 'bg-parchment-canvas text-on-surface'
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
        isReaderRoute={currentPath === 'book-viewer'}
      />

      {/* Main Content Viewport */}
      <main
        style={currentPath === 'book-viewer' ? { paddingTop: 0 } : undefined}
        className={`flex-1 w-full overflow-x-hidden ${currentPath === 'book-viewer' ? 'pt-0 pb-1 sm:pb-2' : 'pt-20 sm:pt-24 pb-8 sm:pb-12'
          }`}
      >
        <div className="w-full max-w-7xl xl:max-w-archive-xl 2xl:max-w-archive-2xl mx-auto px-2 sm:px-6 lg:px-8">
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
                isStandaloneRoute={true}
              />
            )}
          </Suspense>
        </div>
      </main>

      {/* Footer (hidden when in reader view to prevent window scroll) */}
      {currentPath !== 'book-viewer' && <Footer onNavigate={navigateTo} />}

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
