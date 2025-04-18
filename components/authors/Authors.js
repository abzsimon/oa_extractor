import React from 'react';
import AuthorSearch from './AuthorSearch';
import AuthorViewer from './AuthorViewer';

export default function AuthorsPage() {
  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* 🔍 Barre de recherche en haut */}
      <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm p-3">
        <AuthorSearch />
      </div>

      {/* 📋 Vue auteur principale */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
        <AuthorViewer />
      </div>
    </div>
  );
}
