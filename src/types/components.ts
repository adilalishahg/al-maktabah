import type { Book, CategoryScience, IsnadNode, ReaderTheme, WordAnalysis } from './library';
import type { BookChapter, DetailedBook } from './bookContent';
import type { HomeSettings } from './homeSettings';

/**
 * Prop types for Header navigation bar and daily insight ticker.
 */
export interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  currentTheme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  currentLang: 'EN' | 'AR';
  onLangChange: (lang: 'EN' | 'AR') => void;
}

/**
 * Prop types for Footer global academic attribution and waqf directory.
 */
export interface FooterProps {
  onNavigate: (path: string) => void;
}

/**
 * Prop types for BookDetailModal codex overview and metadata inspector.
 */
export interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
  onDownload: (book: Book) => void;
}

/**
 * Prop types for CommandPalette keyboard-first omni-search modal.
 */
export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  categories: CategoryScience[];
  onSelectBook: (book: Book) => void;
  onNavigate: (path: string) => void;
}

/**
 * Prop types for DownloadModal format selection and download dispatcher.
 */
export interface DownloadModalProps {
  book: Book | null;
  onClose: () => void;
}

/**
 * Prop types for MorphologyModal Arabic tri-literal root analysis.
 */
export interface MorphologyModalProps {
  word: WordAnalysis | null;
  onClose: () => void;
}

/**
 * Prop types for NarratorBiographyModal Hadith isnad transmitter biography.
 */
export interface NarratorBiographyModalProps {
  narrator: IsnadNode | null;
  onClose: () => void;
}

/**
 * Prop types for ScholarlyJsonLd Schema.org SEO injector.
 */
export interface ScholarlyJsonLdProps {
  book?: DetailedBook | Book;
  baseUrl?: string;
}

/**
 * Prop types for CodexPdfReader interactive PDF.js canvas viewer.
 */
export interface CodexPdfReaderProps {
  book: DetailedBook;
  pdfUrl?: string;
  initialPage?: number;
  externalPage?: number;
  externalScale?: number;
  hideHeader?: boolean;
  sidebarOpenExternal?: boolean;
  onToggleSidebarExternal?: () => void;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
  onJumpToChapter?: (chapter: BookChapter) => void;
  onSwitchToMatn?: () => void;
}

/**
 * Prop types for AdminHomeSettingsView master homepage section manager.
 */
export interface AdminHomeSettingsViewProps {
  settings: HomeSettings;
  onSaveSettings: (updated: HomeSettings) => Promise<void>;
  isSaving: boolean;
  successMessage: string;
  books: DetailedBook[];
  categories: CategoryScience[];
}
