import { Footnote, IsnadNode, ReadingSection, WordAnalysis } from './library';

export interface DailyBannerConfig {
  enabled: boolean;
  arabicText: string;
  translation: string;
  reference: string;
}

export interface HeroSectionConfig {
  enabled: boolean;
  centerBookId?: string;
  leftBookId?: string;
  rightBookId?: string;
  headline?: string;
  subheadline?: string;
  description?: string;
}

export interface CategoriesGridConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  maxDisplay: number;
}

export interface FeaturedShelfConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  selectionMode: 'all' | 'custom';
  selectedBookIds: string[];
}

export interface ReaderPreviewConfig {
  enabled: boolean;
  sourceMode: 'book' | 'custom';
  selectedBookId?: string;
  selectedChapterId?: string;
  audioActive?: boolean;
  audioReciter?: string;
  audioDuration?: string;
}

export interface SimpleSectionConfig {
  enabled: boolean;
  title?: string;
  subtitle?: string;
}

export interface HomeSectionsConfig {
  dailyBanner: DailyBannerConfig;
  heroSection: HeroSectionConfig;
  categoriesGrid: CategoriesGridConfig;
  featuredShelf: FeaturedShelfConfig;
  readerPreview: ReaderPreviewConfig;
  preservationSection: SimpleSectionConfig;
  newsletterSection: SimpleSectionConfig;
}

export interface HomeSettings {
  sections: HomeSectionsConfig;
  readerSection: ReadingSection;
  updatedAt: string;
}

