'use client';

import React, { useState } from 'react';
import type { ReaderTheme, ReadingSection, IsnadNode, WordAnalysis } from '@/types/library';
import type { ReaderPreviewConfig } from '@/types/homeSettings';

export interface HomeReaderSpotlightProps {
  readerConfig: ReaderPreviewConfig;
  activeReader: ReadingSection;
  onOpenReader: () => void;
  onOpenNarrator: (node: IsnadNode) => void;
  onOpenWordAnalysis: (word: WordAnalysis) => void;
}

export const HomeReaderSpotlight: React.FC<HomeReaderSpotlightProps> = ({
  readerConfig,
  activeReader,
  onOpenReader,
  onOpenNarrator,
  onOpenWordAnalysis,
}) => {
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('parchment');
  const [readerFontSize, setReaderFontSize] = useState<number>(18);
  const [showParallelTranslation, setShowParallelTranslation] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeFootnoteOpen, setActiveFootnoteOpen] = useState<boolean>(true);

  return (
    <section className="py-8 sm:py-12" id="reader-preview">
      <div className="space-y-2 mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-low text-tertiary font-label-sm text-xs font-bold border border-tertiary/30">
          <span className="material-symbols-outlined text-sm text-tertiary">devices</span>
          <span>Zero Installation • Built-in Scholar Apparatus</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary">
          Next-Gen Scholarly Reading Interface
        </h2>
        <p className="font-body-md text-xs sm:text-base text-on-surface-variant">
          Seamless parallel translation, instant morphological breakdown, isnād node inspection, and synchronized vocalization in one distraction-free canvas.
        </p>
      </div>

      {/* Mockup Container with Gold Leaf Border */}
      <div
        className={`rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-tertiary/40 transition-colors ring-1 ring-tertiary/20 ${
          readerTheme === 'night'
            ? 'bg-night-card text-night-text'
            : readerTheme === 'sepia'
              ? 'bg-parchment-canvas text-sepia-text'
              : 'bg-surface-container-lowest text-on-surface'
        }`}
      >
        {/* Reader Toolbar */}
        <div className="bg-surface-container-low/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-surface-container">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-2xs" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-2xs" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-2xs" />
            </div>
            <span className="font-display text-xs sm:text-sm font-bold text-primary truncate max-w-xs sm:max-w-md">
              {activeReader.bookTitle} — Book {activeReader.chapterNumber}: {activeReader.chapterTitleEn}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 text-on-surface-variant">
            {/* Canvas Theme Selector */}
            <div className="hidden sm:flex items-center bg-surface-container rounded-lg p-0.5 gap-0.5 text-xs border border-surface-container-high">
              <button
                onClick={() => setReaderTheme('parchment')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  readerTheme === 'parchment'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                    : 'hover:text-on-surface'
                }`}
              >
                Parchment
              </button>
              <button
                onClick={() => setReaderTheme('night')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  readerTheme === 'night'
                    ? 'bg-surface-container text-white font-bold shadow-xs'
                    : 'hover:text-on-surface'
                }`}
              >
                Night
              </button>
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  readerTheme === 'sepia'
                    ? 'bg-sepia-border text-sepia-text font-bold shadow-xs'
                    : 'hover:text-on-surface'
                }`}
              >
                Sepia
              </button>
            </div>

            {/* Font Sizer */}
            <div className="flex items-center bg-surface-container rounded-lg px-2 py-1 gap-1.5 border border-surface-container-high">
              <button
                onClick={() => setReaderFontSize(Math.max(14, readerFontSize - 2))}
                className="font-label-sm text-xs font-bold px-1 hover:text-primary cursor-pointer"
                title="Smaller font"
              >
                A-
              </button>
              <span className="text-xs text-outline/50">|</span>
              <button
                onClick={() => setReaderFontSize(Math.min(26, readerFontSize + 2))}
                className="font-label-sm text-xs font-bold px-1 hover:text-primary cursor-pointer"
                title="Larger font"
              >
                A+
              </button>
            </div>

            {/* Parallel Split Toggle */}
            <button
              onClick={() => setShowParallelTranslation(!showParallelTranslation)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                showParallelTranslation
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'hover:bg-surface-container'
              }`}
              title="Toggle Parallel Translation"
            >
              <span className="material-symbols-outlined text-lg">vertical_split</span>
            </button>

            {/* Audio Playback button */}
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isPlayingAudio ? 'bg-emerald-600 text-white animate-pulse shadow-xs' : 'hover:bg-surface-container'
              }`}
              title={isPlayingAudio ? 'Pause Recitation' : 'Listen to Recitation'}
            >
              <span className="material-symbols-outlined text-lg">
                {isPlayingAudio ? 'pause' : 'volume_up'}
              </span>
            </button>

            {/* Admin Reader Controls Link */}
            <a
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tertiary-container/15 hover:bg-tertiary-container/30 text-gold-dark dark:text-gold-bright border border-tertiary/40 font-label-sm text-xs font-bold transition-colors"
              title="Change or customize this reader in Admin Portal"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>Admin Control</span>
            </a>

            {/* Full Reader Studio View */}
            <button
              onClick={onOpenReader}
              className="p-1.5 rounded-lg hover:bg-surface-container cursor-pointer text-primary font-bold"
              title="Open in Dedicated Reader Studio"
            >
              <span className="material-symbols-outlined text-lg">fullscreen</span>
            </button>
          </div>
        </div>

        {/* Reader Body (Dual Pane Preview) */}
        <div className="grid grid-cols-12 min-h-reader-shelf">
          {/* Left Marginalia Sidebar */}
          <div className="hidden md:block md:col-span-3 bg-surface-container-low/40 p-5 space-y-5 border-r border-surface-container">
            <div className="space-y-1">
              <p className="font-label-sm text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                Table of Contents
              </p>
              <p className="font-display text-sm font-bold text-primary">
                Hadīth #{activeReader.entryNumber} of {activeReader.totalEntries.toLocaleString()}
              </p>
            </div>

            <div className="space-y-1.5 font-body-sm text-xs">
              <div className="p-2.5 rounded-xl bg-surface-container-lowest text-primary font-bold shadow-xs flex items-center justify-between border border-tertiary/40">
                <span>1. {activeReader.chapterTitleEn}</span>
                <span className="material-symbols-outlined text-xs text-tertiary">chevron_right</span>
              </div>
              <div className="p-2.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-between cursor-pointer">
                <span>2. The Book of Belief (Īmān)</span>
              </div>
              <div className="p-2.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-between cursor-pointer">
                <span>3. The Book of Knowledge (‘Ilm)</span>
              </div>
              <div className="p-2.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-between cursor-pointer">
                <span>4. The Book of Ablution (Wuḍū’)</span>
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
                {activeReader.isnadChain.slice(0, 4).map((node, i) => (
                  <div key={node.id}>
                    <button
                      onClick={() => onOpenNarrator(node)}
                      className="flex items-center gap-2 text-left hover:text-primary transition-colors cursor-pointer group py-0.5"
                    >
                      <span
                        className={`w-2 h-2 rounded-full group-hover:scale-125 transition-transform ${
                          i === 0 ? 'bg-tertiary-container' : 'bg-primary'
                        }`}
                      />
                      <span className="group-hover:underline truncate max-w-44 text-label-sm font-medium">
                        {node.name}
                      </span>
                    </button>
                    {i < 3 && <div className="ml-1 w-0.5 h-1.5 bg-outline-variant/60" />}
                  </div>
                ))}
                {activeReader.isnadChain.length > 0 && (
                  <>
                    <div className="ml-1 w-0.5 h-1.5 bg-outline-variant/60" />
                    <button
                      onClick={() => onOpenNarrator(activeReader.isnadChain[activeReader.isnadChain.length - 1])}
                      className="flex items-center gap-2 font-bold text-primary hover:text-tertiary transition-colors cursor-pointer text-left py-0.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-label-sm">
                        {activeReader.isnadChain[activeReader.isnadChain.length - 1].name}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center Reading Canvas */}
          <div className="col-span-12 md:col-span-9 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
            {isPlayingAudio && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-700 dark:text-emerald-300 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-end gap-1 h-4">
                    <span className="w-1 bg-emerald-500 h-3 animate-pulse" />
                    <span className="w-1 bg-emerald-500 h-4 animate-bounce" />
                    <span className="w-1 bg-emerald-500 h-2 animate-pulse" />
                    <span className="w-1 bg-emerald-500 h-4 animate-bounce" />
                  </div>
                  <span>
                    Recitation Active: <strong>{readerConfig.audioReciter || 'Sheikh Mishary Rashid Alafasy'}</strong> ({activeReader.chapterTitleAr || activeReader.chapterTitleEn})
                  </span>
                </div>
                <span className="font-mono text-xs font-bold shrink-0 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  {readerConfig.audioDuration || '00:42 / 01:15'}
                </span>
              </div>
            )}

            <div className={`grid gap-6 ${showParallelTranslation ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Left Pane: English Vernacular */}
              {showParallelTranslation && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 font-label-sm text-xs text-on-surface-variant flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-bold shadow-2xs">
                      {activeReader.englishHeading}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      • {activeReader.authenticityStatus}
                    </span>
                  </div>

                  <div
                    className="space-y-3 font-body-lg leading-relaxed"
                    style={{ fontSize: `${readerFontSize}px` }}
                  >
                    <p>
                      {activeReader.englishLeadText}{' '}
                      <span className="font-bold text-primary underline decoration-tertiary decoration-2">
                        {activeReader.englishHighlightText}
                      </span>
                    </p>
                    {activeReader.englishSubsequentText && (
                      <p className="font-body-md text-on-surface-variant">
                        {activeReader.englishSubsequentText}
                      </p>
                    )}
                  </div>

                  {activeReader.footnotes && activeReader.footnotes.length > 0 && (
                    <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-surface-container">
                      <div
                        onClick={() => setActiveFootnoteOpen(!activeFootnoteOpen)}
                        className="flex items-center justify-between text-tertiary font-title-md text-sm font-bold cursor-pointer select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">notes</span>
                          Scholarly Footnotes ({activeReader.footnotes.length})
                        </span>
                        <span className="material-symbols-outlined text-sm">
                          {activeFootnoteOpen ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                      {activeFootnoteOpen && (
                        <div className="space-y-2 pt-2 border-t border-surface-container text-xs text-on-surface-variant">
                          {activeReader.footnotes.map((fn) => (
                            <div key={fn.id} className="flex gap-2">
                              <span className="font-mono text-tertiary font-bold shrink-0">{fn.number}.</span>
                              <p>{fn.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Right Pane: Arabic Sacred Matn */}
              <div className="space-y-4" dir="rtl">
                <div className="flex items-center justify-between">
                  <span className="font-arabic text-sm text-tertiary font-bold">
                    {activeReader.chapterTitleAr}
                  </span>
                  <span className="text-label-xs text-on-surface-variant font-mono">
                    باب رقم {activeReader.chapterNumber}
                  </span>
                </div>

                <div
                  className="font-arabic leading-[2.6] text-right font-medium tracking-wide p-4 sm:p-6 rounded-2xl bg-surface-container-low/30 border border-surface-container"
                  style={{ fontSize: `${readerFontSize + 6}px` }}
                >
                  {activeReader.arabicWords && activeReader.arabicWords.length > 0 ? (
                    activeReader.arabicWords.map((w, idx) => (
                      <span
                        key={idx}
                        onClick={() => onOpenWordAnalysis(w)}
                        className="inline-block px-1 rounded-sm hover:bg-tertiary-container/30 hover:text-tertiary cursor-pointer transition-colors"
                        title="Click for morphology breakdown"
                      >
                        {w.word}{' '}
                      </span>
                    ))
                  ) : (
                    <span>{activeReader.arabicText}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

