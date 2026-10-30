import { useState, useMemo } from 'react';
import type { Book, CategoryScience } from '@/types/library';

export type SortOption = 'rating' | 'pages' | 'title' | 'hijri';
export type ViewMode = 'grid' | 'table';

export interface UseCatalogSearchOptions {
  books: Book[];
  categories?: CategoryScience[];
  initialQuery?: string;
}

export interface DisciplineCount {
  id: string;
  label: string;
  count: number;
}

export interface UseCatalogSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDiscipline: string;
  setSelectedDiscipline: (discipline: string) => void;
  selectedFormat: string;
  setSelectedFormat: (format: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  disciplines: DisciplineCount[];
  filteredBooks: Book[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

const DEFAULT_DISCIPLINE_KEYS = [
  { id: 'hadith', label: 'Hadīth & Isnād' },
  { id: 'tafsir', label: 'Tafsīr & Qur’an' },
  { id: 'fiqh', label: 'Fiqh & Jurisprudence' },
  { id: 'seerah', label: 'Sīrah & History' },
  { id: 'aqeedah', label: '‘Aqīdah & Creed' },
  { id: 'tazkiyah', label: 'Tazkiyah & Adab' },
];

/**
 * Custom hook encapsulating search query filtering, classification matching,
 * format filtering, and sorting for the classical library catalog.
 */
export function useCatalogSearch({
  books,
  categories = [],
  initialQuery = '',
}: UseCatalogSearchOptions): UseCatalogSearchReturn {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Compute disciplines with live counts
  const disciplines = useMemo<DisciplineCount[]>(() => {
    const list: DisciplineCount[] = [
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
      DEFAULT_DISCIPLINE_KEYS.forEach((d) => {
        const count = books.filter(
          (b) => b.discipline === d.id || (d.id === 'seerah' && b.discipline === 'history')
        ).length;
        list.push({ id: d.id, label: d.label, count });
      });
    }
    return list;
  }, [books, categories]);

  // Filter and sort books according to active parameters
  const filteredBooks = useMemo<Book[]>(() => {
    const q = searchQuery.trim().toLowerCase();

    return books
      .filter((b) => {
        const matchesQuery =
          !q ||
          b.title.toLowerCase().includes(q) ||
          b.arabicTitle.includes(searchQuery.trim()) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q);

        const matchesDiscipline =
          selectedDiscipline === 'all' ||
          b.discipline === selectedDiscipline ||
          (selectedDiscipline === 'seerah' && b.discipline === 'history');

        const matchesFormat =
          selectedFormat === 'all' ||
          b.formats.some((f) => f.toLowerCase().includes(selectedFormat.toLowerCase()));

        return matchesQuery && matchesDiscipline && matchesFormat;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'pages') return b.pages - a.pages;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [books, searchQuery, selectedDiscipline, selectedFormat, sortBy]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedDiscipline !== 'all' || selectedFormat !== 'all' || sortBy !== 'rating'
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDiscipline('all');
    setSelectedFormat('all');
    setSortBy('rating');
  };

  return {
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
    hasActiveFilters,
    clearFilters,
  };
}

