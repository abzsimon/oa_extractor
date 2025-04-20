import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearAuthor, setAuthor } from "../../reducers/author";
import { convertTopicTreeForMongoose, convertTopicTreeForReducer } from "./Authors.utils";

const AuthorActions = () => {
  const author = useSelector((state) => state.author);
  const dispatch = useDispatch();
  const apiUrl = "http://localhost:3000/authors";
  const { oa_id } = author;
  const [shouldCheckDb, setShouldCheckDb] = useState(false);

  const authorToSend = {
    ...author,
    topic_tree: convertTopicTreeForMongoose(author.topic_tree),
  };

  // 🔍 Re-check la DB lorsque nécessaire
  useEffect(() => {
    if (!oa_id || !shouldCheckDb) return;

    const checkIfAuthorInDb = async () => {
      try {
        const res = await fetch(`${apiUrl}/${oa_id}`);
        if (res.ok) {
          const dbAuthor = await res.json();
          dispatch(setAuthor({
            ...dbAuthor,
            topic_tree: convertTopicTreeForReducer(dbAuthor.topic_tree || []),
            isInDb: true,
          }));
        } else {
          // Pas trouvé => l'auteur n'est plus en base
          dispatch(setAuthor({ ...author, isInDb: false }));
        }
      } catch (err) {
        console.error("Erreur lors du recheck de la DB :", err);
      } finally {
        setShouldCheckDb(false);
      }
    };

    checkIfAuthorInDb();
  }, [shouldCheckDb, oa_id, dispatch]);

  const handleCreate = async () => {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authorToSend),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Erreur création : ${data.message}`);
      } else {
        alert("Auteur créé avec succès 🆕");
        console.log(data);
        setShouldCheckDb(true);
      }
    } catch (err) {
      alert("Erreur réseau lors de la création.");
    }
  };

  const handleUpdate = async () => {
    if (!oa_id) {
      alert("oa_id requis pour la mise à jour !");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/${oa_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authorToSend),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Erreur mise à jour : ${data.message}`);
      } else {
        alert("Auteur mis à jour ✅");
        console.log(data);
        setShouldCheckDb(true);
      }
    } catch (err) {
      alert("Erreur réseau lors de la mise à jour.");
    }
  };

  const handleDelete = async () => {
    if (!oa_id) {
      alert("oa_id requis pour la suppression !");
      return;
    }

    const confirmDelete = window.confirm(`Supprimer l'auteur ${oa_id} ?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${apiUrl}/${oa_id}`, {
        method: "DELETE",
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

  return (
    <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
      <button
        onClick={handleCreate}
        disabled={author.isInDb}
        className={`px-4 py-2 rounded text-white ${
          author.isInDb
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={author.isInDb ? "Auteur déjà enregistré" : "Créer l'auteur"}
      >
        🆕 Créer
      </button>
      <button
        onClick={handleUpdate}
        disabled={!author.isInDb}
        className={`px-4 py-2 rounded text-white ${
          !author.isInDb
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={
          !author.isInDb
            ? "Créér l'auteur avant de mettre à jour"
            : "Mettre à jour"
        }
      >
        ✏️ Mettre à jour
      </button>
      <button
        onClick={handleDelete}
        disabled={!author.isInDb}
        title={
          !author.isInDb
            ? "L'auteur ne peut pas être supprimé car il n'est pas en base"
            : "Supprimer l'auteur"
        }
        className={`px-4 py-2 rounded text-white font-medium transition-colors duration-150 ${
          !author.isInDb
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
