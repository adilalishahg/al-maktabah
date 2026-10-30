import { useState, useCallback, useEffect } from 'react';
import type { HomeSettings } from '@/types/homeSettings';
import type { DetailedBook } from '@/types/bookContent';
import { getHomeSettings, saveHomeSettings, buildReadingSectionFromBook } from '@/data/homeSettingsStore';

export interface UseHomeSettingsOptions {
  getAuthHeaders?: (extraHeaders?: Record<string, string>) => Record<string, string>;
  autoLoad?: boolean;
}

export interface UseHomeSettingsReturn {
  homeSettings: HomeSettings;
  setHomeSettings: React.Dispatch<React.SetStateAction<HomeSettings>>;
  isSavingSettings: boolean;
  settingsSavedSuccess: string;
  loadSettings: () => Promise<void>;
  saveHomeSettingsMutation: (updated: HomeSettings) => Promise<boolean>;
  setBookAsHomeReader: (book: DetailedBook, chapterId?: string) => Promise<boolean>;
}

/**
 * Custom hook encapsulating home settings hydration, synchronization with MongoDB backend,
 * local storage caching, and instant reader section propagation.
 */
export function useHomeSettings({
  getAuthHeaders,
  autoLoad = true,
}: UseHomeSettingsOptions = {}): UseHomeSettingsReturn {
  const [homeSettings, setHomeSettings] = useState<HomeSettings>(() => getHomeSettings());
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState<string>('');

  const getHeaders = useCallback(
    (extra?: Record<string, string>) => {
      if (getAuthHeaders) return getAuthHeaders(extra);
      const headers: Record<string, string> = { ...extra };
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('al_maktabah_admin_token') : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-admin-token'] = token;
      }
      return headers;
    },
    [getAuthHeaders]
  );

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setHomeSettings(json.data);
          saveHomeSettings(json.data);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API fetch settings fallback:', err);
    }
    setHomeSettings(getHomeSettings());
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadSettings();
    }
  }, [autoLoad, loadSettings]);

  const saveHomeSettingsMutation = useCallback(
    async (updated: HomeSettings): Promise<boolean> => {
      setIsSavingSettings(true);
      setSettingsSavedSuccess('');

      // 1. Instant local persistence and event broadcast
      saveHomeSettings(updated);
      setHomeSettings(updated);

      // 2. MongoDB Backend API persistence
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: getHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(updated),
        });

        if (res.ok) {
          setSettingsSavedSuccess('✓ Saved & Published live to Homepage!');
        } else {
          setSettingsSavedSuccess('✓ Saved locally in browser cache.');
        }
        setIsSavingSettings(false);
        setTimeout(() => setSettingsSavedSuccess(''), 4500);
        return res.ok;
      } catch (err) {
        console.warn('Backend settings save notice:', err);
        setSettingsSavedSuccess('✓ Saved locally in browser cache.');
        setIsSavingSettings(false);
        setTimeout(() => setSettingsSavedSuccess(''), 4500);
        return false;
      }
    },
    [getHeaders]
  );

  const setBookAsHomeReader = useCallback(
    async (book: DetailedBook, chapterId?: string): Promise<boolean> => {
      const generatedSection = buildReadingSectionFromBook(book, chapterId);
      const updated: HomeSettings = {
        ...homeSettings,
        sections: {
          ...homeSettings.sections,
          readerPreview: {
            ...homeSettings.sections.readerPreview,
            enabled: true,
            sourceMode: 'book',
            selectedBookId: book.id,
            selectedChapterId: chapterId || book.chapters?.[0]?.id || 'ch-1',
          },
        },
        readerSection: generatedSection,
      };
      return saveHomeSettingsMutation(updated);
    },
    [homeSettings, saveHomeSettingsMutation]
  );

  return {
    homeSettings,
    setHomeSettings,
    isSavingSettings,
    settingsSavedSuccess,
    loadSettings,
    saveHomeSettingsMutation,
    setBookAsHomeReader,
  };
}
