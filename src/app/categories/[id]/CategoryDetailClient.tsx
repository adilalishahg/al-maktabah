'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BrowseLibraryView } from '@/views/BrowseLibraryView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getPublicLibraryBooks } from '@/data/bookStore';
import { getStoredCategories } from '@/data/categoryStore';
import { BookDetailModal } from '@/components/BookDetailModal';
import { DownloadModal } from '@/components/DownloadModal';
import { CommandPalette } from '@/components/CommandPalette';
import { getBookSlug } from '@/utils/slug';
import type { Book, CategoryScience } from '@/types/library';

interface Props {
  category: CategoryScience;
}

export function CategoryDetailClient({ category }: Props) {
  const router = useRouter();
  const { currentTheme, setTheme, currentLang, setLang } = useAppTheme();
  const [books] = useState<Book[]>(() => getPublicLibraryBooks());
  const [categories] = useState(() => getStoredCategories());
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [downloadBook, setDownloadBook] = useState<Book | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const navigateTo = (path: string) => {
    if (path === 'home') router.push('/');
    else if (path === 'browse-library') router.push('/browse-library');
    else if (path === 'categories') router.push('/categories');
    else if (path === 'manuscripts') router.push('/manuscripts');
    else if (path === 'about') router.push('/about');
    else if (path === 'admin') router.push('/admin');
    else router.push(`/${path}`);
  };

  const handleOpenReader = (book?: Book) => {
    if (book) {
      router.push(`/book/${getBookSlug(book)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      currentTheme === 'night'
        ? 'bg-night-canvas text-night-text'
        : currentTheme === 'sepia'
          ? 'bg-sepia-canvas text-sepia-text'
          : 'bg-parchment-canvas text-on-surface'
    }`}>
      <Header
        currentPath="categories"
        onNavigate={navigateTo}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        currentTheme={currentTheme}
        onThemeChange={setTheme}
        currentLang={currentLang}
        onLangChange={setLang}
      />

      <main className="flex-1 w-full pt-20 sm:pt-24 pb-12">
        <div className="w-full max-w-7xl xl:max-w-archive-xl 2xl:max-w-archive-2xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
          {/* Category Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">{category.icon || 'category'}</span>
                <span>Canonical Discipline</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                {category.description}
              </p>
            </div>
            <div className="text-right shrink-0" dir="rtl">
              <div className="font-arabic text-3xl sm:text-4xl font-bold text-primary">
                {category.arabicName}
              </div>
              <div className="text-xs text-on-surface-variant font-mono mt-1">
                {category.volumeCount} Treatises Digitized
              </div>
            </div>
          </div>

          <BrowseLibraryView
            books={books}
            categories={categories}
            initialQuery={category.id}
            onSelectBook={setSelectedBook}
            onOpenReader={handleOpenReader}
            onOpenDownload={setDownloadBook}
          />
        </div>
      </main>

      <Footer onNavigate={navigateTo} />

      {commandPaletteOpen && (
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          books={books}
          categories={categories}
          onSelectBook={setSelectedBook}
          onNavigate={navigateTo}
        />
      )}

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onOpenReader={handleOpenReader}
          onDownload={(b) => {
            setSelectedBook(null);
            setDownloadBook(b);
          }}
        />
      )}

      {downloadBook && (
        <DownloadModal
          book={downloadBook}
          onClose={() => setDownloadBook(null)}
        />
      )}
    </div>
  );
}

