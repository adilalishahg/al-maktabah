'use client';

import React from 'react';
import type { CategoryScience } from '@/types/library';
import type { CategoriesGridConfig } from '@/types/homeSettings';

export interface HomeCategoriesGridProps {
  categoriesConfig: CategoriesGridConfig;
  categories: CategoryScience[];
  onNavigate: (path: string) => void;
}

export const HomeCategoriesGrid: React.FC<HomeCategoriesGridProps> = ({
  categoriesConfig,
  categories,
  onNavigate,
}) => {
  return (
    <section className="py-8 sm:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
            <span className="font-label-sm text-xs uppercase tracking-wider text-tertiary font-bold">
              Classification of Islamic Sciences (Tartīb al-‘Ulūm)
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary">
            {categoriesConfig.title || 'Classified Sciences of Knowledge'}
          </h2>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-xl">
            {categoriesConfig.subtitle ||
              'Systematically organized primary sources across canonical jurisprudence, exegesis, transmitted prophetic traditions, and sacred theology.'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('categories')}
          className="mt-4 md:mt-0 inline-flex items-center gap-1.5 font-title-md text-sm font-bold text-primary hover:text-tertiary transition-colors cursor-pointer group"
        >
          <span>View All 28 Classifications</span>
          <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories.slice(0, categoriesConfig.maxDisplay || 6).map((cat, idx) => {
          const disciplineGradients = [
            'hover:border-emerald-500/50 hover:shadow-emerald-950/10',
            'hover:border-amber-500/50 hover:shadow-amber-950/10',
            'hover:border-sky-500/50 hover:shadow-sky-950/10',
            'hover:border-purple-500/50 hover:shadow-purple-950/10',
            'hover:border-teal-500/50 hover:shadow-teal-950/10',
            'hover:border-rose-500/50 hover:shadow-rose-950/10',
          ];
          const iconBg = [
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            'bg-sky-500/10 text-sky-600 dark:text-sky-400',
            'bg-purple-500/10 text-purple-600 dark:text-purple-400',
            'bg-teal-500/10 text-teal-600 dark:text-teal-400',
            'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          ];
          const activeGrad = disciplineGradients[idx % disciplineGradients.length];
          const activeIcon = iconBg[idx % iconBg.length];

          return (
            <div
              key={cat.id}
              onClick={() => onNavigate('categories')}
              className={`group relative bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-surface-container cursor-pointer overflow-hidden ${activeGrad}`}
            >
              <span className="absolute -bottom-4 -right-2 font-arabic text-6xl text-on-surface/[0.03] select-none pointer-events-none group-hover:scale-105 transition-transform">
                {cat.arabicName}
              </span>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-2xs ${activeIcon}`}
                  >
                    <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                  </span>
                  <span className="font-arabic text-xl sm:text-2xl text-tertiary font-bold">
                    {cat.arabicName}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-primary group-hover:text-tertiary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 font-label-sm">
                  {cat.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-surface-container-low text-label-sm text-on-surface-variant font-medium border border-surface-container"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 flex items-center justify-between text-on-surface-variant font-label-sm text-xs border-t border-surface-container relative z-10">
                <span className="font-bold text-primary">
                  {cat.volumeCount.toLocaleString()} Verified Volumes
                </span>
                <span className="group-hover:translate-x-1 transition-transform text-tertiary font-bold flex items-center gap-1">
                  Explore Branch →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

