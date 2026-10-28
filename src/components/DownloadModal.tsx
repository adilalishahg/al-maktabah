import React, { useState } from 'react';
import { Book } from '../types/library';

interface DownloadModalProps {
  book: Book | null;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ book, onClose }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  if (!book) return null;

  const handleDownload = (format: string) => {
    setDownloadingFormat(format);
    setDownloadCompleted(false);

    try {
      if (book.pdfUrl) {
        const link = document.createElement('a');
        link.href = book.pdfUrl;
        link.download = `${book.title.replace(/[^\w\s-]/g, '_')}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate open-access treatise manifest
        const content = `========================================================
AL-MAKTABAH DIGITAL ARCHIVES (المكتبة الرقمية)
Autonomous Waqf Academic Repository
========================================================

Title: ${book.title}
Arabic: ${book.arabicTitle}
Author: ${book.author} (${book.authorHijriYear || 'Classical Era'})
Discipline: ${book.disciplineName}
Academic Edition: ${book.edition}
Format Selected: ${format}
Volumes: ${book.volumes} | Pages: ${book.pages}

Summary & Abstract:
${book.description}

Preserved under Academic Waqf (Open Access).
========================================================`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${book.title.replace(/[^\w\s-]/g, '_')}_Manifest.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.warn('Download handler notice:', e);
    }

    setTimeout(() => {
      setDownloadingFormat(null);
      setDownloadCompleted(true);
      setTimeout(() => {
        setDownloadCompleted(false);
      }, 3500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary-container text-on-primary p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary-fixed shrink-0">
              <span className="material-symbols-outlined text-xl">download</span>
            </span>
            <div>
              <span className="font-label-sm uppercase tracking-wider text-tertiary-fixed text-xs font-semibold block">
                Free Academic Waqf Download
              </span>
              <h3 className="font-title-md font-bold text-on-primary leading-tight mt-0.5">{book.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-on-primary-container hover:text-on-primary p-1">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container">
            <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded shadow-xs shrink-0" />
            <div className="min-w-0">
              <div className="font-arabic text-base font-bold text-primary truncate">{book.arabicTitle}</div>
              <div className="text-xs text-on-surface-variant">{book.author} ({book.authorHijriYear})</div>
              <div className="text-xs text-tertiary font-medium mt-0.5">{book.pages} pages • {book.sizeMb} MB total</div>
            </div>
          </div>

          {downloadCompleted && (
            <div className="p-3 bg-primary-container/10 border border-primary-container/30 rounded-xl text-xs text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">check_circle</span>
              <span><strong>Download initiated!</strong> Open-access edition saved without cost or DRM.</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="font-label-sm uppercase text-on-surface-variant text-xs font-semibold">Available Format Bundles</p>
            
            <div className="space-y-2">
              <button
                onClick={() => handleDownload('PDF Critical Edition')}
                disabled={downloadingFormat !== null}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-surface-container hover:border-primary hover:bg-surface-container-low transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold text-xs">PDF</span>
                  <div>
                    <div className="font-title-md text-sm font-semibold text-on-surface">Critical Edition PDF</div>
                    <div className="text-xs text-on-surface-variant">Includes complete tashkīl, isnād indices, and pagination ({book.sizeMb} MB)</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-lg">
                  {downloadingFormat === 'PDF Critical Edition' ? 'hourglass_top' : 'download'}
                </span>
              </button>

              <button
                onClick={() => handleDownload('EPUB Reflowable')}
                disabled={downloadingFormat !== null}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-surface-container hover:border-primary hover:bg-surface-container-low transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary font-bold text-xs">EPUB</span>
                  <div>
                    <div className="font-title-md text-sm font-semibold text-on-surface">Reflowable EPUB / Kindle</div>
                    <div className="text-xs text-on-surface-variant">Optimized for e-readers, iPads, and mobile screens ({(book.sizeMb * 0.35).toFixed(1)} MB)</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-lg">
                  {downloadingFormat === 'EPUB Reflowable' ? 'hourglass_top' : 'download'}
                </span>
              </button>

              <button
                onClick={() => handleDownload('Searchable OCR Text')}
                disabled={downloadingFormat !== null}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-surface-container hover:border-primary hover:bg-surface-container-low transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary font-bold text-xs">TXT</span>
                  <div>
                    <div className="font-title-md text-sm font-semibold text-on-surface">Raw TEI / XML Plain Text</div>
                    <div className="text-xs text-on-surface-variant">For researchers, NLP lemmatization, and computational corpus analysis</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-lg">
                  {downloadingFormat === 'Searchable OCR Text' ? 'hourglass_top' : 'download'}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary">verified</span> CC-BY-NC 4.0 License
            </span>
            <button
              onClick={onClose}
              className="text-primary font-semibold hover:underline"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
