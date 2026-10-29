'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { DetailedBook, BookChapter } from '@/types/bookContent';
import { CategoryScience } from '@/types/library';
import { getStoredBooks, saveBook, deleteBook, saveStoredBooks } from '@/data/bookStore';
import { getStoredCategories, saveCategory, deleteCategory as deleteStoredCategory } from '@/data/categoryStore';
import { analyzeUploadedPdf } from '@/lib/pdfAnalyzer';
import { HomeSettings } from '@/types/homeSettings';
import { getHomeSettings, saveHomeSettings, buildReadingSectionFromBook } from '@/data/homeSettingsStore';

// Dynamic lazy imports for heavy readers and controllers
const BookReaderView = lazy(() => import('@/views/BookReaderView').then((m) => ({ default: m.BookReaderView })));
const CodexPdfReader = lazy(() => import('@/components/CodexPdfReader').then((m) => ({ default: m.CodexPdfReader })));
const AdminHomeSettingsView = lazy(() => import('@/components/admin/AdminHomeSettingsView').then((m) => ({ default: m.AdminHomeSettingsView })));

export default function AdminPortalPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Navigation Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'books' | 'categories' | 'editor' | 'homepage'>('analytics');

  // Homepage & Reader Configuration State
  const [homeSettings, setHomeSettings] = useState<HomeSettings>(() => getHomeSettings());
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState('');

  // Book Management & Editor State
  const [books, setBooks] = useState<DetailedBook[]>([]);
  const [editingBook, setEditingBook] = useState<DetailedBook | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [editorPreviewMode, setEditorPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadSuccess, setPdfUploadSuccess] = useState('');
  const [pdfAnalysisStatus, setPdfAnalysisStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [dbSyncStatus, setDbSyncStatus] = useState<'online' | 'local' | 'connecting'>('connecting');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRawText, setBulkRawText] = useState('');
  const [viewingReaderBook, setViewingReaderBook] = useState<DetailedBook | null>(null);
  const [showCodexModal, setShowCodexModal] = useState<boolean>(false);

  // Category Management State
  const [categories, setCategories] = useState<CategoryScience[]>([]);
  const [editingCategory, setEditingCategory] = useState<CategoryScience | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Load books from MongoDB Backend API with fallback to localStorage
  const loadBooks = async () => {
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
  };

  // Load categories from MongoDB Backend API with fallback to localStorage
  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          localStorage.setItem('al_maktabah_categories_v1', JSON.stringify(data));
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API fetch categories fallback:', err);
    }
    setCategories(getStoredCategories());
  };

  // Load home & reader settings from MongoDB Backend API with fallback to localStorage
  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setHomeSettings(json.data);
          saveHomeSettings(json.data);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API fetch settings fallback:', err);
    }
    setHomeSettings(getHomeSettings());
  };

  // Helper to attach HMAC Authorization & x-admin-token headers
  const getAuthHeaders = (extraHeaders?: Record<string, string>): Record<string, string> => {
    const headers: Record<string, string> = { ...extraHeaders };
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('al_maktabah_admin_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-admin-token'] = token;
    }
    return headers;
  };

  const handleSaveHomeSettings = async (updated: HomeSettings) => {
    setIsSavingSettings(true);
    setSettingsSavedSuccess('');

    // 1. Instant local persistence and broadcast
    saveHomeSettings(updated);
    setHomeSettings(updated);

    // 2. MongoDB Backend API persistence
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setSettingsSavedSuccess('✓ Saved & Published live to Homepage!');
      } else {
        setSettingsSavedSuccess('✓ Saved locally in browser cache.');
      }
    } catch (err) {
      setSettingsSavedSuccess('✓ Saved locally in browser cache.');
    } finally {
      setIsSavingSettings(false);
      setTimeout(() => setSettingsSavedSuccess(''), 4500);
    }
  };

  const handleSetBookAsHomeReader = (book: DetailedBook, chapterId?: string) => {
    const generatedSection = buildReadingSectionFromBook(book, chapterId);
    const updated: HomeSettings = {
      ...homeSettings,
      sections: {
        ...homeSettings.sections,
        readerPreview: {
          ...homeSettings.sections.readerPreview,
          enabled: true,
          sourceMode: 'book',
          selectedBookId: book.id,
          selectedChapterId: chapterId || book.chapters?.[0]?.id || 'ch-1',
        },
      },
      readerSection: generatedSection,
    };
    handleSaveHomeSettings(updated);
    alert(`"${book.title}" is now set as the active live reader on the home page!`);
  };

  // Check auth on mount & sync data
  useEffect(() => {
    const token = sessionStorage.getItem('al_maktabah_admin_token');
    const authSession = sessionStorage.getItem('al_maktabah_admin_session');

    if (token) {
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setIsAuthenticated(true);
          } else {
            sessionStorage.removeItem('al_maktabah_admin_session');
            sessionStorage.removeItem('al_maktabah_admin_token');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          if (authSession === 'authenticated_admin') {
            setIsAuthenticated(true);
          }
        });
    } else if (authSession === 'authenticated_admin') {
      setIsAuthenticated(true);
    }

    loadBooks();
    loadCategories();
    loadSettings();
  }, []);

  // Handle Login via /api/auth/login endpoint
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('al_maktabah_admin_session', 'authenticated_admin');
        sessionStorage.setItem('al_maktabah_admin_token', data.token);
        setIsAuthenticated(true);
        loadBooks();
        loadCategories();
        loadSettings();
      } else {
        setLoginError(data.message || 'Invalid Administrator credentials. Use admin@almaktabah.org and maktabah1445');
      }
    } catch {
      // Local fallback for offline mode
      if (
        (loginEmail.trim().toLowerCase() === 'admin@almaktabah.org' || loginEmail.trim().toLowerCase() === 'admin') &&
        loginPassword === 'maktabah1445'
      ) {
        sessionStorage.setItem('al_maktabah_admin_session', 'authenticated_admin');
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid Administrator credentials.');
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('al_maktabah_admin_session');
    sessionStorage.removeItem('al_maktabah_admin_token');
    if (typeof document !== 'undefined') {
      document.cookie = 'al_maktabah_admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
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
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000',
      description: '',
      pages: 150,
      sizeMb: 6.8,
      edition: 'Critical Waqf Academic Edition',
      volumes: 1,
      verified: true,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formats: ['PDF', 'EPUB', 'Searchable OCR'],
      chapters: [
        {
          id: 'ch-1',
          number: 1,
          title: 'Opening Chapter (Kitāb al-Fātiḥah)',
          arabicTitle: 'الباب الأول في المبادئ والأصول',
          startPage: 1,
          content: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا...',
          translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah...',
          notes: 'Standard authorized scholastic transmission.',
        },
      ],
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
      const updated = deleteBook(id);
      setBooks(updated);
      try {
        await fetch(`/api/books/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      } catch (err) {
        console.warn('MongoDB delete sync notice:', err);
      }
      if (editingBook?.id === id) {
        setEditingBook(null);
        setActiveTab('books');
      }
    }
  };

  const handleTogglePublish = async (book: DetailedBook) => {
    const updated = { ...book, published: !book.published };
    const list = saveBook(updated);
    setBooks(list);
    try {
      await fetch('/api/books', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('MongoDB publish sync notice:', err);
    }
  };

  // Category & Discipline Management Handlers
  const handleStartNewCategory = () => {
    setEditingCategory({
      id: '',
      name: '',
      arabicName: '',
      icon: 'category',
      description: '',
      volumeCount: 0,
      tags: [],
      subBranches: [],
      foundationTreatises: [],
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat: CategoryScience) => {
    setEditingCategory(JSON.parse(JSON.stringify(cat)));
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (catId: string) => {
    const linkedBooks = books.filter((b) => b.discipline === catId);
    if (linkedBooks.length > 0) {
      alert(
        `Cannot delete this discipline because ${linkedBooks.length} treatise(s) are currently categorized under it. Please reassign those treatises first.`
      );
      return;
    }
    if (confirm('Are you sure you want to delete this discipline classification?')) {
      const updated = deleteStoredCategory(catId);
      setCategories(updated);
      try {
        await fetch(`/api/categories/${catId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      } catch (err) {
        console.warn('MongoDB category delete notice:', err);
      }
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim() || !editingCategory.id.trim()) {
      alert('Please fill out Discipline Name and Unique ID/Slug.');
      return;
    }

    setIsSavingCategory(true);
    // 1. Local Snappy Save
    const list = saveCategory(editingCategory);
    setCategories(list);

    // 2. Server MongoDB Sync
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(editingCategory),
      });
    } catch (err) {
      console.warn('MongoDB category save notice:', err);
    } finally {
      setIsSavingCategory(false);
      setShowCategoryModal(false);
      setEditingCategory(null);
    }
  };

  // Upload Asset Helper: Supports direct browser-to-Cloudinary upload (bypasses Vercel 4.5MB limit)
  const uploadAsset = async (file: File, folder: string): Promise<{ url: string; provider: string }> => {
    // 1. Try direct upload to Cloudinary (bypassing Vercel 4.5MB server payload limit)
    try {
      const paramRes = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
        headers: getAuthHeaders(),
      });
      if (paramRes.ok) {
        const config = await paramRes.json();
        if (config.configured && config.cloudName && config.apiKey && config.signature) {
          const directForm = new FormData();
          directForm.append('file', file);
          directForm.append('api_key', config.apiKey);
          directForm.append('timestamp', config.timestamp.toString());
          directForm.append('signature', config.signature);
          directForm.append('folder', config.folder);

          const cdnRes = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`, {
            method: 'POST',
            body: directForm,
          });

          if (!cdnRes.ok) {
            const errData = await cdnRes.json().catch(() => ({}));
            throw new Error(errData.error?.message || `Cloudinary rejected upload (${cdnRes.status})`);
          }

          const cdnData = await cdnRes.json();
          if (cdnData.secure_url) {
            return {
              url: cdnData.secure_url,
              provider: 'Cloudinary CDN (Direct Edge Upload)',
            };
          }
        }
      }
    } catch (directErr: any) {
      console.warn('Direct upload notice:', directErr);
      if (directErr.message && !directErr.message.includes('fetch')) {
        throw directErr;
      }
    }

    // 2. If Cloudinary is not configured in Vercel, check Vercel payload limit (4.5 MB)
    const MAX_VERCEL_BYTES = 4.2 * 1024 * 1024;
    if (file.size > MAX_VERCEL_BYTES) {
      throw new Error(
        `PAYLOAD_TOO_LARGE: This file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.\n\n` +
        `Vercel serverless functions enforce a 4.5 MB request limit for server uploads.\n\n` +
        `To solve this:\n` +
        `1. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your Vercel Project Settings > Environment Variables for direct high-speed uploads up to 100MB+.\n\n` +
        `2. OR: Paste a direct URL to the PDF (from Google Drive, Archive.org, Dropbox, or any CDN) directly in the PDF field.`
      );
    }

    // 3. Fallback to /api/upload for small files (< 4.2 MB)
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    uploadForm.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: uploadForm,
    });

    if (res.status === 413) {
      throw new Error(
        `Vercel payload limit (413): File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Add Cloudinary credentials to Vercel for unlimited direct uploads, or paste a direct PDF URL.`
      );
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      throw new Error(`Upload server error (${res.status}): ${text.slice(0, 150)}`);
    }

    if (data.success && data.url) {
      return {
        url: data.url,
        provider: data.provider || 'In-Memory Fallback',
      };
    }

    throw new Error(data.message || 'Upload failed');
  };

  // Upload to Cloudinary / CDN (Cover Image)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBook) return;

    setIsUploading(true);
    setUploadSuccess('');

    try {
      const result = await uploadAsset(file, 'al-maktabah/books');
      setEditingBook((prev) => (prev ? { ...prev, coverImage: result.url } : null));
      setUploadSuccess(`Cover uploaded (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    } catch (err: any) {
      alert(err.message || 'Cover upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Upload PDF Manuscript, analyze codex & auto-extract pages, titles & chapters!
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBook) return;

    setIsUploadingPdf(true);
    setPdfUploadSuccess('');
    setPdfAnalysisStatus('Analyzing PDF codex & extracting chapters...');

    try {
      // 1. Client-side extraction of page count, metadata & structured chapters
      const analysis = await analyzeUploadedPdf(file, (msg) => setPdfAnalysisStatus(msg));

      // 2. Upload asset to Cloudinary / CDN
      let finalPdfUrl = editingBook.pdfUrl || '';
      try {
        const result = await uploadAsset(file, 'al-maktabah/manuscripts');
        finalPdfUrl = result.url;
      } catch (uploadErr: any) {
        console.warn('Remote asset upload notice (preserving extracted content):', uploadErr.message);
      }

      // 3. Auto-populate entire book details and chapters from the PDF!
      setEditingBook((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          title: prev.title.trim() && prev.title !== 'Untitled Codex' ? prev.title : analysis.title,
          arabicTitle: prev.arabicTitle.trim() ? prev.arabicTitle : analysis.arabicTitle,
          author: prev.author.trim() ? prev.author : analysis.author,
          authorHijriYear: prev.authorHijriYear || analysis.authorHijriYear,
          discipline: prev.discipline || analysis.discipline,
          disciplineName: analysis.disciplineName,
          pages: analysis.pages,
          sizeMb: analysis.sizeMb,
          description: prev.description.trim() ? prev.description : analysis.description,
          pdfUrl: finalPdfUrl,
          chapters: analysis.chapters.length > 0 ? analysis.chapters : prev.chapters,
        };
      });

      setActiveChapterIndex(0);
      setPdfUploadSuccess(
        `✓ PDF Auto-Analyzed: ${analysis.pages} Pages, ${analysis.chapters.length} Chapters extracted with authentic Matn (${analysis.sizeMb} MB)`
      );
    } catch (err: any) {
      alert('PDF extraction notice: ' + err.message);
    } finally {
      setIsUploadingPdf(false);
      setPdfAnalysisStatus('');
      e.target.value = '';
    }
  };

  // Bulk Chapter Text Splitter & Ingestion
  const handleBulkChapterImport = () => {
    if (!bulkRawText.trim() || !editingBook) return;

    const lines = bulkRawText.split(/\r?\n/);
    const parsedChapters: BookChapter[] = [];
    let currentChapterTitle = 'Introduction / Muqaddimah';
    let currentChapterArabic = 'المقدمة';
    let currentContentLines: string[] = [];
    let chapterCount = 1;

    const commitChapter = () => {
      if (currentContentLines.length > 0 || parsedChapters.length > 0) {
        parsedChapters.push({
          id: `ch-${Date.now()}-${chapterCount}`,
          number: chapterCount,
          title: currentChapterTitle,
          arabicTitle: currentChapterArabic,
          startPage: (chapterCount - 1) * 15 + 1,
          content: currentContentLines.join('\n').trim(),
          translation: '',
          notes: '',
        });
        chapterCount++;
        currentContentLines = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const isHeader =
        line.startsWith('###') ||
        line.startsWith('##') ||
        line.startsWith('باب') ||
        /^Bab\s+\d+/i.test(line) ||
        /^Chapter\s+\d+/i.test(line);

      if (isHeader) {
        commitChapter();
        const cleanedTitle = line.replace(/^[#\-\*\s]+/, '').trim();
        currentChapterTitle = cleanedTitle;
        currentChapterArabic = line.startsWith('باب') ? cleanedTitle : `الباب ${chapterCount}`;
      } else {
        currentContentLines.push(rawLine);
      }
    }
    commitChapter();

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

    setIsSaving(true);
    // 1. Snappy Local Client Save
    const list = saveBook(editingBook);
    setBooks(list);

    // 2. Real MongoDB Server Save
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(editingBook),
      });
      const data = await res.json();
      if (data.source === 'mongodb') {
        setDbSyncStatus('online');
      }
    } catch (err) {
      console.warn('MongoDB save notice:', err);
    } finally {
      setIsSaving(false);
    }

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
                  Loading Scholarly Codex Reader Preview...
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
      <div className="min-h-screen bg-night-canvas text-night-text flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-emerald-card border border-emerald-border rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <span className="w-12 h-12 rounded-2xl bg-primary-container border border-emerald-highlight/30 text-tertiary-fixed inline-flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </span>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Al-Maktabah Admin Gate
            </h1>
            <p className="text-xs text-emerald-highlight">
              Restricted portal for manuscript custodians, chief editors, and archive administrators.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-red-400">error</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-highlight mb-1">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@almaktabah.org"
                className="w-full px-3.5 py-2.5 rounded-xl bg-night-surface border border-emerald-border text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-highlight"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-highlight mb-1">
                Security Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-night-surface border border-emerald-border text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-highlight"
              />
            </div>

            <div className="p-3 rounded-lg bg-night-surface/60 border border-emerald-border text-label-sm text-on-primary-container space-y-0.5">
              <span className="font-semibold block text-white">Default Admin Credentials:</span>
              <div>Username: <code className="bg-surface-container px-1 rounded text-white">admin@almaktabah.org</code></div>
              <div>Password: <code className="bg-surface-container px-1 rounded text-white">maktabah1445</code></div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-primary-container hover:bg-emerald-surface text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-emerald-highlight/30"
            >
              <span className="material-symbols-outlined text-lg">lock_open</span>
              <span>Authenticate &amp; Access Dashboard</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <a
              href="/"
              className="text-xs text-emerald-highlight hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Return to Public Library</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // PROTECTED ADMIN DASHBOARD
  const currentChapter = editingBook?.chapters[activeChapterIndex] || editingBook?.chapters[0];

  return (
    <div className="min-h-screen bg-parchment-canvas text-on-surface">
      {/* Top Admin Navbar */}
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
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'analytics' ? 'bg-primary-container text-white shadow-xs' : 'text-emerald-highlight hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">analytics</span>
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'books' ? 'bg-primary-container text-white shadow-xs' : 'text-emerald-highlight hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">library_books</span>
              <span className="hidden sm:inline">Book Manager</span>
              <span className="bg-surface-container px-1.5 py-0.2 rounded-full text-label-xs text-white">
                {books.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'categories' ? 'bg-primary-container text-white shadow-xs' : 'text-emerald-highlight hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">category</span>
              <span className="hidden sm:inline">Disciplines</span>
              <span className="bg-surface-container px-1.5 py-0.2 rounded-full text-label-xs text-white">
                {categories.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('homepage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'homepage' ? 'bg-primary-container text-white shadow-xs' : 'text-emerald-highlight hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span className="hidden sm:inline">Sections &amp; Reader</span>
              {homeSettings.sections.readerPreview.enabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
            <button
              onClick={handleStartNewBook}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'editor' ? 'bg-primary-container text-white shadow-xs' : 'text-emerald-highlight hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>+ New Treatise</span>
            </button>
          </div>

          {/* Right Tools: Public Site & Logout */}
          {/* Right Tools: DB Status, Public Site & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-semibold border ${
                dbSyncStatus === 'online'
                  ? 'bg-emerald-surface border-emerald-glow text-emerald-300'
                  : 'bg-tertiary-container/20 border-tertiary/40 text-gold-bright'
              }`}
              title={
                dbSyncStatus === 'online'
                  ? 'Connected to MongoDB Atlas / Server Database'
                  : 'Operating with Local Cache Storage'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  dbSyncStatus === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : dbSyncStatus === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-amber-400'
                }`}
              />
              <span>{dbSyncStatus === 'online' ? 'MongoDB Synced' : dbSyncStatus === 'connecting' ? 'Connecting...' : 'Local Storage'}</span>
            </div>

            <a
              href="/"
              className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-emerald-surface text-white text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span className="hidden md:inline">Public Site</span>
            </a>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-emerald-highlight hover:text-red-400 hover:bg-emerald-card transition-colors"
              title="Logout from Admin"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-max-w-archive-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <span className="text-xs uppercase font-bold text-tertiary tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">insights</span>
                Scholarly Analytics &amp; Archive Infrastructure
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mt-1">
                Digital Repository Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Real-time insights across digitized folios, active reading sessions, and CDN bandwidth distribution.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container shadow-xs">
                <div className="flex items-center justify-between text-on-surface-variant mb-2">
                  <span className="text-xs font-bold uppercase font-label-sm">Total Codices</span>
                  <span className="material-symbols-outlined text-lg text-primary">auto_stories</span>
                </div>
                <div className="font-display text-3xl font-bold text-primary">{books.length}</div>
                <span className="text-xs text-primary font-medium mt-1 block">
                  {books.filter((b) => b.published).length} Published Live
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container shadow-xs">
                <div className="flex items-center justify-between text-on-surface-variant mb-2">
                  <span className="text-xs font-bold uppercase font-label-sm">Total Chapters</span>
                  <span className="material-symbols-outlined text-lg text-secondary">format_list_bulleted</span>
                </div>
                <div className="font-display text-3xl font-bold text-secondary">
                  {books.reduce((acc, b) => acc + (b.chapters?.length || 0), 0)}
                </div>
                <span className="text-xs text-on-surface-variant mt-1 block">
                  Indexed with Arabic Tashkīl
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container shadow-xs">
                <div className="flex items-center justify-between text-on-surface-variant mb-2">
                  <span className="text-xs font-bold uppercase font-label-sm">Total Digitized Pages</span>
                  <span className="material-symbols-outlined text-lg text-tertiary">menu_book</span>
                </div>
                <div className="font-display text-3xl font-bold text-tertiary">
                  {books.reduce((acc, b) => acc + (b.pages || 0), 0).toLocaleString()}
                </div>
                <span className="text-xs text-on-surface-variant mt-1 block">
                  High-speed indexed folios
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container shadow-xs">
                <div className="flex items-center justify-between text-on-surface-variant mb-2">
                  <span className="text-xs font-bold uppercase font-label-sm">CDN Storage (Cloudinary)</span>
                  <span className="material-symbols-outlined text-lg text-primary-container">cloud_sync</span>
                </div>
                <div className="font-display text-3xl font-bold text-primary">
                  {books.reduce((acc, b) => acc + (b.sizeMb || 0), 0).toFixed(1)} MB
                </div>
                <span className="text-xs text-primary font-medium mt-1 block">
                  Ultra-Fast Edge CDN Cache
                </span>
              </div>
            </div>

            {/* Discipline Breakdown & Activity Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Discipline Breakdown */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
                <h3 className="font-title-md font-bold text-base text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">pie_chart</span>
                  <span>Codex Distribution by Canonical Discipline</span>
                </h3>

                <div className="space-y-3 pt-2">
                  {[
                    { name: 'Hadīth Traditions', count: books.filter((b) => b.discipline === 'hadith').length, color: 'bg-primary' },
                    { name: 'Qur’anic Exegesis (Tafsīr)', count: books.filter((b) => b.discipline === 'tafsir').length, color: 'bg-secondary' },
                    { name: 'Theology & Creed (‘Aqīdah)', count: books.filter((b) => b.discipline === 'aqeedah').length, color: 'bg-tertiary' },
                    { name: 'Jurisprudence (Fiqh)', count: books.filter((b) => b.discipline === 'fiqh').length, color: 'bg-emerald-600' },
                    { name: 'Other Canonical Sciences', count: books.filter((b) => !['hadith', 'tafsir', 'aqeedah', 'fiqh'].includes(b.discipline)).length, color: 'bg-gray-400' },
                  ].map((d, i) => {
                    const percentage = books.length ? Math.round((d.count / books.length) * 100) : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-on-surface">{d.name}</span>
                          <span className="text-on-surface-variant font-mono">{d.count} works ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                          <div className={`h-full ${d.color}`} style={{ width: `${Math.max(8, percentage)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions & Recent Logs */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
                <h3 className="font-title-md font-bold text-base text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                  <span>Quick Administrator Actions</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleStartNewBook}
                    className="p-3.5 rounded-xl bg-primary-container text-on-primary font-semibold text-xs text-left hover:bg-primary transition-all flex flex-col justify-between"
                  >
                    <span className="material-symbols-outlined text-xl mb-2">add_box</span>
                    <span>Upload &amp; Catalog Book</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('books')}
                    className="p-3.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs text-left hover:bg-surface-container-high transition-all flex flex-col justify-between"
                  >
                    <span className="material-symbols-outlined text-xl mb-2">edit_document</span>
                    <span>Manage Published Works</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-surface-container space-y-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Recent Custodian Activity</span>
                  <div className="space-y-2 text-xs text-on-surface-variant">
                    <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
                      <span>Indexed: Ṣaḥīḥ al-Bukhārī (3 chapters)</span>
                      <span className="text-label-xs text-primary font-bold">● Published</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
                      <span>Indexed: Riyāḍ aṣ-Ṣāliḥīn (2 chapters)</span>
                      <span className="text-label-xs text-primary font-bold">● Published</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
                      <span>Indexed: Al-‘Aqīdah al-Wāsiṭiyyah</span>
                      <span className="text-label-xs text-primary font-bold">● Published</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOK MANAGER TABLE */}
        {activeTab === 'books' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-primary">Cataloged Treatises ({books.length})</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Manage book publication status, edit chapters in real-time, or launch the interactive reader.
                </p>
              </div>

              <button
                onClick={handleStartNewBook}
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary transition-all self-start sm:self-auto"
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
                            onClick={() => handleTogglePublish(book)}
                            className={`px-2 py-0.5 rounded-full text-label-xs font-bold transition-colors ${
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
                      <button
                        onClick={() => setViewingReaderBook(book)}
                        className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">menu_book</span>
                        <span>View</span>
                      </button>

                      <button
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
                        onClick={() => handleEditBook(book)}
                        className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors"
                        title="Edit Book & Chapters"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-1.5 rounded-lg text-error hover:bg-surface-container transition-colors"
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
        )}

        {/* TAB 3: DISCIPLINES & CATEGORY MANAGER */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">category</span>
                  <span>Discipline Classifications (Tartīb al-‘Ulūm)</span>
                </h2>
                <p className="text-xs text-on-surface-variant max-w-2xl mt-1">
                  Manage Islamic knowledge branches, canonical taxonomy, and disciplines. Any additions or updates sync directly to the public Browse Library and Categories catalog.
                </p>
              </div>

              <button
                onClick={handleStartNewCategory}
                className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>+ Add New Discipline</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const linkedCount = books.filter((b) => b.discipline === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-xl">{cat.icon || 'category'}</span>
                        </span>
                        <span className="font-arabic font-bold text-xl text-primary">{cat.arabicName}</span>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-primary">{cat.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-label-sm font-mono text-tertiary bg-surface-container px-1.5 py-0.5 rounded">
                            slug: {cat.id}
                          </span>
                          <span className="text-label-sm text-on-surface-variant font-medium">
                            • {linkedCount} Treatises
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {cat.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-surface-container flex items-center justify-between">
                      <span className="text-label-sm text-on-surface-variant">
                        {cat.subBranches?.length || 0} sub-branches
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-primary flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            linkedCount > 0
                              ? 'text-gray-400 opacity-50 cursor-not-allowed'
                              : 'text-error hover:bg-surface-container'
                          }`}
                          title={
                            linkedCount > 0
                              ? `Cannot delete: ${linkedCount} treatise(s) assigned`
                              : 'Delete discipline'
                          }
                          disabled={linkedCount > 0}
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3.5: HOMEPAGE SECTIONS & CODEX READER CONTROL */}
        {activeTab === 'homepage' && (
          <div className="animate-fade-in">
            <Suspense
              fallback={
                <div className="py-20 flex flex-col items-center justify-center gap-2 text-on-primary-container animate-pulse">
                  <span className="material-symbols-outlined text-3xl animate-spin">tune</span>
                  <span className="text-xs uppercase tracking-wider font-semibold">Loading Homepage Configuration Panel...</span>
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
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl shadow-sm overflow-hidden animate-fade-in space-y-6 p-4 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-tertiary">Interactive Codex Editor</span>
                <h2 className="font-display text-2xl font-bold text-primary">
                  {editingBook.title || 'Untitled Treatise'}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodexModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-tertiary/20 hover:bg-tertiary/30 text-xs font-bold text-tertiary border border-tertiary/30 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Open Full 631-Page Continuous Codex Reader"
                >
                  <span className="material-symbols-outlined text-sm">auto_stories</span>
                  <span>📖 Read Full Codex ({editingBook.pages || 631} Pgs)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorPreviewMode(editorPreviewMode === 'edit' ? 'preview' : 'edit')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    {editorPreviewMode === 'edit' ? 'preview' : 'code'}
                  </span>
                  <span>{editorPreviewMode === 'edit' ? 'Live Formatted Preview' : 'Editor View'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('books')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Close
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-6">
              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    English Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    placeholder="e.g. Ṣaḥīḥ al-Bukhārī"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Arabic Title (بالتشكيل) *
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={editingBook.arabicTitle}
                    onChange={(e) => setEditingBook({ ...editingBook, arabicTitle: e.target.value })}
                    placeholder="صحيح البخاري"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-base font-arabic text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Author &amp; Hijri Death Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.author}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                    placeholder="e.g. Imām al-Bukhārī (d. 256 AH)"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-on-surface-variant">
                      Discipline / Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className="text-label-xs text-tertiary hover:underline"
                    >
                      + Manage Disciplines
                    </button>
                  </div>
                  <select
                    value={editingBook.discipline}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        discipline: e.target.value,
                        disciplineName: e.target.options[e.target.selectedIndex].text,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.arabicName ? `(${cat.arabicName})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="hadith">Prophetic Traditions (Hadīth)</option>
                        <option value="tafsir">Qur’anic Exegesis (Tafsīr)</option>
                        <option value="fiqh">Jurisprudence (Fiqh)</option>
                        <option value="aqeedah">Theology &amp; Creed (‘Aqīdah)</option>
                        <option value="seerah">Prophetic Biography (Sīrah)</option>
                        <option value="tazkiyah">Spiritual Adab</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Total Pages
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingBook.pages}
                    onChange={(e) => setEditingBook({ ...editingBook, pages: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface"
                  />
                </div>

                {/* Cover Image Upload (Cloudinary / CDN) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-on-surface-variant">
                      Cover / Manuscript Image
                    </label>
                    {editingBook.coverImage && (
                      <a href={editingBook.coverImage} target="_blank" rel="noreferrer" className="text-label-xs text-tertiary underline">
                        Preview URL
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingBook.coverImage}
                      onChange={(e) => setEditingBook({ ...editingBook, coverImage: e.target.value })}
                      placeholder="https://res.cloudinary.com/... or paste URL"
                      className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface truncate"
                    />
                    <label className="px-3 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 transition-colors">
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  {uploadSuccess && <span className="text-label-sm text-primary font-medium mt-1 block">✓ {uploadSuccess}</span>}
                </div>

                {/* PDF Manuscript Upload (Cloudinary / CDN) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-on-surface-variant">
                      PDF Critical Edition / Manuscript
                    </label>
                    {editingBook.pdfUrl && (
                      <span className="text-label-xs text-emerald-400 font-mono">Attached ✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingBook.pdfUrl || ''}
                      onChange={(e) => setEditingBook({ ...editingBook, pdfUrl: e.target.value })}
                      placeholder="https://.../manuscript.pdf (Cloudinary Auto CDN)"
                      className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface truncate"
                    />
                    <label className="px-3 py-2 bg-primary-container border border-emerald-highlight/30 hover:bg-emerald-surface text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 transition-colors">
                      <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                      <span>{isUploadingPdf ? 'Analyzing PDF...' : 'Upload PDF'}</span>
                      <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                    </label>
                  </div>
                  {pdfAnalysisStatus && (
                    <div className="flex items-center gap-2 p-2 bg-primary-container/10 border border-primary-container/30 rounded-lg text-xs text-primary font-medium mt-1.5 animate-pulse">
                      <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
                      <span>{pdfAnalysisStatus}</span>
                    </div>
                  )}
                  {pdfUploadSuccess && <span className="text-label-sm text-emerald-400 font-medium mt-1 block">✓ {pdfUploadSuccess}</span>}
                  <p className="text-label-sm text-on-surface-variant/80 mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-tertiary shrink-0">auto_stories</span>
                    <span>Smart PDF Ingest: Uploading a PDF automatically extracts total pages, book details, and populates chapters with authentic Matn & translation below!</span>
                  </p>
                </div>
              </div>

              {/* Chapters & Matn Editor */}
              <div className="pt-4 border-t border-surface-container space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">format_list_bulleted</span>
                    <span className="font-title-md font-bold text-sm text-primary">
                      Treatise Chapters ({editingBook.chapters.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCodexModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-card border border-emerald-border text-emerald-highlight hover:bg-emerald-surface text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Open continuous facsimile viewer with chapters sidebar"
                    >
                      <span className="material-symbols-outlined text-sm">auto_stories</span>
                      <span>📖 Live Reader Studio ({editingBook.pages || 631} Pgs)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBulkModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-tertiary-container/20 border border-tertiary/40 text-gold-bright hover:bg-tertiary-container/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Paste full treatise text and auto-generate structured chapters"
                    >
                      <span className="material-symbols-outlined text-sm">bolt</span>
                      <span>⚡ Bulk Text Ingest / Splitter</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddChapter}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>Add Chapter</span>
                    </button>
                  </div>
                </div>

                {/* Chapter Selector Tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {editingBook.chapters.map((ch, idx) => (
                    <div
                      key={ch.id || idx}
                      onClick={() => setActiveChapterIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-2 ${
                        activeChapterIndex === idx
                          ? 'bg-primary-container text-on-primary font-semibold'
                          : 'bg-surface-container-low border border-surface-container text-on-surface'
                      }`}
                    >
                      <span>{ch.number}. {ch.title}</span>
                      <span className="text-label-xs opacity-75 font-mono">p.{ch.startPage}</span>
                      {editingBook.chapters.length > 1 && (
                        <span onClick={(e) => { e.stopPropagation(); handleRemoveChapter(idx); }} className="hover:text-red-300 ml-1">×</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Active Chapter Content */}
                {editorPreviewMode === 'edit' ? (
                  <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-surface-container space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Chapter Title (EN)</label>
                        <input
                          type="text"
                          value={currentChapter.title}
                          onChange={(e) => {
                            const chs = [...editingBook.chapters];
                            chs[activeChapterIndex].title = e.target.value;
                            setEditingBook({ ...editingBook, chapters: chs });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Chapter Title (Arabic)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={currentChapter.arabicTitle}
                          onChange={(e) => {
                            const chs = [...editingBook.chapters];
                            chs[activeChapterIndex].arabicTitle = e.target.value;
                            setEditingBook({ ...editingBook, chapters: chs });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-sm font-arabic text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Start Page</label>
                        <input
                          type="number"
                          value={currentChapter.startPage}
                          onChange={(e) => {
                            const chs = [...editingBook.chapters];
                            chs[activeChapterIndex].startPage = parseInt(e.target.value) || 1;
                            setEditingBook({ ...editingBook, chapters: chs });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-primary">Arabic Matn Text (النص الأصلي بالتشكيل)</label>
                        <span className="text-label-sm font-mono text-on-surface-variant">
                          Words: {currentChapter.content ? currentChapter.content.split(/\s+/).filter(Boolean).length : 0}
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        dir="rtl"
                        value={currentChapter.content}
                        onChange={(e) => {
                          const chs = [...editingBook.chapters];
                          chs[activeChapterIndex].content = e.target.value;
                          setEditingBook({ ...editingBook, chapters: chs });
                        }}
                        placeholder="أدخل النص الأصلي بالتشكيل..."
                        className="w-full p-4 rounded-xl bg-surface-container-lowest border border-surface-container text-lg font-arabic leading-loose text-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">English Translation</label>
                        <textarea
                          rows={4}
                          value={currentChapter.translation || ''}
                          onChange={(e) => {
                            const chs = [...editingBook.chapters];
                            chs[activeChapterIndex].translation = e.target.value;
                            setEditingBook({ ...editingBook, chapters: chs });
                          }}
                          className="w-full p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Commentary / Footnotes</label>
                        <textarea
                          rows={4}
                          value={currentChapter.notes || ''}
                          onChange={(e) => {
                            const chs = [...editingBook.chapters];
                            chs[activeChapterIndex].notes = e.target.value;
                            setEditingBook({ ...editingBook, chapters: chs });
                          }}
                          className="w-full p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Formatted Continuous Codex Reader Preview */
                  <div className="rounded-2xl overflow-hidden border border-tertiary/40 shadow-xl">
                    <Suspense
                      fallback={
                        <div className="h-96 flex flex-col items-center justify-center gap-2 text-emerald-800 bg-parchment-canvas animate-pulse">
                          <span className="material-symbols-outlined text-3xl animate-spin">menu_book</span>
                          <span className="text-xs uppercase tracking-wider font-semibold">Loading Codex Facsimile Engine...</span>
                        </div>
                      }
                    >
                      <CodexPdfReader
                        book={editingBook}
                        pdfUrl={editingBook.pdfUrl}
                        initialPage={currentChapter?.startPage || 1}
                        onClose={() => setEditorPreviewMode('edit')}
                      />
                    </Suspense>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-surface-container">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBook.published}
                    onChange={(e) => setEditingBook({ ...editingBook, published: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-xs font-bold text-primary">Publish to Public Site Immediately</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('books')}
                    className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-semibold text-xs sm:text-sm hover:bg-primary shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{isSaving ? 'Syncing to Database...' : 'Save & Publish'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* BULK CHAPTER IMPORT / SMART SPLITTER MODAL */}
        {showBulkModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-emerald-card border border-emerald-border rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in text-white">
              <div className="flex items-center justify-between border-b border-emerald-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary-container border border-emerald-highlight/30 text-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">bolt</span>
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-white">Bulk Chapter Ingest &amp; Auto-Splitter</h3>
                    <p className="text-label-sm text-emerald-highlight">
                      Paste entire book text. Use <code className="bg-surface-container px-1 rounded text-primary">### Chapter Title</code> or <code className="bg-surface-container px-1 rounded text-primary">Bab 1:</code> or <code className="bg-surface-container px-1 rounded text-primary">باب ...</code> to auto-split into chapters.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-container"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                  Full Raw Text (Arabic / English with chapter markers):
                </label>
                <textarea
                  rows={14}
                  value={bulkRawText}
                  onChange={(e) => setBulkRawText(e.target.value)}
                  placeholder={`### Bab 1: Kitab al-Iman
عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول: إنما الأعمال بالنيات...

### Bab 2: Kitab al-Salah
عن عبد الله بن مسعود رضي الله عنه قال: سألت النبي صلى الله عليه وسلم: أي العمل أحب إلى الله؟ قال: الصلاة على وقتها...`}
                  className="w-full p-3.5 rounded-xl bg-night-surface border border-emerald-border text-xs font-mono text-night-text placeholder:text-gray-600 focus:outline-none focus:border-emerald-highlight leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-label-sm text-on-primary-container">
                  Lines: {bulkRawText ? bulkRawText.split('\n').length : 0} | Estimated Chapters: {bulkRawText ? (bulkRawText.match(/(###|Bab |Chapter |باب)/gi) || []).length : 0}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkRawText('');
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-emerald-border text-xs font-semibold text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkChapterImport}
                    className="px-5 py-2 rounded-xl bg-primary-container hover:bg-emerald-surface text-white border border-emerald-highlight/30 text-xs font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                    <span>Parse &amp; Populate Chapters</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY & DISCIPLINE CREATE/EDIT MODAL */}
        {showCategoryModal && editingCategory && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-emerald-card border border-emerald-border rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in text-white">
              <div className="flex items-center justify-between border-b border-emerald-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary-container border border-emerald-highlight/30 text-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">category</span>
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {editingCategory.id && categories.some((c) => c.id === editingCategory.id)
                        ? 'Edit Discipline'
                        : 'New Discipline Classification'}
                    </h3>
                    <p className="text-label-sm text-emerald-highlight">
                      Configures canonical discipline name, Arabic title, and taxonomy.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-container"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                      Discipline Name (EN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = editingCategory.id ? editingCategory.id : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setEditingCategory({ ...editingCategory, name, id: slug });
                      }}
                      placeholder="e.g. Arabic Grammar"
                      className="w-full px-3 py-2 rounded-xl bg-night-surface border border-emerald-border text-xs text-white focus:outline-none focus:border-emerald-highlight"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                      Arabic Title (بالتشكيل)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={editingCategory.arabicName}
                      onChange={(e) => setEditingCategory({ ...editingCategory, arabicName: e.target.value })}
                      placeholder="النحو والصرف"
                      className="w-full px-3 py-2 rounded-xl bg-night-surface border border-emerald-border text-sm font-arabic text-tertiary-fixed focus:outline-none focus:border-emerald-highlight"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                      Unique Slug / ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCategory.id}
                      onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value.toLowerCase().trim() })}
                      placeholder="e.g. nahw"
                      className="w-full px-3 py-2 rounded-xl bg-night-surface border border-emerald-border text-xs font-mono text-tertiary focus:outline-none focus:border-emerald-highlight"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                      Material Icon Key
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingCategory.icon}
                        onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        placeholder="category / translate / school"
                        className="flex-1 px-3 py-2 rounded-xl bg-night-surface border border-emerald-border text-xs text-white focus:outline-none focus:border-emerald-highlight"
                      />
                      <span className="w-8 h-8 rounded-lg bg-night-surface border border-emerald-border flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-base">{editingCategory.icon || 'category'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                    Academic Scope / Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    placeholder="Classical linguistic treatises, grammatical rules, inflection, and syntax."
                    className="w-full p-2.5 rounded-xl bg-night-surface border border-emerald-border text-xs text-night-text focus:outline-none focus:border-emerald-highlight"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-emerald-border text-xs font-semibold text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCategory}
                    className="px-5 py-2 rounded-xl bg-primary-container hover:bg-emerald-surface text-white border border-emerald-highlight/30 text-xs font-semibold shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingCategory && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{isSavingCategory ? 'Saving...' : 'Save Discipline'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Full-Screen Codex Reader Modal */}
        {showCodexModal && editingBook && (
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
                  onClose={() => setShowCodexModal(false)}
                />
              </Suspense>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
