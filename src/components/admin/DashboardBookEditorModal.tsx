'use client';

import React from 'react';
import type { DetailedBook, BookChapter } from '@/types/bookContent';

export interface DashboardBookEditorModalProps {
  formData: DetailedBook;
  setFormData: React.Dispatch<React.SetStateAction<DetailedBook>>;
  selectedBook: DetailedBook | null;
  activeChapterIndex: number;
  setActiveChapterIndex: (idx: number) => void;
  editorPreviewMode: 'edit' | 'preview';
  setEditorPreviewMode: (mode: 'edit' | 'preview') => void;
  isUploading: boolean;
  uploadSuccessMessage: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSaveBook: (e: React.FormEvent) => void;
  handleAddChapter: () => void;
  handleRemoveChapter: (idx: number) => void;
  updateCurrentChapter: (fields: Partial<BookChapter>) => void;
  onClose: () => void;
}

export const DashboardBookEditorModal: React.FC<DashboardBookEditorModalProps> = ({
  formData,
  setFormData,
  selectedBook,
  activeChapterIndex,
  setActiveChapterIndex,
  editorPreviewMode,
  setEditorPreviewMode,
  isUploading,
  uploadSuccessMessage,
  handleFileUpload,
  handleSaveBook,
  handleAddChapter,
  handleRemoveChapter,
  updateCurrentChapter,
  onClose,
}) => {
  const currentChapter = formData.chapters[activeChapterIndex] || formData.chapters[0];

  return (
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
            className="px-3 py-1.5 rounded-lg bg-surface/20 hover:bg-surface/30 text-xs font-semibold text-on-primary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {editorPreviewMode === 'edit' ? 'preview' : 'code'}
            </span>
            <span>{editorPreviewMode === 'edit' ? 'Live Formatted Preview' : 'Back to Editor'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-primary/80 hover:text-on-primary transition-colors cursor-pointer"
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
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
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
                onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value, 10) || 1 })}
                placeholder="Pages"
                className="w-1/2 px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface"
              />
              <input
                type="number"
                min="1"
                value={formData.volumes}
                onChange={(e) => setFormData({ ...formData, volumes: parseInt(e.target.value, 10) || 1 })}
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
              <span className="text-label-sm text-primary font-medium mt-1 block">
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
                <span className="text-label-xs opacity-75 font-mono">p.{ch.startPage}</span>
                {formData.chapters.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveChapter(idx);
                    }}
                    className="hover:text-error ml-1 font-bold"
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
                    onChange={(e) => updateCurrentChapter({ startPage: parseInt(e.target.value, 10) || 1 })}
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
                  <span className="text-label-sm text-on-surface-variant font-mono">
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
            <div className="p-6 rounded-xl bg-surface border border-surface-container space-y-6">
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
                  <span className="font-label-sm uppercase text-label-xs text-tertiary font-bold block mb-1">
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
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 sm:w-auto px-5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">cloud_done</span>
              <span>Save &amp; Publish Book</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
