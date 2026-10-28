import React, { useState, useMemo, useEffect } from 'react';
import { Book, CategoryScience, Discipline } from '../types/library';

interface BrowseLibraryViewProps {
  books: Book[];
  categories?: CategoryScience[];
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onOpenDownload: (book: Book) => void;
  initialQuery?: string;
}

export const BrowseLibraryView: React.FC<BrowseLibraryViewProps> = ({
  books,
  categories = [],
  onSelectBook,
  onOpenReader,
  onOpenDownload,
  initialQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'pages' | 'title' | 'hijri'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const disciplines = useMemo(() => {
    const list: { id: string; label: string; count: number }[] = [
      { id: 'all', label: 'All Sciences', count: books.length },
    ];
    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        const count = books.filter(
          (b) => b.discipline === cat.id || (cat.id === 'seerah' && b.discipline === 'history')
        ).length;
        list.push({ id: String(cat.id), label: cat.name, count });
      });
    } else {
      list.push(
        { id: 'hadith', label: 'Hadīth & Isnād', count: books.filter((b) => b.discipline === 'hadith').length },
        { id: 'tafsir', label: 'Tafsīr & Qur’an', count: books.filter((b) => b.discipline === 'tafsir').length },
        { id: 'fiqh', label: 'Fiqh & Jurisprudence', count: books.filter((b) => b.discipline === 'fiqh').length },
        { id: 'seerah', label: 'Sīrah & History', count: books.filter((b) => b.discipline === 'seerah' || b.discipline === 'history').length },
        { id: 'aqeedah', label: '‘Aqīdah & Creed', count: books.filter((b) => b.discipline === 'aqeedah').length },
        { id: 'tazkiyah', label: 'Tazkiyah & Adab', count: books.filter((b) => b.discipline === 'tazkiyah').length }
      );
    }
    return list;
  }, [books, categories]);

  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesQuery =
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.arabicTitle.includes(searchQuery) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDiscipline = selectedDiscipline === 'all' ||
          b.discipline === selectedDiscipline ||
          (selectedDiscipline === 'seerah' && b.discipline === 'history');

        const matchesFormat = selectedFormat === 'all' ||
          b.formats.some(f => f.toLowerCase().includes(selectedFormat.toLowerCase()));

        return matchesQuery && matchesDiscipline && matchesFormat;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'pages') return b.pages - a.pages;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [books, searchQuery, selectedDiscipline, selectedFormat, sortBy]);

  return (
    <div className="w-full space-y-space-xl">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-label-sm uppercase tracking-wider text-tertiary font-semibold">
          <span className="material-symbols-outlined text-sm">local_library</span>
          <span>Open Academic Catalog</span>
          <span>•</span>
          <span>14,280+ Verified Treatises</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="font-display font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-primary font-bold">
              Classical Manuscript &amp; Library Catalog
            </h1>
            <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant max-w-2xl mt-1">
              Search, inspect, and read authoritative critical editions, isnād indices, and multilingual translations maintained under digital waqf.
            </p>
          </div>
          <div className="flex items-center bg-surface-container rounded-lg p-1 gap-1 border border-surface-container-high self-start sm:self-end shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-lg">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}`}
              title="Academic Table View"
            >
              <span className="material-symbols-outlined text-lg">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 sm:p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container space-y-3 sm:space-y-4">
        {/* Search input & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative w-full sm:w-80 md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-tertiary-container text-xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, Hijri era, or keywords..."
              className="w-full pl-10 pr-8 py-2 bg-surface-container-low rounded-lg font-body-sm text-xs sm:text-sm text-on-surface placeholder:text-outline border border-surface-container focus:outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs text-on-surface-variant">
            <span className="font-label-sm uppercase font-semibold shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-container-low px-3 py-2 rounded-lg font-title-md text-xs text-on-surface border border-surface-container focus:outline-none w-full sm:w-auto"
            >
              <option value="rating">Scholarly Authority (Rating)</option>
              <option value="pages">Volume Length (Pages)</option>
              <option value="title">Alphabetical (Title)</option>
            </select>
          </div>
        </div>

        {/* Discipline Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {disciplines.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDiscipline(d.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 font-title-md text-xs cursor-pointer ${selectedDiscipline === d.id
                  ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
            >
              <span>{d.label}</span>
              <span className="text-[10px] opacity-75">({d.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Results Header */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
        <span>Showing <strong>{filteredBooks.length}</strong> cataloged works</span>
        {searchQuery && (
          <span className="truncate max-w-[180px] sm:max-w-none">Filtering by: <strong className="text-primary">"{searchQuery}"</strong></span>
        )}
      </div>

      {/* Catalog Content (Grid Mode) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-space-lg">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden border border-surface-container"
            >
              <div
                className="relative h-52 bg-surface-container-high overflow-hidden cursor-pointer"
                onClick={() => onSelectBook(book)}
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={book.coverImage}
                  alt={book.title}
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold shadow-sm ${book.badgeColor || 'bg-primary-container text-on-primary'}`}>
                    {book.badge || book.disciplineName}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-surface/90 backdrop-blur-sm text-on-surface font-label-sm text-[11px] font-medium shadow-xs">
                  {book.pages} pgs • {book.sizeMb} MB
                </div>
              </div>

              <div className="p-space-md flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-tertiary">
                    <span className="font-arabic font-title-md text-title-md font-bold text-base">
                      {book.arabicTitle}
                    </span>
                    {book.verified && (
                      <span className="material-symbols-outlined text-xs" title="Verified by Academic Council">
                        verified
                      </span>
                    )}
                  </div>
                  <h3
                    onClick={() => onSelectBook(book)}
                    className="font-title-md text-sm font-bold text-primary group-hover:text-tertiary transition-colors line-clamp-1 cursor-pointer"
                  >
                    {book.title}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1">
                    {book.author} ({book.authorHijriYear})
                  </p>
                  <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {book.formats.map((fmt, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-medium">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 grid grid-cols-2 gap-2 border-t border-surface-container">
                  <button
                    onClick={() => onOpenReader(book)}
                    className="py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">chrome_reader_mode</span>
                    <span>Read</span>
                  </button>
                  <button
                    onClick={() => onOpenDownload(book)}
                    className="py-1.5 px-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-semibold text-xs flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Get</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Academic Table List Mode */
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-surface-container">
              <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                <tr>
                  <th className="py-3 px-4">Treatise Title &amp; Arabic Matn</th>
                  <th className="py-3 px-4">Author &amp; Era</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Folios/Pages</th>
                  <th className="py-3 px-4">Formats</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={book.coverImage} alt={book.title} className="w-8 h-10 object-cover rounded shadow-2xs" />
                        <div>
                          <div
                            onClick={() => onSelectBook(book)}
                            className="font-title-md text-sm font-semibold text-primary hover:underline cursor-pointer"
                          >
                            {book.title}
                          </div>
                          <div className="font-arabic text-tertiary font-bold">{book.arabicTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-on-surface">
                      <div className="font-semibold">{book.author}</div>
                      <div className="text-on-surface-variant text-[11px]">{book.authorHijriYear}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm">
                        {book.disciplineName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {book.pages} pgs ({book.volumes} {book.volumes > 1 ? 'vols' : 'vol'})
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {book.formats.slice(0, 2).map((fmt, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-surface-container-low text-[10px]">
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenReader(book)}
                          className="px-2.5 py-1 rounded bg-primary-container text-on-primary font-semibold text-xs hover:bg-primary transition-colors cursor-pointer"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => onOpenDownload(book)}
                          className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
                          title="Download"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredBooks.length === 0 && (
        <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-surface-container">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">auto_stories</span>
          <h3 className="font-title-lg text-primary font-bold">No treatises matched your filters</h3>
          <p className="text-xs text-on-surface-variant mt-1">Try resetting the discipline or search criteria.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedDiscipline('all'); }}
            className="mt-4 px-4 py-2 bg-primary-container text-on-primary rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
