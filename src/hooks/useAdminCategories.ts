import { useState, useEffect } from 'react';
import type { CategoryScience } from '@/types/library';
import { getStoredCategories, saveCategory, deleteCategory as deleteStoredCategory } from '@/data/categoryStore';

interface UseAdminCategoriesOptions {
  getAuthHeaders: (extra?: Record<string, string>) => Record<string, string>;
  booksLengthByDiscipline?: (catId: string) => number;
}

export function useAdminCategories({ getAuthHeaders, booksLengthByDiscipline }: UseAdminCategoriesOptions) {
  const [categories, setCategories] = useState<CategoryScience[]>([]);
  const [editingCategory, setEditingCategory] = useState<CategoryScience | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          localStorage.setItem('al_maktabah_categories_v1', JSON.stringify(data));
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API fetch categories fallback:', err);
    }
    setCategories(getStoredCategories());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleStartNewCategory = () => {
    setEditingCategory({
      id: '',
      name: '',
      arabicName: '',
      icon: 'category',
      description: '',
      volumeCount: 0,
      tags: [],
      subBranches: [],
      foundationTreatises: [],
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat: CategoryScience) => {
    setEditingCategory(JSON.parse(JSON.stringify(cat)));
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (catId: string) => {
    if (booksLengthByDiscipline) {
      const count = booksLengthByDiscipline(catId);
      if (count > 0) {
        alert(
          `Cannot delete this discipline because ${count} treatise(s) are currently categorized under it. Please reassign those treatises first.`
        );
        return;
      }
    }

    if (confirm('Are you sure you want to delete this discipline classification?')) {
      const updated = deleteStoredCategory(catId);
      setCategories(updated);
      try {
        await fetch(`/api/categories/${catId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      } catch (err) {
        console.warn('MongoDB category delete notice:', err);
      }
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim() || !editingCategory.id.trim()) {
      alert('Please fill out Discipline Name and Unique ID/Slug.');
      return;
    }

    setIsSavingCategory(true);
    // 1. Local Snappy Save
    const list = saveCategory(editingCategory);
    setCategories(list);

    // 2. Server MongoDB Sync
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(editingCategory),
      });
    } catch (err) {
      console.warn('MongoDB category save notice:', err);
    } finally {
      setIsSavingCategory(false);
      setShowCategoryModal(false);
      setEditingCategory(null);
    }
  };

  return {
    categories,
    setCategories,
    editingCategory,
    setEditingCategory,
    showCategoryModal,
    setShowCategoryModal,
    isSavingCategory,
    loadCategories,
    handleStartNewCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleSaveCategory,
  };
}

