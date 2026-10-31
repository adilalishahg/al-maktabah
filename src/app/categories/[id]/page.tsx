import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INITIAL_CATEGORIES } from '@/data/categoryStore';
import { CategoryDetailClient } from './CategoryDetailClient';

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = INITIAL_CATEGORIES.find((c) => c.id.toLowerCase() === id.toLowerCase());

  if (!category) {
    return {
      title: 'Discipline Not Found | Al-Maktabah',
    };
  }

  return {
    title: `${category.name} (${category.arabicName}) | Al-Maktabah`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Al-Maktabah Canonical Archives`,
      description: category.description,
    },
    alternates: {
      canonical: `/categories/${category.id}`,
    },
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = INITIAL_CATEGORIES.find((c) => c.id.toLowerCase() === id.toLowerCase());

  if (!category) {
    notFound();
  }

  return <CategoryDetailClient category={category} />;
}

