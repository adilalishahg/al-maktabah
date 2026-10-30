import { useState, useEffect, useCallback } from 'react';
import type { ReaderTheme } from '@/types/library';

export interface UseAppThemeReturn {
  currentTheme: ReaderTheme;
  setTheme: (theme: ReaderTheme) => void;
  toggleTheme: () => void;
  currentLang: 'EN' | 'AR';
  setLang: (lang: 'EN' | 'AR') => void;
  toggleLang: () => void;
}

const THEME_STORAGE_KEY = 'al_maktabah_theme_v1';
const LANG_STORAGE_KEY = 'al_maktabah_lang_v1';

const THEME_ROTATION: ReaderTheme[] = ['parchment', 'sepia', 'night'];

/**
 * Custom hook encapsulating theme switching, HTML/body class synchronization,
 * language state, and local storage persistence.
 */
export function useAppTheme(): UseAppThemeReturn {
  const [currentTheme, setCurrentTheme] = useState<ReaderTheme>('parchment');
  const [currentLang, setCurrentLang] = useState<'EN' | 'AR'>('EN');

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ReaderTheme | null;
      if (storedTheme && THEME_ROTATION.includes(storedTheme)) {
        setCurrentTheme(storedTheme);
      }
      const storedLang = localStorage.getItem(LANG_STORAGE_KEY) as 'EN' | 'AR' | null;
      if (storedLang === 'EN' || storedLang === 'AR') {
        setCurrentLang(storedLang);
      }
    } catch {
      // Ignore if localStorage is inaccessible
    }
  }, []);

  // Sync DOM classes whenever theme changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('theme-sepia', 'theme-night');
    if (currentTheme === 'sepia') {
      document.body.classList.add('theme-sepia');
    } else if (currentTheme === 'night') {
      document.body.classList.add('theme-night');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    } catch {
      // Ignore
    }
  }, [currentTheme]);

  // Sync language changes
  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, currentLang);
    } catch {
      // Ignore
    }
  }, [currentLang]);

  const setTheme = useCallback((theme: ReaderTheme) => {
    setCurrentTheme(theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prev) => {
      const nextIdx = (THEME_ROTATION.indexOf(prev) + 1) % THEME_ROTATION.length;
      return THEME_ROTATION[nextIdx];
    });
  }, []);

  const setLang = useCallback((lang: 'EN' | 'AR') => {
    setCurrentLang(lang);
  }, []);

  const toggleLang = useCallback(() => {
    setCurrentLang((prev) => (prev === 'EN' ? 'AR' : 'EN'));
  }, []);

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    currentLang,
    setLang,
    toggleLang,
  };
}

