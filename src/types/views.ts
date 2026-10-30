import type { Book, CategoryScience, Discipline, IsnadNode, ManuscriptCodex, ReaderTheme, ReadingSection, WordAnalysis } from './library';
import type { BookChapter, DetailedBook } from './bookContent';
import type { HomeSettings } from './homeSettings';

/**
 * Prop types for HomeView presentational template.
 */
export interface HomeViewProps {
  books: Book[];
  categories: CategoryScience[];
  readingSection: ReadingSection;
  homeSettings?: HomeSettings;
  onSelectBook: (book: Book) => void;
  onOpenReader: (book?: Book) => void;
  onOpenDownload: (book: Book) => void;
  onOpenNarrator: (narrator: IsnadNode) => void;
  onOpenWordAnalysis: (word: WordAnalysis) => void;
  onNavigate: (path: string) => void;
  onSearchQuery: (query: string) => void;
}

/**
 * Prop types for BookReaderView master codex reader viewport.
 */
export interface BookReaderViewProps {
  book: DetailedBook;
  initialChapterId?: string;
  onNavigate: (path: string) => void;
  onOpenAdminEdit?: (book: DetailedBook) => void;
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
}

/**
 * Prop types for BrowseLibraryView catalog search & filtering viewport.
 */
export interface BrowseLibraryViewProps {
  books: Book[];
  categories?: CategoryScience[];
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onOpenDownload: (book: Book) => void;
  initialQuery?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

/**
 * Prop types for CategoriesView 28 Islamic sciences classification tree.
 */
export interface CategoriesViewProps {
  categories: CategoryScience[];
  books?: Book[];
  onSelectCategory: (categoryId: string) => void;
  onNavigate: (path: string) => void;
}

/**
 * Prop types for AdminDashboardView administrative analytics & management.
 */
export interface AdminDashboardViewProps {
  onOpenReader: (book: DetailedBook, chapterId?: string) => void;
  onNavigate: (path: string) => void;
}

/**
 * Prop types for LatestReleasesView newest additions showcase.
 */
export interface LatestReleasesViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onOpenDownload: (book: Book) => void;
}

/**
 * Prop types for ManuscriptsView historic illuminated codex archive.
 */
export interface ManuscriptsViewProps {
  manuscripts: ManuscriptCodex[];
}

/**
 * Prop types for ReaderStudioView comparative scholarly studio.
 */
export interface ReaderStudioViewProps {
  initialBook?: Book;
  allBooks: Book[];
  readingSection: ReadingSection;
  onOpenNarrator: (narrator: IsnadNode) => void;
  onOpenWordAnalysis: (word: WordAnalysis) => void;
  onNavigateHome: () => void;
}

