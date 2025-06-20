// ./components/authors/Authors.js
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { convertTopicTreeForReducer } from "./Authors.utils";
import AuthorSearch from "./AuthorSearch";
import AuthorViewer from "./AuthorViewer";
import { setAuthor } from "../../reducers/author";

export default function Authors() {
  const router = useRouter();
  const { id } = router.query;
  const { isReady } = router;
  const dispatch = useDispatch();

  // --- Sélecteurs Redux ----------------------------------------------------
  const token = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const isLoggedIn = Boolean(token && projectId);

  // --- Config API -----------------------------------------------------------
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND; // ex: http://localhost:3000
  const apiUrl = `${backendUrl}/authors`;

  useEffect(() => {
    // On attend que Next.js ait peuplé router.query et que l'utilisateur soit connecté
    if (!isReady || !id || !isLoggedIn) return;

    const fetchAuthor = async () => {
      try {
        const response = await fetch(`${apiUrl}/${id}?projectId=${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        dispatch(
          setAuthor({
            ...data,
            isInDb: true,
            topic_tree: convertTopicTreeForReducer(data.topic_tree),
          })
        );
      } catch (error) {
        console.error("Erreur lors du fetch de l’auteur :", error);
      }
    };

    fetchAuthor();
  }, [isReady, id, isLoggedIn, apiUrl, projectId, token, dispatch]);

  // Quand l'utilisateur sélectionne un auteur dans AuthorSearch, l'auteur est toujours OpenAlex, soit déjà stocké en DB (source="openalex", isInDb="true"), soit pas encore (source="openalex", isInDb="false").

  const handleAuthorSelected = (selected) => {
    dispatch(setAuthor(selected));
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm p-3"></div>
      <div className="flex flex-column bg-white border border-gray-200 rounded-lg p-4 m-2">
        <AuthorSearch onAuthorSelected={handleAuthorSelected} />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 m-2">
        <AuthorViewer />
      </div>
    </div>
  );
}
