import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import ArticleModal from "./DatabaseArticlesModal";
import ArticleCard from "../articles/ArticleCard";

export default function DatabaseArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [currentTab, setCurrentTab] = useState("incomplete");

  const token = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const isLoggedIn = Boolean(token && projectId);

  const loadArticles = useCallback(async () => {
    if (!isLoggedIn) {
      console.log("User not logged in.");
      setLoading(false);
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const res = await fetch(`${backendUrl}/articles?projectId=${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      setArticles(json.data || json || []);
    } catch (err) {
      console.error("Error loading articles:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, token, projectId]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleViewModal = useCallback((article) => {
    setModal(article);
  }, []);

  // Tri par complétion
  const incomplete = articles.filter((a) => (a.completionRate || 0) === 0);
  const partial = articles.filter((a) => (a.completionRate || 0) > 0 && (a.completionRate || 0) < 100);
  const complete = articles.filter((a) => (a.completionRate || 0) === 100);

  const getCurrentArticles = () => {
    switch (currentTab) {
      case "incomplete": return incomplete;
      case "partial": return partial;
      case "complete": return complete;
      default: return [];
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Articles annotés</h2>

      {/* Onglets */}
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        <button
          onClick={() => setCurrentTab("incomplete")}
          className={`py-1 px-2 text-sm font-medium border-b-2 ${
            currentTab === "incomplete"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          📝 À annoter ({incomplete.length})
        </button>
        <button
          onClick={() => setCurrentTab("partial")}
          className={`py-1 px-2 text-sm font-medium border-b-2 ${
            currentTab === "partial"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          🕓 En cours ({partial.length})
        </button>
        <button
          onClick={() => setCurrentTab("complete")}
          className={`py-1 px-2 text-sm font-medium border-b-2 ${
            currentTab === "complete"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          ✅ Annotés ({complete.length})
        </button>
      </div>

      {/* Articles */}
      {loading ? (
        <p className="text-gray-500">Loading articles...</p>
      ) : !isLoggedIn ? (
        <p className="text-gray-500 italic">You must be logged in to view articles.</p>
      ) : getCurrentArticles().length === 0 ? (
        <p className="text-gray-500 italic">No articles in this category.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {getCurrentArticles().map((article) => (
            <ArticleCard
              key={article.id || article._id}
              article={article}
              small={true}
              onViewModal={handleViewModal}
            />
          ))}
        </div>
      )}

      {modal && (
        <ArticleModal
          article={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
