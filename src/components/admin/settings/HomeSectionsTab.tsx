import React from 'react';
import type { HomeSettings, HomeSectionsConfig } from '../../../types/homeSettings';
import type { DetailedBook } from '../../../types/bookContent';

export interface HomeSectionsTabProps {
  currentSettings: HomeSettings;
  setCurrentSettings: React.Dispatch<React.SetStateAction<HomeSettings>>;
  books: DetailedBook[];
  onToggleSection: (sectionKey: keyof HomeSectionsConfig) => void;
  onNavigateToReaderTab: () => void;
}

export const HomeSectionsTab: React.FC<HomeSectionsTabProps> = ({
  currentSettings,
  setCurrentSettings,
  books,
  onToggleSection,
  onNavigateToReaderTab,
}) => {
  const sections = currentSettings.sections;
  const reader = currentSettings.readerSection;

  return (
    <div className="space-y-6">
      <div className="bg-emerald-surface rounded-2xl p-6 border border-emerald-border space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-border pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-fixed text-lg">toggle_on</span>
              Homepage View Sections Visibility
            </h3>
            <p className="text-xs text-emerald-highlight mt-0.5">
              Click the switch on any section to toggle it Active (shown) or Inactive (hidden) on the public homepage.
            </p>
          </div>

          <span className="text-xs text-emerald-highlight">
            {Object.values(sections).filter((s) => s.enabled).length} of 7 Sections Active
          </span>
        </div>

        {/* Sections Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* 1. Daily Ayah & Hadith Banner */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sections.dailyBanner.enabled
                ? 'bg-night-surface border-emerald-500/40 shadow-sm'
                : 'bg-night-surface border-emerald-border opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-surface text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">format_quote</span>
                </span>
                <span className="text-xs font-bold text-white">Daily Insight Banner</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleSection('dailyBanner')}
                className={`px-2.5 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  sections.dailyBanner.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sections.dailyBanner.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                  }`}
                ></span>
                <span>{sections.dailyBanner.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
              </button>
            </div>
            <p className="text-label-sm text-emerald-highlight leading-relaxed mb-3">
              Top calligraphic banner displaying daily Quranic ayah or hadith with citation.
            </p>
            {sections.dailyBanner.enabled && (
              <div className="space-y-2 pt-2 border-t border-emerald-border text-xs">
                <input
                  type="text"
                  dir="rtl"
                  value={sections.dailyBanner.arabicText}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      sections: {
                        ...currentSettings.sections,
                        dailyBanner: { ...sections.dailyBanner, arabicText: e.target.value },
                      },
                    })
                  }
                  placeholder="Arabic Calligraphy Text"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-night-canvas border border-emerald-border text-white text-right text-xs focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={sections.dailyBanner.translation}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      sections: {
                        ...currentSettings.sections,
                        dailyBanner: { ...sections.dailyBanner, translation: e.target.value },
                      },
                    })
                  }
                  placeholder="English Translation"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-night-canvas border border-emerald-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={sections.dailyBanner.reference}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      sections: {
                        ...currentSettings.sections,
                        dailyBanner: { ...sections.dailyBanner, reference: e.target.value },
                      },
                    })
                  }
                  placeholder="Surah / Hadith Reference"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-night-canvas border border-emerald-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* 2. Hero 3D Manuscripts Showcase */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sections.heroSection.enabled
                ? 'bg-night-surface border-emerald-500/40 shadow-sm'
                : 'bg-night-surface border-emerald-border opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-surface text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">view_in_ar</span>
                </span>
                <span className="text-xs font-bold text-white">Hero 3D Showcase</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleSection('heroSection')}
                className={`px-2.5 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  sections.heroSection.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sections.heroSection.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                  }`}
                ></span>
                <span>{sections.heroSection.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
              </button>
            </div>
            <p className="text-label-sm text-emerald-highlight leading-relaxed mb-3">
              Primary hero column with title, metrics strip, and 3D illuminated codices stack.
            </p>
            {sections.heroSection.enabled && (
              <div className="space-y-2 pt-2 border-t border-emerald-border text-xs">
                <label className="text-label-xs text-on-primary-container font-semibold block">Center Pedestal Book:</label>
                <select
                  value={sections.heroSection.centerBookId || ''}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      sections: {
                        ...currentSettings.sections,
                        heroSection: { ...sections.heroSection, centerBookId: e.target.value },
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-night-canvas border border-emerald-border text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="riyad-salihin">Default: Riyāḍ aṣ-Ṣāliḥīn (رياض الصالحين)</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.arabicTitle || b.author})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 3. Classified Sciences of Knowledge (Categories) */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sections.categoriesGrid.enabled
                ? 'bg-night-surface border-emerald-500/40 shadow-sm'
                : 'bg-night-surface border-emerald-border opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-surface text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">category</span>
                </span>
                <span className="text-xs font-bold text-white">Categories Grid</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleSection('categoriesGrid')}
                className={`px-2.5 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  sections.categoriesGrid.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sections.categoriesGrid.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                  }`}
                ></span>
                <span>{sections.categoriesGrid.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
              </button>
            </div>
            <p className="text-label-sm text-emerald-highlight leading-relaxed mb-3">
              Classification of Islamic Sciences (Tartīb al-‘Ulūm) grid featuring disciplines.
            </p>
            {sections.categoriesGrid.enabled && (
              <div className="space-y-2 pt-2 border-t border-emerald-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-label-xs text-on-primary-container font-semibold">Max Display Cards:</span>
                  <select
                    value={sections.categoriesGrid.maxDisplay || 6}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        sections: {
                          ...currentSettings.sections,
                          categoriesGrid: {
                            ...sections.categoriesGrid,
                            maxDisplay: parseInt(e.target.value) || 6,
                          },
                        },
                      })
                    }
                    className="px-2 py-1 rounded-lg bg-night-canvas border border-emerald-border text-white text-xs focus:outline-none"
                  >
                    <option value={3}>3 Disciplines</option>
                    <option value={6}>6 Disciplines</option>
                    <option value={9}>9 Disciplines</option>
                    <option value={20}>All Catalogued Disciplines</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 4. Featured Critical Editions Shelf */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sections.featuredShelf.enabled
                ? 'bg-night-surface border-emerald-500/40 shadow-sm'
                : 'bg-night-surface border-emerald-border opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-surface text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">shelves</span>
                </span>
                <span className="text-xs font-bold text-white">Featured Books Shelf</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleSection('featuredShelf')}
                className={`px-2.5 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  sections.featuredShelf.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sections.featuredShelf.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                  }`}
                ></span>
                <span>{sections.featuredShelf.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
              </button>
            </div>
            <p className="text-label-sm text-emerald-highlight leading-relaxed mb-3">
              Curated shelf highlighting uploaded critical codices with filter tabs.
            </p>
            {sections.featuredShelf.enabled && (
              <div className="space-y-2 pt-2 border-t border-emerald-border text-xs">
                <input
                  type="text"
                  value={sections.featuredShelf.title}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      sections: {
                        ...currentSettings.sections,
                        featuredShelf: { ...sections.featuredShelf, title: e.target.value },
                      },
                    })
                  }
                  placeholder="Shelf Title (e.g. Featured Critical Editions)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-night-canvas border border-emerald-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* 5. The Scholarly Codex Reader Preview */}
          <div
            className={`p-4 rounded-xl border-2 transition-all ${
              sections.readerPreview.enabled
                ? 'bg-emerald-surface border-tertiary-fixed shadow-md'
                : 'bg-night-surface border-emerald-border opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-tertiary-fixed/20 text-tertiary-fixed flex items-center justify-center border border-tertiary-fixed/40">
                  <span className="material-symbols-outlined text-base">chrome_reader_mode</span>
                </span>
                <div>
                  <span className="text-xs font-bold text-white block">Scholarly Codex Reader</span>
                  <span className="text-label-xs text-tertiary-fixed font-semibold">Featured Live Reading Canvas</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleSection('readerPreview')}
                className={`px-2.5 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  sections.readerPreview.enabled
                    ? 'bg-emerald-500 text-stone-950 shadow-md'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sections.readerPreview.enabled ? 'bg-stone-950' : 'bg-zinc-500'}`}></span>
                <span>{sections.readerPreview.enabled ? 'ACTIVE ON HOME' : 'HIDDEN'}</span>
              </button>
            </div>
            <p className="text-label-sm text-emerald-100 leading-relaxed mb-3">
              The dual-pane interactive reader featuring isnād transmission chains, Arabic matn, English translation, audio, and footnotes.
            </p>
            <div className="pt-2 border-t border-emerald-border flex items-center justify-between gap-2">
              <span className="text-label-sm text-emerald-highlight truncate max-w-36">
                Current: <strong>{reader.bookTitle || 'Custom Hadith'}</strong>
              </span>
              <button
                type="button"
                onClick={onNavigateToReaderTab}
                className="px-2.5 py-1 rounded-lg bg-tertiary-fixed hover:bg-tertiary-fixed text-stone-950 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
                <span>Edit Reader Content →</span>
              </button>
            </div>
          </div>

          {/* 6. Preservation & Waqf Commitment */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sections.preservationSection.enabled
                ? 'bg-night-surface border-emerald-500/40 shadow-sm'
                : 'bg-night-surface border-emerald-border opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-surface text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">verified</span>
                </span>
                <span className="text-xs font-bold text-white">Preservation &amp; Waqf</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleSection('preservationSection')}
                className={`px-2.5 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  sections.preservationSection.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sections.preservationSection.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                  }`}
                ></span>
                <span>{sections.preservationSection.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
              </button>
            </div>
            <p className="text-label-sm text-emerald-highlight leading-relaxed mb-3">
              Scholarly mission statement, CC licensing pledge, and Waqf charter matrix.
            </p>
          </div>

          {/* 7. Monthly Scholarly Dispatch Newsletter */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sections.newsletterSection.enabled
                ? 'bg-night-surface border-emerald-500/40 shadow-sm'
                : 'bg-night-surface border-emerald-border opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-surface text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">mail</span>
                </span>
                <span className="text-xs font-bold text-white">Newsletter Banner</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleSection('newsletterSection')}
                className={`px-2.5 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  sections.newsletterSection.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sections.newsletterSection.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                  }`}
                ></span>
                <span>{sections.newsletterSection.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
              </button>
            </div>
            <p className="text-label-sm text-emerald-highlight leading-relaxed mb-3">
              Patron newsletter enrollment box with calligraphic arabesque seal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
