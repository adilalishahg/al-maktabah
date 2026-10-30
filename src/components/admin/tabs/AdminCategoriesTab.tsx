import React from 'react';
import type { CategoryScience } from '../../../types/library';
import type { DetailedBook } from '../../../types/bookContent';

export interface AdminCategoriesTabProps {
  categories: CategoryScience[];
  books: DetailedBook[];
  handleStartNewCategory: () => void;
  handleEditCategory: (cat: CategoryScience) => void;
  handleDeleteCategory: (id: string) => void;
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  books,
  handleStartNewCategory,
  handleEditCategory,
  handleDeleteCategory,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">category</span>
            <span>Discipline Classifications (Tartīb al-‘Ulūm)</span>
          </h2>
          <p className="text-xs text-on-surface-variant max-w-2xl mt-1">
            Manage Islamic knowledge branches, canonical taxonomy, and disciplines. Any additions or updates sync directly to the public Browse Library and Categories catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNewCategory}
          className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>+ Add New Discipline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const linkedCount = books.filter((b) => b.discipline === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">{cat.icon || 'category'}</span>
                  </span>
                  <span className="font-arabic font-bold text-xl text-primary">{cat.arabicName}</span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-primary">{cat.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-label-sm font-mono text-tertiary bg-surface-container px-1.5 py-0.5 rounded">
                      slug: {cat.id}
                    </span>
                    <span className="text-label-sm text-on-surface-variant font-medium">
                      • {linkedCount} Treatises
                    </span>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-surface-container flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant">
                  {cat.subBranches?.length || 0} sub-branches
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEditCategory(cat)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-primary flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      linkedCount > 0
                        ? 'text-gray-400 opacity-50 cursor-not-allowed'
                        : 'text-error hover:bg-surface-container'
                    }`}
                    title={
                      linkedCount > 0
                        ? `Cannot delete: ${linkedCount} treatise(s) assigned`
                        : 'Delete discipline'
                    }
                    disabled={linkedCount > 0}
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

