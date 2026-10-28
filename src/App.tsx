'use client';

import React, { useState, useEffect } from 'react';
import { Book, CategoryScience, IsnadNode, ReaderTheme, WordAnalysis } from './types/library';
import { BOOKS, MANUSCRIPTS, PRIMARY_READING_SECTION } from './data/mockLibrary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { BookDetailModal } from './components/BookDetailModal';
import { DownloadModal } from './components/DownloadModal';
import { NarratorBiographyModal } from './components/NarratorBiographyModal';
import { MorphologyModal } from './components/MorphologyModal';
import { HomeView } from './views/HomeView';
import { BrowseLibraryView } from './views/BrowseLibraryView';
import { CategoriesView } from './views/CategoriesView';
import { ReaderStudioView } from './views/ReaderStudioView';
import { ManuscriptsView } from './views/ManuscriptsView';
import { LatestReleasesView } from './views/LatestReleasesView';
import { AboutView } from './views/AboutView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { BookReaderView } from './views/BookReaderView';
import { DetailedBook } from './types/bookContent';
import { getStoredBooks, getPublicLibraryBooks, saveStoredBooks } from './data/bookStore';
import { getStoredCategories } from './data/categoryStore';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('home');
  const [currentTheme, setCurrentTheme] = useState<ReaderTheme>('parchment');
  const [currentLang, setCurrentLang] = useState<'EN' | 'AR'>('EN');
  const [publicBooks, setPublicBooks] = useState<Book[]>(() => getPublicLibraryBooks());
  const [categories, setCategories] = useState<CategoryScience[]>(() => getStoredCategories());

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
  };

  useEffect(() => {
    const syncLibrary = () => {
      setPublicBooks(getPublicLibraryBooks());
      setCategories(getStoredCategories());
    };
    window.addEventListener('storage', syncLibrary);
    syncFromApi();

    return () => window.removeEventListener('storage', syncLibrary);
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
      <main className="flex-1 w-full pt-24 sm:pt-28 pb-8 sm:pb-12 overflow-x-hidden">
        <div className="w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {currentPath === 'home' && (
            <HomeView
              books={publicBooks}
              categories={categories}
              readingSection={PRIMARY_READING_SECTION}
              onSelectBook={(book) => setSelectedBookForModal(book)}
              onOpenReader={handleOpenReader}
              onOpenDownload={(book) => setDownloadBook(book)}
              onOpenNarrator={(narrator) => setSelectedNarrator(narrator)}
              onOpenWordAnalysis={(word) => setSelectedWord(word)}
              onNavigate={navigateTo}
              onSearchQuery={handleSearchQueryFromHome}
            />
          )}

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
              readingSection={PRIMARY_READING_SECTION}
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
        </div>
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Modals & Dialogs */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        books={publicBooks}
        categories={categories}
        onSelectBook={(book) => setSelectedBookForModal(book)}
        onNavigate={navigateTo}
      />

      <BookDetailModal
        book={selectedBookForModal}
        onClose={() => setSelectedBookForModal(null)}
        onOpenReader={handleOpenReader}
        onDownload={(book) => {
          setSelectedBookForModal(null);
          setDownloadBook(book);
        }}
      />

      <DownloadModal
        book={downloadBook}
        onClose={() => setDownloadBook(null)}
      />

      <NarratorBiographyModal
        narrator={selectedNarrator}
        onClose={() => setSelectedNarrator(null)}
      />

      <MorphologyModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </div>
  );
}
