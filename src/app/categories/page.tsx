import type { Metadata } from 'next';
import { CategoriesClient } from './CategoriesClient';

export const metadata: Metadata = {
  title: 'Tartīb al-‘Ulūm — 28 Canonical Islamic Sciences | Al-Maktabah',
  description:
    'Comprehensive classification of Islamic knowledge: Tafsīr, Hadīth, Usūl al-Fiqh, Jurisprudence, ‘Aqīdah, and Arabic Philology.',
  alternates: {
    canonical: '/categories',
  },
  openGraph: {
    title: 'Classified Sciences of Sacred Knowledge | Al-Maktabah',
    description: 'Explore the 28 canonical Islamic disciplines and foundational research paths.',
  },
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}

