import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { FooterProps } from '../types/components';
import { getBookSlug } from '@/utils/slug';
import { INITIAL_DETAILED_BOOKS } from '@/data/bookStore';

interface FooterBook {
  id: string;
  slug: string;
  title: string;
  arabicTitle?: string;
  discipline?: string;
  disciplineName?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState<FooterBook[]>(() =>
    INITIAL_DETAILED_BOOKS.slice(0, 5).map((b) => ({
      id: b.id,
      slug: getBookSlug(b),
      title: b.title,
      arabicTitle: b.arabicTitle,
      discipline: b.discipline,
      disciplineName: b.disciplineName,
    }))
  );
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const res = await fetch(
          '/api/books?limit=6&select=id,title,arabicTitle,discipline,disciplineName',
          {
            headers: { Accept: 'application/json' },
            next: { revalidate: 3600 },
          } as RequestInit
        );
        if (!res.ok) throw new Error('Failed to fetch books');
        const json = await res.json();
        if (isMounted && json?.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: FooterBook[] = json.data.slice(0, 5).map((b: any) => ({
            id: b.id || b._id,
            slug: getBookSlug(b),
            title: b.title,
            arabicTitle: b.arabicTitle,
            discipline: b.discipline,
            disciplineName: b.disciplineName,
          }));
          setFeaturedBooks(mapped);
        }
      } catch {
        // Keeps graceful fallback from INITIAL_DETAILED_BOOKS
      } finally {
        if (isMounted) setIsLoadingBooks(false);
      }
    };

    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

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
    <footer className="w-full max-w-full overflow-x-hidden bg-surface-container-low border-t border-surface-container mt-space-xl">
      <div className="w-full max-w-7xl xl:max-w-archive-xl 2xl:max-w-archive-2xl mx-auto px-4 sm:px-6 lg:px-8 py-space-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 mb-space-xl">
          {/* Main Brand Column */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 space-y-space-md">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-space-md cursor-pointer select-none"
            >
              <Image
                alt="Al-Maktabah Brand Logo"
                className="h-7 w-auto object-contain"
                width={32}
                height={28}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkk5vdhfETWDMXgUobuz8b7OFIRxT1RnZyf7NS9WywvGhN2DjXfBC38oWKpOPBa1Qs_m1ca4JDUU4MPkxVPn_Sc46Y9KuVauZl1My3j3Je5ikE7fJ0utasVbauXGLar-TbkdJmDkpxhfmPHXPvXvl3Bffa8uNNmdDFvmiUQbiT0GyDAuAJEGh7OHztOzMPqH7Ugw6p3FwSAO-cR9R2gvZLOgmsldiGILWTav5h_tWWlYQ6vJe9X8xI"
              />
              <span className="font-display font-title-lg text-title-lg text-primary font-bold">
                Al-Maktabah
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              A dedicated open-access scholarly archive preserving classical Islamic sciences, illuminated manuscripts, and peer-reviewed critical editions for researchers and seekers of knowledge worldwide.
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

          {/* Column 2: Featured Codices (Dynamic Database Links) */}
          <div className="col-span-1">
            <div className="flex flex-col gap-0.5 mb-space-md">
              <h4 className="font-title-md text-title-md text-on-surface font-bold">
                Featured Codices
              </h4>
              <span className="font-arabic text-xs text-primary/80 font-semibold" dir="rtl">
                مختارات من المكتبة
              </span>
            </div>

            {isLoadingBooks ? (
              <ul className="space-y-3 font-body-sm text-body-sm" role="status" aria-label="Loading codices">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="animate-pulse space-y-1">
                    <div className="h-4 bg-surface-container rounded-md w-4/5" />
                    <div className="h-2.5 bg-surface-container-high rounded-md w-3/5" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
                {featuredBooks.map((book) => {
                  const targetSlug = book.slug || getBookSlug(book);
                  return (
                    <li key={book.id}>
                      <Link
                        href={`/reader/${encodeURIComponent(targetSlug)}`}
                        className="group flex flex-col hover:text-primary transition-colors text-left"
                      >
                        <span className="font-medium group-hover:underline truncate max-w-full">
                          {book.title}
                        </span>
                        {book.arabicTitle && (
                          <span
                            className="font-arabic text-[11px] text-on-surface-variant/75 group-hover:text-primary/90 truncate max-w-full"
                            dir="rtl"
                          >
                            {book.arabicTitle}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Column 3: Manuscript Archives links */}
          <div className="col-span-1">
            <h4 className="font-title-md text-title-md text-on-surface mb-space-md font-bold">
              Manuscript Archives
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Qur’anic Exegesis (Tafsīr)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Prophetic Traditions (Hadīth)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Jurisprudence (Fiqh &amp; Usūl)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Theology &amp; Creed (‘Aqīdah)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Arabic Linguistics (Nahw &amp; Balāghah)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Scholarly Apparatus links */}
          <div className="col-span-1">
            <h4 className="font-title-md text-title-md text-on-surface mb-space-md font-bold">
              Scholarly Apparatus
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button onClick={() => onNavigate('reader-studio')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Isnād Interactive Graph
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reader-studio')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Biographical Registry (‘Ilm al-Rijāl)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Manuscript Preservation Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('manuscripts')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  High-Res Manuscript Viewer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('browse-library')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Citation &amp; Export Formats
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Scholarly Dispatches newsletter */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1 space-y-space-md">
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
                  className="w-full py-2 px-4 rounded-lg bg-primary-container text-on-primary font-title-md text-title-md hover:bg-primary transition-colors flex items-center justify-center gap-2 text-sm font-semibold shadow-xs cursor-pointer"
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
