'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import type { Book } from '@/types/library';
import type { DetailedBook } from '@/types/bookContent';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Header } from '@/components/Header';
import { BookReaderView } from '@/views/BookReaderView';
import { getStoredBooks, getPublicLibraryBooks } from '@/data/bookStore';
import { INITIAL_DETAILED_BOOKS } from '@/data/bookStore';
import { BOOKS } from '@/data/mockLibrary';
import { getBookSlug, matchesBookSlug } from '@/utils/slug';

const CommandPalette = lazy(() =>
  import('@/components/CommandPalette').then((m) => ({ default: m.CommandPalette }))
);

interface BookSlugClientViewProps {
  slug: string;
  initialBook?: DetailedBook | null;
}

export function BookSlugClientView({ slug, initialBook = null }: BookSlugClientViewProps) {
  const router = useRouter();
  const {
    currentTheme,
    setTheme: setCurrentTheme,
    currentLang,
    setLang: setCurrentLang,
  } = useAppTheme();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Hydration-safe initial state: initialized strictly with initialBook from server.
  // This guarantees SSR and Client initial renders match 100% with no hydration mismatch!
  const [book, setBook] = useState<DetailedBook | null>(initialBook);
  const [isLoading, setIsLoading] = useState<boolean>(!initialBook);

  // Client-side hydration & sync in useEffect (runs safely after mount, preventing hydration errors)
  useEffect(() => {
    let active = true;

    // Safely populate command palette books on client
    setAllBooks(getPublicLibraryBooks());

    // If initialBook was not found on server (e.g. newly created in browser localStorage),
    // hydrate from localStorage safely on client
    if (!book) {
      const stored = getStoredBooks();
      const localMatch = stored.find((b) => matchesBookSlug(b, slug));
      if (localMatch && active) {
        setBook(localMatch);
        setIsLoading(false);
      }
    }

    // Always fetch latest authoritative data from API
    fetch(`/api/books/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active) return;
        if (json?.data) {
          setBook(json.data);
          setIsLoading(false);
          return;
        }

        // If direct slug lookup had no result, fetch all books to match
        return fetch('/api/books')
          .then((r) => (r.ok ? r.json() : null))
          .then((allData) => {
            if (!active) return;
            const list: DetailedBook[] = Array.isArray(allData)
              ? allData
              : Array.isArray(allData?.data)
                ? allData.data
                : [];
            if (list.length > 0) {
              setAllBooks(getPublicLibraryBooks());
              const match = list.find((b) => matchesBookSlug(b, slug));
              if (match) {
                setBook(match);
              }
            }
            setIsLoading(false);
          });
      })
      .catch((err) => {
        if (!active) return;
        console.warn('Could not fetch book from backend API:', err);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div
      className={`h-dvh flex flex-col overflow-hidden transition-colors duration-300 ${currentTheme === 'night'
          ? 'bg-night-canvas text-night-text'
          : currentTheme === 'sepia'
            ? 'bg-sepia-canvas text-sepia-text'
            : 'bg-parchment-canvas text-on-surface'
        }`}
    >
      {/* Unified Site Header - Rendered directly in layout flow with isReaderRoute={true} for zero gap */}
      <Header
        currentPath="book-viewer"
        onNavigate={(path) => {
          if (path === 'home') router.push('/');
          else if (path === 'admin') router.push('/admin');
          else router.push(`/?tab=${path}`);
        }}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        isReaderRoute={true}
      />

      {/* Main Reader Viewport - Flush direct attachment to Header with zero gap */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden w-full max-w-7xl xl:max-w-archive-xl 2xl:max-w-archive-2xl mx-auto px-2 sm:px-4 py-1 sm:py-1.5">
        {book ? (
          <BookReaderView
            book={book}
            onNavigate={(path) => {
              if (path === 'browse-library') router.push('/?tab=browse-library');
              else if (path === 'admin') router.push('/admin');
              else router.push('/');
            }}
            onOpenAdminEdit={() => router.push('/admin')}
            theme={currentTheme}
            onThemeChange={setCurrentTheme}
            isStandaloneRoute={true}
          />
        ) : isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-pulse">
            <div className="w-14 h-14 rounded-2xl bg-primary-container/10 dark:bg-primary-container/30 flex items-center justify-center mb-3 text-primary-container dark:text-emerald-highlight">
              <span className="material-symbols-outlined text-3xl animate-spin">menu_book</span>
            </div>
            <div className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 font-serif">
              Opening Scholarly Manuscript &amp; Digital Facsimile Canvas...
            </div>
            <div className="text-xs text-gray-400 mt-1">جاري تحميل المخطوطة والبيانات العلمية</div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-surface-container flex items-center justify-center text-on-surface-variant mx-auto">
              <span className="material-symbols-outlined text-3xl text-rose-500">menu_book</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif text-primary">Book Not Found</h2>
              <p className="text-xs text-gray-500 font-mono">
                No manuscript or treatise matched slug &ldquo;{slug}&rdquo;
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              Return to Library Catalog
            </button>
          </div>
        )}
      </main>

      {/* Command Palette Search Overlay */}
      {commandPaletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            books={allBooks}
            categories={[]}
            onSelectBook={(selected) => {
              setCommandPaletteOpen(false);
              router.push(`/book/${getBookSlug(selected)}`);
            }}
            onNavigate={(path) => {
              setCommandPaletteOpen(false);
              if (path === 'home') router.push('/');
              else if (path === 'admin') router.push('/admin');
              else router.push(`/?tab=${path}`);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

