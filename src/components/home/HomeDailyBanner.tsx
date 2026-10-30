'use client';

import React from 'react';
import type { DailyBannerConfig } from '@/types/homeSettings';

export interface HomeDailyBannerProps {
  banner: DailyBannerConfig;
}

export const HomeDailyBanner: React.FC<HomeDailyBannerProps> = ({ banner }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 border border-tertiary/40 bg-gradient-to-r from-surface-container-high/90 via-surface-container-lowest to-surface-container-high/90 shadow-md">
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-tertiary-container/25 to-tertiary-container/30 text-gold-dark dark:text-gold-bright border border-tertiary/40 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-lg">auto_stories</span>
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 min-w-0">
            <span className="font-arabic text-xl sm:text-2xl text-tertiary font-bold tracking-wide leading-none">
              {banner.arabicText || '« رَبِّ زِدْنِي عِلْمًا »'}
            </span>
            <span className="font-body-sm text-xs sm:text-sm text-on-surface-variant font-medium">
              {banner.translation || '“My Lord, increase me in knowledge.”'}{' '}
              <span className="text-tertiary font-label-sm text-label-sm sm:text-xs font-bold tracking-wider ml-1 bg-tertiary-container/15 px-2 py-0.5 rounded-full border border-tertiary/20">
                {banner.reference || 'Surah Ṭā-Hā 20:114'}
              </span>
            </span>
          </div>
        </div>
      </div>
      {/* Ambient subtle geometric watermark */}
      <div className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 pointer-events-none text-tertiary">
        <svg fill="currentColor" viewBox="0 0 100 100">
          <polygon points="50,0 62,38 100,38 69,62 81,100 50,75 19,100 31,62 0,38 38,38" />
        </svg>
      </div>
    </div>
  );
};
