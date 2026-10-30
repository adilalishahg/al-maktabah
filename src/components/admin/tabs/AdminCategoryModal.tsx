import React from 'react';
import type { CategoryScience } from '../../../types/library';

export interface AdminCategoryModalProps {
  editingCategory: CategoryScience;
  setEditingCategory: React.Dispatch<React.SetStateAction<CategoryScience | null>>;
  onClose: () => void;
  categories: CategoryScience[];
  handleSaveCategory: (e: React.FormEvent) => void;
  isSavingCategory: boolean;
}

export const AdminCategoryModal: React.FC<AdminCategoryModalProps> = ({
  editingCategory,
  setEditingCategory,
  onClose,
  categories,
  handleSaveCategory,
  isSavingCategory,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-emerald-card border border-emerald-border rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in text-white">
        <div className="flex items-center justify-between border-b border-emerald-border pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container border border-emerald-highlight/30 text-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-base">category</span>
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">
                {editingCategory.id && categories.some((c) => c.id === editingCategory.id)
                  ? 'Edit Discipline'
                  : 'New Discipline Classification'}
              </h3>
              <p className="text-label-sm text-emerald-highlight">
                Configures canonical discipline name, Arabic title, and taxonomy.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-container cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                Discipline Name (EN) *
              </label>
              <input
                type="text"
                required
                value={editingCategory.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = editingCategory.id
                    ? editingCategory.id
                    : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  setEditingCategory({ ...editingCategory, name, id: slug });
                }}
                placeholder="e.g. Arabic Grammar"
                className="w-full px-3 py-2 rounded-xl bg-night-surface border border-emerald-border text-xs text-white focus:outline-none focus:border-emerald-highlight"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                Arabic Title (بالتشكيل)
              </label>
              <input
                type="text"
                dir="rtl"
                value={editingCategory.arabicName}
                onChange={(e) => setEditingCategory({ ...editingCategory, arabicName: e.target.value })}
                placeholder="النحو والصرف"
                className="w-full px-3 py-2 rounded-xl bg-night-surface border border-emerald-border text-sm font-arabic text-tertiary-fixed focus:outline-none focus:border-emerald-highlight"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                Unique Slug / ID *
              </label>
              <input
                type="text"
                required
                value={editingCategory.id}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    id: e.target.value.toLowerCase().trim(),
                  })
                }
                placeholder="e.g. nahw"
                className="w-full px-3 py-2 rounded-xl bg-night-surface border border-emerald-border text-xs font-mono text-tertiary focus:outline-none focus:border-emerald-highlight"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-highlight mb-1">
                Material Icon Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingCategory.icon}
                  onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                  placeholder="category / translate / school"
                  className="flex-1 px-3 py-2 rounded-xl bg-night-surface border border-emerald-border text-xs text-white focus:outline-none focus:border-emerald-highlight"
                />
                <span className="w-8 h-8 rounded-lg bg-night-surface border border-emerald-border flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-base">{editingCategory.icon || 'category'}</span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-highlight mb-1">
              Academic Scope / Description
            </label>
            <textarea
              rows={3}
              value={editingCategory.description}
              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
              placeholder="Classical linguistic treatises, grammatical rules, inflection, and syntax."
              className="w-full p-2.5 rounded-xl bg-night-surface border border-emerald-border text-xs text-night-text focus:outline-none focus:border-emerald-highlight"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-emerald-border text-xs font-semibold text-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingCategory}
              className="px-5 py-2 rounded-xl bg-primary-container hover:bg-emerald-surface text-white border border-emerald-highlight/30 text-xs font-semibold shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSavingCategory && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isSavingCategory ? 'Saving...' : 'Save Discipline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
