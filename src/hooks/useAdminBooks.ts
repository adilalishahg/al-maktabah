import { useState, useCallback, useEffect } from 'react';
import type { DetailedBook } from '@/types/bookContent';
import { getStoredBooks, saveStoredBooks, saveBook as saveBookLocal, deleteBook as deleteBookLocal } from '@/data/bookStore';

export interface UseAdminBooksOptions {
  getAuthHeaders?: (extraHeaders?: Record<string, string>) => Record<string, string>;
  autoLoad?: boolean;
}

export interface UseAdminBooksReturn {
  books: DetailedBook[];
  setBooks: React.Dispatch<React.SetStateAction<DetailedBook[]>>;
  dbSyncStatus: 'online' | 'local' | 'connecting';
  isSaving: boolean;
  loadBooks: () => Promise<void>;
  saveBookMutation: (book: DetailedBook) => Promise<boolean>;
  deleteBookMutation: (bookId: string) => Promise<boolean>;
  togglePublishMutation: (book: DetailedBook) => Promise<boolean>;
}

/**
 * Custom hook encapsulating administrative book fetching, local cache sync,
 * MongoDB mutations, and publishing toggles.
 */
export function useAdminBooks({
  getAuthHeaders,
  autoLoad = true,
}: UseAdminBooksOptions = {}): UseAdminBooksReturn {
  const [books, setBooks] = useState<DetailedBook[]>([]);
  const [dbSyncStatus, setDbSyncStatus] = useState<'online' | 'local' | 'connecting'>('connecting');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const getHeaders = useCallback(
    (extra?: Record<string, string>) => {
      if (getAuthHeaders) return getAuthHeaders(extra);
      const headers: Record<string, string> = { ...extra };
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('al_maktabah_admin_token') : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-admin-token'] = token;
      }
      return headers;
    },
    [getAuthHeaders]
  );

  const loadBooks = useCallback(async () => {
    setDbSyncStatus('connecting');
    try {
      const res = await fetch('/api/books?admin=true');
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : null);
        if (data !== null) {
          setBooks(data);
          saveStoredBooks(data);
          if (json?.source?.includes('MongoDB')) {
            setDbSyncStatus('online');
          } else {
            setDbSyncStatus('local');
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API fetch fallback to local storage:', err);
    }
    setBooks(getStoredBooks());
    setDbSyncStatus('local');
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadBooks();
    }
  }, [autoLoad, loadBooks]);

  const saveBookMutation = useCallback(
    async (book: DetailedBook): Promise<boolean> => {
      setIsSaving(true);
      // 1. Optimistic Local Save
      const updated = saveBookLocal(book);
      setBooks(updated);

      // 2. Remote API Synchronization
      try {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: getHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(book),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.source === 'mongodb') {
            setDbSyncStatus('online');
          }
        }
        setIsSaving(false);
        return res.ok;
      } catch (err) {
        console.warn('MongoDB saveBook sync notice:', err);
        setIsSaving(false);
        return false;
      }
    },
    [getHeaders]
  );

  const deleteBookMutation = useCallback(
    async (bookId: string): Promise<boolean> => {
      // 1. Optimistic Local Remove
      const updated = deleteBookLocal(bookId);
      setBooks(updated);

      // 2. Remote API Synchronization
      try {
        const res = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        return res.ok;
      } catch (err) {
        console.warn('MongoDB delete sync notice:', err);
        return false;
      }
    },
    [getHeaders]
  );

  const togglePublishMutation = useCallback(
    async (book: DetailedBook): Promise<boolean> => {
      const toggled: DetailedBook = { ...book, published: !book.published };
      return saveBookMutation(toggled);
    },
    [saveBookMutation]
  );

  return {
    books,
    setBooks,
    dbSyncStatus,
    isSaving,
    loadBooks,
    saveBookMutation,
    deleteBookMutation,
    togglePublishMutation,
  };
}
