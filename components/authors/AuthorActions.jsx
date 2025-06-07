import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearAuthor, setAuthor } from "../../reducers/author";
import {
  convertTopicTreeForMongoose,
  convertTopicTreeForReducer,
} from "./Authors.utils";

const AuthorActions = () => {
  const dispatch   = useDispatch();

  // --- Sélection du store ---------------------------------------------------
  const author     = useSelector((state) => state.author);
  const token      = useSelector((state) => state.user.token);
  const projectId  = useSelector((state) => state.user.projectIds?.[0]);
  const isLoggedIn = Boolean(token && projectId);

  // --- Config API -----------------------------------------------------------
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;      // ex: http://localhost:3000
  const apiUrl     = `${backendUrl}/authors`;

  // --- Local state ----------------------------------------------------------
  const { oa_id, isInDb } = author;
  const [shouldCheckDb, setShouldCheckDb] = useState(false);

  // Convertit l’arbre au format backend avant l’envoi
  const authorToSend = {
    ...author,
    topic_tree: convertTopicTreeForMongoose(author.topic_tree),
    projectId,                           // ← injecte l’ID dans le body
  };

  // -------------------------------------------------------------------------
  // 🔍 Vérifie si l’auteur existe déjà en base
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!oa_id || !shouldCheckDb || !isLoggedIn) return;

    const checkIfAuthorInDb = async () => {
      try {
        const res = await fetch(`${apiUrl}/${oa_id}?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const dbAuthor = await res.json();
          dispatch(
            setAuthor({
              ...dbAuthor,
              topic_tree: convertTopicTreeForReducer(dbAuthor.topic_tree || []),
              isInDb: true,
            }),
          );
        } else {
          dispatch(setAuthor({ ...author, isInDb: false }));
        }
      } catch (err) {
        console.error("Erreur lors du recheck de la DB :", err);
      } finally {
        setShouldCheckDb(false);
      }
    };

    checkIfAuthorInDb();
  }, [shouldCheckDb, oa_id, token, projectId, isLoggedIn, dispatch, author]);

  // -------------------------------------------------------------------------
  // Création
  // -------------------------------------------------------------------------
  const handleCreate = async () => {
    if (!isLoggedIn) {
      alert("Connecte-toi avant de créer un auteur.");
      return;
    }

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authorToSend),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Erreur création : ${data.message}`);
      } else {
        alert("Auteur créé avec succès 🆕");
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
    if (!oa_id) {
      alert("oa_id requis pour la mise à jour !");
      return;
    }
    if (!isLoggedIn) {
      alert("Connecte-toi avant de mettre à jour un auteur.");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/${oa_id}?projectId=${projectId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authorToSend),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Erreur mise à jour : ${data.message}`);
      } else {
        alert("Auteur mis à jour ✅");
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
    if (!oa_id) {
      alert("oa_id requis pour la suppression !");
      return;
    }
    if (!isLoggedIn) {
      alert("Connecte-toi avant de supprimer un auteur.");
      return;
    }
    if (!window.confirm(`Supprimer l'auteur ${oa_id} ?`)) return;

    try {
      const res = await fetch(`${apiUrl}/${oa_id}?projectId=${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Erreur suppression : ${data.message}`);
      } else {
        alert("Auteur supprimé 🗑️");
        dispatch(clearAuthor());
      }
    } catch (err) {
      alert("Erreur réseau lors de la suppression.");
    }
  };

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------
  return (
    <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
      <button
        onClick={handleCreate}
        disabled={isInDb || !isLoggedIn}
        className={`px-4 py-2 rounded text-white ${
          isInDb || !isLoggedIn
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={
          !isLoggedIn
            ? "Connexion requise"
            : isInDb
            ? "Auteur déjà enregistré"
            : "Créer l'auteur"
        }
      >
        🆕 Créer
      </button>

      <button
        onClick={handleUpdate}
        disabled={!isInDb || !isLoggedIn}
        className={`px-4 py-2 rounded text-white ${
          !isInDb || !isLoggedIn
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={
          !isLoggedIn
            ? "Connexion requise"
            : !isInDb
            ? "Créer l'auteur avant de mettre à jour"
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
            ? "L'auteur ne peut pas être supprimé car il n'est pas en base"
            : "Supprimer l'auteur"
        }
        className={`px-4 py-2 rounded text-white font-medium transition-colors duration-150 ${
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

export default AuthorActions;
