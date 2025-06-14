import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setArticle } from "../../reducers/article";
import ArticleSearch from "./ArticleSearch";
import ArticleCard from "./ArticleCard";

export default function ArticleOpenAlexMetadata() {
  const dispatch = useDispatch();

  const token = useSelector((s) => s.user.token);
  const projectId = useSelector((s) => s.user.projectIds?.[0]);
  const selectedArticleId = useSelector((s) => s.user.selectedArticleId);
  const article = useSelector((s) => s.article);
  const isLoggedIn = Boolean(token && projectId);

  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
  const apiUrl = `${backendUrl}/articles`;

  const extractId = (url) => {
    const match = url?.match(/([WA]\d+)$/);
    return match ? match[0] : url;
  };

  const reconstructAbstract = (abstractInvertedIndex) => {
    if (!abstractInvertedIndex) return "";
    const index = {};
    for (const [word, positions] of Object.entries(abstractInvertedIndex)) {
      for (const pos of positions) {
        index[pos] = word;
      }
    }
    return Object.keys(index)
      .sort((a, b) => a - b)
      .map((k) => index[k])
      .join(" ");
  };

  const fetchArticle = useCallback(async () => {
    if (!selectedArticleId) {
      dispatch(setArticle({}));
      return;
    }

    // 1. Tentative DB
    if (isLoggedIn) {
      try {
        const res = await fetch(
          `${apiUrl}/${selectedArticleId}?projectId=${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const dbArticle = await res.json();
          dispatch(setArticle({ ...dbArticle, isInDb: true }));
          return;
        }
      } catch (err) {
        console.error("❌ Erreur DB :", err);
      }
    }

    // 2. Fallback OpenAlex
    try {
      const res = await fetch(`https://api.openalex.org/works/${selectedArticleId}`);
      if (!res.ok) throw new Error("Échec OpenAlex");

      const data = await res.json();

      const authorsList = data.authorships.map((author) => ({
        name: author.author?.display_name || "Unknown Author",
        oaId: extractId(author.author?.id) || "N/A",
      }));

      const article = {
        id: extractId(data.id),
        title: data.display_name || "Untitled Article",
        authors: authorsList.map((a) => a.oaId),
        authorsFullNames: authorsList.map((a) => a.name),
        publishedIn: data.primary_location?.source?.display_name || "",
        abstract: reconstructAbstract(data.abstract_inverted_index),
        url: data.primary_location?.landing_page_url || "",
        pubyear: data.publication_year,
        doi: data.doi,
        pdfRelativePath: data.primary_location?.pdf_url || "",
        referenceType: data.type,
        oa_status: data.open_access?.is_oa || false,
        topics: [...new Set(data.topics?.map((t) => t.display_name).filter(Boolean) || [])],
        domains: [...new Set(data.topics?.map((t) => t.domain?.display_name).filter(Boolean) || [])],
        fields: [...new Set(data.topics?.map((t) => t.field?.display_name).filter(Boolean) || [])],
        subfields: [...new Set(data.topics?.map((t) => t.subfield?.display_name).filter(Boolean) || [])],
        isInDb: false,
        source: "openalex"
      };

      dispatch(setArticle(article));
    } catch (err) {
      console.error("❌ Erreur OpenAlex :", err);
      dispatch(setArticle({}));
    }
  }, [selectedArticleId, isLoggedIn, token, projectId, apiUrl, dispatch]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return (
    <div className="flex flex-col gap-4">
      <ArticleSearch />
      {article?.id ? (
        <ArticleCard article={article} />
      ) : (
        <p className="text-gray-600">Aucun article sélectionné.</p>
      )}
    </div>
  );
}
