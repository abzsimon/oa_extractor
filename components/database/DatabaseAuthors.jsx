// import des fonctions react
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { setAuthor } from "../../reducers/author";
import AuthorCard from "../authors/AuthorCard";
import { convertTopicTreeForReducer } from "../authors/Authors.utils";
import { setSelectedAuthorId } from "../../reducers/user";

export default function DatabaseAuthors() {
  const dispatch = useDispatch();
  const router = useRouter();

  const token = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const article = useSelector((state) => state.article); // <- le reducer article
  const isLoggedIn = Boolean(token && projectId);

  const [authors, setAuthors] = useState([]);

  // callback à passer à chaque AuthorCard en inverse data flow pour réactualiser la liste après la suppression d'un auteur
  const handleDeleteAuthor = (deletedId) => {
    setAuthors((prev) => prev.filter((a) => a.id !== deletedId));
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;

    const fetchAuthors = async () => {
      try {
        if (!article || !article.authors || article.authors.length === 0) {
          // ✅ Pas d'article sélectionné → on récupère tous les auteurs
          const res = await fetch(
            `${backendUrl}/authors?projectId=${projectId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) throw new Error("Erreur chargement auteurs");
          const allAuthors = await res.json();
          setAuthors(allAuthors);
        } else {
          // ✅ Article sélectionné → on récupère uniquement les auteurs associés
          const authorFetches = article.authors.map((authorId) =>
            fetch(`${backendUrl}/authors/${authorId}?projectId=${projectId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).then((res) => res.json())
          );

          const authorsData = await Promise.all(authorFetches);
          setAuthors(authorsData);
        }
      } catch (err) {
        console.error("Erreur chargement auteurs:", err);
        setAuthors([]);
      }
    };

    fetchAuthors();
  }, [article, isLoggedIn, token, projectId]);

  const handleClick = (author) => {
    if (!author.id) return;
    dispatch(
      setAuthor({
        ...author,
        topic_tree: convertTopicTreeForReducer(author.topic_tree || {}),
        isInDb: true,
      })
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4 ml-8">👩‍🎨 Auteurs annotés</h2>

      {!isLoggedIn ? (
        <p className="text-gray-500 italic">
          Vous devez être connecté pour voir les auteurs.
        </p>
      ) : authors.length === 0 ? (
        <p className="text-gray-500 italic">Aucun auteur pour le moment.</p>
      ) : (
        <div className="columns-1 sm:columns-2 gap-4">
          {authors.map((author) => (
            <div key={author.id} className="mb-4 break-inside-avoid">
              <AuthorCard
                key={author.id || author._id}
                author={author}
                onClick={() => handleClick(author)}
                onDelete={handleDeleteAuthor}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
