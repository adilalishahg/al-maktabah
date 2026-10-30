import React, { useState } from 'react';
import type { HomeSettings } from '../../../types/homeSettings';

export interface HomePreviewTabProps {
  currentSettings: HomeSettings;
  onSaveSettings: (settings: HomeSettings) => void;
  isSaving: boolean;
}

export const HomePreviewTab: React.FC<HomePreviewTabProps> = ({
  currentSettings,
  onSaveSettings,
  isSaving,
}) => {
  const [previewTheme, setPreviewTheme] = useState<'parchment' | 'night' | 'sepia'>('parchment');
  const [previewFontSize] = useState<number>(18);
  const [showParallel, setShowParallel] = useState<boolean>(true);
  const [activeFootnoteOpen, setActiveFootnoteOpen] = useState<boolean>(true);

  const reader = currentSettings.readerSection;

  return (
    <div className="space-y-4">
      <div className="bg-emerald-surface p-4 rounded-xl border border-emerald-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary-fixed">visibility</span>
          <span className="text-white font-bold">
            Live Rendering Preview of &ldquo;{reader.bookTitle}&rdquo;
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-night-canvas rounded-lg p-0.5 gap-0.5 border border-emerald-border">
            <button
              type="button"
              onClick={() => setPreviewTheme('parchment')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                previewTheme === 'parchment' ? 'bg-parchment-canvas text-on-surface font-bold' : 'text-emerald-highlight'
              }`}
            >
              Parchment
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme('night')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                previewTheme === 'night' ? 'bg-surface-container text-white font-bold' : 'text-emerald-highlight'
              }`}
            >
              Night
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme('sepia')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                previewTheme === 'sepia' ? 'bg-sepia-border text-sepia-text font-bold' : 'text-emerald-highlight'
              }`}
            >
              Sepia
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSaveSettings(currentSettings)}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-tertiary-fixed hover:bg-tertiary-fixed text-stone-950 font-bold transition-all flex items-center gap-1 cursor-pointer"
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
            ? 'bg-night-surface text-night-text border-emerald-border'
            : previewTheme === 'sepia'
            ? 'bg-parchment-canvas text-sepia-text border-sepia-border'
            : 'bg-surface-container-lowest text-on-surface border-surface-container-high'
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
              type="button"
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
        <div className="grid grid-cols-12 min-h-reader-shelf">
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
              <div className="p-2.5 rounded-xl bg-surface-container-lowest text-primary font-bold shadow-xs flex items-center justify-between border border-tertiary/40">
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
                <span className="text-label-xs text-on-surface-variant font-semibold">Inspect</span>
              </div>
              <div className="space-y-1 text-xs text-on-surface-variant">
                {reader.isnadChain.slice(0, 4).map((node, i) => (
                  <div key={node.id || i}>
                    <div className="flex items-center gap-2 py-0.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          i === 0 ? 'bg-tertiary-container' : 'bg-primary'
                        }`}
                      ></span>
                      <span className="truncate max-w-44 text-label-sm font-medium">{node.name}</span>
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
                      <span className="font-bold text-primary underline decoration-tertiary decoration-2">
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

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-tertiary-container/15 to-transparent text-right border-2 border-tertiary/40 shadow-xs">
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
                  <span className="text-outline-variant font-mono text-label-sm">{reader.arabicSubtext}</span>
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
  );
};
