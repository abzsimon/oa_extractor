import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setArticle, clearArticle } from "../../reducers/article";

const apiUrl = "https://oa-extractor-backend.vercel.app/articles";

const ArticleActions = () => {
  const article = useSelector((state) => state.article);
  const dispatch = useDispatch();
  const { id, isInDb } = article;
  const [shouldCheckDb, setShouldCheckDb] = useState(false);

  // Vérifier si l'article existe en DB (pour activer/désactiver les boutons)
  useEffect(() => {
    if (!id || !shouldCheckDb) return;
    const checkIfArticleInDb = async () => {
      try {
        const res = await fetch(`${apiUrl}/${id}`);
        if (res.ok) {
          const dbArticle = await res.json();
          dispatch(setArticle({
            ...dbArticle,
            isInDb: true,
          }));
        } else {
          dispatch(setArticle({ ...article, isInDb: false }));
        }
      } catch (err) {
        console.error("Erreur lors du recheck de la DB :", err);
      } finally {
        setShouldCheckDb(false);
      }
    };
    checkIfArticleInDb();
    // eslint-disable-next-line
  }, [shouldCheckDb, id]);

  // Création d'article
  const handleCreate = async () => {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Erreur création : ${data.message}`);
      } else {
        alert("Article créé avec succès 🆕");
        setShouldCheckDb(true);
      }
    } catch (err) {
      alert("Erreur réseau lors de la création.");
    }
  };

  // Mise à jour d'article
  const handleUpdate = async () => {
    if (!id) {
      alert("ID requis pour la mise à jour !");
      return;
    }
    try {
      console.log("Article envoyé en DB (POST/PUT):", article);
      const res = await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Erreur mise à jour : ${data.message}`);
      } else {
        alert("Article mis à jour ✅");
        setShouldCheckDb(true);
      }
    } catch (err) {
      alert("Erreur réseau lors de la mise à jour.");
    }
  };

  // Suppression d'article
  const handleDelete = async () => {
    if (!id) {
      alert("ID requis pour la suppression !");
      return;
    }
    if (!window.confirm(`Supprimer l'article ${id} ?`)) return;
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(`Erreur suppression : ${data.message}`);
      } else {
        alert("Article supprimé 🗑️");
        dispatch(clearArticle());
      }
    } catch (err) {
      alert("Erreur réseau lors de la suppression.");
    }
  };

  return (
    <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
      <button
        onClick={handleCreate}
        disabled={isInDb}
        className={`px-4 py-2 rounded text-white ${
          isInDb
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={isInDb ? "Article déjà enregistré" : "Créer l'article"}
      >
        🆕 Créer
      </button>
      <button
        onClick={handleUpdate}
        disabled={!isInDb}
        className={`px-4 py-2 rounded text-white ${
          !isInDb
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={
          !isInDb
            ? "Créer l'article avant de mettre à jour"
            : "Mettre à jour"
        }
      >
        ✏️ Mettre à jour
      </button>
      <button
        onClick={handleDelete}
        disabled={!isInDb}
        title={
          !isInDb
            ? "L'article ne peut pas être supprimé car il n'est pas en base"
            : "Supprimer l'article"
        }
        className={`px-4 py-2 rounded text-white font-medium transition-colors duration-150 ${
          !isInDb
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        🗑️ Supprimer
      </button>
    </div>
  );
};

export default ArticleActions;