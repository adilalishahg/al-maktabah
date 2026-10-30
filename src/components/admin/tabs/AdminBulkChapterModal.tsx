import React from 'react';

export interface AdminBulkChapterModalProps {
  showBulkModal: boolean;
  setShowBulkModal: (show: boolean) => void;
  bulkRawText: string;
  setBulkRawText: (text: string) => void;
  handleBulkChapterImport: () => void;
}

export const AdminBulkChapterModal: React.FC<AdminBulkChapterModalProps> = ({
  showBulkModal,
  setShowBulkModal,
  bulkRawText,
  setBulkRawText,
  handleBulkChapterImport,
}) => {
  if (!showBulkModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-emerald-card border border-emerald-border rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in text-white">
        <div className="flex items-center justify-between border-b border-emerald-border pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container border border-emerald-highlight/30 text-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-base">bolt</span>
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">Bulk Chapter Ingest &amp; Auto-Splitter</h3>
              <p className="text-label-sm text-emerald-highlight">
                Paste entire book text. Use <code className="bg-surface-container px-1 rounded text-primary">### Chapter Title</code> or <code className="bg-surface-container px-1 rounded text-primary">Bab 1:</code> or <code className="bg-surface-container px-1 rounded text-primary">باب ...</code> to auto-split into chapters.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBulkModal(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-container cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-emerald-highlight mb-1">
            Full Raw Text (Arabic / English with chapter markers):
          </label>
          <textarea
            rows={14}
            value={bulkRawText}
            onChange={(e) => setBulkRawText(e.target.value)}
            placeholder={`### Bab 1: Kitab al-Iman\nعن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول: إنما الأعمال بالنيات...\n\n### Bab 2: Kitab al-Salah\nعن عبد الله بن مسعود رضي الله عنه قال: سألت النبي صلى الله عليه وسلم: أي العمل أحب إلى الله؟ قال: الصلاة على وقتها...`}
            className="w-full p-3.5 rounded-xl bg-night-surface border border-emerald-border text-xs font-mono text-night-text placeholder:text-gray-600 focus:outline-none focus:border-emerald-highlight leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-label-sm text-on-primary-container">
            Lines: {bulkRawText ? bulkRawText.split('\n').length : 0} | Estimated Chapters: {bulkRawText ? (bulkRawText.match(/(###|Bab |Chapter |باب)/gi) || []).length : 0}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowBulkModal(false);
                setBulkRawText('');
              }}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-emerald-border text-xs font-semibold text-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkChapterImport}
              className="px-5 py-2 rounded-xl bg-primary-container hover:bg-emerald-surface text-white border border-emerald-highlight/30 text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">auto_fix_high</span>
              <span>Parse &amp; Populate Chapters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
