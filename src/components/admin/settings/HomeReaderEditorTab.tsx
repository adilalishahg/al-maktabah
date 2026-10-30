import React from 'react';
import type { HomeSettings } from '../../../types/homeSettings';
import type { DetailedBook } from '../../../types/bookContent';
import type { Footnote, IsnadNode } from '../../../types/library';
import { IsnadEditorList } from './IsnadEditorList';
import { FootnotesEditorList } from './FootnotesEditorList';

export interface HomeReaderEditorTabProps {
  currentSettings: HomeSettings;
  setCurrentSettings: React.Dispatch<React.SetStateAction<HomeSettings>>;
  books: DetailedBook[];
  selectedBookId: string;
  setSelectedBookId: (id: string) => void;
  selectedChapterId: string;
  setSelectedChapterId: (id: string) => void;
  onLoadBookIntoReader: () => void;
  onAddNarrator: () => void;
  onRemoveNarrator: (index: number) => void;
  onUpdateNarrator: (index: number, field: keyof IsnadNode, value: string) => void;
  onAddFootnote: () => void;
  onRemoveFootnote: (index: number) => void;
  onUpdateFootnote: (index: number, field: keyof Footnote, value: string) => void;
  onSaveSettings: (settings: HomeSettings) => void;
  isSaving: boolean;
}

export const HomeReaderEditorTab: React.FC<HomeReaderEditorTabProps> = ({
  currentSettings,
  setCurrentSettings,
  books,
  selectedBookId,
  setSelectedBookId,
  selectedChapterId,
  setSelectedChapterId,
  onLoadBookIntoReader,
  onAddNarrator,
  onRemoveNarrator,
  onUpdateNarrator,
  onAddFootnote,
  onRemoveFootnote,
  onUpdateFootnote,
  onSaveSettings,
  isSaving,
}) => {
  const reader = currentSettings.readerSection;
  const sections = currentSettings.sections;
  const currentBookChapters = books.find((b) => b.id === selectedBookId)?.chapters || [];

  return (
    <div className="space-y-6">
      {/* Quick Populate from Uploaded Books Banner */}
      <div className="bg-gradient-to-r from-emerald-surface via-emerald-surface to-emerald-surface rounded-2xl p-5 border-2 border-tertiary/50 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-tertiary-fixed">cloud_sync</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Populate Reader Directly from Uploaded Books
              </h3>
              <p className="text-xs text-emerald-highlight">
                Pick any book you uploaded to the library and select which chapter/matn to display on the homepage reader.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-tertiary-container/20 text-tertiary-fixed text-xs font-bold border border-tertiary/40 self-start sm:self-auto">
            {books.length} Uploaded Codices Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6">
            <label className="text-xs text-emerald-100 font-semibold block mb-1">Select Uploaded Book:</label>
            <select
              value={selectedBookId}
              onChange={(e) => {
                setSelectedBookId(e.target.value);
                const b = books.find((x) => x.id === e.target.value);
                if (b?.chapters?.[0]) {
                  setSelectedChapterId(b.chapters[0].id);
                } else {
                  setSelectedChapterId('');
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white text-xs font-semibold focus:outline-none focus:border-tertiary-fixed"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.arabicTitle || b.author} ({b.chapters?.length || 1} Chapters)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs text-emerald-100 font-semibold block mb-1">Select Chapter / Matn:</label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white text-xs font-semibold focus:outline-none focus:border-tertiary-fixed"
              disabled={currentBookChapters.length === 0}
            >
              {currentBookChapters.length > 0 ? (
                currentBookChapters.map((ch, idx) => (
                  <option key={ch.id} value={ch.id}>
                    {idx + 1}. {ch.title} ({ch.arabicTitle || `Page ${ch.startPage}`})
                  </option>
                ))
              ) : (
                <option value="">Default Recension (Chapter 1)</option>
              )}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="button"
              onClick={onLoadBookIntoReader}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-tertiary-fixed to-tertiary-container text-stone-950 text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Load Content</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reader Core Identity Fields */}
      <div className="bg-emerald-surface rounded-2xl p-6 border border-emerald-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-emerald-border pb-3">
          <span className="material-symbols-outlined text-tertiary-fixed">badge</span>
          Reader Identification &amp; Chapter Header
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Book Title (English):</label>
            <input
              type="text"
              value={reader.bookTitle}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  readerSection: { ...reader, bookTitle: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Book Title (Arabic):</label>
            <input
              type="text"
              dir="rtl"
              value={reader.bookTitleArabic}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  readerSection: { ...reader, bookTitleArabic: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white text-right focus:outline-none focus:border-emerald-500 font-arabic text-sm"
            />
          </div>

          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Chapter Title (English):</label>
            <input
              type="text"
              value={reader.chapterTitleEn}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  readerSection: { ...reader, chapterTitleEn: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Chapter Title (Arabic):</label>
            <input
              type="text"
              dir="rtl"
              value={reader.chapterTitleAr}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  readerSection: { ...reader, chapterTitleAr: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white text-right focus:outline-none focus:border-emerald-500 font-arabic text-sm"
            />
          </div>

          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Chapter Number:</label>
            <input
              type="number"
              value={reader.chapterNumber}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  readerSection: { ...reader, chapterNumber: parseInt(e.target.value) || 1 },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Hadith / Entry Number:</label>
            <input
              type="number"
              value={reader.entryNumber}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  readerSection: { ...reader, entryNumber: parseInt(e.target.value) || 1 },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Total Entries in Book:</label>
            <input
              type="number"
              value={reader.totalEntries}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  readerSection: { ...reader, totalEntries: parseInt(e.target.value) || 1 },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Authenticity Status Badge:</label>
            <input
              type="text"
              value={reader.authenticityStatus}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  readerSection: { ...reader, authenticityStatus: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Dual-Pane Texts Editor: Classical Arabic & English */}
      <div className="bg-emerald-surface rounded-2xl p-6 border border-emerald-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-emerald-border pb-3">
          <span className="material-symbols-outlined text-tertiary-fixed">translate</span>
          Sacred Matn &amp; Parallel Translation Content
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Right Column (Classical Arabic RTL) */}
          <div className="space-y-3 bg-night-canvas p-4 rounded-xl border border-emerald-border">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider text-label-xs">
                Classical Arabic Canvas (RTL)
              </span>
              <span className="text-label-sm text-on-primary-container">النص العربي المعتمد</span>
            </div>

            <div>
              <label className="text-emerald-highlight font-semibold block mb-1">Arabic Sanad / Lead Text:</label>
              <textarea
                dir="rtl"
                rows={3}
                value={reader.arabicLead}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    readerSection: { ...reader, arabicLead: e.target.value },
                  })
                }
                placeholder="حَدَّثَنَا فُلانٌ قَالَ..."
                className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white text-right font-arabic text-sm leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-tertiary-fixed font-bold block mb-1">
                Arabic Sacred Matn (Main Core Text):
              </label>
              <textarea
                dir="rtl"
                rows={4}
                value={reader.arabicMatn}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    readerSection: { ...reader, arabicMatn: e.target.value },
                  })
                }
                placeholder="« إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ... »"
                className="w-full px-3 py-2 rounded-xl border-2 border-tertiary/50 text-white text-right font-arabic text-base font-bold leading-loose focus:outline-none focus:border-tertiary-fixed"
              />
            </div>

            <div>
              <label className="text-emerald-highlight font-semibold block mb-1">Arabic Chapter Subtext:</label>
              <input
                type="text"
                dir="rtl"
                value={reader.arabicSubtext}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    readerSection: { ...reader, arabicSubtext: e.target.value },
                  })
                }
                placeholder="باب كيف كان بدء الوحي..."
                className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white text-right font-arabic text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Left Column (English Vernacular & Scholarly Translation) */}
          <div className="space-y-3 bg-night-canvas p-4 rounded-xl border border-emerald-border">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-primary-container text-white font-bold uppercase tracking-wider text-label-xs">
                English Translation &amp; Apparatus
              </span>
              <span className="text-label-sm text-on-primary-container">Academic Recension</span>
            </div>

            <div>
              <label className="text-emerald-highlight font-semibold block mb-1">English Heading:</label>
              <input
                type="text"
                value={reader.englishHeading}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    readerSection: { ...reader, englishHeading: e.target.value },
                  })
                }
                placeholder="Narrated by 'Umar bin Al-Khattab"
                className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-emerald-highlight font-semibold block mb-1">English Lead Text:</label>
              <input
                type="text"
                value={reader.englishLeadText}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    readerSection: { ...reader, englishLeadText: e.target.value },
                  })
                }
                placeholder="I heard Allah's Messenger (ﷺ) saying,"
                className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-tertiary-fixed font-bold block mb-1">
                English Highlighted Matn (Gold Underlined):
              </label>
              <textarea
                rows={3}
                value={reader.englishHighlightText}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    readerSection: { ...reader, englishHighlightText: e.target.value },
                  })
                }
                placeholder='"The reward of deeds depends upon the intentions..."'
                className="w-full px-3 py-2 rounded-xl bg-night-canvas border-2 border-tertiary/50 text-white font-semibold leading-relaxed focus:outline-none focus:border-tertiary-fixed"
              />
            </div>

            <div>
              <label className="text-emerald-highlight font-semibold block mb-1">English Subsequent Text:</label>
              <textarea
                rows={2}
                value={reader.englishSubsequentText}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    readerSection: { ...reader, englishSubsequentText: e.target.value },
                  })
                }
                placeholder="So whoever emigrated for worldly benefits..."
                className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Isnād Transmission Chain Nodes */}
      <IsnadEditorList
        isnadChain={reader.isnadChain}
        onAddNarrator={onAddNarrator}
        onRemoveNarrator={onRemoveNarrator}
        onUpdateNarrator={onUpdateNarrator}
      />

      {/* Footnotes Marginalia */}
      <FootnotesEditorList
        footnotes={reader.footnotes}
        onAddFootnote={onAddFootnote}
        onRemoveFootnote={onRemoveFootnote}
        onUpdateFootnote={onUpdateFootnote}
      />

      {/* Recitation Audio Controls */}
      <div className="bg-emerald-surface rounded-2xl p-6 border border-emerald-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-emerald-border pb-3">
          <span className="material-symbols-outlined text-tertiary-fixed">volume_up</span>
          Vocal Recitation Apparatus
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Reciter Name:</label>
            <input
              type="text"
              value={sections.readerPreview.audioReciter || ''}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  sections: {
                    ...currentSettings.sections,
                    readerPreview: {
                      ...sections.readerPreview,
                      audioReciter: e.target.value,
                    },
                  },
                })
              }
              placeholder="Sheikh Mishary Rashid Alafasy"
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-emerald-highlight font-semibold block mb-1">Duration Indicator:</label>
            <input
              type="text"
              value={sections.readerPreview.audioDuration || '00:42 / 01:15'}
              onChange={(e) =>
                setCurrentSettings({
                  ...currentSettings,
                  sections: {
                    ...currentSettings.sections,
                    readerPreview: {
                      ...sections.readerPreview,
                      audioDuration: e.target.value,
                    },
                  },
                })
              }
              placeholder="00:42 / 01:15"
              className="w-full px-3 py-2 rounded-xl bg-night-canvas border border-emerald-border text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => onSaveSettings(currentSettings)}
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold-leaf via-tertiary-fixed to-tertiary-container hover:brightness-110 active:scale-95 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>Save All Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
