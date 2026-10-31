'use client';

import React from 'react';
import { useAdminContext } from '@/context/AdminContext';
import { AdminHomeSettingsView } from '@/components/admin/AdminHomeSettingsView';

export default function AdminSectionsPage() {
  const {
    homeSettings,
    handleSaveHomeSettings,
    isSavingSettings,
    settingsSavedSuccess,
    books,
    categories,
  } = useAdminContext();

  return (
    <AdminHomeSettingsView
      settings={homeSettings}
      onSaveSettings={handleSaveHomeSettings}
      isSaving={isSavingSettings}
      successMessage={settingsSavedSuccess}
      books={books}
      categories={categories}
    />
  );
}
