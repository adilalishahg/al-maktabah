import React from 'react';
import type { IsnadNode } from '../types/library';
import type { NarratorBiographyModalProps } from '../types/components';

export const NarratorBiographyModal: React.FC<NarratorBiographyModalProps> = ({ narrator, onClose }) => {
  if (!narrator) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with ornamental ribbon */}
        <div className="bg-primary-container text-on-primary p-4 sm:p-5 relative overflow-hidden shrink-0">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary-fixed shrink-0">
                <span className="material-symbols-outlined text-lg">history_edu</span>
              </span>
              <span className="font-label-sm uppercase tracking-wider text-tertiary-fixed font-semibold text-xs sm:text-label-sm">
                ‘Ilm ar-Rijāl Biographical Registry
              </span>
            </div>
            <button 
              onClick={onClose}
              className="text-on-primary-container hover:text-on-primary rounded-full p-1 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="mt-2.5 sm:mt-3 relative z-10">
            <h3 className="font-title-lg text-lg sm:text-xl font-bold text-on-primary">{narrator.name}</h3>
            <p className="font-arabic text-lg sm:text-xl text-tertiary-fixed font-semibold mt-0.5">{narrator.arabicName}</p>
          </div>

          {/* Watermark */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 pointer-events-none text-white">
            <svg fill="currentColor" viewBox="0 0 100 100">
              <polygon points="50,0 62,38 100,38 69,62 81,100 50,75 19,100 31,62 0,38 38,38"></polygon>
            </svg>
          </div>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Metadata badges */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-container-low">
              <span className="text-on-surface-variant block font-label-sm uppercase">Generation / Rank</span>
              <span className="font-semibold text-primary text-sm mt-0.5 block">{narrator.rank}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low">
              <span className="text-on-surface-variant block font-label-sm uppercase">Era & Death</span>
              <span className="font-semibold text-tertiary text-sm mt-0.5 block">{narrator.birthDeathAH}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low">
              <span className="text-on-surface-variant block font-label-sm uppercase">Primary Region</span>
              <span className="font-semibold text-on-surface text-sm mt-0.5 block">{narrator.region}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low">
              <span className="text-on-surface-variant block font-label-sm uppercase">Jarḥ wa’t-Ta‘dīl Status</span>
              <span className="font-semibold text-primary text-sm mt-0.5 block">{narrator.reliability}</span>
            </div>
          </div>

          {/* Biographical Note */}
          <div className="space-y-1.5 pt-1">
            <h4 className="font-title-md text-sm font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-tertiary">menu_book</span>
              Tahdhīb al-Kamāl Scholarly Evaluation
            </h4>
            <p className="font-body-md text-sm text-on-surface leading-relaxed bg-surface-container-low/40 p-3 rounded-xl border border-surface-container">
              {narrator.bio}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-tertiary-container">verified</span>
              Peer-reviewed Isnād Archive
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold hover:bg-primary transition-colors text-xs"
            >
              Close Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
