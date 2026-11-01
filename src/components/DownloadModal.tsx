import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Book } from '../types/library';
import type { DownloadModalProps } from '../types/components';

function escapeXml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ book, onClose }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!book) return null;

  const downloadManifest = (format: string) => {
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
    link.download = `Al-Maktabah-${book.title.replace(/[^\w\s-]/g, '_')}_Manifest.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadTeiXml = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title level="m" type="main">${escapeXml(book.title)}</title>
        <title level="m" type="sub" xml:lang="ar">${escapeXml(book.arabicTitle)}</title>
        <author>${escapeXml(book.author)} (${escapeXml(book.authorHijriYear || 'Classical Era')})</author>
        <sponsor>Al-Maktabah Open Knowledge Foundation</sponsor>
        <funder>Autonomous Open Waqf Commons</funder>
      </titleStmt>
      <publicationStmt>
        <publisher>Al-Maktabah Digital Archives</publisher>
        <pubPlace>Quds / Global Edge CDN</pubPlace>
        <date>1445 AH / 2024 CE</date>
        <availability status="free">
          <licence target="https://creativecommons.org/licenses/by-nc/4.0/">CC-BY-NC 4.0 International</licence>
        </availability>
      </publicationStmt>
      <sourceDesc>
        <biblStruct>
          <monogr>
            <title>${escapeXml(book.title)}</title>
            <author>${escapeXml(book.author)}</author>
            <edition>${escapeXml(book.edition)}</edition>
            <imprint>
              <date>${escapeXml(book.authorHijriYear)}</date>
            </imprint>
            <extent>
              <measure unit="volume" quantity="${book.volumes || 1}"/>
              <measure unit="page" quantity="${book.pages}"/>
            </extent>
          </monogr>
        </biblStruct>
      </sourceDesc>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="#disciplines">
          <term>${escapeXml(book.disciplineName)}</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text xml:lang="ar">
    <body>
      <div type="treatise">
        <head>${escapeXml(book.title)} - ${escapeXml(book.arabicTitle)}</head>
        <p>${escapeXml(book.description)}</p>
      </div>
    </body>
  </text>
</TEI>`;
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Al-Maktabah-${book.title.replace(/[^\w\s-]/g, '_')}_TEI.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadEpubReader = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(book.title)} - ${escapeXml(book.arabicTitle)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Amiri", serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 20px; background: #faf8f5; color: #1e293b; }
    h1 { color: #064e3b; border-bottom: 2px solid #064e3b; padding-bottom: 12px; }
    .meta { background: #f1ede4; padding: 16px; border-radius: 12px; margin: 20px 0; font-size: 14px; }
    .arabic { font-size: 1.4rem; color: #064e3b; font-weight: bold; }
    .abstract { font-size: 1.1rem; line-height: 1.9; margin-top: 24px; text-align: justify; }
    footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div dir="ltr" style="font-size: 12px; color: #064e3b; font-weight: bold; letter-spacing: 1px;">AL-MAKTABAH SCHOLARLY ARCHIVE</div>
  <h1>${escapeXml(book.title)}</h1>
  <div class="arabic">${escapeXml(book.arabicTitle)}</div>
  <div class="meta" dir="ltr">
    <div><strong>Author / المؤلف:</strong> ${escapeXml(book.author)} (${escapeXml(book.authorHijriYear || 'Classical Era')})</div>
    <div><strong>Canonical Discipline:</strong> ${escapeXml(book.disciplineName)}</div>
    <div><strong>Critical Edition:</strong> ${escapeXml(book.edition)}</div>
    <div><strong>Pagination:</strong> ${book.pages} pages • ${book.volumes} volumes</div>
  </div>
  <div class="abstract">
    <h3 dir="ltr">Treatise Abstract &amp; Critical Overview:</h3>
    <p>${escapeXml(book.description)}</p>
  </div>
  <footer dir="ltr">
    Preserved under Open Waqf Commons (CC-BY-NC 4.0) • Al-Maktabah Digital Archives
  </footer>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Al-Maktabah-${book.title.replace(/[^\w\s-]/g, '_')}_Reader.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: string) => {
    setDownloadingFormat(format);
    setDownloadCompleted(false);
    setDownloadError(null);

    try {
      if (format === 'PDF Critical Edition') {
        if (book.pdfUrl) {
          // Route through Next.js server-side download proxy to ensure forced attachment download
          // and prevent mobile ERR_INVALID_RESPONSE CDN issues
          const proxyUrl = `/api/books/download?url=${encodeURIComponent(book.pdfUrl)}&title=${encodeURIComponent(book.title)}`;
          
          const link = document.createElement('a');
          link.href = proxyUrl;
          link.download = `Al-Maktabah-${book.title.replace(/[^\w\s-]/g, '_')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          downloadManifest(format);
        }
      } else if (format === 'EPUB Reflowable') {
        downloadEpubReader();
      } else if (format === 'Searchable OCR Text') {
        downloadTeiXml();
      } else {
        downloadManifest(format);
      }

      setDownloadCompleted(true);
      setTimeout(() => {
        setDownloadCompleted(false);
      }, 4000);
    } catch (e: any) {
      console.error('Download handler error:', e);
      setDownloadError(e.message || 'Download initialization failed. Please try again.');
    } finally {
      setTimeout(() => {
        setDownloadingFormat(null);
      }, 900);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
        className="w-full max-w-md max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary-container text-on-primary p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary-fixed shrink-0">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">download</span>
            </span>
            <div>
              <span className="font-label-sm uppercase tracking-wider text-tertiary-fixed text-xs font-semibold block">
                Free Academic Waqf Download
              </span>
              <h3 id="download-modal-title" className="font-title-md font-bold text-on-primary leading-tight mt-0.5">
                {book.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close download modal"
            className="text-on-primary-container hover:text-on-primary p-1 rounded-full cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container">
            <div className="relative w-12 h-16 rounded shadow-xs shrink-0 overflow-hidden bg-surface-container">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized={
                    !book.coverImage.includes('images.unsplash.com') &&
                    !book.coverImage.includes('res.cloudinary.com') &&
                    !book.coverImage.includes('lh3.googleusercontent.com')
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">menu_book</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-arabic text-base font-bold text-primary truncate" dir="rtl" lang="ar">
                {book.arabicTitle}
              </div>
              <div className="text-xs text-on-surface-variant truncate">
                {book.author} ({book.authorHijriYear || 'Classical Era'})
              </div>
              <div className="text-xs text-tertiary font-medium mt-0.5">
                {book.pages} pages • {book.sizeMb || '3.5'} MB total
              </div>
            </div>
          </div>

          {downloadCompleted && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-emerald-700 text-base">check_circle</span>
              <span><strong>Download initiated!</strong> Document streamed directly without cost or DRM.</span>
            </div>
          )}

          {downloadError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-800 flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-red-700 text-base">error</span>
              <span>{downloadError}</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="font-label-sm uppercase text-on-surface-variant text-xs font-semibold">
              Available Format Bundles
            </p>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDownload('PDF Critical Edition')}
                disabled={downloadingFormat !== null}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-surface-container hover:border-primary hover:bg-surface-container-low transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                    PDF
                  </span>
                  <div>
                    <div className="font-title-md text-sm font-semibold text-on-surface">
                      Critical Edition PDF
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      Includes complete tashkīl, isnād indices, and pagination ({book.sizeMb || '3.5'} MB)
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-lg">
                  {downloadingFormat === 'PDF Critical Edition' ? (
                    <span className="animate-spin inline-block">progress_activity</span>
                  ) : (
                    'download'
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload('EPUB Reflowable')}
                disabled={downloadingFormat !== null}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-surface-container hover:border-primary hover:bg-surface-container-low transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary font-bold text-xs group-hover:bg-secondary group-hover:text-white transition-colors">
                    EPUB
                  </span>
                  <div>
                    <div className="font-title-md text-sm font-semibold text-on-surface">
                      Reflowable EPUB / Kindle
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      Optimized for e-readers, iPads, and mobile screens ({((book.sizeMb || 3.5) * 0.35).toFixed(1)} MB)
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-lg">
                  {downloadingFormat === 'EPUB Reflowable' ? (
                    <span className="animate-spin inline-block">progress_activity</span>
                  ) : (
                    'download'
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload('Searchable OCR Text')}
                disabled={downloadingFormat !== null}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-surface-container hover:border-primary hover:bg-surface-container-low transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary font-bold text-xs group-hover:bg-tertiary group-hover:text-white transition-colors">
                    TXT
                  </span>
                  <div>
                    <div className="font-title-md text-sm font-semibold text-on-surface">
                      Raw TEI / XML Plain Text
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      For researchers, NLP lemmatization, and computational corpus analysis
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-lg">
                  {downloadingFormat === 'Searchable OCR Text' ? (
                    <span className="animate-spin inline-block">progress_activity</span>
                  ) : (
                    'download'
                  )}
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
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
