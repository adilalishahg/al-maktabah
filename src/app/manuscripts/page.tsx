import type { Metadata } from 'next';
import { ManuscriptsClient } from './ManuscriptsClient';

export const metadata: Metadata = {
  title: 'Historical Manuscripts & Archival Folios | Al-Maktabah',
  description:
    'High-resolution archival gallery of rare classical Islamic manuscripts: Andalusian, Ottoman, and Abbasid calligraphic folios with paleographic analysis.',
  alternates: {
    canonical: '/manuscripts',
  },
  openGraph: {
    title: 'Rare Islamic Manuscripts & Archival Folios | Al-Maktabah',
    description: 'Explore high-resolution digital scans of timeless classical Islamic manuscripts.',
  },
};

export default function ManuscriptsPage() {
  return <ManuscriptsClient />;
}

