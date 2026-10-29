import type { Metadata } from 'next';
import './globals.css';
import { ScholarlyJsonLd } from '@/components/seo/ScholarlyJsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://al-maktabah.org';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Al-Maktabah (المكتبة) — Academic Islamic Codex & Digital Waqf Repository',
    template: '%s | Al-Maktabah Digital Archives',
  },
  description:
    'Authentic classical Islamic codices, manuscripts, and verified treatises. Digitized with isnād transmission graphs, dual-pane comparative reading, and morphological analysis.',
  keywords: [
    'Islamic Books',
    'Hadith',
    'Tafsir',
    'Fiqh',
    'Aqeedah',
    'Usul al-Fiqh',
    'Isnad Transmission',
    'Bilingual Islamic Manuscripts',
    'Digital Waqf',
    'Al-Maktabah',
    'Arabic Manuscripts OCR',
  ],
  authors: [{ name: 'Al-Maktabah Academic Council' }],
  creator: 'Al-Maktabah Digital Waqf',
  publisher: 'Al-Maktabah Scholarly Foundation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'ar-SA': '/?lang=ar',
    },
  },
  openGraph: {
    title: 'Al-Maktabah (المكتبة) — Academic Islamic Codex Repository',
    description:
      'Authentic classical Islamic codices, manuscripts, and verified treatises with isnād transmission and dual-pane comparative reading.',
    url: siteUrl,
    siteName: 'Al-Maktabah Digital Archives',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200&h=630',
        width: 1200,
        height: 630,
        alt: 'Al-Maktabah Classical Illuminated Manuscripts',
      },
    ],
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Al-Maktabah (المكتبة) — Academic Islamic Codex Repository',
    description:
      'Preserving and digitizing timeless classical Islamic treatises, isnād transmission chains, and illuminated manuscripts.',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200&h=630'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <ScholarlyJsonLd />
      </head>
      <body className="antialiased selection:bg-[#cba72f] selection:text-[#002218]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
