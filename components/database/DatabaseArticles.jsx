import { useEffect, useState } from "react";
import ArticleModal from "./DatabaseArticlesModal";

export default function DatabaseArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const res = await fetch("https://oa-extractor-backend.vercel.app/articles");
        const json = await res.json();
        setArticles(json.data || json || []);
      } catch (err) {
        console.error("Erreur chargement articles:", err);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Articles commentés</h2>
      {loading ? (
        <p className="text-gray-500">Chargement des articles...</p>
      ) : articles.length === 0 ? (
        <p className="text-gray-500 italic">Aucun article en base.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {articles.map((a, i) => (
            <button
              key={a.id || i}
              className="flex items-center justify-between bg-gray-50 border rounded px-2 py-1 text-sm hover:bg-blue-50 transition cursor-pointer text-left"
              onClick={() => setModal(a)}
              title="Voir les annotations"
              type="button"
            >
              <div className="flex flex-col">
                <span className="font-semibold">{a.title || "(Sans titre)"}</span>
                <span className="text-gray-600">
                  {a.pubyear || "?"} • {a.referenceType || "-"}
                  {a.oa_status && (
                    <span className="ml-2 text-green-600 font-bold">OA</span>
                  )}
                </span>
                <span className="text-xs text-gray-400 truncate max-w-xs">
                  {a.id}
                </span>
              </div>
              <span className="text-blue-500 font-bold text-lg ml-2">⟶</span>
            </button>
          ))}
        </div>
      )}
      {modal && (
        <ArticleModal article={modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
