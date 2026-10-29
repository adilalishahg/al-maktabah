'use client';

import React, { useState } from 'react';
import { HomeSettings, HomeSectionsConfig } from '@/types/homeSettings';
import { DetailedBook } from '@/types/bookContent';
import { CategoryScience, IsnadNode, Footnote, ReadingSection } from '@/types/library';
import { buildReadingSectionFromBook } from '@/data/homeSettingsStore';

interface AdminHomeSettingsViewProps {
  settings: HomeSettings;
  onSaveSettings: (updated: HomeSettings) => Promise<void>;
  isSaving: boolean;
  successMessage: string;
  books: DetailedBook[];
  categories: CategoryScience[];
}

export const AdminHomeSettingsView: React.FC<AdminHomeSettingsViewProps> = ({
  settings,
  onSaveSettings,
  isSaving,
  successMessage,
  books,
  categories,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sections' | 'reader' | 'preview'>('sections');
  const [currentSettings, setCurrentSettings] = useState<HomeSettings>(() => JSON.parse(JSON.stringify(settings)));
  
  // Selected book/chapter to populate reader
  const [selectedBookId, setSelectedBookId] = useState<string>(
    books[0]?.id || currentSettings.sections.readerPreview.selectedBookId || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  // Reader interactive state for preview
  const [previewTheme, setPreviewTheme] = useState<'parchment' | 'night' | 'sepia'>('parchment');
  const [previewFontSize, setPreviewFontSize] = useState<number>(18);
  const [showParallel, setShowParallel] = useState<boolean>(true);
  const [activeFootnoteOpen, setActiveFootnoteOpen] = useState<boolean>(true);

  // Sync state if prop changes
  React.useEffect(() => {
    setCurrentSettings(JSON.parse(JSON.stringify(settings)));
  }, [settings]);

  // Section toggle handler
  const handleToggleSection = (sectionKey: keyof HomeSectionsConfig) => {
    const updated = {
      ...currentSettings,
      sections: {
        ...currentSettings.sections,
        [sectionKey]: {
          ...currentSettings.sections[sectionKey],
          enabled: !currentSettings.sections[sectionKey].enabled,
        },
      },
    };
    setCurrentSettings(updated);
  };

  // Populate reader from selected uploaded book
  const handleLoadBookIntoReader = () => {
    const targetBook = books.find((b) => b.id === selectedBookId);
    if (!targetBook) {
      alert('Please select an uploaded book first.');
      return;
    }

    const generated = buildReadingSectionFromBook(targetBook, selectedChapterId || undefined);
    const updated: HomeSettings = {
      ...currentSettings,
      sections: {
        ...currentSettings.sections,
        readerPreview: {
          ...currentSettings.sections.readerPreview,
          enabled: true,
          sourceMode: 'book',
          selectedBookId: targetBook.id,
          selectedChapterId: selectedChapterId || targetBook.chapters?.[0]?.id || 'ch-1',
        },
      },
      readerSection: generated,
    };

    setCurrentSettings(updated);
    setActiveSubTab('reader');
    alert(`Loaded "${targetBook.title}" content into the Home Reader editor! Review and click "Save & Publish" to activate.`);
  };

  // Isnād narrators management
  const handleAddNarrator = () => {
    const newNode: IsnadNode = {
      id: `node-${Date.now()}`,
      name: 'New Transmitting Scholar',
      arabicName: 'راوٍ جديد',
      rank: 'Tābi‘ī',
      reliability: 'Thiqah Thabt (Trustworthy)',
      birthDeathAH: 'c. 150 AH',
      region: 'Madīnah / Kūfah',
      bio: 'Transmitted authentic scholastic narrations verified in primary compendiums.',
    };

    setCurrentSettings({
      ...currentSettings,
      readerSection: {
        ...currentSettings.readerSection,
        isnadChain: [...currentSettings.readerSection.isnadChain, newNode],
      },
    });
  };

  const handleRemoveNarrator = (index: number) => {
    const updated = [...currentSettings.readerSection.isnadChain];
    updated.splice(index, 1);
    setCurrentSettings({
      ...currentSettings,
      readerSection: {
        ...currentSettings.readerSection,
        isnadChain: updated,
      },
    });
  };

  const handleUpdateNarrator = (index: number, field: keyof IsnadNode, value: string) => {
    const updated = [...currentSettings.readerSection.isnadChain];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentSettings({
      ...currentSettings,
      readerSection: {
        ...currentSettings.readerSection,
        isnadChain: updated,
      },
    });
  };

  // Footnote management
  const handleAddFootnote = () => {
    const newFn: Footnote = {
      id: `fn-${Date.now()}`,
      code: `Footnote [1.${currentSettings.readerSection.footnotes.length + 1}]`,
      title: 'Academic Commentary',
      scholar: 'Scholarly Editorial Board',
      scholarDeathAH: 'Classical Period',
      text: 'Explanatory scholastic note contextualizing legal, grammatical, or theological nuances.',
    };

    setCurrentSettings({
      ...currentSettings,
      readerSection: {
        ...currentSettings.readerSection,
        footnotes: [...currentSettings.readerSection.footnotes, newFn],
      },
    });
  };

  const handleRemoveFootnote = (index: number) => {
    const updated = [...currentSettings.readerSection.footnotes];
    updated.splice(index, 1);
    setCurrentSettings({
      ...currentSettings,
      readerSection: {
        ...currentSettings.readerSection,
        footnotes: updated,
      },
    });
  };

  const handleUpdateFootnote = (index: number, field: keyof Footnote, value: string) => {
    const updated = [...currentSettings.readerSection.footnotes];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentSettings({
      ...currentSettings,
      readerSection: {
        ...currentSettings.readerSection,
        footnotes: updated,
      },
    });
  };

  const reader = currentSettings.readerSection;
  const sections = currentSettings.sections;

  const currentBookChapters = books.find((b) => b.id === selectedBookId)?.chapters || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Save Action Bar */}
      <div className="bg-[#12241b] rounded-2xl p-5 border border-[#21392e] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#0f382c] border border-[#79a292]/40 text-[#ffe088] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">tune</span>
            </span>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              Homepage Layout &amp; Codex Reader Control
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#194032] text-[#86efac] text-[10px] font-bold uppercase tracking-wider border border-[#276749]">
              Live Controller
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#a2b7ad] max-w-2xl">
            Control which sections appear on the public homepage, toggle them active/hidden, and choose or customize what text and book appears in the live Scholarly Codex Reader.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          {successMessage && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1.5 rounded-lg animate-fade-in flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {successMessage}
            </span>
          )}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#192e25] hover:bg-[#223d32] text-[#d1fae5] text-xs font-semibold flex items-center gap-1.5 transition-all border border-[#2e5344]"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>View Live Site</span>
          </a>

          <button
            onClick={() => onSaveSettings(currentSettings)}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c053] to-[#cba72f] hover:brightness-110 active:scale-95 text-stone-950 text-xs sm:text-sm font-extrabold shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {isSaving ? 'sync' : 'publish'}
            </span>
            <span>{isSaving ? 'Saving...' : 'Save & Publish to Home'}</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Pills */}
      <div className="flex items-center bg-[#0d1a14] rounded-xl p-1 border border-[#21392e] w-fit">
        <button
          onClick={() => setActiveSubTab('sections')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeSubTab === 'sections'
              ? 'bg-[#0f382c] text-white shadow-xs'
              : 'text-[#a2b7ad] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">view_quilt</span>
          <span>1. Sections Visibility (Active / Hidden)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reader')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeSubTab === 'reader'
              ? 'bg-[#0f382c] text-white shadow-xs'
              : 'text-[#a2b7ad] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">auto_stories</span>
          <span>2. Featured Reader Data &amp; Content</span>
          {sections.readerPreview.enabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('preview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeSubTab === 'preview'
              ? 'bg-[#0f382c] text-white shadow-xs'
              : 'text-[#a2b7ad] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">preview</span>
          <span>3. Live Reader Preview</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SECTIONS VISIBILITY & MASTER TOGGLES */}
      {/* ========================================================================= */}
      {activeSubTab === 'sections' && (
        <div className="space-y-6">
          <div className="bg-[#12241b] rounded-2xl p-6 border border-[#21392e] space-y-4">
            <div className="flex items-center justify-between border-b border-[#21392e] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffe088] text-lg">toggle_on</span>
                  Homepage View Sections Visibility
                </h3>
                <p className="text-xs text-[#a2b7ad] mt-0.5">
                  Click the switch on any section to toggle it Active (shown) or Inactive (hidden) on the public homepage.
                </p>
              </div>

              <span className="text-xs text-[#a2b7ad]">
                {Object.values(sections).filter((s) => s.enabled).length} of 7 Sections Active
              </span>
            </div>

            {/* Sections Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* 1. Daily Ayah & Hadith Banner */}
              <div className={`p-4 rounded-xl border transition-all ${
                sections.dailyBanner.enabled
                  ? 'bg-[#0c1e15] border-emerald-500/40 shadow-sm'
                  : 'bg-[#101b16] border-[#21392e] opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#193d2c] text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">format_quote</span>
                    </span>
                    <span className="text-xs font-bold text-white">Daily Insight Banner</span>
                  </div>
                  <button
                    onClick={() => handleToggleSection('dailyBanner')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      sections.dailyBanner.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sections.dailyBanner.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                    <span>{sections.dailyBanner.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#a2b7ad] leading-relaxed mb-3">
                  Top calligraphic banner displaying daily Quranic ayah or hadith with citation.
                </p>
                {sections.dailyBanner.enabled && (
                  <div className="space-y-2 pt-2 border-t border-[#1d3529] text-xs">
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
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#08150f] border border-[#21392e] text-white text-right text-xs focus:outline-none focus:border-emerald-500"
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
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#08150f] border border-[#21392e] text-white text-xs focus:outline-none focus:border-emerald-500"
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
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#08150f] border border-[#21392e] text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* 2. Hero 3D Manuscripts Showcase */}
              <div className={`p-4 rounded-xl border transition-all ${
                sections.heroSection.enabled
                  ? 'bg-[#0c1e15] border-emerald-500/40 shadow-sm'
                  : 'bg-[#101b16] border-[#21392e] opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#193d2c] text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">view_in_ar</span>
                    </span>
                    <span className="text-xs font-bold text-white">Hero 3D Showcase</span>
                  </div>
                  <button
                    onClick={() => handleToggleSection('heroSection')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      sections.heroSection.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sections.heroSection.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                    <span>{sections.heroSection.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#a2b7ad] leading-relaxed mb-3">
                  Primary hero column with title, metrics strip, and 3D illuminated codices stack.
                </p>
                {sections.heroSection.enabled && (
                  <div className="space-y-2 pt-2 border-t border-[#1d3529] text-xs">
                    <label className="text-[10px] text-[#79a292] font-semibold block">Center Pedestal Book:</label>
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
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#08150f] border border-[#21392e] text-white text-xs focus:outline-none focus:border-emerald-500"
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
              <div className={`p-4 rounded-xl border transition-all ${
                sections.categoriesGrid.enabled
                  ? 'bg-[#0c1e15] border-emerald-500/40 shadow-sm'
                  : 'bg-[#101b16] border-[#21392e] opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#193d2c] text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">category</span>
                    </span>
                    <span className="text-xs font-bold text-white">Categories Grid</span>
                  </div>
                  <button
                    onClick={() => handleToggleSection('categoriesGrid')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      sections.categoriesGrid.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sections.categoriesGrid.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                    <span>{sections.categoriesGrid.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#a2b7ad] leading-relaxed mb-3">
                  Classification of Islamic Sciences (Tartīb al-‘Ulūm) grid featuring disciplines.
                </p>
                {sections.categoriesGrid.enabled && (
                  <div className="space-y-2 pt-2 border-t border-[#1d3529] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#79a292] font-semibold">Max Display Cards:</span>
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
                        className="px-2 py-1 rounded-lg bg-[#08150f] border border-[#21392e] text-white text-xs focus:outline-none"
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
              <div className={`p-4 rounded-xl border transition-all ${
                sections.featuredShelf.enabled
                  ? 'bg-[#0c1e15] border-emerald-500/40 shadow-sm'
                  : 'bg-[#101b16] border-[#21392e] opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#193d2c] text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">shelves</span>
                    </span>
                    <span className="text-xs font-bold text-white">Featured Books Shelf</span>
                  </div>
                  <button
                    onClick={() => handleToggleSection('featuredShelf')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      sections.featuredShelf.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sections.featuredShelf.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                    <span>{sections.featuredShelf.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#a2b7ad] leading-relaxed mb-3">
                  Curated shelf highlighting uploaded critical codices with filter tabs.
                </p>
                {sections.featuredShelf.enabled && (
                  <div className="space-y-2 pt-2 border-t border-[#1d3529] text-xs">
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
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#08150f] border border-[#21392e] text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* 5. The Scholarly Codex Reader Preview (CORE FOCUS) */}
              <div className={`p-4 rounded-xl border-2 transition-all ${
                sections.readerPreview.enabled
                  ? 'bg-[#153426] border-[#ffe088] shadow-md'
                  : 'bg-[#101b16] border-[#21392e] opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#ffe088]/20 text-[#ffe088] flex items-center justify-center border border-[#ffe088]/40">
                      <span className="material-symbols-outlined text-base">chrome_reader_mode</span>
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">Scholarly Codex Reader</span>
                      <span className="text-[10px] text-[#ffe088] font-semibold">Featured Live Reading Canvas</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSection('readerPreview')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      sections.readerPreview.enabled
                        ? 'bg-emerald-500 text-stone-950 shadow-md'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sections.readerPreview.enabled ? 'bg-stone-950' : 'bg-zinc-500'}`}></span>
                    <span>{sections.readerPreview.enabled ? 'ACTIVE ON HOME' : 'HIDDEN'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#d1fae5] leading-relaxed mb-3">
                  The dual-pane interactive reader featuring isnād transmission chains, Arabic matn, English translation, audio, and footnotes.
                </p>
                <div className="pt-2 border-t border-[#26533e] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#a2b7ad] truncate max-w-[150px]">
                    Current: <strong>{reader.bookTitle || 'Custom Hadith'}</strong>
                  </span>
                  <button
                    onClick={() => setActiveSubTab('reader')}
                    className="px-2.5 py-1 rounded-lg bg-[#ffe088] hover:bg-[#ffe8a8] text-stone-950 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">edit</span>
                    <span>Edit Reader Content →</span>
                  </button>
                </div>
              </div>

              {/* 6. Preservation & Waqf Commitment */}
              <div className={`p-4 rounded-xl border transition-all ${
                sections.preservationSection.enabled
                  ? 'bg-[#0c1e15] border-emerald-500/40 shadow-sm'
                  : 'bg-[#101b16] border-[#21392e] opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#193d2c] text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">verified</span>
                    </span>
                    <span className="text-xs font-bold text-white">Preservation &amp; Waqf</span>
                  </div>
                  <button
                    onClick={() => handleToggleSection('preservationSection')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      sections.preservationSection.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sections.preservationSection.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                    <span>{sections.preservationSection.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#a2b7ad] leading-relaxed mb-3">
                  Scholarly mission statement, CC licensing pledge, and Waqf charter matrix.
                </p>
              </div>

              {/* 7. Monthly Scholarly Dispatch Newsletter */}
              <div className={`p-4 rounded-xl border transition-all ${
                sections.newsletterSection.enabled
                  ? 'bg-[#0c1e15] border-emerald-500/40 shadow-sm'
                  : 'bg-[#101b16] border-[#21392e] opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#193d2c] text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">mail</span>
                    </span>
                    <span className="text-xs font-bold text-white">Newsletter Banner</span>
                  </div>
                  <button
                    onClick={() => handleToggleSection('newsletterSection')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      sections.newsletterSection.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sections.newsletterSection.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                    <span>{sections.newsletterSection.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#a2b7ad] leading-relaxed mb-3">
                  Patron newsletter enrollment box with calligraphic arabesque seal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FEATURED READER CONTENT & DATA MANAGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'reader' && (
        <div className="space-y-6">
          {/* Quick Populate from Uploaded Books Banner */}
          <div className="bg-gradient-to-r from-[#193e2e] via-[#122e22] to-[#193e2e] rounded-2xl p-5 border-2 border-[#cba72f]/50 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-[#ffe088]">cloud_sync</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Populate Reader Directly from Uploaded Books
                  </h3>
                  <p className="text-xs text-[#a2b7ad]">
                    Pick any book you uploaded to the library and select which chapter/matn to display on the homepage reader.
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#cba72f]/20 text-[#ffe088] text-xs font-bold border border-[#cba72f]/40 self-start sm:self-auto">
                {books.length} Uploaded Codices Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
              <div className="sm:col-span-6">
                <label className="text-xs text-[#d1fae5] font-semibold block mb-1">Select Uploaded Book:</label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#2e5e48] text-white text-xs font-semibold focus:outline-none focus:border-[#ffe088]"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} — {b.arabicTitle || b.author} ({b.chapters?.length || 1} Chapters)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs text-[#d1fae5] font-semibold block mb-1">Select Chapter / Matn:</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#2e5e48] text-white text-xs font-semibold focus:outline-none focus:border-[#ffe088]"
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
                  onClick={handleLoadBookIntoReader}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#ffe088] to-[#cba72f] text-stone-950 text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Load Content</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reader Core Identity Fields */}
          <div className="bg-[#12241b] rounded-2xl p-6 border border-[#21392e] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#21392e] pb-3">
              <span className="material-symbols-outlined text-[#ffe088]">badge</span>
              Reader Identification &amp; Chapter Header
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Book Title (English):</label>
                <input
                  type="text"
                  value={reader.bookTitle}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      readerSection: { ...reader, bookTitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Book Title (Arabic):</label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-white text-right focus:outline-none focus:border-emerald-500 font-arabic text-sm"
                />
              </div>

              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Chapter Title (English):</label>
                <input
                  type="text"
                  value={reader.chapterTitleEn}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      readerSection: { ...reader, chapterTitleEn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Chapter Title (Arabic):</label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-white text-right focus:outline-none focus:border-emerald-500 font-arabic text-sm"
                />
              </div>

              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Chapter Number:</label>
                <input
                  type="number"
                  value={reader.chapterNumber}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      readerSection: { ...reader, chapterNumber: parseInt(e.target.value) || 1 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Hadith / Entry Number:</label>
                <input
                  type="number"
                  value={reader.entryNumber}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      readerSection: { ...reader, entryNumber: parseInt(e.target.value) || 1 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Total Entries in Book:</label>
                <input
                  type="number"
                  value={reader.totalEntries}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      readerSection: { ...reader, totalEntries: parseInt(e.target.value) || 1 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Authenticity Status Badge:</label>
                <input
                  type="text"
                  value={reader.authenticityStatus}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      readerSection: { ...reader, authenticityStatus: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Dual-Pane Texts Editor: Classical Arabic & English */}
          <div className="bg-[#12241b] rounded-2xl p-6 border border-[#21392e] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#21392e] pb-3">
              <span className="material-symbols-outlined text-[#ffe088]">translate</span>
              Sacred Matn &amp; Parallel Translation Content
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              {/* Right Column (Classical Arabic RTL) */}
              <div className="space-y-3 bg-[#0a1711] p-4 rounded-xl border border-[#1b3a2c]">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                    Classical Arabic Canvas (RTL)
                  </span>
                  <span className="text-[11px] text-[#79a292]">النص العربي المعتمد</span>
                </div>

                <div>
                  <label className="text-[#a2b7ad] font-semibold block mb-1">Arabic Sanad / Lead Text:</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#040e09] border border-[#21392e] text-white text-right font-arabic text-sm leading-relaxed focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[#ffe088] font-bold block mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#040e09] border-2 border-[#cba72f]/50 text-white text-right font-arabic text-base font-bold leading-loose focus:outline-none focus:border-[#ffe088]"
                  />
                </div>

                <div>
                  <label className="text-[#a2b7ad] font-semibold block mb-1">Arabic Chapter Subtext:</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#040e09] border border-[#21392e] text-white text-right font-arabic text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Left Column (English Vernacular & Scholarly Translation) */}
              <div className="space-y-3 bg-[#0a1711] p-4 rounded-xl border border-[#1b3a2c]">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-primary-container text-white font-bold uppercase tracking-wider text-[10px]">
                    English Translation &amp; Apparatus
                  </span>
                  <span className="text-[11px] text-[#79a292]">Academic Recension</span>
                </div>

                <div>
                  <label className="text-[#a2b7ad] font-semibold block mb-1">English Heading:</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#040e09] border border-[#21392e] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[#a2b7ad] font-semibold block mb-1">English Lead Text:</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#040e09] border border-[#21392e] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[#ffe088] font-bold block mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#040e09] border-2 border-[#cba72f]/50 text-white font-semibold leading-relaxed focus:outline-none focus:border-[#ffe088]"
                  />
                </div>

                <div>
                  <label className="text-[#a2b7ad] font-semibold block mb-1">English Subsequent Text:</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#040e09] border border-[#21392e] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Isnād Transmission Chain Nodes */}
          <div className="bg-[#12241b] rounded-2xl p-6 border border-[#21392e] space-y-4">
            <div className="flex items-center justify-between border-b border-[#21392e] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffe088]">hub</span>
                  Isnād Transmission Chain Nodes ({reader.isnadChain.length})
                </h3>
                <p className="text-xs text-[#a2b7ad]">
                  Scholars and narrators in the transmission line shown in the reader sidebar. Clicking their node opens their full bio.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddNarrator}
                className="px-3 py-1.5 rounded-lg bg-[#193d2c] hover:bg-[#20513b] text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-600/40"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Narrator Node</span>
              </button>
            </div>

            <div className="space-y-3">
              {reader.isnadChain.map((node, idx) => (
                <div
                  key={node.id || idx}
                  className="p-3.5 rounded-xl bg-[#0a1711] border border-[#1b3a2c] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-6 h-6 rounded-full bg-[#ffe088]/20 text-[#ffe088] font-mono font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={node.name}
                      onChange={(e) => handleUpdateNarrator(idx, 'name', e.target.value)}
                      placeholder="Scholar Name (English)"
                      className="px-2.5 py-1.5 rounded-lg bg-[#040e09] border border-[#21392e] text-white font-semibold w-48 sm:w-56 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      value={node.reliability}
                      onChange={(e) => handleUpdateNarrator(idx, 'reliability', e.target.value)}
                      placeholder="Scholastic Reliability (e.g. Thiqah Thabt)"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#040e09] border border-[#21392e] text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={node.birthDeathAH}
                      onChange={(e) => handleUpdateNarrator(idx, 'birthDeathAH', e.target.value)}
                      placeholder="d. 219 AH"
                      className="w-24 px-2 py-1.5 rounded-lg bg-[#040e09] border border-[#21392e] text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveNarrator(idx)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                    title="Remove Narrator"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footnotes & Scholarly Commentary */}
          <div className="bg-[#12241b] rounded-2xl p-6 border border-[#21392e] space-y-4">
            <div className="flex items-center justify-between border-b border-[#21392e] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffe088]">notes</span>
                  Footnotes &amp; Commentary Marginalia ({reader.footnotes.length})
                </h3>
                <p className="text-xs text-[#a2b7ad]">
                  Scholastic annotations appearing under the English translation pane.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddFootnote}
                className="px-3 py-1.5 rounded-lg bg-[#193d2c] hover:bg-[#20513b] text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-600/40"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Footnote</span>
              </button>
            </div>

            <div className="space-y-3">
              {reader.footnotes.map((fn, idx) => (
                <div
                  key={fn.id || idx}
                  className="p-4 rounded-xl bg-[#0a1711] border border-[#1b3a2c] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={fn.code}
                        onChange={(e) => handleUpdateFootnote(idx, 'code', e.target.value)}
                        placeholder="Footnote [1.1]"
                        className="w-32 px-2.5 py-1 rounded-lg bg-[#040e09] border border-[#21392e] text-[#ffe088] font-mono text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        value={fn.title}
                        onChange={(e) => handleUpdateFootnote(idx, 'title', e.target.value)}
                        placeholder="Commentary Title"
                        className="w-48 sm:w-60 px-2.5 py-1 rounded-lg bg-[#040e09] border border-[#21392e] text-white font-semibold text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        value={fn.scholar}
                        onChange={(e) => handleUpdateFootnote(idx, 'scholar', e.target.value)}
                        placeholder="Commentator Scholar"
                        className="w-44 px-2.5 py-1 rounded-lg bg-[#040e09] border border-[#21392e] text-[#a2b7ad] text-xs focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFootnote(idx)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove Footnote"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={fn.text}
                    onChange={(e) => handleUpdateFootnote(idx, 'text', e.target.value)}
                    placeholder="Commentary text..."
                    className="w-full px-3 py-2 rounded-lg bg-[#040e09] border border-[#21392e] text-white text-xs leading-relaxed focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recitation Audio Controls */}
          <div className="bg-[#12241b] rounded-2xl p-6 border border-[#21392e] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#21392e] pb-3">
              <span className="material-symbols-outlined text-[#ffe088]">volume_up</span>
              Vocal Recitation Apparatus
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Reciter Name:</label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[#a2b7ad] font-semibold block mb-1">Duration Indicator:</label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#08150f] border border-[#21392e] text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => onSaveSettings(currentSettings)}
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c053] to-[#cba72f] hover:brightness-110 active:scale-95 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE HIGH-FIDELITY READER PREVIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'preview' && (
        <div className="space-y-4">
          <div className="bg-[#12241b] p-4 rounded-xl border border-[#21392e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffe088]">visibility</span>
              <span className="text-white font-bold">
                Live Rendering Preview of &ldquo;{reader.bookTitle}&rdquo;
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#08150f] rounded-lg p-0.5 gap-0.5 border border-[#21392e]">
                <button
                  onClick={() => setPreviewTheme('parchment')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    previewTheme === 'parchment' ? 'bg-[#fbf9f5] text-[#1b1c1a] font-bold' : 'text-[#a2b7ad]'
                  }`}
                >
                  Parchment
                </button>
                <button
                  onClick={() => setPreviewTheme('night')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    previewTheme === 'night' ? 'bg-[#192e25] text-white font-bold' : 'text-[#a2b7ad]'
                  }`}
                >
                  Night
                </button>
                <button
                  onClick={() => setPreviewTheme('sepia')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    previewTheme === 'sepia' ? 'bg-[#ded1c1] text-[#26211a] font-bold' : 'text-[#a2b7ad]'
                  }`}
                >
                  Sepia
                </button>
              </div>

              <button
                onClick={() => onSaveSettings(currentSettings)}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-[#ffe088] hover:bg-[#ffe8a8] text-stone-950 font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">publish</span>
                <span>Publish to Home</span>
              </button>
            </div>
          </div>

          {/* Render the Reader exact container matching HomeView */}
          <div
            className={`rounded-2xl sm:rounded-3xl shadow-xl border overflow-hidden transition-all duration-300 ${
              previewTheme === 'night'
                ? 'bg-[#0f1f18] text-[#e5ede9] border-[#1d4032]'
                : previewTheme === 'sepia'
                ? 'bg-[#fbf4ea] text-[#2c2419] border-[#e0cfb8]'
                : 'bg-surface-container-lowest text-[#1b1c1a] border-surface-container-high'
            }`}
          >
            {/* Window title bar */}
            <div className="px-4 sm:px-6 py-3 border-b border-surface-container flex items-center justify-between gap-3 bg-surface-container-low/60">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-2xs"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-2xs"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-2xs"></span>
                </div>
                <span className="font-display text-xs sm:text-sm font-bold text-primary truncate max-w-xs sm:max-w-md">
                  {reader.bookTitle} — Book {reader.chapterNumber}: {reader.chapterTitleEn}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <button
                  onClick={() => setShowParallel(!showParallel)}
                  className={`p-1.5 rounded-lg transition-all ${
                    showParallel ? 'bg-primary-container text-white shadow-xs' : 'hover:bg-surface-container'
                  }`}
                  title="Toggle Parallel Translation"
                >
                  <span className="material-symbols-outlined text-base">vertical_split</span>
                </button>
              </div>
            </div>

            {/* Reader Body Grid */}
            <div className="grid grid-cols-12 min-h-[460px]">
              {/* Left TOC & Isnād Sidebar */}
              <div className="hidden md:block md:col-span-3 bg-surface-container-low/40 p-5 space-y-5 border-r border-surface-container">
                <div className="space-y-1">
                  <p className="font-label-sm text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                    Table of Contents
                  </p>
                  <p className="font-display text-sm font-bold text-primary">
                    Hadīth #{reader.entryNumber} of {reader.totalEntries.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1.5 font-body-sm text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-container-lowest text-primary font-bold shadow-xs flex items-center justify-between border border-[#cba72f]/40">
                    <span>1. {reader.chapterTitleEn}</span>
                    <span className="material-symbols-outlined text-xs text-tertiary">chevron_right</span>
                  </div>
                  <div className="p-2.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-between">
                    <span>2. Section Two</span>
                  </div>
                </div>

                {/* Chain of Transmission Snapshot */}
                <div className="pt-4 space-y-2.5 border-t border-surface-container">
                  <div className="flex items-center justify-between">
                    <p className="font-label-sm text-xs uppercase tracking-wider font-bold text-tertiary flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">hub</span>
                      Isnād Chain Nodes
                    </p>
                    <span className="text-[10px] text-on-surface-variant font-semibold">Inspect</span>
                  </div>
                  <div className="space-y-1 text-xs text-on-surface-variant">
                    {reader.isnadChain.slice(0, 4).map((node, i) => (
                      <div key={node.id || i}>
                        <div className="flex items-center gap-2 py-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              i === 0 ? 'bg-[#cba72f]' : 'bg-primary'
                            }`}
                          ></span>
                          <span className="truncate max-w-[170px] text-[11px] font-medium">{node.name}</span>
                        </div>
                        {i < 3 && <div className="ml-1 w-0.5 h-1.5 bg-outline-variant/60"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Reading Canvas */}
              <div className="col-span-12 md:col-span-9 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
                <div className={`grid gap-6 ${showParallel ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Left Pane: English Vernacular */}
                  {showParallel && (
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 font-label-sm text-xs text-on-surface-variant flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-white font-bold shadow-2xs">
                          {reader.englishHeading}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          • {reader.authenticityStatus}
                        </span>
                      </div>

                      <div
                        className="space-y-3 font-body-lg leading-relaxed"
                        style={{ fontSize: `${previewFontSize}px` }}
                      >
                        <p>
                          {reader.englishLeadText}{' '}
                          <span className="font-bold text-primary underline decoration-[#cba72f] decoration-2">
                            {reader.englishHighlightText}
                          </span>
                        </p>
                        {reader.englishSubsequentText && (
                          <p className="font-body-md text-on-surface-variant text-sm">
                            {reader.englishSubsequentText}
                          </p>
                        )}
                      </div>

                      {/* Footnotes Marginalia */}
                      {reader.footnotes.length > 0 && (
                        <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-surface-container">
                          <div
                            onClick={() => setActiveFootnoteOpen(!activeFootnoteOpen)}
                            className="flex items-center justify-between text-tertiary font-title-md text-sm font-bold cursor-pointer select-none"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base">notes</span>
                              <span>{reader.footnotes[0].code} — {reader.footnotes[0].title}</span>
                            </span>
                            <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1">
                              <span>{reader.footnotes[0].scholar} ({reader.footnotes[0].scholarDeathAH})</span>
                              <span className="material-symbols-outlined text-xs">
                                {activeFootnoteOpen ? 'expand_less' : 'expand_more'}
                              </span>
                            </span>
                          </div>
                          {activeFootnoteOpen && (
                            <p className="font-body-sm text-xs text-on-surface-variant pt-1 leading-relaxed border-t border-surface-container-high/60">
                              {reader.footnotes[0].text}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Right Pane: Classical Arabic (RTL) */}
                  <div className="space-y-4 text-right flex flex-col justify-between" dir="rtl">
                    <div className="inline-flex items-center gap-2 self-start font-label-sm text-xs text-tertiary">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        حَدِيثٌ صَحِيحٌ
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-bold">رَقْمُ الحَدِيثِ : {reader.entryNumber}</span>
                    </div>

                    <div className="space-y-4">
                      {reader.arabicLead && (
                        <p
                          className="font-arabic text-primary leading-loose font-medium"
                          style={{ fontSize: `${Math.round(previewFontSize * 1.3)}px` }}
                        >
                          {reader.arabicLead}
                        </p>
                      )}

                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#cba72f]/15 to-transparent text-right border-2 border-[#cba72f]/40 shadow-xs">
                        <p
                          className="font-arabic font-bold text-primary leading-relaxed"
                          style={{ fontSize: `${Math.round(previewFontSize * 1.45)}px` }}
                        >
                          {reader.arabicMatn}
                        </p>
                      </div>

                      {/* Interactive Word Inspector strip */}
                      {reader.wordAnalyses.length > 0 && (
                        <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant space-y-1.5 border border-surface-container" dir="ltr">
                          <div className="flex items-center justify-between text-tertiary font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">spellcheck</span>
                              Click Word for Root Morphology:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {reader.wordAnalyses.map((w, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-surface-container text-primary font-arabic text-sm border border-surface-container-high shadow-2xs"
                              >
                                {w.arabic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-on-surface-variant font-label-sm text-xs" dir="ltr">
                      <span className="text-outline-variant font-mono text-[11px]">{reader.arabicSubtext}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Pagination Ribbon */}
                <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-body-sm text-xs sm:text-sm border-t border-surface-container">
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Previous Section
                  </span>
                  <span className="font-label-sm text-xs text-center font-semibold">
                    Page {reader.currentPage} of {reader.totalPages} • {reader.chapterTitleAr}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    Next Section <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

