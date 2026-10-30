'use client';

import React, { useState } from 'react';
import type { HomeSettings, HomeSectionsConfig } from '@/types/homeSettings';
import type { IsnadNode, Footnote } from '@/types/library';
import type { AdminHomeSettingsViewProps } from '@/types/components';
import { buildReadingSectionFromBook } from '@/data/homeSettingsStore';
import { HomeSectionsTab, HomeReaderEditorTab, HomePreviewTab } from './settings';

export const AdminHomeSettingsView: React.FC<AdminHomeSettingsViewProps> = ({
  settings,
  onSaveSettings,
  isSaving,
  successMessage,
  books,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sections' | 'reader' | 'preview'>('sections');
  const [currentSettings, setCurrentSettings] = useState<HomeSettings>(() => JSON.parse(JSON.stringify(settings)));

  // Selected book/chapter to populate reader
  const [selectedBookId, setSelectedBookId] = useState<string>(
    books[0]?.id || currentSettings.sections.readerPreview.selectedBookId || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

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

  return (
    <div className="space-y-6">
      {/* Top Banner & Save Action Bar */}
      <div className="bg-emerald-surface rounded-2xl p-5 border border-emerald-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-night-canvas text-tertiary-fixed text-xs font-bold border border-emerald-border">
            <span className="material-symbols-outlined text-sm">home_storage</span>
            <span>Public Portal Content Management System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            Homepage View &amp; Scholarly Codex Customizer
          </h2>
          <p className="text-xs sm:text-sm text-emerald-highlight max-w-2xl">
            Toggle which library sections appear on the public homepage, or customize the featured Hadīth / Codex Reader with verified isnād narrators, Arabic text, and academic apparatus.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onSaveSettings(currentSettings)}
            disabled={isSaving}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-gold-leaf via-tertiary-fixed to-tertiary-container hover:brightness-110 active:scale-95 text-stone-950 font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">
              {isSaving ? 'hourglass_top' : 'save'}
            </span>
            <span>{isSaving ? 'Saving...' : 'Save & Publish to Home'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm font-bold flex items-center gap-3 shadow-lg animate-in fade-in">
          <span className="material-symbols-outlined text-xl text-emerald-400">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Tab Strip */}
      <div className="flex items-center gap-2 border-b border-emerald-border pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('sections')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'sections'
              ? 'bg-emerald-500 text-stone-950 shadow-md'
              : 'text-emerald-highlight hover:text-white hover:bg-emerald-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">view_quilt</span>
          <span>Sections Visibility (7)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('reader')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'reader'
              ? 'bg-emerald-500 text-stone-950 shadow-md'
              : 'text-emerald-highlight hover:text-white hover:bg-emerald-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">chrome_reader_mode</span>
          <span>Featured Reader Content</span>
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'preview'
              ? 'bg-emerald-500 text-stone-950 shadow-md'
              : 'text-emerald-highlight hover:text-white hover:bg-emerald-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">visibility</span>
          <span>Live Reader Preview</span>
        </button>
      </div>

      {/* Subtab Contents */}
      {activeSubTab === 'sections' && (
        <HomeSectionsTab
          currentSettings={currentSettings}
          setCurrentSettings={setCurrentSettings}
          books={books}
          onToggleSection={handleToggleSection}
          onNavigateToReaderTab={() => setActiveSubTab('reader')}
        />
      )}

      {activeSubTab === 'reader' && (
        <HomeReaderEditorTab
          currentSettings={currentSettings}
          setCurrentSettings={setCurrentSettings}
          books={books}
          selectedBookId={selectedBookId}
          setSelectedBookId={setSelectedBookId}
          selectedChapterId={selectedChapterId}
          setSelectedChapterId={setSelectedChapterId}
          onLoadBookIntoReader={handleLoadBookIntoReader}
          onAddNarrator={handleAddNarrator}
          onRemoveNarrator={handleRemoveNarrator}
          onUpdateNarrator={handleUpdateNarrator}
          onAddFootnote={handleAddFootnote}
          onRemoveFootnote={handleRemoveFootnote}
          onUpdateFootnote={handleUpdateFootnote}
          onSaveSettings={onSaveSettings}
          isSaving={isSaving}
        />
      )}

      {activeSubTab === 'preview' && (
        <HomePreviewTab
          currentSettings={currentSettings}
          onSaveSettings={onSaveSettings}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};
