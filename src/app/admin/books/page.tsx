'use client';

import React from 'react';
import { useAdminContext } from '@/context/AdminContext';
import { AdminBooksTab } from '@/components/admin/tabs';

export default function AdminBooksPage() {
  const {
    books,
    handleStartNewBook,
    handleTogglePublish,
    setViewingReaderBook,
    handleSetBookAsHomeReader,
    homeSettings,
    handleEditBook,
    handleDeleteBook,
  } = useAdminContext();

  return (
    <AdminBooksTab
      books={books}
      handleStartNewBook={handleStartNewBook}
      handleTogglePublish={handleTogglePublish}
      setViewingReaderBook={setViewingReaderBook}
      handleSetBookAsHomeReader={handleSetBookAsHomeReader}
      homeSettings={homeSettings}
      handleEditBook={handleEditBook}
      handleDeleteBook={handleDeleteBook}
    />
  );
}
