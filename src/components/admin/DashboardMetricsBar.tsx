'use client';

import React from 'react';
import type { DetailedBook } from '@/types/bookContent';

export interface DashboardMetricsBarProps {
  books: DetailedBook[];
}

export const DashboardMetricsBar: React.FC<DashboardMetricsBarProps> = ({ books }) => {
  const verifiedCount = books.filter((b) => b.verified).length;
  const totalPages = books.reduce((acc, b) => acc + (b.pages || 0), 0);
  const totalSizeMb = books.reduce((acc, b) => acc + (b.sizeMb || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-xs uppercase font-bold text-on-surface-variant">Total Catalog</span>
          <span className="material-symbols-outlined text-primary text-lg">auto_stories</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-display text-primary">{books.length}</div>
        <div className="text-label-xs text-on-surface-variant mt-0.5">Authoritative treatises</div>
      </div>

      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-xs uppercase font-bold text-on-surface-variant">Verified Waqf</span>
          <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-display text-tertiary">{verifiedCount}</div>
        <div className="text-label-xs text-on-surface-variant mt-0.5">Scholastically audited</div>
      </div>

      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-xs uppercase font-bold text-on-surface-variant">Archived Pages</span>
          <span className="material-symbols-outlined text-primary text-lg">description</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-display text-primary font-mono">
          {totalPages.toLocaleString()}
        </div>
        <div className="text-label-xs text-on-surface-variant mt-0.5">Digitized codex leaves</div>
      </div>

      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-xs uppercase font-bold text-on-surface-variant">Storage Volume</span>
          <span className="material-symbols-outlined text-primary text-lg">cloud_done</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-display text-primary font-mono">
          {totalSizeMb.toFixed(1)} MB
        </div>
        <div className="text-label-xs text-on-surface-variant mt-0.5">Cloudinary edge CDN</div>
      </div>
    </div>
  );
};

