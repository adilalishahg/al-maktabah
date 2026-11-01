import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Book, CategoryScience } from '../types/library';
import type { CommandPaletteProps } from '../types/components';

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  books,
  categories,
  onSelectBook,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.arabicTitle.includes(query) ||
    b.author.toLowerCase().includes(query.toLowerCase()) ||
    b.disciplineName.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.arabicName.includes(query) ||
    c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const visibleBooks = filteredBooks.slice(0, 5);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, visibleBooks.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (visibleBooks[selectedIndex]) {
          e.preventDefault();
          onSelectBook(visibleBooks[selectedIndex]);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, visibleBooks, selectedIndex, onSelectBook]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Universal Catalog Search and Command Palette"
        className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-3 sm:px-4 py-3 border-b border-surface-container-high bg-surface-container-low/50">
          <span className="material-symbols-outlined text-tertiary-container text-xl sm:text-2xl mr-2 sm:mr-3 shrink-0" aria-hidden="true">search</span>
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-label="Search treatises, isnāds, authors, disciplines..."
            className="w-full bg-transparent border-0 font-body-md text-sm sm:text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-0"
            placeholder="Search treatises, isnāds, authors, disciplines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button 
            onClick={onClose}
            aria-label="Close search dialog"
            className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs px-2 shrink-0 cursor-pointer"
          >
            ESC
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-surface-container">
          {/* Quick Nav Suggestions */}
          {query.trim() === '' && (
            <div className="p-2 space-y-1">
              <p className="font-label-sm uppercase tracking-wider text-on-surface-variant text-label-sm px-2 py-1">Direct Navigation</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                <button
                  onClick={() => { onNavigate('reader-studio'); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-surface-container text-primary font-medium"
                >
                  <span className="material-symbols-outlined text-tertiary-container text-base">menu_book</span>
                  <span>Open Interactive Reader</span>
                </button>
                <button
                  onClick={() => { onNavigate('browse-library'); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-surface-container text-primary font-medium"
                >
                  <span className="material-symbols-outlined text-tertiary-container text-base">local_library</span>
                  <span>Browse 14,000+ Catalog</span>
                </button>
                <button
                  onClick={() => { onNavigate('categories'); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-surface-container text-primary font-medium"
                >
                  <span className="material-symbols-outlined text-tertiary-container text-base">category</span>
                  <span>28 Canonical Disciplines</span>
                </button>
                <button
                  onClick={() => { onNavigate('manuscripts'); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-surface-container text-primary font-medium"
                >
                  <span className="material-symbols-outlined text-tertiary-container text-base">history_edu</span>
                  <span>Illuminated Manuscripts Archive</span>
                </button>
              </div>
            </div>
          )}

          {/* Book Results */}
          {filteredBooks.length > 0 && (
            <div className="p-2 space-y-1">
              <p className="font-label-sm uppercase tracking-wider text-on-surface-variant text-label-sm px-2 py-1">Classical Books &amp; Treatises</p>
              {visibleBooks.map((book, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    aria-selected={isSelected}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-surface-container-high ring-1 ring-tertiary/40'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 rounded shadow-xs shrink-0 overflow-hidden">
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized={
                            !book.coverImage.includes('images.unsplash.com') &&
                            !book.coverImage.includes('res.cloudinary.com') &&
                            !book.coverImage.includes('lh3.googleusercontent.com')
                          }
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-title-md font-semibold ${isSelected ? 'text-tertiary' : 'text-primary'}`}>
                            {book.title}
                          </span>
                          <span className="font-arabic text-sm text-tertiary" dir="rtl" lang="ar">
                            {book.arabicTitle}
                          </span>
                        </div>
                        <p className="font-body-sm text-on-surface-variant text-xs">{book.author} • {book.authorHijriYear}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-surface-container font-label-sm text-on-surface-variant">{book.disciplineName}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Category Results */}
          {filteredCategories.length > 0 && (
            <div className="p-2 space-y-1">
              <p className="font-label-sm uppercase tracking-wider text-on-surface-variant text-label-sm px-2 py-1">Classified Sciences</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {filteredCategories.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onNavigate('categories');
                      onClose();
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container-low text-left"
                  >
                    <span className="material-symbols-outlined text-primary text-lg">{cat.icon}</span>
                    <div className="truncate">
                      <div className="font-title-md text-xs font-semibold text-primary">{cat.name}</div>
                      <div className="text-label-sm text-on-surface-variant">{cat.volumeCount} Volumes</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredBooks.length === 0 && filteredCategories.length === 0 && query.trim() !== '' && (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl mb-2 text-outline">menu_book</span>
              <p className="font-title-md">No treatises found matching "{query}"</p>
              <p className="text-xs mt-1 text-outline">Try searching with root words, English names (e.g. Bukhari), or Arabic terms.</p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-surface-container-low text-label-sm text-on-surface-variant flex items-center justify-between border-t border-surface-container">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">↵</kbd> to select</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">esc</kbd> to close</span>
          </div>
          <span className="text-tertiary font-medium">Al-Maktabah Digital Waqf Engine</span>
        </div>
      </div>
    </div>
  );
};
