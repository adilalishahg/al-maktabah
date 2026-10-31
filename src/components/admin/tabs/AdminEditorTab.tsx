import React, { useState, useRef, Suspense, lazy } from 'react';
import type { DetailedBook } from '../../../types/bookContent';
import type { CategoryScience } from '../../../types/library';

const CodexPdfReader = lazy(() =>
  import('@/components/CodexPdfReader').then((m) => ({ default: m.CodexPdfReader }))
);

export interface AdminEditorTabProps {
  editingBook: DetailedBook;
  setEditingBook: React.Dispatch<React.SetStateAction<DetailedBook | null>>;
  categories: CategoryScience[];
  activeChapterIndex: number;
  setActiveChapterIndex: (idx: number) => void;
  editorPreviewMode: 'edit' | 'preview';
  setEditorPreviewMode: (mode: 'edit' | 'preview') => void;
  isUploading: boolean;
  uploadSuccess: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingPdf: boolean;
  pdfUploadSuccess: string;
  pdfAnalysisStatus: string;
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement> | File) => void;
  handleAddChapter: () => void;
  handleRemoveChapter: (idx: number) => void;
  handleSaveBook: (e: React.FormEvent) => void;
  isSaving: boolean;
  setShowCodexModal: (show: boolean) => void;
  setShowBulkModal: (show: boolean) => void;
  setActiveTab: (tab: 'analytics' | 'books' | 'categories' | 'editor' | 'homepage') => void;
}

export const AdminEditorTab: React.FC<AdminEditorTabProps> = ({
  editingBook,
  setEditingBook,
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
  setActiveTab,
}) => {
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const bigFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const hasPdfAttached = Boolean(editingBook.pdfUrl && editingBook.pdfUrl.trim());
  const currentChapter = editingBook.chapters[activeChapterIndex] || editingBook.chapters[0];

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.toLowerCase().endsWith('.pdf')) {
        handlePdfUpload(droppedFile);
      } else {
        alert('Please drop a valid PDF manuscript file (.pdf)');
      }
    }
  };

  // STEP 1: INITIAL STATE -> Show Big Prominent Document Uploader
  if (!hasPdfAttached && !manualMode) {
    return (
      <div className="bg-surface-container-lowest border border-surface-container rounded-3xl shadow-sm overflow-hidden animate-fade-in p-6 sm:p-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-container pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-tertiary">
              Interactive Manuscript Studio
            </span>
            <h2 className="font-display text-2xl font-bold text-primary">
              Upload Manuscript Document
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('books')}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

        {/* Big Drag and Drop Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploadingPdf && bigFileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-16 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-5 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/20 scale-[1.01]'
              : 'border-emerald-800/30 hover:border-emerald-700 bg-surface-container-low/40 hover:bg-emerald-950/10'
          }`}
        >
          <input
            ref={bigFileInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />

          {isUploadingPdf ? (
            /* Uploading & Analyzing Progress Screen */
            <div className="py-8 space-y-5 flex flex-col items-center max-w-md mx-auto">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
                <span className="material-symbols-outlined text-4xl text-emerald-700 animate-pulse">
                  picture_as_pdf
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl font-bold text-primary">
                  Analyzing PDF &amp; Ingesting Content...
                </h3>
                <p className="text-xs font-medium text-on-surface-variant animate-pulse font-mono">
                  {pdfAnalysisStatus || 'Extracting page 1 cover image, metadata & chapters...'}
                </p>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full w-2/3 animate-pulse" />
              </div>
            </div>
          ) : (
            /* Idle Uploader Dropzone */
            <>
              <div className="w-20 h-20 rounded-2xl bg-primary-container/10 border border-emerald-highlight/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-4xl text-emerald-800">
                  upload_file
                </span>
              </div>

              <div className="space-y-1.5 max-w-lg">
                <h3 className="font-display text-2xl font-bold text-primary">
                  Click to Upload or Drag &amp; Drop PDF
                </h3>
                <p className="text-sm text-on-surface-variant font-arabic text-emerald-900 font-semibold">
                  اسحب ملف المخطوط (PDF) وأفلته هنا، أو اضغط للتصفح والرفع
                </p>
                <p className="text-xs text-on-surface-variant/80">
                  Select your manuscript or critical edition (PDF up to 100MB+ supported)
                </p>
              </div>

              {/* Feature extraction pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 max-w-2xl w-full">
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container text-left space-y-1 shadow-xs">
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">auto_stories</span> Title &amp; Author
                  </span>
                  <p className="text-label-xs text-on-surface-variant leading-tight">
                    Auto-extracted in English &amp; vocalized Arabic
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container text-left space-y-1 shadow-xs">
                  <span className="text-tertiary font-bold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">image</span> Page 1 Cover
                  </span>
                  <p className="text-label-xs text-on-surface-variant leading-tight">
                    Rendered directly from the PDF first page
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container text-left space-y-1 shadow-xs">
                  <span className="text-gold-bright font-bold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">format_list_bulleted</span> Chapters &amp; Matn
                  </span>
                  <p className="text-label-xs text-on-surface-variant leading-tight">
                    Bookmarks, start pages &amp; authentic Arabic text
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container text-left space-y-1 shadow-xs">
                  <span className="text-primary font-bold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">pages</span> Auto-Pagination
                  </span>
                  <p className="text-label-xs text-on-surface-variant leading-tight">
                    Automatic page counting and file size indexing
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                  <span>Select PDF Manuscript</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Subtle manual entry alternative */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer hover:underline inline-flex items-center gap-1"
          >
            <span>Or enter treatise details manually without a PDF</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: AUTO-COMPLETED EDITOR VIEW (After PDF Upload or Manual Entry)
  return (
    <div className="bg-surface-container-lowest border border-surface-container rounded-2xl shadow-sm overflow-hidden animate-fade-in space-y-6 p-4 sm:p-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container pb-4">
        <div>
          <span className="text-xs font-bold uppercase text-tertiary">Interactive Manuscript Editor</span>
          <h2 className="font-display text-2xl font-bold text-primary">
            {editingBook.title || 'Untitled Treatise'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCodexModal(true)}
            className="px-3 py-1.5 rounded-lg bg-tertiary/20 hover:bg-tertiary/30 text-xs font-bold text-tertiary border border-tertiary/30 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Open Full-Page Continuous PDF Reader"
          >
            <span className="material-symbols-outlined text-sm">auto_stories</span>
            <span>📖 Read Full PDF ({editingBook.pages} Pgs)</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorPreviewMode(editorPreviewMode === 'edit' ? 'preview' : 'edit')}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {editorPreviewMode === 'edit' ? 'preview' : 'code'}
            </span>
            <span>{editorPreviewMode === 'edit' ? 'Live Formatted Preview' : 'Editor View'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('books')}
            className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Auto-analysis Success Banner */}
      {pdfUploadSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-emerald-700">check_circle</span>
            <span>{pdfUploadSuccess}</span>
          </div>
          <span className="text-label-xs font-mono text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full">
            Extracted from PDF
          </span>
        </div>
      )}

      <form onSubmit={handleSaveBook} className="space-y-6">
        {/* Row 1: English Title, Arabic Title, Author & Hijri Year */}
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
        </div>

        {/* Row 2: Cover Image (Extracted from PDF Page 1) & PDF Manuscript */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Cover Image with Extracted Thumbnail Preview */}
          <div className="p-3.5 rounded-xl bg-surface-container-low/50 border border-surface-container space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-on-surface-variant flex items-center gap-1.5">
                <span>Cover / Manuscript Image</span>
                {editingBook.coverImage && (
                  <span className="text-label-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                    Extracted from PDF Page 1 ✓
                  </span>
                )}
              </label>
              {editingBook.coverImage && (
                <a
                  href={editingBook.coverImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-label-xs text-tertiary underline"
                >
                  Preview Full
                </a>
              )}
            </div>

            <div className="flex items-center gap-3">
              {editingBook.coverImage ? (
                <img
                  src={editingBook.coverImage}
                  alt="Extracted PDF Cover"
                  className="w-14 h-20 object-cover rounded-lg border border-surface-container shadow-xs shrink-0 bg-surface-container"
                />
              ) : (
                <div className="w-14 h-20 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                  <span className="material-symbols-outlined text-xl">image</span>
                </div>
              )}

              <div className="flex-1 space-y-1.5 min-w-0">
                <input
                  type="text"
                  value={editingBook.coverImage}
                  onChange={(e) => setEditingBook({ ...editingBook, coverImage: e.target.value })}
                  placeholder="Cover image URL or extracted preview..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-surface-container text-xs text-on-surface truncate"
                />
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    <span>{isUploading ? 'Uploading...' : 'Replace Image'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {uploadSuccess && (
                    <span className="text-label-sm text-primary font-medium truncate">
                      ✓ {uploadSuccess}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PDF Critical Edition / Manuscript */}
          <div className="p-3.5 rounded-xl bg-surface-container-low/50 border border-surface-container space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-on-surface-variant flex items-center gap-1.5">
                <span>PDF Critical Edition / Manuscript</span>
                {editingBook.pdfUrl && (
                  <span className="text-label-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full font-mono">
                    Attached ✓ ({editingBook.pages} Pgs)
                  </span>
                )}
              </label>
              {editingBook.pdfUrl && (
                <button
                  type="button"
                  onClick={() => setShowCodexModal(true)}
                  className="text-label-xs text-tertiary underline cursor-pointer"
                >
                  Inspect Codex
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingBook.pdfUrl || ''}
                onChange={(e) => setEditingBook({ ...editingBook, pdfUrl: e.target.value })}
                placeholder="https://.../manuscript.pdf (Cloudinary Auto CDN)"
                className="flex-1 px-3 py-2 rounded-lg bg-surface-container-lowest border border-surface-container text-xs text-on-surface truncate"
              />
              <label className="px-3 py-2 bg-primary-container border border-emerald-highlight/30 hover:bg-emerald-surface text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                <span>{isUploadingPdf ? 'Analyzing PDF...' : 'Change PDF'}</span>
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>

            {pdfAnalysisStatus && (
              <div className="flex items-center gap-2 p-2 bg-primary-container/10 border border-primary-container/30 rounded-lg text-xs text-primary font-medium animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{pdfAnalysisStatus}</span>
              </div>
            )}

            <p className="text-label-sm text-on-surface-variant/80 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-tertiary shrink-0">auto_stories</span>
              <span>
                PDF Ingest Active: {editingBook.pages} pages, titles &amp; {editingBook.chapters.length} chapters populated!
              </span>
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
                <span>📖 Live Reader Studio ({editingBook.pages} Pgs)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="px-3 py-1.5 rounded-lg bg-tertiary-container/20 border border-tertiary/40 text-gold-bright hover:bg-tertiary-container/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Paste full treatise text and auto-generate structured chapters"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>⚡ Bulk Text Ingest / Splitter</span>
              </button>
              <button
                type="button"
                onClick={handleAddChapter}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary flex items-center gap-1 cursor-pointer"
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-2 transition-all ${
                  activeChapterIndex === idx
                    ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                    : 'bg-surface-container-low border border-surface-container text-on-surface hover:bg-surface-container'
                }`}
              >
                <span>{ch.number}. {ch.title}</span>
                <span className="text-label-xs opacity-75 font-mono">p.{ch.startPage}</span>
                {editingBook.chapters.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveChapter(idx);
                    }}
                    className="hover:text-red-300 ml-1 font-bold text-sm"
                    title="Remove Chapter"
                  >
                    ×
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Active Chapter Content */}
          {editorPreviewMode === 'edit' ? (
            <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-surface-container space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Chapter Title (EN)
                  </label>
                  <input
                    type="text"
                    value={currentChapter?.title || ''}
                    onChange={(e) => {
                      const chs = [...editingBook.chapters];
                      chs[activeChapterIndex].title = e.target.value;
                      setEditingBook({ ...editingBook, chapters: chs });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Chapter Title (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={currentChapter?.arabicTitle || ''}
                    onChange={(e) => {
                      const chs = [...editingBook.chapters];
                      chs[activeChapterIndex].arabicTitle = e.target.value;
                      setEditingBook({ ...editingBook, chapters: chs });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-sm font-arabic text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Start Page
                  </label>
                  <input
                    type="number"
                    value={currentChapter?.startPage || 1}
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
                  <label className="text-xs font-bold text-primary">
                    Arabic Matn Text (النص الأصلي بالتشكيل)
                  </label>
                  <span className="text-label-sm font-mono text-on-surface-variant">
                    Words: {currentChapter?.content ? currentChapter.content.split(/\s+/).filter(Boolean).length : 0}
                  </span>
                </div>
                <textarea
                  rows={6}
                  dir="rtl"
                  value={currentChapter?.content || ''}
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
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    English Translation
                  </label>
                  <textarea
                    rows={4}
                    value={currentChapter?.translation || ''}
                    onChange={(e) => {
                      const chs = [...editingBook.chapters];
                      chs[activeChapterIndex].translation = e.target.value;
                      setEditingBook({ ...editingBook, chapters: chs });
                    }}
                    className="w-full p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Commentary / Footnotes
                  </label>
                  <textarea
                    rows={4}
                    value={currentChapter?.notes || ''}
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
                    <span className="text-xs uppercase tracking-wider font-semibold">Loading Facsimile Engine...</span>
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
              className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-semibold text-xs sm:text-sm hover:bg-primary shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isSaving && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isSaving ? 'Syncing to Database...' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
