'use client';

import React, { useState, Suspense, lazy } from 'react';
import { DetailedBook, BookChapter } from '@/types/bookContent';
import { analyzeUploadedPdf } from '@/lib/pdfAnalyzer';
import { HomeSettings } from '@/types/homeSettings';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminBooks } from '@/hooks/useAdminBooks';
import { useHomeSettings } from '@/hooks/useHomeSettings';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { uploadAsset } from '@/utils/adminUpload';
import { parseChaptersFromText } from '@/utils/chapterSplitter';

import { AdminLoginCard } from '@/components/admin/AdminLoginCard';
import { AdminHeaderBar } from '@/components/admin/AdminHeaderBar';
import {
  AdminAnalyticsTab,
  AdminBooksTab,
  AdminCategoriesTab,
  AdminEditorTab,
  AdminCategoryModal,
  AdminBulkChapterModal,
  AdminCodexReaderModal,
} from '@/components/admin/tabs';

// Dynamic lazy imports for heavy readers and controllers
const BookReaderView = lazy(() => import('@/views/BookReaderView').then((m) => ({ default: m.BookReaderView })));
const AdminHomeSettingsView = lazy(() =>
  import('@/components/admin/AdminHomeSettingsView').then((m) => ({ default: m.AdminHomeSettingsView }))
);

export default function AdminPortalPage() {
  const {
    isAuthenticated,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    getAuthHeaders,
    handleLogin: baseLogin,
    handleLogout,
  } = useAdminAuth();

  // Admin Navigation Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'books' | 'categories' | 'editor' | 'homepage'>('analytics');

  const {
    books,
    dbSyncStatus,
    isSaving,
    loadBooks,
    saveBookMutation,
    deleteBookMutation,
    togglePublishMutation,
  } = useAdminBooks({ getAuthHeaders });

  const {
    homeSettings,
    isSavingSettings,
    settingsSavedSuccess,
    loadSettings,
    saveHomeSettingsMutation,
    setBookAsHomeReader,
  } = useHomeSettings({ getAuthHeaders });

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

  // Book Management & Editor State
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

  const handleLogin = async (e: React.FormEvent) => {
    const success = await baseLogin(e);
    if (success) {
      loadBooks();
      loadCategories();
      loadSettings();
    }
  };

  const handleSaveHomeSettings = async (updated: HomeSettings): Promise<void> => {
    await saveHomeSettingsMutation(updated);
  };

  const handleSetBookAsHomeReader = (book: DetailedBook, chapterId?: string) => {
    setBookAsHomeReader(book, chapterId);
    alert(`"${book.title}" is now set as the active live reader on the home page!`);
  };

  // Create New Book Template
  const handleStartNewBook = () => {
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
    setActiveTab('editor');
  };

  const handleEditBook = (book: DetailedBook) => {
    setEditingBook(JSON.parse(JSON.stringify(book)));
    setActiveChapterIndex(0);
    setActiveTab('editor');
  };

  const handleDeleteBook = async (id: string) => {
    if (confirm('Are you sure you want to delete this book record?')) {
      await deleteBookMutation(id);
      if (editingBook?.id === id) {
        setEditingBook(null);
        setActiveTab('books');
      }
    }
  };

  const handleTogglePublish = async (book: DetailedBook) => {
    await togglePublishMutation(book);
  };

  // Upload to Cloudinary / CDN (Cover Image)
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

      // 1. Upload extracted cover image (rendered from Page 1 canvas)
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

      // 2. Upload PDF Manuscript to cloud storage
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
          } catch {}
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
      alert(`Successfully generated ${parsedChapters.length} structured chapters from text!`);
    } else {
      alert('Could not parse chapters. Please check headings or dividers (e.g. ### Chapter Name).');
    }
  };

  // Add Chapter in Editor
  const handleAddChapter = () => {
    if (!editingBook) return;
    const nextNum = editingBook.chapters.length + 1;
    const lastChapter = editingBook.chapters[editingBook.chapters.length - 1];
    const newPage = (lastChapter?.startPage || 1) + 20;

    const newCh: BookChapter = {
      id: `ch-${Date.now()}`,
      number: nextNum,
      title: `Chapter ${nextNum}`,
      arabicTitle: `الباب ${nextNum}`,
      startPage: newPage,
      content: '',
      translation: '',
      notes: '',
    };

    setEditingBook({
      ...editingBook,
      chapters: [...editingBook.chapters, newCh],
    });
    setActiveChapterIndex(editingBook.chapters.length);
  };

  const handleRemoveChapter = (idx: number) => {
    if (!editingBook || editingBook.chapters.length <= 1) {
      alert('A treatise must contain at least one chapter.');
      return;
    }
    const filtered = editingBook.chapters.filter((_, i) => i !== idx);
    setEditingBook({ ...editingBook, chapters: filtered });
    if (activeChapterIndex >= filtered.length) {
      setActiveChapterIndex(filtered.length - 1);
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !editingBook.title || !editingBook.arabicTitle || !editingBook.author) {
      alert('Please fill out required fields (Title, Arabic Title, Author).');
      return;
    }

    await saveBookMutation(editingBook);
    alert(`Book "${editingBook.title}" successfully saved and published!`);
    setActiveTab('books');
  };

  // Render Reader Fullscreen Preview if requested
  if (viewingReaderBook) {
    return (
      <div className="min-h-screen bg-parchment-canvas p-4 sm:p-8">
        <div className="max-max-w-archive-2xl mx-auto">
          <Suspense
            fallback={
              <div className="h-[80vh] flex flex-col items-center justify-center gap-3 text-primary-container animate-pulse">
                <span className="material-symbols-outlined text-4xl animate-spin">menu_book</span>
                <span className="font-serif text-sm uppercase tracking-widest font-semibold">
                  Loading Scholarly Reader Preview...
                </span>
              </div>
            }
          >
            <BookReaderView
              book={viewingReaderBook}
              onNavigate={() => setViewingReaderBook(null)}
              onOpenAdminEdit={(b) => {
                setViewingReaderBook(null);
                handleEditBook(b);
              }}
              theme="parchment"
              onThemeChange={() => {}}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN (Authentication Gate)
  if (!isAuthenticated) {
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
      {/* Top Admin Navbar */}
      <AdminHeaderBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        booksCount={books.length}
        categoriesCount={categories.length}
        readerEnabled={homeSettings.sections.readerPreview.enabled}
        handleStartNewBook={handleStartNewBook}
        dbSyncStatus={dbSyncStatus}
        handleLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-max-w-archive-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <AdminAnalyticsTab
            books={books}
            handleStartNewBook={handleStartNewBook}
            setActiveTab={setActiveTab}
          />
        )}

        {/* TAB 2: BOOK MANAGER TABLE */}
        {activeTab === 'books' && (
          <AdminBooksTab
            books={books}
            handleStartNewBook={handleStartNewBook}
            handleTogglePublish={handleTogglePublish}
            setViewingReaderBook={setViewingReaderBook}
            handleSetBookAsHomeReader={handleSetBookAsHomeReader}
            homeSettings={homeSettings}
            handleEditBook={handleEditBook}
            handleDeleteBook={handleDeleteBook}
          />
        )}

        {/* TAB 3: DISCIPLINES & CATEGORY MANAGER */}
        {activeTab === 'categories' && (
          <AdminCategoriesTab
            categories={categories}
            books={books}
            handleStartNewCategory={handleStartNewCategory}
            handleEditCategory={handleEditCategory}
            handleDeleteCategory={handleDeleteCategory}
          />
        )}

        {/* TAB 3.5: HOMEPAGE SECTIONS & CODEX READER CONTROL */}
        {activeTab === 'homepage' && (
          <div className="animate-fade-in">
            <Suspense
              fallback={
                <div className="h-96 flex flex-col items-center justify-center gap-3 text-emerald-300 bg-emerald-card rounded-2xl border border-emerald-border animate-pulse">
                  <span className="material-symbols-outlined text-4xl animate-spin text-tertiary-fixed">tune</span>
                  <span className="text-sm font-semibold tracking-wider">Loading Homepage Customizer...</span>
                </div>
              }
            >
              <AdminHomeSettingsView
                settings={homeSettings}
                onSaveSettings={handleSaveHomeSettings}
                isSaving={isSavingSettings}
                successMessage={settingsSavedSuccess}
                books={books}
                categories={categories}
              />
            </Suspense>
          </div>
        )}

        {/* TAB 4: RICH TEXT & CHAPTER EDITOR */}
        {activeTab === 'editor' && editingBook && (
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
            setActiveTab={setActiveTab}
          />
        )}

        {/* BULK CHAPTER IMPORT / SMART SPLITTER MODAL */}
        <AdminBulkChapterModal
          showBulkModal={showBulkModal}
          setShowBulkModal={setShowBulkModal}
          bulkRawText={bulkRawText}
          setBulkRawText={setBulkRawText}
          handleBulkChapterImport={handleBulkChapterImport}
        />

        {/* CATEGORY & DISCIPLINE CREATE/EDIT MODAL */}
        {showCategoryModal && editingCategory && (
          <AdminCategoryModal
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
            onClose={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
            categories={categories}
            handleSaveCategory={handleSaveCategory}
            isSavingCategory={isSavingCategory}
          />
        )}

        {/* Full-Screen Codex Reader Modal */}
        <AdminCodexReaderModal
          showCodexModal={showCodexModal}
          editingBook={editingBook}
          activeChapterIndex={activeChapterIndex}
          onClose={() => setShowCodexModal(false)}
        />
      </main>
    </div>
  );
}
