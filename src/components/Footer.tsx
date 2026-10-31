import React, { useState } from 'react';
import type { FooterProps } from '../types/components';

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container mt-space-xl">
      <div className="w-full max-w-7xl xl:max-w-archive-xl 2xl:max-w-archive-2xl mx-auto px-4 sm:px-6 lg:px-8 py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl mb-space-xl">
          {/* Main Brand Column */}
          <div className="lg:col-span-2 space-y-space-md">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-space-md cursor-pointer select-none"
            >
              <img
                alt="Al-Maktabah Brand Logo"
                className="h-7 w-auto object-contain"
                loading="lazy"
                decoding="async"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkk5vdhfETWDMXgUobuz8b7OFIRxT1RnZyf7NS9WywvGhN2DjXfBC38oWKpOPBa1Qs_m1ca4JDUU4MPkxVPn_Sc46Y9KuVauZl1My3j3Je5ikE7fJ0utasVbauXGLar-TbkdJmDkpxhfmPHXPvXvl3Bffa8uNNmdDFvmiUQbiT0GyDAuAJEGh7OHztOzMPqH7Ugw6p3FwSAO-cR9R2gvZLOgmsldiGILWTav5h_tWWlYQ6vJe9X8xI"
              />
              <span className="font-display font-title-lg text-title-lg text-primary font-bold">
                Al-Maktabah
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              A dedicated open-access scholarly archive preserving classical Islamic sciences, illuminated codices, and peer-reviewed critical editions for researchers and seekers of knowledge worldwide.
            </p>
            <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm border border-surface-container">
                <span className="material-symbols-outlined text-sm text-primary-container">verified</span>
                Open Knowledge Charter
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm border border-surface-container">
                <span className="material-symbols-outlined text-sm text-tertiary-container">verified_user</span>
                Verified Isnād Node
              </span>
            </div>
          </div>

          {/* Manuscript Archives links */}
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-md font-bold">
              Manuscript Archives
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left">
                  Qur’anic Exegesis (Tafsīr)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left">
                  Prophetic Traditions (Hadīth)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left">
                  Jurisprudence (Fiqh &amp; Usūl)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left">
                  Theology &amp; Creed (‘Aqīdah)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left">
                  Arabic Linguistics (Nahw &amp; Balāghah)
                </button>
              </li>
            </ul>
          </div>

          {/* Scholarly Apparatus links */}
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-md font-bold">
              Scholarly Apparatus
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button onClick={() => onNavigate('reader-studio')} className="hover:text-primary transition-colors text-left">
                  Isnād Interactive Graph
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reader-studio')} className="hover:text-primary transition-colors text-left">
                  Biographical Registry (‘Ilm al-Rijāl)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-primary transition-colors text-left">
                  Manuscript Preservation Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('manuscripts')} className="hover:text-primary transition-colors text-left">
                  High-Res Manuscript Viewer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('browse-library')} className="hover:text-primary transition-colors text-left">
                  Citation &amp; Export Formats
                </button>
              </li>
            </ul>
          </div>

          {/* Scholarly Dispatches newsletter */}
          <div className="space-y-space-md">
            <h4 className="font-title-md text-title-md text-on-surface font-bold">
              Scholarly Dispatches
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Receive notices of newly digitised parchment accessions, critical apparatus updates, and academic editions.
            </p>
            {subscribed ? (
              <div className="p-3 bg-primary-container text-on-primary rounded-lg text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">mark_email_read</span>
                <span>Subscribed! Check your scholarly inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none shadow-sm border border-surface-container"
                  placeholder="scholar@institution.edu"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  className="w-full py-2 px-4 rounded-lg bg-primary-container text-on-primary font-title-md text-title-md hover:bg-primary transition-colors flex items-center justify-center gap-2 text-sm font-semibold shadow-xs"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-sm">mark_email_read</span>
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 sm:pt-space-lg border-t border-surface-container flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-space-md font-body-sm text-xs text-on-surface-variant text-center md:text-left">
          <p>© 1445 AH / 2024 CE Al-Maktabah Open Knowledge Foundation. Preserved for academic and public study under Open Waqf Commons.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-space-lg">
            <button onClick={() => onNavigate('about')} className="hover:text-on-surface transition-colors cursor-pointer">
              Privacy &amp; Data Ethics
            </button>
            <button onClick={() => onNavigate('about')} className="hover:text-on-surface transition-colors cursor-pointer">
              Editorial Standards
            </button>
            <button onClick={() => onNavigate('about')} className="hover:text-on-surface transition-colors cursor-pointer">
              Institutional API
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
