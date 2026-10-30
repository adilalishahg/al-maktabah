import React, { useState } from 'react';
import type { HomeViewProps } from '../types/views';
import { DEFAULT_HOME_SETTINGS } from '../data/homeSettingsStore';
import {
  HomeDailyBanner,
  HomeHeroSection,
  HomeCategoriesGrid,
  HomeFeaturedShelf,
  HomeReaderSpotlight,
  HomeManuscriptsSection,
  HomeWaqfMission,
} from '../components/home';

export const HomeView: React.FC<HomeViewProps> = ({
  books,
  categories,
  readingSection,
  homeSettings,
  onSelectBook,
  onOpenReader,
  onOpenDownload,
  onOpenNarrator,
  onOpenWordAnalysis,
  onNavigate,
}) => {
  const sections = homeSettings?.sections || DEFAULT_HOME_SETTINGS.sections;
  const activeReader = homeSettings?.readerSection || readingSection;

  // Newsletter state
  const [dispatchEmail, setDispatchEmail] = useState('');
  const [dispatchSubscribed, setDispatchSubscribed] = useState(false);

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchEmail) return;
    setDispatchSubscribed(true);
    setTimeout(() => {
      setDispatchEmail('');
      setDispatchSubscribed(false);
    }, 4500);
  };

  return (
    <div className="w-full">
      {/* Top Daily Ayah / Hadith Calligraphic Banner */}
      {sections.dailyBanner?.enabled && (
        <HomeDailyBanner banner={sections.dailyBanner} />
      )}

      {/* Hero Section */}
      {sections.heroSection?.enabled !== false && (
        <HomeHeroSection
          hero={sections.heroSection}
          books={books}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onNavigate={onNavigate}
        />
      )}

      {/* Classification of Islamic Sciences Grid */}
      {sections.categoriesGrid?.enabled !== false && (
        <HomeCategoriesGrid
          categoriesConfig={sections.categoriesGrid}
          categories={categories}
          onNavigate={onNavigate}
        />
      )}

      {/* Curated Scholarly Shelves & Filters */}
      {sections.featuredShelf?.enabled !== false && (
        <HomeFeaturedShelf
          shelfConfig={sections.featuredShelf}
          books={books}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onOpenDownload={onOpenDownload}
        />
      )}

      {/* Reader Spotlight / Interactive Preview */}
      {sections.readerPreview?.enabled !== false && (
        <HomeReaderSpotlight
          readerConfig={sections.readerPreview}
          activeReader={activeReader}
          onOpenReader={onOpenReader}
          onOpenNarrator={onOpenNarrator}
          onOpenWordAnalysis={onOpenWordAnalysis}
        />
      )}

      {/* Classical Preservation Mission */}
      {sections.preservationSection?.enabled !== false && (
        <HomeManuscriptsSection config={sections.preservationSection} />
      )}

      {/* Scholarly Newsletter & Digest Strip */}
      {sections.newsletterSection?.enabled !== false && (
        <HomeWaqfMission
          config={sections.newsletterSection}
          dispatchSubscribed={dispatchSubscribed}
          dispatchEmail={dispatchEmail}
          setDispatchEmail={setDispatchEmail}
          handleDispatchSubmit={handleDispatchSubmit}
        />
      )}
    </div>
  );
};
