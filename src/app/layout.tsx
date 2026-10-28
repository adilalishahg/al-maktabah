import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Al-Maktabah | Digital Library & Archives',
  description:
    'Authentic Islamic Books & Scholarly Knowledge. Preserving and digitizing timeless classical treatises, contemporary research, Qur’anic exegesis, and authenticated hadith collections in pristine typography.',
  keywords: [
    'Islamic Books',
    'Hadith',
    'Tafsir',
    'Fiqh',
    'Digital Library',
    'Islamic Archives',
    'Manuscripts',
    'Al-Maktabah',
  ],
  openGraph: {
    title: 'Al-Maktabah | Digital Library & Archives',
    description:
      'Authentic Islamic Books & Scholarly Knowledge. Preserving and digitizing timeless classical treatises, contemporary research, Qur’anic exegesis, and authenticated hadith collections.',
    type: 'website',
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
      </head>
      <body className="antialiased selection:bg-[#cba72f] selection:text-[#002218]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
