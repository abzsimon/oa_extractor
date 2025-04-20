import { useRouter } from "next/router";
import { useState } from "react";
import AuthorSearch from "./AuthorSearch";
import AuthorViewer from "./AuthorViewer";

export default function AuthorsPage() {
  const [showAuthorSearch, setShowAuthorSearch] = useState(false);
  const router = useRouter();
  const { oa_id } = router.query;

  const handleAuthorSelected = () => {
    setShowAuthorSearch(false);
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* 🔍 Barre de recherche ou bouton en haut */}
      <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm p-3">
        {showAuthorSearch || oa_id ? (
          <AuthorSearch
            onAuthorSelected={handleAuthorSelected}
            oa_id={oa_id} // 👈 this triggers fetch
          />
        ) : (
          <button
            onClick={() => setShowAuthorSearch(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Rechercher un nouvel auteur
          </button>
        )}
      </div>

      {/* 📋 Vue auteur principale */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
        <AuthorViewer />
      </div>
    </div>
  );
}
