import React from 'react';
import { SimpleSectionConfig } from '../../types';

interface HomeWaqfMissionProps {
  config?: SimpleSectionConfig;
  dispatchSubscribed: boolean;
  dispatchEmail: string;
  setDispatchEmail: (val: string) => void;
  handleDispatchSubmit: (e: React.FormEvent) => void;
}

export const HomeWaqfMission: React.FC<HomeWaqfMissionProps> = ({
  config,
  dispatchSubscribed,
  dispatchEmail,
  setDispatchEmail,
  handleDispatchSubmit,
}) => {
  if (config && !config.enabled) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden bg-gradient-to-br from-emerald-deep via-emerald-dark to-emerald-deep border-2 border-tertiary/40 text-tertiary-fixed">
        {/* Decorative Arabesque Vector Overlay */}
        <div className="absolute -right-12 -top-12 w-64 h-64 opacity-10 pointer-events-none text-tertiary">
          <svg fill="currentColor" viewBox="0 0 100 100">
            <polygon points="50,0 62,38 100,38 69,62 81,100 50,75 19,100 31,62 0,38 38,38"></polygon>
          </svg>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-tertiary-container/20 text-gold-bright border border-tertiary/40 font-label-sm text-xs uppercase font-bold tracking-wider">
            <span className="material-symbols-outlined text-sm">mark_email_read</span>
            The Monthly Scholarly Dispatch
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            {config?.title || 'Join 140,000+ Seekers & Researchers of Sacred Knowledge'}
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-tertiary-fixed max-w-xl mx-auto leading-relaxed">
            {config?.subtitle ||
              'Receive monthly digests of newly digitized manuscripts, authenticated translations, paleographic findings, and academic reading roadmaps. No promotional spam.'}
          </p>

          {dispatchSubscribed ? (
            <div className="p-4 bg-emerald-500/30 border border-emerald-400 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg">
              <span className="material-symbols-outlined text-2xl text-emerald-300">check_circle</span>
              <span>Alhamdulillah! You have been enrolled in the Monthly Scholarly Dispatch.</span>
            </div>
          ) : (
            <form onSubmit={handleDispatchSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              <input
                className="w-full sm:w-auto flex-1 px-4 py-3.5 rounded-xl bg-white/95 text-stone-900 placeholder:text-stone-500 font-body-sm text-sm focus:outline-none focus:ring-2 focus:ring-tertiary shadow-lg"
                placeholder="scholar@university.edu"
                type="email"
                value={dispatchEmail}
                onChange={(e) => setDispatchEmail(e.target.value)}
                required
              />
              <button
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-leaf via-tertiary-fixed to-tertiary-container text-stone-950 font-title-md text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg font-extrabold shrink-0 cursor-pointer"
                type="submit"
              >
                <span>Subscribe</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-4 text-tertiary-fixed font-label-sm text-xs pt-1">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-tertiary">lock</span> 100% Privacy Protected
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-tertiary">history_edu</span> Academic Editorial Board
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

