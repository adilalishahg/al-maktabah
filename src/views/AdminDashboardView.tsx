'use client';

import React, { useState } from 'react';
import { DetailedBook, BookChapter } from '../types/bookContent';
import { getStoredBooks, saveBook, deleteBook } from '../data/bookStore';

interface AdminDashboardViewProps {
  onOpenReader: (book: DetailedBook, chapterId?: string) => void;
  onNavigate: (path: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onOpenReader,
  onNavigate,
}) => {
  const [books, setBooks] = useState<DetailedBook[]>(() => getStoredBooks());
  const [selectedBook, setSelectedBook] = useState<DetailedBook | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [editorPreviewMode, setEditorPreviewMode] = useState<'edit' | 'preview'>('edit');

  // New or Edited Book Form State
  const [formData, setFormData] = useState<DetailedBook>({
    id: '',
    title: '',
    arabicTitle: '',
    author: '',
    authorHijriYear: '',
    discipline: 'hadith',
    disciplineName: 'Prophetic Traditions (Hadīth)',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000',
    description: '',
    pages: 100,
    sizeMb: 5.0,
    edition: 'Standard Critical Academic Edition',
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
        title: 'Introduction & Preamble',
        arabicTitle: 'المقدمة والباب الأول',
        startPage: 1,
        content: '',
        translation: '',
        notes: '',
      },
    ],
  });

  const handleCreateNew = () => {
    const newId = 'book-' + Date.now();
    setFormData({
      id: newId,
      title: '',
      arabicTitle: '',
      author: '',
      authorHijriYear: '',
      discipline: 'hadith',
      disciplineName: 'Prophetic Traditions (Hadīth)',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000',
      description: '',
      pages: 120,
      sizeMb: 8.5,
      edition: 'Dar al-Turath Standard Edition',
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
          title: 'Foundational Chapter',
          arabicTitle: 'الفصل الأول في الأصول',
          startPage: 1,
          content: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...',
          translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds...',
          notes: 'Standard introductory khutbah with isnād commentary.',
        },
      ],
    });
    setSelectedBook(null);
    setActiveChapterIndex(0);
    setIsEditing(true);
  };

  const handleEditBook = (book: DetailedBook) => {
    setFormData(JSON.parse(JSON.stringify(book)));
    setSelectedBook(book);
    setActiveChapterIndex(0);
    setIsEditing(true);
  };

  const handleDeleteBook = (id: string) => {
    if (confirm('Are you sure you want to delete this book from the digital archives?')) {
      const updated = deleteBook(id);
      setBooks(updated);
      if (selectedBook?.id === id) {
        setIsEditing(false);
        setSelectedBook(null);
      }
    }
  };

  const handleTogglePublish = (book: DetailedBook) => {
    const updatedBook = { ...book, published: !book.published };
    const updatedList = saveBook(updatedBook);
    setBooks(updatedList);
  };

  // Upload handler with Cloudinary support
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccessMessage('');

    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('folder', 'al-maktabah/covers');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: data.url,
        }));
        setUploadSuccessMessage(`Uploaded successfully to ${data.provider || 'CDN'}`);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error uploading asset to server: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Add Chapter to current book
  const handleAddChapter = () => {
    const nextNum = formData.chapters.length + 1;
    const lastChapter = formData.chapters[formData.chapters.length - 1];
    const newStartPage = (lastChapter?.startPage || 1) + 20;

    const newChapter: BookChapter = {
      id: `ch-${Date.now()}`,
      number: nextNum,
      title: `Chapter ${nextNum}`,
      arabicTitle: `الباب ${nextNum}`,
      startPage: newStartPage,
      content: '',
      translation: '',
      notes: '',
    };

    setFormData((prev) => ({
      ...prev,
      chapters: [...prev.chapters, newChapter],
    }));
    setActiveChapterIndex(formData.chapters.length);
  };

  const handleRemoveChapter = (index: number) => {
    if (formData.chapters.length <= 1) {
      alert('A book must have at least one chapter.');
      return;
    }
    const updated = formData.chapters.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, chapters: updated }));
    if (activeChapterIndex >= updated.length) {
      setActiveChapterIndex(updated.length - 1);
    }
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.arabicTitle || !formData.author) {
      alert('Please fill out the English Title, Arabic Title, and Author fields.');
      return;
    }

    const updatedList = saveBook(formData);
    setBooks(updatedList);
    setIsEditing(false);
    setSelectedBook(formData);
    alert(`Book "${formData.title}" has been saved and published to the site!`);
  };

  const currentChapter = formData.chapters[activeChapterIndex] || formData.chapters[0];

  const updateCurrentChapter = (fields: Partial<BookChapter>) => {
    setFormData((prev) => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[activeChapterIndex] = {
        ...updatedChapters[activeChapterIndex],
        ...fields,
      };
      return { ...prev, chapters: updatedChapters };
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-tertiary mb-1">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            <span>Digital Custodian &amp; Waqf Archive Center</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">
            Admin Library Dashboard
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
            Upload new treatises, manage chapters, edit Arabic texts in real-time, and publish directly to the live reader.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            <span>View Public Site</span>
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>+ Upload &amp; Catalog Book</span>
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
          <span className="text-[11px] font-label-sm uppercase text-on-surface-variant font-semibold block">Total Cataloged</span>
          <span className="font-display text-2xl font-bold text-primary mt-0.5 block">{books.length}</span>
          <span className="text-xs text-on-surface-variant mt-0.5 block">Authentic treatises</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
          <span className="text-[11px] font-label-sm uppercase text-on-surface-variant font-semibold block">Published Live</span>
          <span className="font-display text-2xl font-bold text-primary mt-0.5 block">
            {books.filter((b) => b.published).length}
          </span>
          <span className="text-xs text-primary font-medium mt-0.5 block">Available to readers</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
          <span className="text-[11px] font-label-sm uppercase text-on-surface-variant font-semibold block">Draft Treatises</span>
          <span className="font-display text-2xl font-bold text-tertiary mt-0.5 block">
            {books.filter((b) => !b.published).length}
          </span>
          <span className="text-xs text-on-surface-variant mt-0.5 block">Under scholarly review</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
          <span className="text-[11px] font-label-sm uppercase text-on-surface-variant font-semibold block">Total Chapters</span>
          <span className="font-display text-2xl font-bold text-secondary mt-0.5 block">
            {books.reduce((acc, b) => acc + (b.chapters?.length || 0), 0)}
          </span>
          <span className="text-xs text-on-surface-variant mt-0.5 block">Indexed sections</span>
        </div>
      </div>

      {/* Editor Modal / Panel */}
      {isEditing && (
        <div className="bg-surface-container-lowest border-2 border-primary-container/40 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          {/* Editor Header Bar */}
          <div className="bg-primary-container text-on-primary p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-primary-container">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary-fixed shrink-0">
                <span className="material-symbols-outlined text-lg">edit_note</span>
              </span>
              <div>
                <h3 className="font-title-md font-bold text-on-primary leading-tight">
                  {selectedBook ? `Edit: ${formData.title || 'Untitled'}` : 'Catalog New Classical Treatise'}
                </h3>
                <span className="text-xs text-tertiary-fixed font-medium">
                  Interactive Text Editor with Chapter Indexing &amp; Cloudinary CDN Storage
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditorPreviewMode(editorPreviewMode === 'edit' ? 'preview' : 'edit')}
                className="px-3 py-1.5 rounded-lg bg-surface/20 hover:bg-surface/30 text-xs font-semibold text-on-primary transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">
                  {editorPreviewMode === 'edit' ? 'preview' : 'code'}
                </span>
                <span>{editorPreviewMode === 'edit' ? 'Live Formatted Preview' : 'Back to Editor'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-on-primary/80 hover:text-on-primary transition-colors"
                title="Cancel"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveBook} className="p-4 sm:p-6 space-y-6">
            {/* Top Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                  English Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Ṣaḥīḥ al-Bukhārī"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface focus:outline-none focus:border-primary"
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
                  value={formData.arabicTitle}
                  onChange={(e) => setFormData({ ...formData, arabicTitle: e.target.value })}
                  placeholder="صحيح البخاري"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-base font-arabic text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                  Author &amp; Death Year *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. Imām al-Bukhārī (d. 256 AH)"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                  Discipline / Category
                </label>
                <select
                  value={formData.discipline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discipline: e.target.value,
                      disciplineName: e.target.options[e.target.selectedIndex].text,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="hadith">Prophetic Traditions (Hadīth)</option>
                  <option value="tafsir">Qur’anic Exegesis (Tafsīr)</option>
                  <option value="fiqh">Jurisprudence &amp; Legal Theory (Fiqh)</option>
                  <option value="aqeedah">Theology &amp; Creed (‘Aqīdah)</option>
                  <option value="seerah">Prophetic Biography (Sīrah)</option>
                  <option value="tazkiyah">Spiritual Purification (Adab)</option>
                  <option value="linguistics">Arabic Linguistics &amp; Naḥw</option>
                  <option value="history">Islamic History &amp; Chronicles</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                  Total Pages &amp; Volumes
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 1 })}
                    placeholder="Pages"
                    className="w-1/2 px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface"
                  />
                  <input
                    type="number"
                    min="1"
                    value={formData.volumes}
                    onChange={(e) => setFormData({ ...formData, volumes: parseInt(e.target.value) || 1 })}
                    placeholder="Vols"
                    className="w-1/2 px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface"
                  />
                </div>
              </div>

              {/* Cover Image & Cloudinary Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                  Cover Image (Cloudinary / CDN)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="Image URL or upload"
                    className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface truncate"
                  />
                  <label className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-semibold text-primary cursor-pointer border border-surface-container shrink-0 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {uploadSuccessMessage && (
                  <span className="text-[11px] text-primary font-medium mt-1 block">
                    ✓ {uploadSuccessMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                Book Scholarly Description &amp; Overview
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Comprehensive academic overview of this treatise, transmission recension, and verified manuscripts..."
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Chapter Management Ribbon */}
            <div className="pt-4 border-t border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">format_list_bulleted</span>
                  <span className="font-title-md font-bold text-sm text-primary">
                    Book Chapters &amp; Text Sections ({formData.chapters.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>+ Add New Chapter</span>
                </button>
              </div>

              {/* Chapters Pills */}
              <div className="flex flex-wrap gap-1.5 pb-3">
                {formData.chapters.map((ch, idx) => (
                  <div
                    key={ch.id || idx}
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-2 transition-all ${
                      activeChapterIndex === idx
                        ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant border border-surface-container'
                    }`}
                  >
                    <span>{ch.number}. {ch.title}</span>
                    <span className="text-[10px] opacity-75 font-mono">p.{ch.startPage}</span>
                    {formData.chapters.length > 1 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveChapter(idx);
                        }}
                        className="hover:text-error ml-1"
                        title="Delete Chapter"
                      >
                        ×
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Current Chapter Editor or Live Preview */}
              {editorPreviewMode === 'edit' ? (
                <div className="p-4 rounded-xl bg-surface-container-low/40 border border-surface-container space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        Chapter English Title
                      </label>
                      <input
                        type="text"
                        value={currentChapter.title}
                        onChange={(e) => updateCurrentChapter({ title: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        Chapter Arabic Title
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={currentChapter.arabicTitle}
                        onChange={(e) => updateCurrentChapter({ arabicTitle: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-sm font-arabic text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        Start Page Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentChapter.startPage}
                        onChange={(e) => updateCurrentChapter({ startPage: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs text-on-surface"
                      />
                    </div>
                  </div>

                  {/* Main Arabic Text Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-primary flex items-center gap-1">
                        <span>Arabic Matn (النص الأصلي بالتشكيل)</span>
                      </label>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        Words: {currentChapter.content ? currentChapter.content.split(/\s+/).filter(Boolean).length : 0}
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      dir="rtl"
                      value={currentChapter.content}
                      onChange={(e) => updateCurrentChapter({ content: e.target.value })}
                      placeholder="أدخل النص العربي الأصلي هنا مع علامات التشكيل الكاملة..."
                      className="w-full p-4 rounded-xl bg-surface-container-lowest border border-surface-container text-lg font-arabic leading-loose text-primary focus:outline-none focus:border-primary shadow-xs"
                    />
                  </div>

                  {/* Translation & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        English Translation (Parallel View)
                      </label>
                      <textarea
                        rows={4}
                        value={currentChapter.translation || ''}
                        onChange={(e) => updateCurrentChapter({ translation: e.target.value })}
                        placeholder="Insert authorized English scholarly translation..."
                        className="w-full p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-xs text-on-surface leading-relaxed focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        Isnād Commentary &amp; Footnotes
                      </label>
                      <textarea
                        rows={4}
                        value={currentChapter.notes || ''}
                        onChange={(e) => updateCurrentChapter({ notes: e.target.value })}
                        placeholder="Transmission chain nodes, narrator grades, and theological notes..."
                        className="w-full p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-xs text-on-surface-variant leading-relaxed focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Live Formatted Preview */
                <div className="p-6 rounded-xl bg-[#fbf9f5] border border-surface-container space-y-6">
                  <div className="text-center pb-4 border-b border-surface-container">
                    <span className="font-label-sm uppercase tracking-wider text-tertiary text-xs font-bold block">
                      {formData.title} • Chapter {currentChapter.number}
                    </span>
                    <h2 className="font-arabic text-2xl font-bold text-primary mt-1">
                      {currentChapter.arabicTitle}
                    </h2>
                    <h3 className="font-title-md font-semibold text-on-surface text-sm mt-0.5">
                      {currentChapter.title}
                    </h3>
                    <span className="text-xs text-on-surface-variant font-mono mt-1 inline-block">
                      Page {currentChapter.startPage} of {formData.pages}
                    </span>
                  </div>

                  {/* Arabic Matn Rendering */}
                  <div
                    dir="rtl"
                    className="font-arabic text-xl sm:text-2xl font-medium text-primary leading-[2.2] p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container whitespace-pre-line"
                  >
                    {currentChapter.content || 'لا يوجد نص مدخل حتى الآن.'}
                  </div>

                  {/* Translation */}
                  {currentChapter.translation && (
                    <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container text-sm text-on-surface leading-relaxed whitespace-pre-line">
                      <span className="font-label-sm uppercase text-[10px] text-tertiary font-bold block mb-1">
                        Authorized English Rendering
                      </span>
                      {currentChapter.translation}
                    </div>
                  )}

                  {/* Notes */}
                  {currentChapter.notes && (
                    <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant border-l-4 border-tertiary">
                      <span className="font-semibold block mb-0.5 text-on-surface">Marginal Scholarly Commentary:</span>
                      {currentChapter.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-surface-container">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <span className="text-xs font-bold text-on-surface">
                  Publish to Live Public Library Immediately
                </span>
              </label>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 sm:w-auto px-4 py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 sm:w-auto px-5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-base">cloud_done</span>
                  <span>Save &amp; Publish Book</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Cataloged Books Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-title-md font-bold text-lg text-primary">
            Cataloged Treatises &amp; Codex Records ({books.length})
          </h2>
          <span className="text-xs text-on-surface-variant font-medium">
            Click 'Read in Viewer' or 'Edit' to update text and chapters.
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
                      <span className="font-label-sm uppercase text-[10px] text-tertiary font-bold truncate">
                        {book.disciplineName}
                      </span>
                      <button
                        onClick={() => handleTogglePublish(book)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          book.published
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

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-surface-container text-center text-[11px] text-on-surface-variant">
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
                <button
                  onClick={() => onOpenReader(book)}
                  className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  <span>Read in Viewer</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditBook(book)}
                    className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors"
                    title="Edit Text & Chapters"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="p-1.5 rounded-lg text-error/80 hover:text-error hover:bg-surface-container transition-colors"
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
    </div>
  );
};
