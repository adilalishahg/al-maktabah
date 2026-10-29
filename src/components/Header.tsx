import React, { useState } from 'react';
import { ReaderTheme } from '../types/library';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  currentTheme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  currentLang: 'EN' | 'AR';
  onLangChange: (lang: 'EN' | 'AR') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  currentTheme,
  onThemeChange,
  currentLang,
  onLangChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'browse-library', label: 'Browse Library' },
    // { id: 'categories', label: 'Categories' },
    // { id: 'manuscripts', label: 'Manuscripts' },
    // { id: 'reader-studio', label: 'Reader Studio' },
    // { id: 'latest-releases', label: 'Latest Releases' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      {/* Top Banner: Daily Insight Calligraphy & Hijri Date */}
      <div className="w-full bg-primary-container text-on-primary py-1 sm:py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto flex items-center justify-between font-body-sm text-xs sm:text-body-sm">
          <div className="flex items-center gap-2 sm:gap-space-md min-w-0 truncate">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-tertiary-container text-on-primary font-label-sm text-[10px] sm:text-label-sm font-semibold tracking-wide uppercase shrink-0">
              Daily Insight
            </span>
            <span className="font-arabic text-tertiary-fixed font-medium truncate text-xs sm:text-base">
              « اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ »
            </span>
            <span className="hidden xl:inline text-on-primary-container text-opacity-90 italic font-body-sm text-xs truncate">
              “Read in the name of your Lord who created.” (Surah Al-’Alaq 96:1)
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 sm:gap-space-lg text-on-primary-container font-label-sm text-xs sm:text-label-sm shrink-0">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs sm:text-sm text-tertiary-fixed-dim">calendar_month</span>
              14 Shawwal 1445 AH
            </span>
            <span className="text-outline-variant">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs sm:text-sm text-tertiary-fixed-dim">auto_stories</span>
              54,280 Manuscripts
            </span>
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="h-16 sm:h-20 w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 xl:gap-3 2xl:gap-6">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 sm:gap-space-md shrink-0 cursor-pointer select-none"
        >
          <img
            alt="Al-Maktabah Brand Logo"
            className="h-7 sm:h-8 w-auto object-contain"
            decoding="async"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkk5vdhfETWDMXgUobuz8b7OFIRxT1RnZyf7NS9WywvGhN2DjXfBC38oWKpOPBa1Qs_m1ca4JDUU4MPkxVPn_Sc46Y9KuVauZl1My3j3Je5ikE7fJ0utasVbauXGLar-TbkdJmDkpxhfmPHXPvXvl3Bffa8uNNmdDFvmiUQbiT0GyDAuAJEGh7OHztOzMPqH7Ugw6p3FwSAO-cR9R2gvZLOgmsldiGILWTav5h_tWWlYQ6vJe9X8xI"
          />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-display font-headline-sm text-lg sm:text-headline-sm text-primary tracking-tight font-semibold">
                Al-Maktabah
              </span>
              <span className="font-arabic font-title-lg text-base sm:text-title-lg text-tertiary font-bold">
                المكتبة
              </span>
            </div>
            <span className="hidden 2xl:block font-label-sm text-[10px] 2xl:text-label-sm text-on-surface-variant tracking-wider uppercase">
              Knowledge Hub &amp; Digital Archives
            </span>
          </div>
        </div>

        {/* Center Nav Links (Desktop xl+) */}
        <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1.5 shrink-0">
          {navLinks.map((link) => {
            const isActive = currentPath === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-2.5 2xl:px-3 py-1.5 2xl:py-2 rounded-lg font-title-md text-xs 2xl:text-sm transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 2xl:gap-3 shrink-0">
          {/* Quick Search Pill (lg+) */}
          {/* <div
            onClick={onOpenSearch}
            className="relative hidden lg:flex items-center bg-surface-container-lowest rounded-lg px-2.5 2xl:px-3 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-surface-container-high cursor-pointer hover:border-tertiary-container transition-colors w-36 lg:w-40 2xl:w-56 shrink-0"
          >
            <span className="material-symbols-outlined text-tertiary-container mr-1.5 text-base sm:text-lg">search</span>
            <span className="w-full font-body-sm text-xs text-outline truncate select-none">
              Search treatises, isnāds...
            </span>
            <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-label-sm text-on-surface-variant bg-surface-container rounded ml-1">
              ⌘K
            </kbd>
          </div>
 
          <button
            onClick={onOpenSearch}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
            title="Search treatises"
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button> */}

          {/* Theme Switcher Trio (sm+) */}
          <div className="hidden sm:flex items-center bg-surface-container-low rounded-lg p-0.5 gap-0.5 border border-surface-container shrink-0">
            <button
              onClick={() => onThemeChange('parchment')}
              className={`p-1.5 rounded text-xs flex items-center transition-all ${currentTheme === 'parchment'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
              title="Light Parchment Theme"
            >
              <span className="material-symbols-outlined text-sm text-tertiary-container">light_mode</span>
            </button>
            <button
              onClick={() => onThemeChange('sepia')}
              className={`p-1.5 rounded text-xs flex items-center transition-all ${currentTheme === 'sepia'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
              title="Warm Sepia Parchment"
            >
              <span className="material-symbols-outlined text-sm text-tertiary">auto_stories</span>
            </button>
            <button
              onClick={() => onThemeChange('night')}
              className={`p-1.5 rounded text-xs flex items-center transition-all ${currentTheme === 'night'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
              title="Night Emerald Theme"
            >
              <span className="material-symbols-outlined text-sm text-primary-container">dark_mode</span>
            </button>
          </div>

          {/* Language Switcher (md+) */}
          <div className="hidden md:flex items-center bg-surface-container-high rounded-lg p-0.5 border border-surface-container shrink-0">
            <button
              onClick={() => onLangChange('EN')}
              className={`px-2 py-1 rounded font-label-sm text-xs font-semibold transition-colors ${currentLang === 'EN'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('AR')}
              className={`px-2 py-1 rounded font-label-sm text-xs font-semibold transition-colors ${currentLang === 'AR'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              عربي
            </button>
          </div>

          {/* Admin Portal Shortcut & Scholar Avatar */}
          <a
            href="/admin"
            title="Open Admin Portal"
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-surface-container-high transition-colors group shrink-0"
          >
            <img
              alt="Scholar Profile / Admin"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-tertiary-container ring-offset-2 ring-offset-surface shrink-0 group-hover:scale-105 transition-transform"
              loading="lazy"
              decoding="async"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp6hjwy-OtUiOFhXULVfc39TXd10KeuRXfFUG5sIqXVsYPcK5Q3_sXBUEWdWMQiSBlB-RSNxE5NSOG1gAp2qrAfJdN9ukCek7BibNabA20PebeMtnMMzmI8puJlGt9eWVf06upC4lVHJo3seg2JriFqz6XknjL28boYGcDkKgVHJ7UJLGLIr5O_cfctFnbYX28zDj5WwUvVllMUdmi0tkU4ok2-XSiS14eZeUo7chnLI3iQWQdDkYf"
            />
            <span className="hidden lg:inline text-[11px] font-bold text-tertiary px-1.5 py-0.5 rounded-md bg-tertiary-container/15 border border-tertiary/20">
              Admin
            </span>
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 sm:p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-container p-4 space-y-3 animate-fade-in shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto">
          {/* Search bar inside drawer */}
          <div
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch();
            }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container cursor-pointer text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-tertiary text-lg">search</span>
            <span className="text-xs text-outline font-body-sm flex-1">Search 14,280+ treatises, authors, isnāds...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-mono">⌘K</kbd>
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pb-3 border-b border-surface-container">
            {navLinks.map((link) => {
              const isActive = currentPath === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-xl text-left text-sm font-semibold flex items-center justify-between transition-colors ${isActive
                    ? 'bg-primary-container text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">
                      {link.id === 'home' && 'home'}
                      {link.id === 'browse-library' && 'local_library'}
                      {link.id === 'categories' && 'category'}
                      {link.id === 'manuscripts' && 'history_edu'}
                      {link.id === 'reader-studio' && 'chrome_reader_mode'}
                      {link.id === 'latest-releases' && 'new_releases'}
                      {link.id === 'about' && 'info'}
                    </span>
                    <span>{link.label}</span>
                  </span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              );
            })}
          </div>

          {/* Theme & Language Controls inside Drawer */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span className="font-label-sm uppercase font-semibold">Reading Palette:</span>
              <div className="flex items-center bg-surface-container rounded-lg p-0.5 gap-1">
                <button
                  onClick={() => onThemeChange('parchment')}
                  className={`px-2 py-1 rounded text-xs font-semibold ${currentTheme === 'parchment' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}`}
                >
                  Parchment
                </button>
                <button
                  onClick={() => onThemeChange('sepia')}
                  className={`px-2 py-1 rounded text-xs font-semibold ${currentTheme === 'sepia' ? 'bg-[#ded1c1] text-[#26211a] shadow-xs' : 'text-on-surface-variant'}`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => onThemeChange('night')}
                  className={`px-2 py-1 rounded text-xs font-semibold ${currentTheme === 'night' ? 'bg-[#192e25] text-white shadow-xs' : 'text-on-surface-variant'}`}
                >
                  Night
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-container">
              <span>Hijri 1445 AH Codex</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onLangChange('EN')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${currentLang === 'EN' ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  English
                </button>
                <button
                  onClick={() => onLangChange('AR')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${currentLang === 'AR' ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  العربية
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
