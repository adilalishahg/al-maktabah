import React from 'react';
import type { Footnote } from '../../../types/library';

export interface FootnotesEditorListProps {
  footnotes: Footnote[];
  onAddFootnote: () => void;
  onRemoveFootnote: (index: number) => void;
  onUpdateFootnote: (index: number, field: keyof Footnote, value: string) => void;
}

export const FootnotesEditorList: React.FC<FootnotesEditorListProps> = ({
  footnotes,
  onAddFootnote,
  onRemoveFootnote,
  onUpdateFootnote,
}) => {
  return (
    <div className="bg-emerald-surface rounded-2xl p-6 border border-emerald-border space-y-4">
      <div className="flex items-center justify-between border-b border-emerald-border pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-fixed">notes</span>
            Scholarly Commentary &amp; Footnotes ({footnotes.length})
          </h3>
          <p className="text-xs text-emerald-highlight">
            Classical annotations, lexical glosses, and juristic cross-references displayed in the collapsible marginalia.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddFootnote}
          className="px-3 py-1.5 rounded-xl bg-night-canvas hover:bg-emerald-surface border border-emerald-border text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm text-emerald-400">note_add</span>
          <span>Add Footnote</span>
        </button>
      </div>

      <div className="space-y-3 pt-1">
        {footnotes.map((fn, idx) => (
          <div
            key={fn.id || idx}
            className="p-3.5 rounded-xl bg-night-canvas border border-emerald-border space-y-2 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary-fixed font-bold text-label-xs">
                  {fn.code || `Footnote ${idx + 1}`}
                </span>
                <input
                  type="text"
                  value={fn.title}
                  onChange={(e) => onUpdateFootnote(idx, 'title', e.target.value)}
                  placeholder="Commentary Title"
                  className="w-48 sm:w-60 px-2.5 py-1 rounded-lg bg-night-canvas border border-emerald-border text-white font-semibold text-xs focus:outline-none"
                />
                <input
                  type="text"
                  value={fn.scholar}
                  onChange={(e) => onUpdateFootnote(idx, 'scholar', e.target.value)}
                  placeholder="Commentator Scholar"
                  className="w-44 px-2.5 py-1 rounded-lg bg-night-canvas border border-emerald-border text-emerald-highlight text-xs focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => onRemoveFootnote(idx)}
                className="p-1 rounded text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer self-end sm:self-auto"
                title="Remove Footnote"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={fn.text}
              onChange={(e) => onUpdateFootnote(idx, 'text', e.target.value)}
              placeholder="Commentary text..."
              className="w-full px-3 py-2 rounded-lg bg-night-canvas border border-emerald-border text-white text-xs leading-relaxed focus:outline-none focus:border-emerald-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

