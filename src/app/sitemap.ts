import { MetadataRoute } from 'next';
import { INITIAL_DETAILED_BOOKS } from '@/data/bookStore';
import { INITIAL_CATEGORIES } from '@/data/categoryStore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://al-maktabah.org';
  const currentDate = new Date().toISOString();

  // Core Static Scholarly Portals
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse-library`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/manuscripts`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic Discipline and Category Science routes
  const categoryRoutes: MetadataRoute.Sitemap = INITIAL_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/categories/${cat.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Canonical Scholarly Codex Pages
  const bookRoutes: MetadataRoute.Sitemap = INITIAL_DETAILED_BOOKS.map((book) => ({
    url: `${baseUrl}/books/${book.id}`,
    lastModified: book.updatedAt || currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...bookRoutes];
}

