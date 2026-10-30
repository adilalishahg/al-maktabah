'use client';

import React, { useState } from 'react';
import type { DetailedBook, BookChapter } from '../types/bookContent';
import type { AdminDashboardViewProps } from '../types/views';
import { useAdminBooks } from '@/hooks/useAdminBooks';
import { DashboardMetricsBar } from '@/components/admin/DashboardMetricsBar';
import { DashboardBooksTable } from '@/components/admin/DashboardBooksTable';
import { DashboardBookEditorModal } from '@/components/admin/DashboardBookEditorModal';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onOpenReader,
  onNavigate,
}) => {
  const {
    books,
    saveBookMutation,
    deleteBookMutation,
    togglePublishMutation,
  } = useAdminBooks();

  const [selectedBook, setSelectedBook] = useState<DetailedBook | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [editorPreviewMode, setEditorPreviewMode] = useState<'edit' | 'preview'>('edit');

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
          content: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ...',
          translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful...',
          notes: 'Standard critical academic edition transmission.',
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

  const handleDeleteBook = async (id: string) => {
    if (confirm('Are you sure you want to delete this book from the digital archives?')) {
      await deleteBookMutation(id);
      if (selectedBook?.id === id) {
        setIsEditing(false);
        setSelectedBook(null);
      }
    }
  };

  const handleTogglePublish = (book: DetailedBook) => {
    togglePublishMutation(book);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccessMessage('');

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'ml_default');

        const res = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
          method: 'POST',
          body: data,
        });

      if (res.ok) {
        const json = await res.json();
        setFormData((prev) => ({
          ...prev,
          coverImage: json.secure_url || prev.coverImage,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(1)),
        }));
        setUploadSuccessMessage('Cover image uploaded to Cloudinary CDN successfully!');
      } else {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const result = uploadEvent.target?.result as string;
          setFormData((prev) => ({
            ...prev,
            coverImage: result,
            sizeMb: Number((file.size / (1024 * 1024)).toFixed(1)),
          }));
          setUploadSuccessMessage('Asset loaded in local browser cache.');
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          coverImage: result,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(1)),
        }));
        setUploadSuccessMessage('Asset loaded locally in browser.');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadSuccessMessage(''), 4000);
    }
  };

  const handleAddChapter = () => {
    const nextNum = formData.chapters.length + 1;
    const newChapter: BookChapter = {
      id: `ch-${Date.now()}`,
      number: nextNum,
      title: `Chapter ${nextNum}`,
      arabicTitle: `الباب ${nextNum}`,
      startPage: (formData.chapters[formData.chapters.length - 1]?.startPage || 1) + 15,
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

    const handleRemoveChapter = (indexToRemove: number) => {
      if (formData.chapters.length <= 1) return;
      const updated = formData.chapters.filter((_, idx) => idx !== indexToRemove);
      setFormData((prev) => ({ ...prev, chapters: updated }));
      if (activeChapterIndex >= updated.length) {
        setActiveChapterIndex(updated.length - 1);
      }
    };

    const updateCurrentChapter = (fields: Partial<BookChapter>) => {
      setFormData((prev) => {
        const updated = [...prev.chapters];
        updated[activeChapterIndex] = {
          ...updated[activeChapterIndex],
          ...fields,
        };
        return { ...prev, chapters: updated };
      });
    };

    const handleSaveBook = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title || !formData.arabicTitle || !formData.author) {
        alert('Please fill out the English Title, Arabic Title, and Author fields.');
        return;
      }

      saveBookMutation(formData);
      setIsEditing(false);
      setSelectedBook(formData);
      alert(`Book "${formData.title}" has been saved and published to the site!`);
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
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
                className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
                <span>View Public Site</span>
              </button>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>+ Upload &amp; Catalog Book</span>
              </button>
            </div>
          </div>

          {/* Stats Ribbon */}
          <DashboardMetricsBar books={books} />

          {/* Editor Modal / Panel */}
          {isEditing && (
        <DashboardBookEditorModal
          formData={formData}
          setFormData={setFormData}
          selectedBook={selectedBook}
          activeChapterIndex={activeChapterIndex}
          setActiveChapterIndex={setActiveChapterIndex}
          editorPreviewMode={editorPreviewMode}
          setEditorPreviewMode={setEditorPreviewMode}
          isUploading={isUploading}
          uploadSuccessMessage={uploadSuccessMessage}
          handleFileUpload={handleFileUpload}
          handleSaveBook={handleSaveBook}
          handleAddChapter={handleAddChapter}
          handleRemoveChapter={handleRemoveChapter}
          updateCurrentChapter={updateCurrentChapter}
          onClose={() => setIsEditing(false)}
        />
          )}

          {/* Cataloged Books Table / Cards */}
          <DashboardBooksTable
            books={books}
            onOpenReader={onOpenReader}
            onEditBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
            onTogglePublish={handleTogglePublish}
          />
        </div>
        );
};
