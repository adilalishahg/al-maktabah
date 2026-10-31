import React from 'react';
import type { DetailedBook } from '../../../types/bookContent';

export interface AdminAnalyticsTabProps {
  books: DetailedBook[];
  handleStartNewBook: () => void;
  setActiveTab: (tab: 'analytics' | 'books' | 'categories' | 'editor' | 'homepage') => void;
}

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({
  books,
  handleStartNewBook,
  setActiveTab,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold text-tertiary tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">insights</span>
          Scholarly Analytics &amp; Archive Infrastructure
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mt-1">
          Digital Repository Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
          Real-time insights across digitized folios, active reading sessions, and CDN bandwidth distribution.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase font-label-sm">Total Codices</span>
            <span className="material-symbols-outlined text-lg text-primary">auto_stories</span>
          </div>
          <div className="font-display text-3xl font-bold text-primary">{books.length}</div>
          <span className="text-xs text-primary font-medium mt-1 block">
            {books.filter((b) => b.published).length} Published Live
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase font-label-sm">Total Chapters</span>
            <span className="material-symbols-outlined text-lg text-secondary">format_list_bulleted</span>
          </div>
          <div className="font-display text-3xl font-bold text-secondary">
            {books.reduce((acc, b) => acc + (b.chapters?.length || 0), 0)}
          </div>
          <span className="text-xs text-on-surface-variant mt-1 block">
            Indexed with Arabic Tashkīl
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase font-label-sm">Total Digitized Pages</span>
            <span className="material-symbols-outlined text-lg text-tertiary">menu_book</span>
          </div>
          <div className="font-display text-3xl font-bold text-tertiary">
            {books.reduce((acc, b) => acc + (b.pages || 0), 0).toLocaleString()}
          </div>
          <span className="text-xs text-on-surface-variant mt-1 block">
            High-speed indexed folios
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase font-label-sm">CDN Storage (Cloudinary)</span>
            <span className="material-symbols-outlined text-lg text-primary-container">cloud_sync</span>
          </div>
          <div className="font-display text-3xl font-bold text-primary">
            {books.reduce((acc, b) => acc + (b.sizeMb || 0), 0).toFixed(1)} MB
          </div>
          <span className="text-xs text-primary font-medium mt-1 block">
            Ultra-Fast Edge CDN Cache
          </span>
        </div>
      </div>

      {/* Discipline Breakdown & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Discipline Breakdown */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
          <h3 className="font-title-md font-bold text-base text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">pie_chart</span>
            <span>Manuscript Distribution by Canonical Discipline</span>
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { name: 'Hadīth Traditions', count: books.filter((b) => b.discipline === 'hadith').length, color: 'bg-primary' },
              { name: 'Qur’anic Exegesis (Tafsīr)', count: books.filter((b) => b.discipline === 'tafsir').length, color: 'bg-secondary' },
              { name: 'Theology & Creed (‘Aqīdah)', count: books.filter((b) => b.discipline === 'aqeedah').length, color: 'bg-tertiary' },
              { name: 'Jurisprudence (Fiqh)', count: books.filter((b) => b.discipline === 'fiqh').length, color: 'bg-emerald-600' },
              { name: 'Other Canonical Sciences', count: books.filter((b) => !['hadith', 'tafsir', 'aqeedah', 'fiqh'].includes(b.discipline)).length, color: 'bg-gray-400' },
            ].map((d, i) => {
              const percentage = books.length ? Math.round((d.count / books.length) * 100) : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-on-surface">{d.name}</span>
                    <span className="text-on-surface-variant font-mono">{d.count} works ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className={`h-full ${d.color}`} style={{ width: `${Math.max(8, percentage)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Recent Logs */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
          <h3 className="font-title-md font-bold text-base text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">bolt</span>
            <span>Quick Administrator Actions</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleStartNewBook}
              className="p-3.5 rounded-xl bg-primary-container text-on-primary font-semibold text-xs text-left hover:bg-primary transition-all flex flex-col justify-between cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl mb-2">add_box</span>
              <span>Upload &amp; Catalog Book</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('books')}
              className="p-3.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs text-left hover:bg-surface-container-high transition-all flex flex-col justify-between cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl mb-2">edit_document</span>
              <span>Manage Published Works</span>
            </button>
          </div>

          <div className="pt-2 border-t border-surface-container space-y-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Recent Custodian Activity</span>
            <div className="space-y-2 text-xs text-on-surface-variant">
              <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
                <span>Indexed: Ṣaḥīḥ al-Bukhārī (3 chapters)</span>
                <span className="text-label-xs text-primary font-bold">● Published</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
                <span>Indexed: Riyāḍ aṣ-Ṣāliḥīn (2 chapters)</span>
                <span className="text-label-xs text-primary font-bold">● Published</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
                <span>Indexed: Al-‘Aqīdah al-Wāsiṭiyyah</span>
                <span className="text-label-xs text-primary font-bold">● Published</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

