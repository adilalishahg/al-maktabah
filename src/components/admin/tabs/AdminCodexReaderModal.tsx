import React, { Suspense, lazy } from 'react';
import type { DetailedBook } from '../../../types/bookContent';

const CodexPdfReader = lazy(() =>
  import('@/components/CodexPdfReader').then((m) => ({ default: m.CodexPdfReader }))
);

export interface AdminCodexReaderModalProps {
  showCodexModal: boolean;
  editingBook: DetailedBook | null;
  activeChapterIndex: number;
  onClose: () => void;
}

export const AdminCodexReaderModal: React.FC<AdminCodexReaderModalProps> = ({
  showCodexModal,
  editingBook,
  activeChapterIndex,
  onClose,
}) => {
  if (!showCodexModal || !editingBook) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-2 sm:p-6 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-7xl h-[95vh] flex flex-col">
        <Suspense
          fallback={
            <div className="h-full flex flex-col items-center justify-center gap-2 text-white animate-pulse">
              <span className="material-symbols-outlined text-4xl animate-spin">menu_book</span>
              <span className="text-xs uppercase tracking-wider font-semibold">Loading Codex Reader...</span>
            </div>
          }
        >
          <CodexPdfReader
            book={editingBook}
            pdfUrl={editingBook.pdfUrl}
            initialPage={editingBook.chapters?.[activeChapterIndex]?.startPage || 1}
            onClose={onClose}
          />
        </Suspense>
      </div>
    </div>
  );
};

