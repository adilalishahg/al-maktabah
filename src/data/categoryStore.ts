import { CategoryScience } from '../types/library';
import { CATEGORIES } from './mockLibrary';

const CATEGORIES_STORAGE_KEY = 'al_maktabah_categories_v1';

export const INITIAL_CATEGORIES: CategoryScience[] = CATEGORIES;

export const getStoredCategories = (): CategoryScience[] => {
  if (typeof window === 'undefined') {
    return INITIAL_CATEGORIES;
  }
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATEGORIES;
  } catch (err) {
    console.error('Failed to load categories from local storage:', err);
    return INITIAL_CATEGORIES;
  }
};

export const saveCategory = (category: CategoryScience): CategoryScience[] => {
  const current = getStoredCategories();
  const index = current.findIndex((c) => c.id === category.id);
  let updated: CategoryScience[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = category;
  } else {
    updated = [...current, category];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
  return updated;
};

export const deleteCategory = (id: string): CategoryScience[] => {
  const current = getStoredCategories();
  const updated = current.filter((c) => c.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
  return updated;
};
