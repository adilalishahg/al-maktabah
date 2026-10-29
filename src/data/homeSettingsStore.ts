import { HomeSettings } from '../types/homeSettings';
import { ReadingSection, IsnadNode, Footnote, WordAnalysis } from '../types/library';
import { PRIMARY_READING_SECTION } from './mockLibrary';
import { DetailedBook } from '../types/bookContent';

const STORAGE_KEY = 'al_maktabah_home_settings_v1';

export const DEFAULT_HOME_SETTINGS: HomeSettings = {
  sections: {
    dailyBanner: {
      enabled: true,
      arabicText: '« رَبِّ زِدْنِي عِلْمًا »',
      translation: '“My Lord, increase me in knowledge.”',
      reference: 'Surah Ṭā-Hā 20:114',
    },
    heroSection: {
      enabled: true,
      centerBookId: 'riyad-salihin',
      leftBookId: 'bidayah-wan-nihayah',
      rightBookId: 'ihya-ulum-al-din',
    },
    categoriesGrid: {
      enabled: true,
      title: 'Classified Sciences of Knowledge',
      subtitle: 'Systematically organized primary sources across canonical jurisprudence, exegesis, transmitted prophetic traditions, and sacred theology.',
      maxDisplay: 6,
    },
    featuredShelf: {
      enabled: true,
      title: 'Featured Critical Editions',
      subtitle: 'Rigorous recensions with isnād apparatus, academic footnotes, and dual-language parallel views.',
      selectionMode: 'all',
      selectedBookIds: [],
    },
    readerPreview: {
      enabled: true,
      sourceMode: 'custom',
      selectedBookId: 'mukhtasar-bukhari',
      selectedChapterId: '1',
      audioActive: false,
      audioReciter: 'Sheikh Mishary Rashid Alafasy (Kitāb Bad’ al-Waḥy)',
      audioDuration: '00:42 / 01:15',
    },
    preservationSection: {
      enabled: true,
      title: 'Our Commitment to Classical Preservation',
      subtitle: 'Knowledge in Islam is a communal obligation (Farḍ Kifāyah) and a timeless continuous charity (Ṣadaqah Jāriyah).',
    },
    newsletterSection: {
      enabled: true,
      title: 'Join 140,000+ Seekers & Researchers of Sacred Knowledge',
      subtitle: 'Receive monthly digests of newly digitized manuscripts, authenticated translations, and academic reading roadmaps.',
    },
  },
  readerSection: { ...PRIMARY_READING_SECTION },
  updatedAt: new Date().toISOString(),
};

/**
 * Retrieves the current homepage configuration and featured reader data.
 */
export function getHomeSettings(): HomeSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_HOME_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_HOME_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    // Deep merge with defaults to safeguard against missing keys in older cached states
    return {
      ...DEFAULT_HOME_SETTINGS,
      ...parsed,
      sections: {
        ...DEFAULT_HOME_SETTINGS.sections,
        ...(parsed.sections || {}),
        dailyBanner: { ...DEFAULT_HOME_SETTINGS.sections.dailyBanner, ...(parsed.sections?.dailyBanner || {}) },
        heroSection: { ...DEFAULT_HOME_SETTINGS.sections.heroSection, ...(parsed.sections?.heroSection || {}) },
        categoriesGrid: { ...DEFAULT_HOME_SETTINGS.sections.categoriesGrid, ...(parsed.sections?.categoriesGrid || {}) },
        featuredShelf: { ...DEFAULT_HOME_SETTINGS.sections.featuredShelf, ...(parsed.sections?.featuredShelf || {}) },
        readerPreview: { ...DEFAULT_HOME_SETTINGS.sections.readerPreview, ...(parsed.sections?.readerPreview || {}) },
        preservationSection: { ...DEFAULT_HOME_SETTINGS.sections.preservationSection, ...(parsed.sections?.preservationSection || {}) },
        newsletterSection: { ...DEFAULT_HOME_SETTINGS.sections.newsletterSection, ...(parsed.sections?.newsletterSection || {}) },
      },
      readerSection: {
        ...DEFAULT_HOME_SETTINGS.readerSection,
        ...(parsed.readerSection || {}),
      },
    };
  } catch (err) {
    console.warn('Failed reading home settings from localStorage:', err);
    return DEFAULT_HOME_SETTINGS;
  }
}

/**
 * Saves homepage configuration and dispatches storage & custom events for live updates across views.
 */
export function saveHomeSettings(settings: HomeSettings): HomeSettings {
  const updated: HomeSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Notify components in current window
      window.dispatchEvent(new CustomEvent('al_maktabah_settings_updated', { detail: updated }));
      // Standard storage event
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Failed saving home settings to localStorage:', err);
    }
  }

  return updated;
}

/**
 * Resets home settings back to default
 */
export function resetHomeSettings(): HomeSettings {
  return saveHomeSettings(DEFAULT_HOME_SETTINGS);
}

/**
 * Automatically transforms an uploaded/stored DetailedBook into a full ReadingSection
 * for display in the Home Codex Reader.
 */
export function buildReadingSectionFromBook(
  book: DetailedBook,
  chapterId?: string
): ReadingSection {
  const chapter = (chapterId ? book.chapters?.find((c) => c.id === chapterId) : null) ||
    book.chapters?.[0] || {
      id: 'ch-1',
      number: 1,
      title: 'Chapter 1',
      arabicTitle: book.arabicTitle,
      startPage: 1,
      content: book.description || 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      translation: book.description || 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      notes: '',
    };

  // Attempt to parse out Lead/Isnad vs Matn from Arabic content
  let arabicLead = `عَنْ ${book.author} رَحِمَهُ اللَّهُ قَالَ فِي كِتَابِهِ:`;
  let arabicMatn = chapter.content || '« إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ »';

  if (chapter.content && chapter.content.includes('\n\n')) {
    const parts = chapter.content.split('\n\n');
    arabicLead = parts[0].trim();
    arabicMatn = parts.slice(1).join('\n\n').trim();
  }

  // Attempt to parse out Lead vs Highlight from translation
  let englishLead = `Narrated in ${book.title}:`;
  let englishHighlight = chapter.translation || 'Sacred knowledge transmitted with authentic lineage.';
  let englishSubsequent = chapter.notes || '';

  if (chapter.translation && chapter.translation.includes('"')) {
    const quoteStart = chapter.translation.indexOf('"');
    const quoteEnd = chapter.translation.lastIndexOf('"');
    if (quoteEnd > quoteStart) {
      englishLead = chapter.translation.substring(0, quoteStart).trim();
      englishHighlight = chapter.translation.substring(quoteStart, quoteEnd + 1).trim();
      englishSubsequent = chapter.translation.substring(quoteEnd + 1).trim();
    }
  }

  // Generate an authentic Isnad Chain representing the book's scholarly lineage
  const defaultIsnad: IsnadNode[] = [
    {
      id: 'node-author',
      name: book.author || 'Author',
      arabicName: book.arabicTitle ? book.author : 'المصنف',
      rank: 'Leading Imām',
      reliability: 'Thiqah Thabt (Author & Verifier of Codex)',
      birthDeathAH: book.authorHijriYear || '1445 AH',
      region: 'Islamic Caliphate',
      bio: `Author and compiler of ${book.title}. Preserved with critical apparatus in Al-Maktabah digital codices.`,
    },
    {
      id: 'node-chain-2',
      name: 'Scholarly Council Recension',
      arabicName: 'لجنة التحقيق العلمي',
      rank: 'Leading Imām',
      reliability: 'Peer-reviewed Academic Edition',
      birthDeathAH: 'Extant 1445 AH',
      region: 'Digital Archive',
      bio: `Transmitted and verified across multiple primary manuscripts by the Academic Waqf Committee.`,
    },
  ];

  // Footnote from chapter notes or book description
  const defaultFootnotes: Footnote[] = [
    {
      id: `fn-${book.id}-1`,
      code: 'Commentary [1.1]',
      title: `${book.title} Critical Apparatus`,
      scholar: book.author || 'Scholarly Editorial Board',
      scholarDeathAH: book.authorHijriYear || '1445 AH',
      text: chapter.notes || book.description || 'Verified against primary manuscript recensions with full philological annotations.',
    },
  ];

  // Word analyses extracted or sample
  const sampleWords: WordAnalysis[] = [
    {
      arabic: 'الْعِلْم',
      root: 'ع-ل-م',
      transliteration: 'al-‘Ilm',
      pos: 'Noun (Ism)',
      meaning: 'Knowledge, sacred cognition, discernment',
      morphologyNote: 'Definite singular trilateral root ‘ayn-lām-mīm denoting certainty.',
    },
    {
      arabic: 'النِّيَّة',
      root: 'ن-و-ي',
      transliteration: 'an-Niyyah',
      pos: 'Noun (Ism)',
      meaning: 'Intention, resolve, pure purpose',
      morphologyNote: 'Feminine noun denoting decisive heart commitment before deed.',
    },
  ];

  return {
    id: `reader-section-${book.id}`,
    bookId: book.id,
    bookTitle: book.title,
    bookTitleArabic: book.arabicTitle,
    chapterNumber: chapter.number || 1,
    chapterTitleEn: chapter.title || 'Foundational Chapter',
    chapterTitleAr: chapter.arabicTitle || book.arabicTitle,
    entryNumber: 1,
    totalEntries: (book.chapters && book.chapters.length > 0) ? book.chapters.length : 1,
    narrator: book.author || 'Authenticated Narration',
    authenticityStatus: book.verified ? 'Verified Status: Academic Consensus (Muḥaqqaq)' : 'Scholarly Edition',
    englishHeading: `Narrated in ${book.title}`,
    englishLeadText: englishLead,
    englishHighlightText: englishHighlight,
    englishSubsequentText: englishSubsequent,
    arabicLead: arabicLead,
    arabicMatn: arabicMatn,
    arabicSubtext: chapter.arabicTitle || book.arabicTitle,
    isnadChain: defaultIsnad,
    footnotes: defaultFootnotes,
    wordAnalyses: sampleWords,
    totalPages: book.pages || 100,
    currentPage: chapter.startPage || 1,
  };
}

