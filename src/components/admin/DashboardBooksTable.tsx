'use client';

import React from 'react';
import type { DetailedBook } from '@/types/bookContent';
import { getBookSlug } from '@/utils/slug';

export interface DashboardBooksTableProps {
  books: DetailedBook[];
  onOpenReader: (book: DetailedBook) => void;
  onEditBook: (book: DetailedBook) => void;
  onDeleteBook: (id: string) => void;
  onTogglePublish: (book: DetailedBook) => void;
}

export const DashboardBooksTable: React.FC<DashboardBooksTableProps> = ({
  books,
  onOpenReader,
  onEditBook,
  onDeleteBook,
  onTogglePublish,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-title-md font-bold text-lg text-primary">
          Cataloged Treatises &amp; Codex Records ({books.length})
        </h2>
        <span className="text-xs text-on-surface-variant font-medium">
          Click &apos;Read in Viewer&apos; or &apos;Edit&apos; to update text and chapters.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-14 h-20 object-cover rounded shadow-xs shrink-0 bg-surface-container"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-label-sm uppercase text-label-xs text-tertiary font-bold truncate">
                      {book.disciplineName}
                    </span>
                    <button
                      onClick={() => onTogglePublish(book)}
                      className={`px-2 py-0.5 rounded-full text-label-xs font-bold transition-colors cursor-pointer ${book.published
                          ? 'bg-primary-container/15 text-primary'
                          : 'bg-surface-container text-on-surface-variant'
                        }`}
                    >
                      {book.published ? '● Live' : '○ Draft'}
                    </button>
                  </div>
                  <h3 className="font-display text-sm font-bold text-primary truncate mt-0.5">
                    {book.title}
                  </h3>
                  <div className="font-arabic text-sm font-bold text-tertiary truncate">
                    {book.arabicTitle}
                  </div>
                  <span className="text-xs text-on-surface-variant block mt-0.5 truncate">
                    {book.author}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-surface-container text-center text-label-sm text-on-surface-variant">
                <div className="p-1 rounded bg-surface-container-low">
                  <span className="font-semibold text-primary block">{book.chapters?.length || 1}</span>
                  <span>Chapters</span>
                </div>
                <div className="p-1 rounded bg-surface-container-low">
                  <span className="font-semibold text-primary block">{book.pages}</span>
                  <span>Pages</span>
                </div>
                <div className="p-1 rounded bg-surface-container-low">
                  <span className="font-semibold text-primary block">{book.sizeMb} MB</span>
                  <span>Size</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-surface-container-low/50 px-4 py-2.5 border-t border-surface-container flex items-center justify-between gap-2">
              <a
                href={`/book/${getBookSlug(book)}`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenReader(book);
                }}
                className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">menu_book</span>
                <span>Read in Viewer</span>
              </a>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditBook(book)}
                  className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors cursor-pointer"
                  title="Edit Text & Chapters"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button
                  onClick={() => onDeleteBook(book.id)}
                  className="p-1.5 rounded-lg text-error/80 hover:text-error hover:bg-surface-container transition-colors cursor-pointer"
                  title="Delete Book"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
