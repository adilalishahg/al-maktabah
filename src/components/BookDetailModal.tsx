import React, { useState } from 'react';
import { Book } from '../types/library';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
  onDownload: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onOpenReader,
  onDownload
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'toc' | 'citation'>('overview');
  const [copiedCitation, setCopiedCitation] = useState(false);

  if (!book) return null;

  const citationText = `${book.author}. ${book.title} (${book.arabicTitle}). ${book.edition}. Al-Maktabah Digital Waqf Archives, 1445 AH. Open Access Codex ID: AK-${book.id.toUpperCase()}.`;

  const handleCopyCitation = () => {
    navigator.clipboard?.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-3xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-surface-container-high px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-surface-container-highest">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">auto_stories</span>
            </span>
            <span className="font-label-sm uppercase tracking-wider text-primary font-bold text-xs sm:text-sm truncate">
              Scholarly Codex Record
            </span>
            {book.verified && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-tertiary px-2 py-0.5 rounded-full bg-surface-container-lowest border border-tertiary/20 shrink-0">
                <span className="material-symbols-outlined text-xs">verified</span> Academic Council Verified
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1">
          {/* Hero Split */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
            <div className="md:col-span-4 shrink-0">
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-surface-container-high max-w-xs mx-auto md:max-w-none">
                <img src={book.coverImage} alt={book.title} className="w-full h-52 sm:h-64 object-cover" />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-xs font-semibold shadow-xs">
                    {book.badge || book.disciplineName}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-surface/90 backdrop-blur-sm text-on-surface font-label-sm text-xs font-medium">
                  {book.pages} pgs • {book.sizeMb} MB
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-4 max-w-xs mx-auto md:max-w-none">
                <button
                  onClick={() => {
                    onOpenReader(book);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-title-md text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">chrome_reader_mode</span>
                  <span>Read in Web Reader</span>
                </button>
                <button
                  onClick={() => onDownload(book)}
                  className="w-full py-2.5 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-title-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-surface-container-high cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Download Archive</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div>
                <div className="font-arabic text-2xl sm:text-3xl font-bold text-primary mb-1">{book.arabicTitle}</div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-primary">{book.title}</h2>
                <p className="font-title-md text-xs sm:text-sm text-tertiary font-semibold mt-1">
                  By {book.author} <span className="text-on-surface-variant font-normal">({book.authorHijriYear})</span>
                </p>
              </div>

              {/* Quick stats pills */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
                <div className="p-2 sm:p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
                  <span className="text-on-surface-variant block font-label-sm uppercase text-[10px] sm:text-xs">Canonical Status</span>
                  <span className="font-semibold text-primary block mt-0.5 text-xs sm:text-sm truncate">{book.canonicalStatus || 'Verified Text'}</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
                  <span className="text-on-surface-variant block font-label-sm uppercase text-[10px] sm:text-xs">Volumes</span>
                  <span className="font-semibold text-primary block mt-0.5 text-xs sm:text-sm">{book.volumes} {book.volumes > 1 ? 'Vols' : 'Vol'}</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
                  <span className="text-on-surface-variant block font-label-sm uppercase text-[10px] sm:text-xs">Read Time</span>
                  <span className="font-semibold text-primary block mt-0.5 text-xs sm:text-sm">~{book.readingTimeHours || 12}h</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-surface-container pt-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                >
                  Scholarly Overview
                </button>
                <button
                  onClick={() => setActiveTab('toc')}
                  className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'toc' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                >
                  Table of Contents
                </button>
                <button
                  onClick={() => setActiveTab('citation')}
                  className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'citation' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                >
                  Academic Citation
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'overview' && (
                <div className="space-y-3 text-sm text-on-surface leading-relaxed">
                  <p>{book.description}</p>
                  <div className="space-y-2 pt-2">
                    <p className="font-label-sm uppercase text-xs text-on-surface-variant font-semibold">Digitized Formats Available</p>
                    <div className="flex flex-wrap gap-1.5">
                      {book.formats.map((fmt, i) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-surface-container text-xs text-on-surface font-medium">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-primary block">Codex Provenance & Recension</span>
                    <p className="text-on-surface-variant">{book.edition}. Cross-referenced with historical manuscript witnesses held in Istanbul, Cairo, and Damascus.</p>
                  </div>
                </div>
              )}

              {activeTab === 'toc' && (
                <div className="space-y-2 text-sm text-on-surface">
                  <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between text-xs font-semibold">
                    <span>1. Prologue & Author's Khutbah</span>
                    <span className="text-on-surface-variant font-mono">p. 1-14</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between text-xs font-semibold">
                    <span>2. Foundational Principles & Transmitted Isnāds</span>
                    <span className="text-on-surface-variant font-mono">p. 15-84</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between text-xs font-semibold">
                    <span>3. Primary Chapters (Kutub wa-Abwāb)</span>
                    <span className="text-on-surface-variant font-mono">p. 85-520</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between text-xs font-semibold">
                    <span>4. Concluding Epilogue & Index of Narrators</span>
                    <span className="text-on-surface-variant font-mono">p. 521-{book.pages}</span>
                  </div>
                </div>
              )}

              {activeTab === 'citation' && (
                <div className="space-y-3 text-xs">
                  <p className="text-on-surface-variant">
                    Use this standardized citation string for university dissertations, academic journals, and research publications:
                  </p>
                  <div className="p-3 bg-surface-container-low rounded-xl font-mono text-xs text-on-surface border border-surface-container break-all">
                    {citationText}
                  </div>
                  <button
                    onClick={handleCopyCitation}
                    className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-semibold text-xs flex items-center gap-1.5 hover:bg-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">{copiedCitation ? 'done' : 'content_copy'}</span>
                    <span>{copiedCitation ? 'Citation Copied!' : 'Copy Chicago / MLA Citation'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-container px-6 py-3 border-t border-surface-container-high flex items-center justify-between text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs text-tertiary-container">history_edu</span>
            Preserved under the International Digital Waqf Charter
          </span>
          <button onClick={onClose} className="hover:text-primary font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
