import React, { Suspense, lazy } from 'react';
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
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  const currentChapter = editingBook.chapters[activeChapterIndex] || editingBook.chapters[0];

  return (
    <div className="bg-surface-container-lowest border border-surface-container rounded-2xl shadow-sm overflow-hidden animate-fade-in space-y-6 p-4 sm:p-8">
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
            title="Open Full -Page Continuous PDF Reader"
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
                className="text-label-xs text-tertiary hover:underline cursor-pointer"
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
                <a
                  href={editingBook.coverImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-label-xs text-tertiary underline"
                >
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-2 ${activeChapterIndex === idx
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'bg-surface-container-low border border-surface-container text-on-surface'
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
                    className="hover:text-red-300 ml-1"
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
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Chapter Title (EN)</label>
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
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Chapter Title (Arabic)</label>
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
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Start Page</label>
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
                  <label className="text-xs font-bold text-primary">Arabic Matn Text (النص الأصلي بالتشكيل)</label>
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
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">English Translation</label>
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
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Commentary / Footnotes</label>
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
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-semibold text-xs sm:text-sm hover:bg-primary shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSaving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isSaving ? 'Syncing to Database...' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
