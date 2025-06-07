import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setArticle, clearArticle } from "../../reducers/article";

const ArticleActions = () => {
  const dispatch  = useDispatch();

  // --- Sélection du store ---------------------------------------------------
  const article    = useSelector((state) => state.article);
  const token      = useSelector((state) => state.user.token);
  const projectId  = useSelector((state) => state.user.projectIds?.[0]);
  const isLoggedIn = Boolean(token && projectId);

  // --- Config API -----------------------------------------------------------
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;   // ex : http://localhost:3000
  const apiUrl     = `${backendUrl}/articles`;

  // --- Local state ----------------------------------------------------------
  const { id, isInDb } = article;
  const [shouldCheckDb, setShouldCheckDb] = useState(false);

  // -------------------------------------------------------------------------
  // Vérifie si l’article existe déjà en DB
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!id || !shouldCheckDb || !isLoggedIn) return;

    const checkIfArticleInDb = async () => {
      try {
        const res = await fetch(`${apiUrl}/${id}?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const dbArticle = await res.json();
          dispatch(setArticle({ ...dbArticle, isInDb: true }));
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
  }, [shouldCheckDb, id, token, projectId, isLoggedIn, dispatch, article]);

  // -------------------------------------------------------------------------
  // Création
  // -------------------------------------------------------------------------
  const handleCreate = async () => {
    if (!isLoggedIn) {
      alert("Connecte-toi avant de créer un article.");
      return;
    }

    try {
      const payload = { ...article, projectId };        // ← projectId dans le body
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

  // -------------------------------------------------------------------------
  // Mise à jour
  // -------------------------------------------------------------------------
  const handleUpdate = async () => {
    if (!id) {
      alert("ID requis pour la mise à jour !");
      return;
    }
    if (!isLoggedIn) {
      alert("Connecte-toi avant de mettre à jour un article.");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/${id}?projectId=${projectId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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

  // -------------------------------------------------------------------------
  // Suppression
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!id) {
      alert("ID requis pour la suppression !");
      return;
    }
    if (!isLoggedIn) {
      alert("Connecte-toi avant de supprimer un article.");
      return;
    }
    if (!window.confirm(`Supprimer l'article ${id} ?`)) return;

    try {
      const res = await fetch(`${apiUrl}/${id}?projectId=${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

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

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------
  return (
    <div style={{ display: "flex" }}>
      <button
        onClick={handleCreate}
        disabled={isInDb || !isLoggedIn}
        className={`px-2 py-1 rounded text-white ${
          isInDb || !isLoggedIn
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={
          !isLoggedIn
            ? "Connexion requise"
            : isInDb
            ? "Article déjà enregistré"
            : "Créer l'article"
        }
      >
        🆕 Créer
      </button>

      <button
        onClick={handleUpdate}
        disabled={!isInDb || !isLoggedIn}
        className={`px-2 py-1 rounded text-white ml-2 ${
          !isInDb || !isLoggedIn
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={
          !isLoggedIn
            ? "Connexion requise"
            : !isInDb
            ? "Créer l'article avant de mettre à jour"
            : "Mettre à jour"
        }
      >
        ✏️ Mettre à jour
      </button>

      <button
        onClick={handleDelete}
        disabled={!isInDb || !isLoggedIn}
        title={
          !isLoggedIn
            ? "Connexion requise"
            : !isInDb
            ? "L'article ne peut pas être supprimé car il n'est pas en base"
            : "Supprimer l'article"
        }
        className={`px-2 py-1 rounded text-white ml-2 font-medium transition-colors duration-150 ${
          !isInDb || !isLoggedIn
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
