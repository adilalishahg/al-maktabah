import React, { useEffect } from 'react';
import type { WordAnalysis } from '../types/library';
import type { MorphologyModalProps } from '../types/components';

export const MorphologyModal: React.FC<MorphologyModalProps> = ({ word, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!word) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="morphology-modal-title"
        className="w-full max-w-md max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-surface-container-high p-4 flex items-center justify-between border-b border-surface-container-highest">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base" aria-hidden="true">spellcheck</span>
            </span>
            <span id="morphology-modal-title" className="font-label-sm uppercase tracking-wider text-primary font-bold">
              Arabic Morphological Analysis (Ṣarf &amp; Naḥw)
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close morphology analysis"
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Word Hero */}
        <div className="p-6 text-center bg-surface-container-low/30 border-b border-surface-container">
          <div className="font-arabic text-4xl font-bold text-primary mb-1" dir="rtl" lang="ar">{word.arabic}</div>
          <div className="font-body-sm text-sm text-tertiary font-semibold tracking-wide">{word.transliteration}</div>
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-xs">
            {word.pos}
          </div>
        </div>

        {/* Breakdown Body */}
        <div className="p-4 sm:p-6 space-y-4 text-sm overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-container-low">
              <span className="text-label-sm font-label-sm text-on-surface-variant uppercase block">Tri-Literal Root (الجذر)</span>
              <span className="font-arabic text-xl text-primary font-bold block mt-1" dir="rtl" lang="ar">{word.root}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low">
              <span className="text-label-sm font-label-sm text-on-surface-variant uppercase block">Semantic Field</span>
              <span className="font-body-md text-sm font-semibold text-on-surface block mt-1">{word.meaning}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-label-sm uppercase text-on-surface-variant font-semibold">Grammatical Role &amp; I‘rāb Formulation</span>
            <p className="p-3 rounded-xl bg-surface-container-low text-on-surface text-xs leading-relaxed border border-surface-container">
              {word.morphologyNote}
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold hover:bg-primary transition-colors text-xs cursor-pointer"
            >
              Done Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
