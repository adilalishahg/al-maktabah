'use client';

import React, { Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProvider, useAdminContext } from '@/context/AdminContext';
import { AdminHeaderBar } from '@/components/admin/AdminHeaderBar';
import { AdminLoginCard } from '@/components/admin/AdminLoginCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  AdminCategoryModal,
  AdminBulkChapterModal,
  AdminCodexReaderModal,
} from '@/components/admin/tabs';

const BookReaderView = lazy(() =>
  import('@/views/BookReaderView').then((m) => ({ default: m.BookReaderView }))
);

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    handleLogin,
    handleLogout,
    books,
    categories,
    homeSettings,
    handleStartNewBook,
    dbSyncStatus,
    showCategoryModal,
    setShowCategoryModal,
    editingCategory,
    setEditingCategory,
    isSavingCategory,
    handleSaveCategory,
    showBulkModal,
    setShowBulkModal,
    bulkRawText,
    setBulkRawText,
    handleBulkChapterImport,
    showCodexModal,
    setShowCodexModal,
    editingBook,
    activeChapterIndex,
    viewingReaderBook,
    setViewingReaderBook,
  } = useAdminContext();

  const router = useRouter();
  const { currentTheme, setTheme } = useAppTheme();

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-parchment-canvas flex flex-col items-center justify-center gap-3 text-primary">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wider font-mono">
          Authenticating Administrative Session...
        </span>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <AdminLoginCard
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        loginError={loginError}
        handleLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-parchment-canvas text-on-surface">
      {/* Top Sticky Admin Navbar */}
      <AdminHeaderBar
        booksCount={books.length}
        categoriesCount={categories.length}
        readerEnabled={Boolean(homeSettings.sections?.readerPreview?.enabled)}
        handleStartNewBook={handleStartNewBook}
        dbSyncStatus={dbSyncStatus}
        handleLogout={handleLogout}
      />

      {/* Main Content Container */}
      <main className="max-max-w-archive-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {children}
      </main>

      {/* GLOBAL ADMINISTRATIVE MODALS */}
      {showCategoryModal && editingCategory && (
        <AdminCategoryModal
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          onClose={() => setShowCategoryModal(false)}
          categories={categories}
          isSavingCategory={isSavingCategory}
          handleSaveCategory={handleSaveCategory}
        />
      )}

      {showBulkModal && (
        <AdminBulkChapterModal
          showBulkModal={showBulkModal}
          setShowBulkModal={setShowBulkModal}
          bulkRawText={bulkRawText}
          setBulkRawText={setBulkRawText}
          handleBulkChapterImport={handleBulkChapterImport}
        />
      )}

      {showCodexModal && editingBook && (
        <AdminCodexReaderModal
          showCodexModal={showCodexModal}
          editingBook={editingBook}
          activeChapterIndex={activeChapterIndex}
          onClose={() => setShowCodexModal(false)}
        />
      )}

      {viewingReaderBook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col animate-fade-in">
          <div className="bg-primary-container text-white px-4 py-2.5 flex items-center justify-between border-b border-primary">
            <span className="font-semibold text-xs sm:text-sm">
              Live Reader Preview: {viewingReaderBook.title}
            </span>
            <button
              type="button"
              onClick={() => setViewingReaderBook(null)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center text-white font-mono text-sm">
                  Loading Live Reader...
                </div>
              }
            >
              <BookReaderView
                book={viewingReaderBook}
                onNavigate={(path) => router.push(path)}
                theme={currentTheme}
                onThemeChange={setTheme}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
