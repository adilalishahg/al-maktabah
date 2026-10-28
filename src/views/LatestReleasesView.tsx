import React from 'react';
import { Book } from '../types/library';

interface LatestReleasesViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onOpenDownload: (book: Book) => void;
}

export const LatestReleasesView: React.FC<LatestReleasesViewProps> = ({
  books,
  onSelectBook,
  onOpenReader,
  onOpenDownload
}) => {
  const accessions = [
    {
      id: 'acc-1',
      book: books[1], // Mukhtasar Bukhari
      dateHijri: '12 Shawwāl 1445 AH',
      releaseType: 'New Critical Collation',
      notes: 'Collation against 3 Istanbul and Cairo autographs with expanded isnad tree indexing.',
      batchCode: 'ARC-2024-Q2-089'
    },
    {
      id: 'acc-2',
      book: books[3], // Tafsir Ibn Kathir
      dateHijri: '8 Shawwāl 1445 AH',
      releaseType: '10-Volume 4K OCR Package',
      notes: 'Complete ayah mapping with bilingual verse-by-verse footnotes and morphological tagging.',
      batchCode: 'ARC-2024-Q2-084'
    },
    {
      id: 'acc-3',
      book: books[2], // Purification of the Heart
      dateHijri: '28 Ramaḍān 1445 AH',
      releaseType: 'Bilingual Gloss Recension',
      notes: 'Refined English translation with Mauritanian poetic commentary and spiritual remedies index.',
      batchCode: 'ARC-2024-Q1-067'
    },
    {
      id: 'acc-4',
      book: books[0], // Sealed Nectar
      dateHijri: '15 Ramaḍān 1445 AH',
      releaseType: 'High-Density Map Edition',
      notes: 'Includes authenticated historical battle route maps, treaties facsimile, and companion lineages.',
      batchCode: 'ARC-2024-Q1-052'
    }
  ];

  return (
    <div className="w-full space-y-space-xl">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-label-sm uppercase tracking-wider text-tertiary font-semibold">
          <span className="material-symbols-outlined text-sm">new_releases</span>
          <span>Accession Log &amp; Newly Digitized Releases</span>
        </div>
        <h1 className="font-display font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-primary font-bold">
          Latest Scholarly Accessions &amp; Updates
        </h1>
        <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
          Chronological record of newly accessioned codices, peer-reviewed critical editions, and digital apparatus releases added to the Al-Maktabah open repository.
        </p>
      </div>

      <div className="space-y-4">
        {accessions.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-6 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <img
                src={item.book.coverImage}
                alt={item.book.title}
                className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded-lg shadow-xs shrink-0 cursor-pointer"
                onClick={() => onSelectBook(item.book)}
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-[11px] font-semibold">
                    {item.releaseType}
                  </span>
                  <span className="text-xs text-tertiary font-semibold">{item.dateHijri}</span>
                  <span className="text-[11px] font-mono text-outline">{item.batchCode}</span>
                </div>
                <h3 
                  onClick={() => onSelectBook(item.book)}
                  className="font-title-lg text-sm sm:text-base font-bold text-primary hover:text-tertiary transition-colors cursor-pointer"
                >
                  {item.book.title} ({item.book.arabicTitle})
                </h3>
                <p className="text-xs text-on-surface-variant">
                  By {item.book.author} • {item.book.edition}
                </p>
                <p className="text-xs text-on-surface leading-relaxed pt-1">
                  {item.notes}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-end md:self-center w-full sm:w-auto">
              <button
                onClick={() => onOpenReader(item.book)}
                className="flex-1 sm:flex-none justify-center px-4 py-2 bg-primary-container text-on-primary rounded-lg text-xs font-semibold hover:bg-primary transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chrome_reader_mode</span>
                <span>Open Reader</span>
              </button>
              <button
                onClick={() => onOpenDownload(item.book)}
                className="flex-1 sm:flex-none justify-center px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-surface-container-high"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
