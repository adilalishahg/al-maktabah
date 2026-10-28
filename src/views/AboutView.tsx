import React from 'react';

export const AboutView: React.FC = () => {
  return (
    <div className="w-full space-y-space-xl">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-label-sm uppercase tracking-wider text-tertiary font-semibold">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span>Digital Waqf Endowment Charter</span>
        </div>
        <h1 className="font-display font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-primary font-bold">
          About Al-Maktabah &amp; Classical Preservation
        </h1>
        <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
          Established in 1445 AH / 2024 CE as an international digital endowment (<em>Waqf ‘Ilmī</em>) to preserve, authenticate, and freely distribute classical Islamic manuscripts and critical scholarly treatises for all humankind.
        </p>
      </div>

      {/* Core Principles Trio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border border-surface-container shadow-sm space-y-3">
          <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">lock_open</span>
          </span>
          <h3 className="font-title-lg text-base font-bold text-primary">Perpetual Open Access (Waqf)</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Islamic scholarly heritage belongs to the entire global Ummah. Under our charter, no paywall, recurring subscription, or restrictive intellectual monopoly will ever be imposed on these sacred texts.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border border-surface-container shadow-sm space-y-3">
          <span className="w-10 h-10 rounded-xl bg-tertiary-container text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">fact_check</span>
          </span>
          <h3 className="font-title-lg text-base font-bold text-primary">Rigorous Council Authentication</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Every digitized treatise is validated against primary manuscript witnesses by vetted philologists and traditional scholars with unbroken isnād chains in hadith, fiqh, and exegesis.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border border-surface-container shadow-sm space-y-3 sm:col-span-2 lg:col-span-1">
          <span className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">camera</span>
          </span>
          <h3 className="font-title-lg text-base font-bold text-primary">Conservation Grade Digitization</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Utilizing specialized non-contact 110-degree book cradles, cold UV-free LED illumination, and multispectral imaging to extract faint iron gall inks from fragile historical papyri.
          </p>
        </div>
      </div>

      {/* Technical Preservation Lab Standards */}
      <div className="bg-surface-container-lowest p-4 sm:p-6 md:p-8 rounded-2xl border border-surface-container shadow-sm space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">biotech</span>
          </span>
          <div>
            <h2 className="font-title-lg text-lg font-bold text-primary">Archival Scanning &amp; Paleographic Lab Specifications</h2>
            <p className="text-xs text-on-surface-variant">The technical pipeline ensuring longevity for the next thousand years.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <strong className="text-primary font-semibold block text-sm">4K Ultra-Res Multispectral Capture</strong>
            <p className="text-on-surface-variant leading-relaxed">
              Captures parchment grain, watermarks, paper chains, and gilded illumination in uncompressed TIFF 16-bit color depth at 600 DPI optical fidelity.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <strong className="text-primary font-semibold block text-sm">Automated Diacritic Lemmatization</strong>
            <p className="text-on-surface-variant leading-relaxed">
              Our neural OCR engine distinguishes Arabic harakat, tanwīn, shaddah, and classical orthographic variations without altering authentic scribal spelling.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <strong className="text-primary font-semibold block text-sm">Semantic TEI-XML &amp; Isnād Graph Modeling</strong>
            <p className="text-on-surface-variant leading-relaxed">
              Transmitted traditions are tagged with RDF graph ontology linking narrators to biographical registries (<em>‘Ilm ar-Rijāl</em>) and Qur’anic cross-references.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <strong className="text-primary font-semibold block text-sm">Cold Offline Vault Replication</strong>
            <p className="text-on-surface-variant leading-relaxed">
              Distributed backup nodes distributed across 5 continents in climate-controlled academic institutions and portable hardware bundles for rural madrasas.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Editorial Board */}
      <div className="space-y-4">
        <h2 className="font-title-lg text-xl font-bold text-primary">Academic Editorial Council</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: 'Dr. Muhammad Farooq al-Azhari',
              role: 'Chair of Hadith Sciences',
              institution: 'Al-Azhar University, Cairo',
              spec: 'Kutub as-Sittah Manuscript Collation'
            },
            {
              name: 'Prof. Aisha bint Salman',
              role: 'Director of Codicology',
              institution: 'Süleymaniye Manuscript Institute',
              spec: 'Ottoman & Andalusian Paleography'
            },
            {
              name: 'Shaykh Tariq al-Dimashqi',
              role: 'Senior Fiqh Specialist',
              institution: 'University of Damascus',
              spec: 'Comparative Madhhab Verification'
            },
            {
              name: 'Dr. Zaid ibn Mansoor',
              role: 'Chief Digital Archivist',
              institution: 'Open Heritage Initiative',
              spec: 'Computational Arabic Linguistics'
            }
          ].map((scholar, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm">
                {scholar.name.split(' ')[1]?.[0] || 'A'}
              </div>
              <div>
                <h4 className="font-bold text-xs text-primary">{scholar.name}</h4>
                <p className="text-[11px] text-tertiary font-semibold">{scholar.role}</p>
                <p className="text-[10px] text-on-surface-variant">{scholar.institution}</p>
              </div>
              <div className="pt-1 text-[10px] text-outline font-medium border-t border-surface-container">
                {scholar.spec}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
