'use client';

import React from 'react';
import { useAdminContext } from '@/context/AdminContext';
import { AdminCategoriesTab } from '@/components/admin/tabs';

export default function AdminCategoriesPage() {
  const {
    categories,
    books,
    handleStartNewCategory,
    handleEditCategory,
    handleDeleteCategory,
  } = useAdminContext();

  return (
    <AdminCategoriesTab
      categories={categories}
      books={books}
      handleStartNewCategory={handleStartNewCategory}
      handleEditCategory={handleEditCategory}
      handleDeleteCategory={handleDeleteCategory}
    />
  );
}
