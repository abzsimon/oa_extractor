import { useEffect, useState } from "react";
import { useSelector } from "react-redux";  // Pour accéder au store Redux
import ArticleModal from "./DatabaseArticlesModal";

export default function DatabaseArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  // Récupérer le token depuis Redux
  const token = useSelector((state) => state.user.token);  // Remplacez par le chemin correct si nécessaire
  const projectId = useSelector((state) => state.user.projectIds?.[0]);  // Remplacez par le chemin correct vers projectId

  useEffect(() => {
    const loadArticles = async () => {
      try {
        if (!token || !projectId) {
          console.error("Token ou projectId manquant");
          return;
        }

        // Utilisation de la variable d'environnement BACKEND pour l'URL
        const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;

        // Effectuer la requête en incluant le token et le projectId dans l'en-tête et l'URL
        const res = await fetch(`${backendUrl}/articles?projectId=${projectId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Ajout du token dans l'en-tête Authorization
            'Content-Type': 'application/json', // Indique que la réponse sera en JSON
          }
        });

        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        setArticles(json.data || json || []); // Traiter la réponse
      } catch (err) {
        console.error("Erreur chargement articles:", err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [token, projectId]); // Dépendances sur le token et le projectId pour recharger les articles lorsque l'un d'eux change

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Articles commentés</h2>
      {loading ? (
        <p className="text-gray-500">Chargement des articles...</p>
      ) : articles.length === 0 ? (
        <p className="text-gray-500 italic">Connectez-vous pour accéder à la liste des fiches d'articles annotés</p>
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
