import React from 'react';
import type { BrowseLibraryViewProps } from '../types/views';
import { useCatalogSearch } from '@/hooks/useCatalogSearch';

export const BrowseLibraryView: React.FC<BrowseLibraryViewProps> = ({
  books,
  categories = [],
  onSelectBook,
  onOpenReader,
  onOpenDownload,
  initialQuery = '',
  isLoading = false,
  onRefresh,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedDiscipline,
    setSelectedDiscipline,
    selectedFormat,
    setSelectedFormat,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    disciplines,
    filteredBooks,
    clearFilters,
  } = useCatalogSearch({ books, categories, initialQuery });

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
              <span className="text-label-xs opacity-75">({d.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Results Header */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
        <span>
          Showing <strong>{filteredBooks.length}</strong> cataloged works
          {books.length > 0 && filteredBooks.length !== books.length && (
            <span className="text-outline ml-1">(filtered from {books.length} total)</span>
          )}
        </span>
        {searchQuery && (
          <span className="truncate max-w-xs sm:max-w-none">
            Filtering by: <strong className="text-primary">"{searchQuery}"</strong>
          </span>
        )}
      </div>

      {/* Loading State */}
      {isLoading && books.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-3 border-primary/20 border-t-primary animate-spin"></div>
          <div className="space-y-1">
            <h3 className="font-title-md font-bold text-primary">Connecting to Live Database...</h3>
            <p className="text-xs text-on-surface-variant">Querying MongoDB and catalog indices for authentic codices.</p>
          </div>
        </div>
      ) : books.length === 0 ? (
        /* Empty State: No Books in Database */
        <div className="py-14 px-6 sm:px-12 text-center bg-gradient-to-b from-surface-container-lowest via-surface-container-lowest to-surface-container-low/40 rounded-3xl border-2 border-dashed border-tertiary/40 shadow-sm max-w-2xl mx-auto space-y-5">
          <div className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-tertiary-container/20 to-primary/10 border border-tertiary/50 flex items-center justify-center text-tertiary shadow-sm">
            <span className="material-symbols-outlined text-4xl text-gold-dark dark:text-gold-bright">
              library_books
            </span>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-surface"></span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/15 text-gold-dark dark:text-gold-bright text-xs font-bold border border-tertiary/30">
              <span className="material-symbols-outlined text-sm">database</span>
              <span>Live Database Connected</span>
            </div>
            <h3 className="font-display text-2xl font-extrabold text-primary">
              No Live Books in Database Yet
            </h3>
            <p className="font-arabic text-lg text-tertiary font-bold tracking-wide">
              « لَمْ يَتِمَّ إِضَافَةُ أَيِّ كُتُبٍ أَوْ مَخْطُوطَاتٍ حَتَّى الْآنَ »
            </p>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              The public library is connected to your database, but no codices have been uploaded or published yet. As soon as an administrator adds books via the Admin Portal, they will appear here with full reading, isnād inspection, and download features.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold text-xs sm:text-sm shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span>Open Admin Portal to Upload Books</span>
            </a>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm border border-surface-container-high transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>Refresh Live Data</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredBooks.length === 0 ? (
        /* Filter Empty State */
        <div className="py-12 px-6 text-center bg-surface-container-lowest rounded-2xl border border-surface-container max-w-lg mx-auto space-y-3 shadow-xs">
          <span className="material-symbols-outlined text-4xl text-outline mb-1">search_off</span>
          <h3 className="font-title-lg text-primary font-bold">No Treatises Match Your Filter</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            {searchQuery
              ? `No works matched the search query "${searchQuery}".`
              : 'No treatises found in the selected discipline or format.'}
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 px-4 py-2 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:bg-primary transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Catalog Content (Grid Mode) */
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
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold shadow-sm ${book.badgeColor || 'bg-primary-container text-on-primary'}`}>
                    {book.badge || book.disciplineName}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-surface/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm font-medium shadow-xs">
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
                      <span key={i} className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-label-xs font-medium">
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
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          loading="lazy"
                          decoding="async"
                          className="w-8 h-10 object-cover rounded shadow-2xs"
                        />
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
                      <div className="text-on-surface-variant text-label-sm">{book.authorHijriYear}</div>
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
                          <span key={i} className="px-1.5 py-0.5 rounded bg-surface-container-low text-label-xs">
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
    </div>
  );
};
