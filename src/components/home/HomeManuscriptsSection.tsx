import React from 'react';
import { SimpleSectionConfig } from '../../types';

interface HomeManuscriptsSectionProps {
  config?: SimpleSectionConfig;
}

export const HomeManuscriptsSection: React.FC<HomeManuscriptsSectionProps> = ({ config }) => {
  if (config && !config.enabled) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Commitment to Waqf */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low text-primary font-label-sm text-xs font-bold border border-tertiary/30">
            <span className="material-symbols-outlined text-sm text-tertiary">verified</span>
            <span>Endowment for Eternity (Waqf Lillāh)</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary">
            {config?.title || 'Our Commitment to Classical Preservation'}
          </h2>
          <p className="font-body-lg text-sm sm:text-base text-on-surface-variant leading-relaxed">
            {config?.subtitle || (
              <>
                Knowledge in Islam is a communal obligation (<em>Farḍ Kifāyah</em>) and a timeless continuous charity (<em>Ṣadaqah Jāriyah</em>). Al-Maktabah operates as an independent academic digital waqf:
              </>
            )}
          </p>
          <div className="space-y-3 font-body-md text-xs sm:text-sm text-on-surface-variant">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl shrink-0 mt-0.5">check_circle</span>
              <p>
                <strong className="text-primary">No Paywalls, Ever:</strong> Every manuscript, critical edition, and translation is 100% open-access without subscription barriers or commercial advertisements.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl shrink-0 mt-0.5">check_circle</span>
              <p>
                <strong className="text-primary">4K Ultra-High Density Digitization:</strong> Preserving fragile papyri, parchment codices, and rare Ottoman/Abbasid bindings before physical decay destroys them.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl shrink-0 mt-0.5">check_circle</span>
              <p>
                <strong className="text-primary">Rigorously Authenticated by Council:</strong> Every text is cross-referenced with extant historical copies by seasoned specialists in traditional Islamic philology.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Feature Matrix */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2.5 border border-surface-container">
            <div className="w-11 h-11 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">copyright</span>
            </div>
            <h3 className="font-display text-base font-bold text-primary">Open Academic Licensing</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Licensed under CC-BY-NC for research centers, university faculties, and educational initiatives globally.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2.5 border border-surface-container">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-2xl">spellcheck</span>
            </div>
            <h3 className="font-display text-base font-bold text-primary">Morphological Search</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Search with full Arabic diacritics (<em>tashkīl</em>) or stripped bare roots with stem lemmatization support.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2.5 border border-surface-container">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-2xl">sync_alt</span>
            </div>
            <h3 className="font-display text-base font-bold text-primary">Cross-Referencing</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Instant live bidirectional links connecting Hadith citations directly into corresponding Qur’anic verses.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2.5 border border-surface-container">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <span className="material-symbols-outlined text-2xl">offline_pin</span>
            </div>
            <h3 className="font-display text-base font-bold text-primary">Offline Bundles</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Download entire library sections as compressed standalone packages for rural madrasas with no internet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
