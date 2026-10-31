'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AboutView } from '@/views/AboutView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getPublicLibraryBooks } from '@/data/bookStore';
import { getStoredCategories } from '@/data/categoryStore';
import { CommandPalette } from '@/components/CommandPalette';
import type { Book } from '@/types/library';

export function AboutClient() {
  const router = useRouter();
  const { currentTheme, setTheme, currentLang, setLang } = useAppTheme();
  const [books] = useState<Book[]>(() => getPublicLibraryBooks());
  const [categories] = useState(() => getStoredCategories());
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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      currentTheme === 'night'
        ? 'bg-night-canvas text-night-text'
        : currentTheme === 'sepia'
          ? 'bg-sepia-canvas text-sepia-text'
          : 'bg-parchment-canvas text-on-surface'
    }`}>
      <Header
        currentPath="about"
        onNavigate={navigateTo}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        currentTheme={currentTheme}
        onThemeChange={setTheme}
        currentLang={currentLang}
        onLangChange={setLang}
      />

      <main className="flex-1 w-full pt-20 sm:pt-24 pb-12">
        <div className="w-full max-w-7xl xl:max-w-archive-xl 2xl:max-w-archive-2xl mx-auto px-3 sm:px-6 lg:px-8">
          <AboutView />
        </div>
      </main>

      <Footer onNavigate={navigateTo} />

      {commandPaletteOpen && (
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          books={books}
          categories={categories}
          onSelectBook={() => {}}
          onNavigate={navigateTo}
        />
      )}
    </div>
  );
}

