import React, { useState } from 'react';
import type { ManuscriptCodex } from '../types/library';
import type { ManuscriptsViewProps } from '../types/views';

export const ManuscriptsView: React.FC<ManuscriptsViewProps> = ({ manuscripts }) => {
  const [selectedCodex, setSelectedCodex] = useState<ManuscriptCodex>(manuscripts[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  return (
    <div className="w-full space-y-space-xl">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-label-sm uppercase tracking-wider text-tertiary font-semibold">
          <span className="material-symbols-outlined text-sm">auto_stories</span>
          <span>Imperial Codices &amp; Paleography Archive</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="font-display font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-primary font-bold">
              Illuminated Manuscripts &amp; Rare Codices
            </h1>
            <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              Ultra-high density 4K scans of historical parchment leaves, gold leaf illumination (<em>tadhhīb</em>), and scribal colophons preserved from historical libraries in Istanbul, Cairo, and Damascus.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Codex Inspector */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container overflow-hidden">
        {/* Inspection Header Bar */}
        <div className="p-3 sm:p-4 bg-surface-container-low border-b border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary font-bold text-xs sm:text-sm shrink-0">
              MS
            </span>
            <div className="min-w-0">
              <h3 className="font-title-md text-sm sm:text-base font-bold text-primary truncate">{selectedCodex.title}</h3>
              <p className="text-label-sm sm:text-xs text-on-surface-variant truncate">
                {selectedCodex.callNumber} • {selectedCodex.holdingRepository} ({selectedCodex.location})
              </p>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-2 bg-surface-container rounded-lg p-1 text-xs shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setZoomLevel(Math.max(80, zoomLevel - 20))}
              className="p-1 rounded hover:bg-surface-container-lowest text-on-surface-variant hover:text-on-surface cursor-pointer"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-base">zoom_out</span>
            </button>
            <span className="font-mono px-1 font-semibold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(220, zoomLevel + 20))}
              className="p-1 rounded hover:bg-surface-container-lowest text-on-surface-variant hover:text-on-surface cursor-pointer"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-base">zoom_in</span>
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-2 py-0.5 rounded hover:bg-surface-container-lowest text-xs text-on-surface-variant cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Center Split: High-Res Folio Viewport & Paleography Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Folio Canvas */}
          <div className="lg:col-span-8 bg-night-canvas p-3 sm:p-6 flex items-center justify-center overflow-auto min-h-80 sm:min-h-reader-shelf relative">
            <div 
              className="transition-transform duration-300 origin-center max-w-xl shadow-2xl rounded-lg overflow-hidden border border-night-border"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <img
                src={selectedCodex.image}
                alt={selectedCodex.title}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover max-h-reader-tall"
              />
            </div>
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/75 backdrop-blur-sm rounded-lg text-white text-label-sm font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>4K High-Density Scan • Folio 1b (Opening Unwān)</span>
            </div>
          </div>

          {/* Right Paleography & Codicology Details */}
          <div className="lg:col-span-4 p-6 bg-surface-container-low/50 space-y-4 border-l border-surface-container text-xs">
            <div className="space-y-1">
              <span className="font-label-sm uppercase tracking-wider text-tertiary font-semibold block">
                Codicological Specification
              </span>
              <div className="font-arabic text-xl font-bold text-primary">{selectedCodex.arabicTitle}</div>
            </div>

            <div className="space-y-2 divide-y divide-surface-container">
              <div className="pt-2 flex justify-between">
                <span className="text-on-surface-variant">Scribe Attribution</span>
                <span className="font-semibold text-primary">{selectedCodex.scribeName}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-on-surface-variant">Era of Production</span>
                <span className="font-semibold text-tertiary">{selectedCodex.eraHijri} / {selectedCodex.eraCE}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-on-surface-variant">Calligraphic Script</span>
                <span className="font-semibold text-on-surface">{selectedCodex.scriptStyle}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-on-surface-variant">Folio Count &amp; Dim</span>
                <span className="font-semibold text-on-surface">{selectedCodex.folios} folios ({selectedCodex.dimensions})</span>
              </div>
            </div>

            {/* Illumination Description */}
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container space-y-1">
              <strong className="text-primary block font-title-md text-xs">Illumination &amp; Gilded Rosettes</strong>
              <p className="text-on-surface-variant leading-relaxed">
                {selectedCodex.illuminationNotes}
              </p>
            </div>

            {/* Historical Significance */}
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container space-y-1">
              <strong className="text-primary block font-title-md text-xs">Scholarly Significance</strong>
              <p className="text-on-surface-variant leading-relaxed">
                {selectedCodex.historicalSignificance}
              </p>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => alert(`Downloading high-resolution archival TIFF package for ${selectedCodex.callNumber}...`)}
                className="w-full py-2.5 px-3 bg-primary-container text-on-primary rounded-lg font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download Archival TIFF Package</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Codex Thumbnails Shelf */}
      <div className="space-y-3">
        <h3 className="font-title-md text-base font-bold text-primary">Browse Digitized Archive Codices</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {manuscripts.map((ms) => (
            <div
              key={ms.id}
              onClick={() => { setSelectedCodex(ms); setZoomLevel(100); }}
              className={`p-3 rounded-xl bg-surface-container-lowest border transition-all cursor-pointer flex items-center gap-3 ${
                selectedCodex.id === ms.id 
                  ? 'border-tertiary-container ring-2 ring-tertiary-container/30 shadow-md' 
                  : 'border-surface-container hover:border-outline-variant shadow-xs'
              }`}
            >
              <img
                src={ms.image}
                alt={ms.title}
                loading="lazy"
                decoding="async"
                className="w-14 h-16 object-cover rounded shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-xs text-primary truncate">{ms.title}</h4>
                <p className="text-label-sm text-tertiary font-medium">{ms.eraHijri}</p>
                <p className="text-label-xs text-on-surface-variant truncate">{ms.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
