import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import AuthorSearch from "./AuthorSearch";
import AuthorViewer from "./AuthorViewer";

export default function Authors() {
  const [showAuthorSearch, setShowAuthorSearch] = useState(false);
  const router = useRouter();
  const { oa_id } = router.query;

  useEffect(() => {
    // If oa_id exists in the URL, hide the search and show the author details
    if (oa_id) {
      setShowAuthorSearch(false);
    }
  }, [oa_id]);

  const handleAuthorSelected = () => {
    setShowAuthorSearch(false);
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* 🔍 Search bar or button at the top */}
      <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm p-3">
        {showAuthorSearch || oa_id ? (
          <AuthorSearch onAuthorSelected={handleAuthorSelected} oa_id={oa_id} />
        ) : (
          <button
            onClick={() => setShowAuthorSearch(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Rechercher un nouvel auteur
          </button>
        )}
      </div>

      {/* 📋 Main author view */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
        <AuthorViewer oa_id={oa_id} />
      </div>
    </div>
  );
}
