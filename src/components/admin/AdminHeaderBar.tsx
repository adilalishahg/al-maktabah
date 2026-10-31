'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface AdminHeaderBarProps {
  activeTab?: 'analytics' | 'books' | 'categories' | 'editor' | 'homepage';
  setActiveTab?: (tab: 'analytics' | 'books' | 'categories' | 'editor' | 'homepage') => void;
  booksCount: number;
  categoriesCount: number;
  readerEnabled: boolean;
  handleStartNewBook: () => void;
  dbSyncStatus: 'online' | 'connecting' | 'local' | 'offline';
  handleLogout: () => void;
}

export const AdminHeaderBar: React.FC<AdminHeaderBarProps> = ({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  booksCount,
  categoriesCount,
  readerEnabled,
  handleStartNewBook,
  dbSyncStatus,
  handleLogout,
}) => {
  const router = useRouter();
  const pathname = usePathname() || '';

  const activeTab = (() => {
    if (propActiveTab) return propActiveTab;
    if (pathname.includes('/books')) return 'books';
    if (pathname.includes('/categories') || pathname.includes('/disciplines')) return 'categories';
    if (pathname.includes('/sections') || pathname.includes('/homepage')) return 'homepage';
    if (pathname.includes('/editor')) return 'editor';
    return 'analytics';
  })();

  const goTo = (tab: 'analytics' | 'books' | 'categories' | 'editor' | 'homepage', route: string) => {
    if (propSetActiveTab) {
      propSetActiveTab(tab);
    }
    router.push(route);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-md border-b border-primary-container">
      <div className="max-max-w-archive-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary-container border border-emerald-highlight/40 text-tertiary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">shield_person</span>
          </span>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-base tracking-tight text-white">Al-Maktabah</span>
              <span className="font-arabic font-bold text-sm text-tertiary-fixed">لوحة الإدارة</span>
            </div>
            <span className="text-label-xs text-on-primary-container font-semibold uppercase tracking-wider block">
              Authenticated Admin System
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-night-surface rounded-xl p-1 border border-emerald-border">
          <button
            type="button"
            onClick={() => goTo('analytics', '/admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-primary-container text-white shadow-xs'
                : 'text-emerald-highlight hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span className="hidden sm:inline">Analytics</span>
          </button>
          <button
            type="button"
            onClick={() => goTo('books', '/admin/books')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'books'
                ? 'bg-primary-container text-white shadow-xs'
                : 'text-emerald-highlight hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">library_books</span>
            <span className="hidden sm:inline">Book Manager</span>
            <span className="bg-surface-container px-1.5 py-0.2 rounded-full text-label-xs text-white">
              {booksCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => goTo('categories', '/admin/categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-primary-container text-white shadow-xs'
                : 'text-emerald-highlight hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">category</span>
            <span className="hidden sm:inline">Disciplines</span>
            <span className="bg-surface-container px-1.5 py-0.2 rounded-full text-label-xs text-white">
              {categoriesCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => goTo('homepage', '/admin/sections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'homepage'
                ? 'bg-primary-container text-white shadow-xs'
                : 'text-emerald-highlight hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span className="hidden sm:inline">Sections &amp; Reader</span>
            {readerEnabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>
          <button
            type="button"
            onClick={handleStartNewBook}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-primary-container text-white shadow-xs'
                : 'text-emerald-highlight hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>+ New Treatise</span>
          </button>
        </div>

        {/* Right Tools: DB Status, Public Site & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`hidden sm:flex items-center gap-1.5 px - 2.5 py - 1 rounded - full text - label - sm font - semibold border ${
    dbSyncStatus === 'online'
      ? 'bg-emerald-surface border-emerald-glow text-emerald-300'
      : 'bg-tertiary-container/20 border-tertiary/40 text-gold-bright'
  } `}
            title={
              dbSyncStatus === 'online'
                ? 'Connected to MongoDB Atlas / Server Database'
                : 'Operating with Local Cache Storage'
            }
          >
            <span
              className={`w - 2 h - 2 rounded - full ${
    dbSyncStatus === 'online'
      ? 'bg-emerald-400 animate-pulse'
      : dbSyncStatus === 'connecting'
        ? 'bg-amber-400 animate-ping'
        : 'bg-amber-400'
  } `}
            />
            <span>
              {dbSyncStatus === 'online'
                ? 'MongoDB Synced'
                : dbSyncStatus === 'connecting'
                ? 'Connecting...'
                : 'Local Storage'}
            </span>
          </div>

          <a
            href="/"
            className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-emerald-surface text-white text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            <span className="hidden md:inline">Public Site</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-emerald-highlight hover:text-red-400 hover:bg-emerald-card transition-colors cursor-pointer"
            title="Logout from Admin"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
