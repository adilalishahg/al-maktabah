'use client';

import React from 'react';
import { useAdminContext } from '@/context/AdminContext';
import { AdminAnalyticsTab } from '@/components/admin/tabs';

export default function AdminAnalyticsPage() {
  const { books, handleStartNewBook, navigateToTab } = useAdminContext();

    return (
    <AdminAnalyticsTab
      books={books}
      handleStartNewBook={handleStartNewBook}
      setActiveTab={navigateToTab}
    />
    );
  }
