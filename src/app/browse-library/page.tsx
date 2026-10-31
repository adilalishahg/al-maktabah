import type { Metadata } from 'next';
import { BrowseLibraryClient } from './BrowseLibraryClient';

export const metadata: Metadata = {
  title: 'Browse Library Catalog | Al-Maktabah Digital Archives',
  description:
    'Search, filter, and explore classical verified Islamic manuscripts, canonical Hadīth collections, Qur’anic commentaries, and legal treatises.',
  alternates: {
    canonical: '/browse-library',
  },
  openGraph: {
    title: 'Browse Islamic Library Catalog | Al-Maktabah',
    description: 'Explore over 14,000 verified treatises across 28 traditional Islamic disciplines.',
  },
};

export default function BrowseLibraryPage() {
  return <BrowseLibraryClient />;
}

