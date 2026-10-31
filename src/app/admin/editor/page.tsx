'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminContext } from '@/context/AdminContext';
import { AdminEditorTab } from '@/components/admin/tabs';

function AdminEditorContent() {
  const {
    editingBook,
    setEditingBook,
    books,
    handleStartNewBook,
    categories,
    activeChapterIndex,
    setActiveChapterIndex,
    editorPreviewMode,
    setEditorPreviewMode,
    isUploading,
    uploadSuccess,
    handleFileUpload,
    isUploadingPdf,
    pdfUploadSuccess,
    pdfAnalysisStatus,
    handlePdfUpload,
    handleAddChapter,
    handleRemoveChapter,
    handleSaveBook,
    isSaving,
    setShowCodexModal,
    setShowBulkModal,
    navigateToTab,
  } = useAdminContext();

  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');

  useEffect(() => {
    if (bookId && books.length > 0) {
      const found = books.find((b) => b.id === bookId);
      if (found && (!editingBook || editingBook.id !== bookId)) {
        setEditingBook(JSON.parse(JSON.stringify(found)));
        setActiveChapterIndex(0);
      }
    } else if (!editingBook && !bookId) {
      handleStartNewBook();
    }
  }, [bookId, books, editingBook, setEditingBook, setActiveChapterIndex, handleStartNewBook]);

  if (!editingBook) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-emerald-800 bg-surface-container-lowest rounded-3xl border border-surface-container animate-pulse">
        <span className="material-symbols-outlined text-4xl animate-spin text-tertiary">auto_stories</span>
        <span className="text-sm font-semibold tracking-wider font-mono">
          Preparing Manuscript Studio...
        </span>
      </div>
    );
  }

  return (
    <AdminEditorTab
      editingBook={editingBook}
      setEditingBook={setEditingBook}
      categories={categories}
      activeChapterIndex={activeChapterIndex}
      setActiveChapterIndex={setActiveChapterIndex}
      editorPreviewMode={editorPreviewMode}
      setEditorPreviewMode={setEditorPreviewMode}
      isUploading={isUploading}
      uploadSuccess={uploadSuccess}
      handleFileUpload={handleFileUpload}
      isUploadingPdf={isUploadingPdf}
      pdfUploadSuccess={pdfUploadSuccess}
      pdfAnalysisStatus={pdfAnalysisStatus}
      handlePdfUpload={handlePdfUpload}
      handleAddChapter={handleAddChapter}
      handleRemoveChapter={handleRemoveChapter}
      handleSaveBook={handleSaveBook}
      isSaving={isSaving}
      setShowCodexModal={setShowCodexModal}
      setShowBulkModal={setShowBulkModal}
      setActiveTab={navigateToTab}
    />
  );
}

export default function AdminEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 flex flex-col items-center justify-center gap-3 text-emerald-800 bg-surface-container-lowest rounded-3xl border border-surface-container animate-pulse">
          <span className="material-symbols-outlined text-4xl animate-spin text-tertiary">auto_stories</span>
          <span className="text-sm font-semibold tracking-wider font-mono">
            Loading Manuscript Studio...
          </span>
        </div>
      }
    >
      <AdminEditorContent />
    </Suspense>
  );
}

