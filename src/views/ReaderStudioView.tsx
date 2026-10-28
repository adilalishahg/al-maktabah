import React, { useState } from 'react';
import { Book, IsnadNode, ReaderTheme, ReadingSection, WordAnalysis } from '../types/library';

interface ReaderStudioViewProps {
  initialBook?: Book;
  allBooks: Book[];
  readingSection: ReadingSection;
  onOpenNarrator: (narrator: IsnadNode) => void;
  onOpenWordAnalysis: (word: WordAnalysis) => void;
  onNavigateHome: () => void;
}

export const ReaderStudioView: React.FC<ReaderStudioViewProps> = ({
  initialBook,
  allBooks,
  readingSection,
  onOpenNarrator,
  onOpenWordAnalysis,
  onNavigateHome
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(initialBook?.id || readingSection.bookId);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('parchment');
  const [fontSize, setFontSize] = useState<number>(18);
  const [showTashkeel, setShowTashkeel] = useState<boolean>(true);
  const [showParallel, setShowParallel] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1.0x' | '1.25x' | '1.5x'>('1.0x');
  const [activeFootnoteIndex, setActiveFootnoteIndex] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  const selectedBook = allBooks.find(b => b.id === selectedBookId) || allBooks[1];

  const handleCopyCitation = () => {
    navigator.clipboard?.writeText(
      `${readingSection.bookTitle}, ${readingSection.chapterTitleEn}, Hadīth #${readingSection.entryNumber}. Al-Maktabah Digital Archives.`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Strip tashkeel helper
  const stripDiacritics = (text: string) => {
    return text.replace(/[\u064B-\u065F\u0670]/g, '');
  };

  return (
    <div className="w-full space-y-4">
      {/* Studio Top Control Strip */}
      <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onNavigateHome}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="hidden xs:inline">Back to Portal</span>
          </button>
          
          {/* Mobile TOC / Isnād Toggle */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
            title="Toggle Chapters & Isnād Chain"
          >
            <span className="material-symbols-outlined text-base">format_list_bulleted</span>
            <span>Index</span>
          </button>

          <span className="text-outline-variant hidden sm:inline">|</span>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-0">
            <span className="text-xs text-on-surface-variant font-label-sm uppercase font-semibold shrink-0">Treatise:</span>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full sm:w-auto bg-surface-container-lowest px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary border border-surface-container focus:outline-none truncate"
            >
              {allBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.arabicTitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reader Display Customizers */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-between md:justify-end">
          {/* Theme buttons */}
          <div className="flex items-center bg-surface-container rounded-lg p-0.5 gap-0.5 text-xs">
            <button
              onClick={() => setReaderTheme('parchment')}
              className={`px-2 py-1 rounded text-xs transition-colors ${readerTheme === 'parchment' ? 'bg-surface-container-lowest font-semibold shadow-xs' : 'text-on-surface-variant'}`}
            >
              Parchment
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`px-2 py-1 rounded text-xs transition-colors ${readerTheme === 'sepia' ? 'bg-[#ded1c1] text-[#26211a] font-semibold shadow-xs' : 'text-on-surface-variant'}`}
            >
              Sepia
            </button>
            <button
              onClick={() => setReaderTheme('night')}
              className={`px-2 py-1 rounded text-xs transition-colors ${readerTheme === 'night' ? 'bg-[#192e25] text-white font-semibold shadow-xs' : 'text-on-surface-variant'}`}
            >
              Night
            </button>
          </div>

          {/* Diacritics Toggle */}
          <button
            onClick={() => setShowTashkeel(!showTashkeel)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showTashkeel 
                ? 'bg-primary-container text-on-primary border-primary-container' 
                : 'bg-surface-container text-on-surface-variant border-surface-container'
            }`}
            title="Toggle Arabic Tashkīl / Harakat"
          >
            <span>{showTashkeel ? 'Tashkīl On' : 'Bare Root'}</span>
          </button>

          {/* Font Resizing */}
          <div className="flex items-center bg-surface-container rounded-lg px-2 py-1 gap-1 text-xs">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="font-bold px-1 hover:text-primary cursor-pointer"
            >
              A-
            </button>
            <span className="text-outline">|</span>
            <button
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className="font-bold px-1 hover:text-primary cursor-pointer"
            >
              A+
            </button>
          </div>

          {/* Parallel Toggle */}
          <button
            onClick={() => setShowParallel(!showParallel)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showParallel ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}
            title="Dual-Pane Parallel Translation"
          >
            <span className="material-symbols-outlined text-base">vertical_split</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked ? 'bg-tertiary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}
            title="Save Bookmark"
          >
            <span className="material-symbols-outlined text-base">
              {isBookmarked ? 'bookmark_added' : 'bookmark_border'}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleCopyCitation}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Copy Citation Link"
          >
            <span className="material-symbols-outlined text-base">
              {copiedLink ? 'done' : 'share'}
            </span>
          </button>
        </div>
      </div>

      {/* Synchronized Audio Recitation Bar */}
      <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isPlayingAudio ? 'bg-tertiary text-on-tertiary shadow-sm' : 'bg-primary-container text-on-primary hover:bg-primary'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {isPlayingAudio ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <div>
            <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <span>Reciter: <strong>Sheikh Mishary Rashid Alafasy</strong></span>
              <span className="px-1.5 py-0.2 rounded bg-primary-container/10 text-primary text-[10px]">Murattal</span>
            </div>
            <div className="text-[11px] text-on-surface-variant">
              Kitāb Bad’ al-Waḥy • Hadīth #1 of 7,563
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md mx-4 hidden sm:flex items-center gap-2 text-[11px] text-on-surface-variant">
          <span className="font-mono">00:18</span>
          <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div 
              className={`h-full bg-tertiary transition-all duration-300 ${isPlayingAudio ? 'w-2/5' : 'w-1/6'}`}
            ></div>
          </div>
          <span className="font-mono">01:15</span>
        </div>

        {/* Audio Speed Options */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] text-on-surface-variant">Speed:</span>
          {(['1.0x', '1.25x', '1.5x'] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                playbackSpeed === spd ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {spd}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reader Studio Dual Canvas */}
      <div className={`rounded-2xl shadow-xl overflow-hidden border border-surface-container transition-colors ${
        readerTheme === 'night' 
          ? 'bg-[#0a1410] text-[#e5ede9]' 
          : readerTheme === 'sepia' 
            ? 'bg-[#fbf5eb] text-[#26211a]' 
            : 'bg-surface-container-lowest text-on-surface'
      }`}>
        {/* Mobile & Tablet Sidebar Accordion / Drawer */}
        {showMobileSidebar && (
          <div className="lg:hidden p-4 bg-surface-container-low border-b border-surface-container space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-label-sm uppercase tracking-wider text-xs font-semibold text-primary">
                Chapters &amp; Isnād Navigator
              </span>
              <button 
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant block mb-1">Chapters in Book:</span>
                <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                  <div className="p-2 rounded bg-surface-container-lowest text-primary font-bold shadow-xs">
                    1. How Revelation Began
                  </div>
                  <div className="p-2 rounded text-on-surface-variant">2. The Book of Belief (Īmān)</div>
                  <div className="p-2 rounded text-on-surface-variant">3. The Book of Knowledge (‘Ilm)</div>
                </div>
              </div>

              <div>
                <span className="font-label-sm text-[11px] text-tertiary block mb-1">Transmitter Isnād Nodes:</span>
                <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                  {readingSection.isnadChain.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => {
                        onOpenNarrator(node);
                        setShowMobileSidebar(false);
                      }}
                      className="w-full text-left p-1.5 rounded bg-surface-container-lowest text-primary hover:text-tertiary flex items-center justify-between"
                    >
                      <span className="truncate">{node.name}</span>
                      <span className="text-[10px] text-on-surface-variant shrink-0">{node.rank}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 min-h-[640px]">
          {/* Left Column: TOC & Isnād Tree (Desktop lg+) */}
          <div className="hidden lg:block lg:col-span-3 p-5 bg-surface-container-low/40 border-r border-surface-container space-y-6">
            <div>
              <span className="font-label-sm uppercase tracking-wider text-xs font-semibold text-on-surface-variant block mb-1">
                Chapters in this Book
              </span>
              <div className="space-y-1 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-container-lowest text-primary font-bold shadow-xs border border-surface-container flex items-center justify-between">
                  <span>1. How Revelation Began</span>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </div>
                <div className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer">
                  2. The Book of Belief (Īmān)
                </div>
                <div className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer">
                  3. The Book of Knowledge (‘Ilm)
                </div>
                <div className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer">
                  4. The Book of Ablution (Wuḍū’)
                </div>
                <div className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer">
                  5. The Book of Bathing (Ghusl)
                </div>
                <div className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer">
                  6. The Book of Prayer (Ṣalāh)
                </div>
              </div>
            </div>

            {/* Complete Isnād Chain Visualizer */}
            <div className="space-y-3 pt-3 border-t border-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-sm uppercase tracking-wider text-xs font-semibold text-tertiary">
                  Transmitter Chain (Isnād)
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">6 Nodes</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Click any narrator below to inspect classical biographical entries from <em>Tahdhīb al-Kamāl</em>.
              </p>

              <div className="space-y-2 text-xs">
                {readingSection.isnadChain.map((node, i) => (
                  <div key={node.id} className="relative">
                    <button
                      onClick={() => onOpenNarrator(node)}
                      className="w-full text-left p-2 rounded-lg bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all group cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          i === readingSection.isnadChain.length - 1 ? 'bg-primary' : i === 0 ? 'bg-tertiary-container' : 'bg-primary-container'
                        }`}></span>
                        <div className="truncate">
                          <div className="font-semibold text-primary group-hover:text-tertiary text-xs truncate">
                            {node.name}
                          </div>
                          <div className="text-[10px] text-on-surface-variant">{node.rank} • {node.birthDeathAH}</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-xs text-outline group-hover:text-primary">
                        info
                      </span>
                    </button>
                    {i < readingSection.isnadChain.length - 1 && (
                      <div className="ml-3.5 w-0.5 h-2 bg-outline-variant"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reading Canvas: Dual or Single Pane */}
          <div className="col-span-12 lg:col-span-9 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
            <div className={`grid gap-6 sm:gap-8 ${showParallel ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Left Pane: English Vernacular with Commentary Drawer */}
              {showParallel && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-surface-container text-primary text-xs font-semibold">
                        {readingSection.englishHeading}
                      </span>
                      <span className="text-xs text-on-surface-variant">• {readingSection.authenticityStatus}</span>
                    </div>
                  </div>

                  <div 
                    className="space-y-4 leading-relaxed font-body-lg text-on-surface"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <p className="text-on-surface-variant font-medium">
                      {readingSection.englishLeadText}
                    </p>
                    <blockquote className="p-4 rounded-xl bg-surface-container-low border-l-4 border-tertiary text-primary font-semibold leading-relaxed">
                      {readingSection.englishHighlightText}
                    </blockquote>
                    <p className="text-on-surface leading-relaxed">
                      {readingSection.englishSubsequentText}
                    </p>
                  </div>

                  {/* Scholarly Commentary Tabs */}
                  <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container space-y-3">
                    <div className="flex items-center justify-between border-b border-surface-container pb-2">
                      <div className="flex items-center gap-2">
                        {readingSection.footnotes.map((fn, idx) => (
                          <button
                            key={fn.id}
                            onClick={() => setActiveFootnoteIndex(idx)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                              activeFootnoteIndex === idx 
                                ? 'bg-primary-container text-on-primary' 
                                : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            {fn.code}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-tertiary font-semibold">
                        {readingSection.footnotes[activeFootnoteIndex].scholar} ({readingSection.footnotes[activeFootnoteIndex].scholarDeathAH})
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-primary text-sm">
                        {readingSection.footnotes[activeFootnoteIndex].title}
                      </h4>
                      <p className="text-on-surface-variant leading-relaxed">
                        {readingSection.footnotes[activeFootnoteIndex].text}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Pane: Classical Arabic Text (RTL) */}
              <div className="space-y-6 text-right" dir="rtl">
                <div className="flex items-center justify-between text-xs text-tertiary">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">حَدِيثٌ مُتَّفَقٌ عَلَيْهِ</span>
                    <span>•</span>
                    <span>رَقْمُ الحَدِيثِ : ١</span>
                  </div>
                  <span className="text-on-surface-variant font-arabic text-sm">{readingSection.arabicSubtext}</span>
                </div>

                {/* Lead Isnad */}
                <div className="space-y-4">
                  <p 
                    className="font-arabic text-primary leading-loose font-medium"
                    style={{ fontSize: `${Math.round(fontSize * 1.35)}px` }}
                  >
                    {showTashkeel ? readingSection.arabicLead : stripDiacritics(readingSection.arabicLead)}
                  </p>

                  {/* Highlighted Prophetic Utterance (Matn) */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-tertiary-fixed/25 text-primary text-right border border-tertiary-container/30 shadow-xs">
                    <p 
                      className="font-arabic font-bold text-primary leading-relaxed"
                      style={{ fontSize: `${Math.round(fontSize * 1.5)}px` }}
                    >
                      {showTashkeel ? readingSection.arabicMatn : stripDiacritics(readingSection.arabicMatn)}
                    </p>
                  </div>
                </div>

                {/* Word by word breakdown toolbar */}
                <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-2 text-right">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-primary font-semibold" dir="ltr">
                    <span className="flex items-center gap-1 text-tertiary">
                      <span className="material-symbols-outlined text-sm">spellcheck</span>
                      Morphological Grammar Inspector
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Click word for tri-literal root:</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-end">
                    {readingSection.wordAnalyses.map((w, idx) => (
                      <button
                        key={idx}
                        onClick={() => onOpenWordAnalysis(w)}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary text-primary font-arabic text-sm sm:text-base font-bold transition-all shadow-2xs border border-surface-container-high cursor-pointer"
                      >
                        {w.arabic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigator Strip */}
            <div className="mt-6 sm:mt-8 pt-4 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant font-medium">
              <button 
                onClick={() => alert("Already at First Hadith of Book 1.")}
                className="w-full sm:w-auto px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
                <span>Previous Hadīth</span>
              </button>
              <span className="text-center text-[11px] sm:text-xs">Page {readingSection.currentPage} of {readingSection.totalPages} • Ṣaḥīḥ al-Bukhārī (1445 AH)</span>
              <button 
                onClick={() => alert("Advancing to Hadīth #2: Revelation via Gabriel...")}
                className="w-full sm:w-auto px-3 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Next Hadīth</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
