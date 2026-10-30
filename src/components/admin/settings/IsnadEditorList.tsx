import React from 'react';
import type { IsnadNode } from '../../../types/library';

export interface IsnadEditorListProps {
  isnadChain: IsnadNode[];
  onAddNarrator: () => void;
  onRemoveNarrator: (index: number) => void;
  onUpdateNarrator: (index: number, field: keyof IsnadNode, value: string) => void;
}

export const IsnadEditorList: React.FC<IsnadEditorListProps> = ({
  isnadChain,
  onAddNarrator,
  onRemoveNarrator,
  onUpdateNarrator,
}) => {
  return (
    <div className="bg-emerald-surface rounded-2xl p-6 border border-emerald-border space-y-4">
      <div className="flex items-center justify-between border-b border-emerald-border pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-fixed">hub</span>
            Isnād Transmission Chain Nodes ({isnadChain.length})
          </h3>
          <p className="text-xs text-emerald-highlight">
            Scholars and narrators in the transmission line shown in the reader sidebar. Clicking their node opens their full bio.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddNarrator}
          className="px-3 py-1.5 rounded-xl bg-night-canvas hover:bg-emerald-surface border border-emerald-border text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm text-emerald-400">person_add</span>
          <span>Add Narrator</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {isnadChain.map((node, idx) => (
          <div
            key={node.id || idx}
            className="p-3.5 rounded-xl bg-night-canvas border border-emerald-border space-y-2.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary-fixed font-bold text-label-xs">
                Node #{idx + 1} • {node.rank || 'Narrator'}
              </span>
              <button
                type="button"
                onClick={() => onRemoveNarrator(idx)}
                className="p-1 rounded text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Remove Node"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={node.name}
                onChange={(e) => onUpdateNarrator(idx, 'name', e.target.value)}
                placeholder="English Name"
                className="px-2.5 py-1 rounded-lg bg-night-canvas border border-emerald-border text-white text-xs focus:outline-none"
              />
              <input
                type="text"
                dir="rtl"
                value={node.arabicName}
                onChange={(e) => onUpdateNarrator(idx, 'arabicName', e.target.value)}
                placeholder="الاسم بالعربية"
                className="px-2.5 py-1 rounded-lg bg-night-canvas border border-emerald-border text-white text-right text-xs focus:outline-none font-arabic"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={node.rank}
                onChange={(e) => onUpdateNarrator(idx, 'rank', e.target.value)}
                placeholder="Rank (e.g. Companion)"
                className="px-2.5 py-1 rounded-lg bg-night-canvas border border-emerald-border text-white text-xs focus:outline-none"
              />
              <input
                type="text"
                value={node.reliability}
                onChange={(e) => onUpdateNarrator(idx, 'reliability', e.target.value)}
                placeholder="Reliability (e.g. Thiqah)"
                className="px-2.5 py-1 rounded-lg bg-night-canvas border border-emerald-border text-emerald-400 text-xs focus:outline-none"
              />
            </div>

            <textarea
              rows={2}
              value={node.bio}
              onChange={(e) => onUpdateNarrator(idx, 'bio', e.target.value)}
              placeholder="Scholarly biography and transmission details..."
              className="w-full px-2.5 py-1 rounded-lg bg-night-canvas border border-emerald-border text-emerald-100 text-xs focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

