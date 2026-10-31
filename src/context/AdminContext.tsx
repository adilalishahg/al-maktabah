'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { DetailedBook, BookChapter } from '@/types/bookContent';
import type { HomeSettings } from '@/types/homeSettings';
import type { CategoryScience } from '@/types/library';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminBooks } from '@/hooks/useAdminBooks';
import { useHomeSettings } from '@/hooks/useHomeSettings';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { analyzeUploadedPdf } from '@/lib/pdfAnalyzer';
import { uploadAsset } from '@/utils/adminUpload';
import { parseChaptersFromText } from '@/utils/chapterSplitter';

export type AdminTab = 'analytics' | 'books' | 'categories' | 'editor' | 'homepage';

export interface AdminContextType {
  // Auth
  isAuthenticated: boolean | null;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginError: string;
  isLoggingIn: boolean;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => void;
  getAuthHeaders: (extra?: Record<string, string>) => Record<string, string>;

  // Navigation
  activeTab: AdminTab;
  navigateToTab: (tab: AdminTab) => void;

  // Books
  books: DetailedBook[];
  dbSyncStatus: 'online' | 'connecting' | 'local' | 'offline';
  isSaving: boolean;
  loadBooks: () => Promise<void>;
  saveBookMutation: (book: DetailedBook) => Promise<boolean>;
  deleteBookMutation: (id: string) => Promise<boolean>;
  togglePublishMutation: (book: DetailedBook) => Promise<boolean>;
  handleTogglePublish: (book: DetailedBook) => Promise<void>;
  handleDeleteBook: (id: string) => Promise<void>;

  // Categories / Disciplines
  categories: CategoryScience[];
  editingCategory: CategoryScience | null;
  setEditingCategory: React.Dispatch<React.SetStateAction<CategoryScience | null>>;
  showCategoryModal: boolean;
  setShowCategoryModal: (show: boolean) => void;
  isSavingCategory: boolean;
  loadCategories: () => Promise<void>;
  handleStartNewCategory: () => void;
  handleEditCategory: (cat: CategoryScience) => void;
  handleDeleteCategory: (id: string) => Promise<void>;
  handleSaveCategory: (e: React.FormEvent) => Promise<void>;

  // Home Settings
  homeSettings: HomeSettings;
  isSavingSettings: boolean;
  settingsSavedSuccess: string;
  loadSettings: () => Promise<void>;
  saveHomeSettingsMutation: (updated: HomeSettings) => Promise<boolean>;
  setBookAsHomeReader: (book: DetailedBook, chapterId?: string) => void;
  handleSetBookAsHomeReader: (book: DetailedBook, chapterId?: string) => void;
  handleSaveHomeSettings: (updated: HomeSettings) => Promise<void>;

  // Book Editor State
  editingBook: DetailedBook | null;
  setEditingBook: React.Dispatch<React.SetStateAction<DetailedBook | null>>;
  activeChapterIndex: number;
  setActiveChapterIndex: (idx: number) => void;
  editorPreviewMode: 'edit' | 'preview';
  setEditorPreviewMode: (mode: 'edit' | 'preview') => void;
  isUploading: boolean;
  uploadSuccess: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploadingPdf: boolean;
  pdfUploadSuccess: string;
  pdfAnalysisStatus: string;
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement> | File) => Promise<void>;
  handleAddChapter: () => void;
  handleRemoveChapter: (idx: number) => void;
  handleSaveBook: (e: React.FormEvent) => Promise<void>;
  handleStartNewBook: () => void;
  handleEditBook: (book: DetailedBook) => void;

  // Modals & Reader Viewer
  showBulkModal: boolean;
  setShowBulkModal: (show: boolean) => void;
  bulkRawText: string;
  setBulkRawText: (text: string) => void;
  handleBulkChapterImport: () => void;
  showCodexModal: boolean;
  setShowCodexModal: (show: boolean) => void;
  viewingReaderBook: DetailedBook | null;
  setViewingReaderBook: (book: DetailedBook | null) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname() || '';

  // 1. Auth Hook
  const {
    isAuthenticated,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    isLoggingIn,
    getAuthHeaders,
    handleLogin: baseLogin,
    handleLogout: baseLogout,
  } = useAdminAuth();

  // 2. Books Hook
  const {
    books,
    dbSyncStatus,
    isSaving,
    loadBooks,
    saveBookMutation,
    deleteBookMutation,
    togglePublishMutation,
  } = useAdminBooks({ getAuthHeaders });

  // 3. Home Settings Hook
  const {
    homeSettings,
    isSavingSettings,
    settingsSavedSuccess,
    loadSettings,
    saveHomeSettingsMutation,
    setBookAsHomeReader,
  } = useHomeSettings({ getAuthHeaders });

  // 4. Categories Hook
  const {
    categories,
    editingCategory,
    setEditingCategory,
    showCategoryModal,
    setShowCategoryModal,
    isSavingCategory,
    loadCategories,
    handleStartNewCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleSaveCategory,
  } = useAdminCategories({
    getAuthHeaders,
    booksLengthByDiscipline: (catId) => books.filter((b) => b.discipline === catId).length,
  });

  // 5. Editor and Reader State
  const [editingBook, setEditingBook] = useState<DetailedBook | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [editorPreviewMode, setEditorPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadSuccess, setPdfUploadSuccess] = useState('');
  const [pdfAnalysisStatus, setPdfAnalysisStatus] = useState<string>('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRawText, setBulkRawText] = useState('');
  const [viewingReaderBook, setViewingReaderBook] = useState<DetailedBook | null>(null);
  const [showCodexModal, setShowCodexModal] = useState<boolean>(false);

  // Active Tab derived from Current Route
  const activeTab: AdminTab = useMemo(() => {
    if (pathname.includes('/books')) return 'books';
    if (pathname.includes('/categories') || pathname.includes('/disciplines')) return 'categories';
    if (pathname.includes('/sections') || pathname.includes('/homepage')) return 'homepage';
    if (pathname.includes('/editor')) return 'editor';
    return 'analytics';
  }, [pathname]);

  const navigateToTab = useCallback(
    (tab: AdminTab) => {
      switch (tab) {
        case 'analytics':
          router.push('/admin');
          break;
        case 'books':
          router.push('/admin/books');
          break;
        case 'categories':
          router.push('/admin/categories');
          break;
        case 'homepage':
          router.push('/admin/sections');
          break;
        case 'editor':
          router.push('/admin/editor');
          break;
        default:
          router.push('/admin');
      }
    },
    [router]
  );

  const handleLogin = async (e: React.FormEvent) => {
    const success = await baseLogin(e);
    if (success) {
      loadBooks();
      loadCategories();
      loadSettings();
    }
  };

  const handleLogout = () => {
    baseLogout();
    router.push('/admin');
  };

  const handleSaveHomeSettings = async (updated: HomeSettings): Promise<void> => {
    await saveHomeSettingsMutation(updated);
  };

  const handleSetBookAsHomeReader = (book: DetailedBook, chapterId?: string) => {
    setBookAsHomeReader(book, chapterId);
    alert(`"${book.title}" is now set as the active live reader on the home page!`);
  };

  // Start New Book Template & navigate to /admin/editor
  const handleStartNewBook = useCallback(() => {
    const newBook: DetailedBook = {
      id: 'book-' + Date.now(),
      title: '',
      arabicTitle: '',
      author: '',
      authorHijriYear: '',
      discipline: 'hadith',
      disciplineName: 'Prophetic Traditions (Hadīth)',
      coverImage: '',
      description: '',
      pages: 1,
      sizeMb: 0,
      edition: 'Critical Waqf Academic Edition',
      volumes: 1,
      verified: true,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formats: ['PDF', 'EPUB', 'Searchable OCR'],
      chapters: [],
    };
    setEditingBook(newBook);
    setActiveChapterIndex(0);
    router.push('/admin/editor');
  }, [router]);

  // Edit existing book & navigate to /admin/editor
  const handleEditBook = useCallback(
    (book: DetailedBook) => {
      setEditingBook(JSON.parse(JSON.stringify(book)));
      setActiveChapterIndex(0);
      router.push(`/admin/editor?id=${encodeURIComponent(book.id)}`);
    },
    [router]
  );

  const handleDeleteBook = async (id: string) => {
    if (confirm('Are you sure you want to delete this book record?')) {
      await deleteBookMutation(id);
      if (editingBook?.id === id) {
        setEditingBook(null);
        router.push('/admin/books');
      }
    }
  };

  const handleTogglePublish = async (book: DetailedBook) => {
    await togglePublishMutation(book);
  };

  // Upload Cover Image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBook) return;

    setIsUploading(true);
    setUploadSuccess('');

    try {
      const result = await uploadAsset(file, 'al-maktabah/books', getAuthHeaders);
      setEditingBook((prev) => (prev ? { ...prev, coverImage: result.url } : null));
      setUploadSuccess(`Cover uploaded (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    } catch (err: any) {
      alert(err.message || 'Cover upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Upload PDF Manuscript, analyze codex & auto-extract pages, titles, cover & chapters!
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | undefined;
    if (e instanceof File) {
      file = e;
    } else {
      file = e.target.files?.[0];
    }
    if (!file || !editingBook) return;

    setIsUploadingPdf(true);
    setPdfUploadSuccess('');
    setPdfAnalysisStatus('Reading PDF structure and extracting manuscript...');

    try {
      const analysis = await analyzeUploadedPdf(file, (msg) => setPdfAnalysisStatus(msg));

      // 1. Upload extracted cover image to storage
      let finalCoverImage = analysis.coverImage || editingBook.coverImage || '';
      if (analysis.coverFile) {
        setPdfAnalysisStatus('Uploading extracted cover image to storage...');
        try {
          const coverRes = await uploadAsset(analysis.coverFile, 'al-maktabah/books', getAuthHeaders);
          if (coverRes?.url) {
            finalCoverImage = coverRes.url;
          }
        } catch (coverErr: any) {
          console.warn('Cover upload to cloud CDN notice (using extracted canvas image):', coverErr.message);
        }
      }

      // 2. Upload PDF Manuscript
      setPdfAnalysisStatus('Uploading PDF manuscript to storage...');
      let finalPdfUrl = editingBook.pdfUrl || '';
      try {
        const result = await uploadAsset(file, 'al-maktabah/manuscripts', getAuthHeaders);
        finalPdfUrl = result.url;
      } catch (uploadErr: any) {
        console.warn('Remote asset upload notice (preserving extracted content):', uploadErr.message);
        if (!finalPdfUrl) {
          try {
            finalPdfUrl = URL.createObjectURL(file);
          } catch { }
        }
      }

      // 3. Populate all extracted metadata & chapters into the book model
      setEditingBook((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          title: analysis.title || prev.title || 'Untitled Manuscript',
          arabicTitle: analysis.arabicTitle || prev.arabicTitle,
          author: analysis.author || prev.author || 'Classical Author',
          authorHijriYear: analysis.authorHijriYear || prev.authorHijriYear || '1445 AH',
          discipline: analysis.discipline || prev.discipline || 'hadith',
          disciplineName: analysis.disciplineName || prev.disciplineName || 'Prophetic Traditions (Hadīth)',
          pages: analysis.pages || prev.pages || 1,
          sizeMb: analysis.sizeMb || prev.sizeMb || 1,
          description: analysis.description || prev.description,
          coverImage: finalCoverImage,
          pdfUrl: finalPdfUrl,
          chapters: analysis.chapters.length > 0 ? analysis.chapters : prev.chapters,
        };
      });

      setActiveChapterIndex(0);
      setPdfUploadSuccess(
        `✓ PDF Auto-Analyzed: ${analysis.pages} Pages, ${analysis.chapters.length} Chapters, Cover Image extracted (${analysis.sizeMb} MB)`
      );
    } catch (err: any) {
      alert('PDF extraction notice: ' + err.message);
    } finally {
      setIsUploadingPdf(false);
      setPdfAnalysisStatus('');
      if (!(e instanceof File) && e.target) {
        e.target.value = '';
      }
    }
  };

  // Bulk Chapter Text Splitter & Ingestion
  const handleBulkChapterImport = () => {
    if (!bulkRawText.trim() || !editingBook) return;

    const parsedChapters = parseChaptersFromText(bulkRawText);

    if (parsedChapters.length > 0) {
      setEditingBook({
        ...editingBook,
        chapters: parsedChapters,
        pages: Math.max(editingBook.pages, parsedChapters.length * 15),
      });
      setActiveChapterIndex(0);
      setShowBulkModal(false);
      setBulkRawText('');
      alert(`Successfully parsed and loaded ${parsedChapters.length} structured chapters!`);
    } else {
      alert('Could not detect distinct chapter headings. Please review format.');
    }
  };

  // Chapter management
  const handleAddChapter = () => {
    if (!editingBook) return;
    const nextNum = editingBook.chapters.length + 1;
    const newChapter: BookChapter = {
      id: `ch-${Date.now()}-${nextNum}`,
      number: nextNum,
      title: `Chapter ${nextNum}`,
      arabicTitle: `الباب ${nextNum}`,
      startPage: (editingBook.chapters[editingBook.chapters.length - 1]?.startPage || 1) + 10,
      content: '',
      translation: '',
      notes: '',
    };
    setEditingBook({
      ...editingBook,
      chapters: [...editingBook.chapters, newChapter],
    });
    setActiveChapterIndex(editingBook.chapters.length);
  };

  const handleRemoveChapter = (idx: number) => {
    if (!editingBook || editingBook.chapters.length <= 1) return;
    const updated = editingBook.chapters.filter((_, i) => i !== idx);
    setEditingBook({ ...editingBook, chapters: updated });
    if (activeChapterIndex >= updated.length) {
      setActiveChapterIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    const success = await saveBookMutation(editingBook);
    if (success) {
      router.push('/admin/books');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        loginEmail,
        setLoginEmail,
        loginPassword,
        setLoginPassword,
        loginError,
        isLoggingIn,
        handleLogin,
        handleLogout,
        getAuthHeaders,

        activeTab,
        navigateToTab,

        books,
        dbSyncStatus,
        isSaving,
        loadBooks,
        saveBookMutation,
        deleteBookMutation,
        togglePublishMutation,
        handleTogglePublish,
        handleDeleteBook,

        categories,
        editingCategory,
        setEditingCategory,
        showCategoryModal,
        setShowCategoryModal,
        isSavingCategory,
        loadCategories,
        handleStartNewCategory,
        handleEditCategory,
        handleDeleteCategory,
        handleSaveCategory,

        homeSettings,
        isSavingSettings,
        settingsSavedSuccess,
        loadSettings,
        saveHomeSettingsMutation,
        setBookAsHomeReader,
        handleSetBookAsHomeReader,
        handleSaveHomeSettings,

        editingBook,
        setEditingBook,
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
        handleStartNewBook,
        handleEditBook,

        showBulkModal,
        setShowBulkModal,
        bulkRawText,
        setBulkRawText,
        handleBulkChapterImport,
        showCodexModal,
        setShowCodexModal,
        viewingReaderBook,
        setViewingReaderBook,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export function useAdminContext(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
}
