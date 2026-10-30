import React, { useState } from 'react';
import type { Book, CategoryScience } from '../types/library';
import type { CategoriesViewProps } from '../types/views';

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  books = [],
  onSelectCategory,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'disciplines' | 'roadmap'>('disciplines');

  return (
    <div className="w-full space-y-space-xl">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-label-sm uppercase tracking-wider text-tertiary font-semibold">
          <span className="material-symbols-outlined text-sm">account_tree</span>
          <span>Classification of Islamic Sciences (Tartīb al-‘Ulūm)</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="font-display font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-primary font-bold">
              Classified Sciences &amp; Canonical Disciplines
            </h1>
            <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant max-w-2xl mt-1">
              Explore primary sources organized systematically across classical Islamic jurisprudence, exegesis, transmitted traditions, logic, and spirituality.
            </p>
          </div>

          <div className="flex items-center bg-surface-container rounded-lg p-1 gap-1 border border-surface-container-high self-start sm:self-end shrink-0">
            <button
              onClick={() => setActiveTab('disciplines')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${activeTab === 'disciplines' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Sciences Directory
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${activeTab === 'roadmap' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Seeker Study Roadmaps
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'disciplines' ? (
        <div className="space-y-space-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-space-lg">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-surface-container-lowest rounded-2xl p-4 sm:p-space-lg shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                    </span>
                    <span className="font-arabic font-title-lg text-2xl text-tertiary font-bold">
                      {cat.arabicName}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-title-lg text-lg font-bold text-primary">{cat.name}</h3>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Sub-branches list */}
                  <div className="space-y-2 pt-2 border-t border-surface-container">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold block">
                      Sub-Disciplines &amp; Branches
                    </span>
                    <div className="space-y-1.5">
                      {cat.subBranches.map((sub, i) => (
                        <div key={i} className="p-2 rounded-lg bg-surface-container-low text-xs flex items-center justify-between">
                          <span className="font-medium text-on-surface">{sub.title}</span>
                          <span className="text-label-sm text-tertiary font-semibold">{sub.count} works</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Foundational texts / Live Treatises */}
                  <div className="pt-2">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold block mb-1">
                      {books.filter(b => b.discipline === cat.id).length > 0 ? 'Digital Treatises in Archive' : 'Canonical Texts (Matn)'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {books.filter(b => b.discipline === cat.id).length > 0 ? (
                        books.filter(b => b.discipline === cat.id).map((b) => (
                          <span key={b.id} className="px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary/20 text-label-sm font-medium truncate max-w-52" title={b.title}>
                            {b.title}
                          </span>
                        ))
                      ) : (
                        cat.foundationTreatises.map((treatise, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-surface-container text-label-sm text-on-surface">
                            {treatise}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-space-md mt-space-md flex items-center justify-between border-t border-surface-container text-xs">
                  <div>
                    <span className="font-bold text-primary block">
                      {books.filter(b => b.discipline === cat.id).length} Active Treatises
                    </span>
                    <span className="text-label-xs text-on-surface-variant">
                      {cat.volumeCount.toLocaleString()} Classical Records
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onNavigate('browse-library');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors cursor-pointer"
                  >
                    Explore Discipline →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Seeker Study Roadmaps */
        <div className="space-y-6">
          <div className="p-6 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">school</span>
              </span>
              <div>
                <h2 className="font-title-lg text-lg font-bold text-primary">Classical Curriculum for Traditional Knowledge (Manhaj Ṭālib al-‘Ilm)</h2>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Graduated learning milestones compiled by the Academic Council for mastering fundamental disciplines in sequence.
                </p>
              </div>
            </div>

            {/* Level 1: Foundational */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-xs font-semibold">Stage 1</span>
                  <h3 className="font-title-md text-sm font-bold text-primary">Foundational Pillars (Al-Uṣūl)</h3>
                </div>
                <span className="text-xs text-tertiary font-semibold">Recommended Duration: 6–12 Months</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Emphasis on sound creed (Tawḥīd), basic obligatory jurisprudence (Farḍ ‘Ayn), authentic daily prophetic supplications, and core Arabic grammar foundations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                  <strong className="block text-primary">‘Aqīdah</strong>
                  <span>Al-Qawā‘id al-Arba‘ah &amp; Al-‘Aqīdah aṭ-Ṭaḥāwiyyah</span>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                  <strong className="block text-primary">Hadīth</strong>
                  <span>Al-Arba‘īn an-Nawawiyyah (40 Hadith)</span>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                  <strong className="block text-primary">Linguistics</strong>
                  <span>Al-Ājurrūmiyyah in Arabic Syntax</span>
                </div>
              </div>
            </div>

            {/* Level 2: Intermediate */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-tertiary-container text-on-primary font-label-sm text-xs font-semibold">Stage 2</span>
                  <h3 className="font-title-md text-sm font-bold text-primary">Intermediate Consolidation (At-Ta’ṣīl)</h3>
                </div>
                <span className="text-xs text-tertiary font-semibold">Recommended Duration: 2–3 Years</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Comparative analysis of legal proofs, deep study of Qur’anic exegesis, memorization of prophetic traditions with isnād awareness, and rhetorical sciences.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                  <strong className="block text-primary">Tafsīr</strong>
                  <span>Tafsīr Ibn Kathīr &amp; As-Sa‘dī</span>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                  <strong className="block text-primary">Hadīth</strong>
                  <span>Riyāḍ aṣ-Ṣāliḥīn &amp; ‘Umdat al-Aḥkām</span>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                  <strong className="block text-primary">Jurisprudence</strong>
                  <span>Bidayat al-Mujtahid or School Matn (e.g. Zad al-Mustaqni)</span>
                </div>
              </div>
            </div>

            {/* Level 3: Advanced Research */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-xs font-semibold">Stage 3</span>
                  <h3 className="font-title-md text-sm font-bold text-primary">Advanced Research &amp; Codex Paleography (At-Tahqīq)</h3>
                </div>
                <span className="text-xs text-tertiary font-semibold">Specialist &amp; Post-Graduate</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Critical edition manuscript recension, complex isnād defect critique (al-‘Ilal), universal legal maxims (Qawā‘id Fiqhiyyah), and historical manuscript collation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                  <strong className="block text-primary">Primary Canon</strong>
                  <span>Fatḥ al-Bārī bi-Sharḥ Ṣaḥīḥ al-Bukhārī</span>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                  <strong className="block text-primary">Comparative Fiqh</strong>
                  <span>Al-Mughnī by Ibn Qudāmah</span>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                  <strong className="block text-primary">Isnād Analysis</strong>
                  <span>Tahdhīb al-Kamāl &amp; Mīzān al-I‘tidāl</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
