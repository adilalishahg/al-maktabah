import React from 'react';
import type { DetailedBook } from '../../../types/bookContent';
import type { HomeSettings } from '../../../types/homeSettings';
import { getBookSlug } from '@/utils/slug';

export interface AdminBooksTabProps {
  books: DetailedBook[];
  handleStartNewBook: () => void;
  handleTogglePublish: (book: DetailedBook) => void;
  setViewingReaderBook: (book: DetailedBook) => void;
  handleSetBookAsHomeReader: (book: DetailedBook) => void;
  homeSettings: HomeSettings;
  handleEditBook: (book: DetailedBook) => void;
  handleDeleteBook: (id: string) => void;
}

export const AdminBooksTab: React.FC<AdminBooksTabProps> = ({
  books,
  handleStartNewBook,
  handleTogglePublish,
  setViewingReaderBook,
  handleSetBookAsHomeReader,
  homeSettings,
  handleEditBook,
  handleDeleteBook,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary">Cataloged Treatises ({books.length})</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage book publication status, edit chapters in real-time, or launch the interactive reader.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNewBook}
          className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary transition-all self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>+ Catalog New Book</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-14 h-20 object-cover rounded-lg shadow-xs shrink-0 bg-surface-container"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-label-xs font-bold uppercase text-tertiary truncate">
                      {book.disciplineName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(book)}
                      className={`px-2 py-0.5 rounded-full text-label-xs font-bold transition-colors cursor-pointer ${
                        book.published
                          ? 'bg-primary-container/15 text-primary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {book.published ? '● Live' : '○ Draft'}
                    </button>
                  </div>
                  <h4 className="font-title-md font-bold text-sm text-primary truncate mt-0.5">{book.title}</h4>
                  <div className="font-arabic text-sm font-bold text-tertiary truncate">{book.arabicTitle}</div>
                  <span className="text-xs text-on-surface-variant block mt-0.5 truncate">{book.author}</span>
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

            <div className="pt-3 mt-3 border-t border-surface-container flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <a
                  href={`/book/${getBookSlug(book)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  <span>View</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleSetBookAsHomeReader(book)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border cursor-pointer ${
                    homeSettings.readerSection?.bookId === book.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : 'bg-tertiary-container/10 text-tertiary border-tertiary/40 hover:bg-tertiary-container/25'
                  }`}
                  title="Set this uploaded book as the live Featured Reader on the Homepage"
                >
                  <span className="material-symbols-outlined text-sm">
                    {homeSettings.readerSection?.bookId === book.id ? 'check_circle' : 'auto_stories'}
                  </span>
                  <span>{homeSettings.readerSection?.bookId === book.id ? 'Live in Reader' : 'Set as Home Reader'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEditBook(book)}
                  className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors cursor-pointer"
                  title="Edit Book & Chapters"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBook(book.id)}
                  className="p-1.5 rounded-lg text-error hover:bg-surface-container transition-colors cursor-pointer"
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

