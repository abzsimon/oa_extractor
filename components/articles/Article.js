import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { setArticle } from "../../reducers/article";
import AuthorCard from "../../components/authors/AuthorCard";
import ArticleCard from "../../components/articles/ArticleCard";
import ArticleSearch from "../../components/articles/ArticleSearch";
import ArticleForm from "./ArticleForm";

export default function ArticlePage() {
  // C'est LUI le vrai identifiant fiable, venant du sélecteur
  const selectedArticleId =
    useSelector((state) => state.user.selectedArticleId) || "";
  const dispatch = useDispatch();
  const [authors, setAuthors] = useState([]);

  // Pour reconstruire un abstract OpenAlex
  const reconstructAbstract = (abstractInvertedIndex) => {
    if (!abstractInvertedIndex) return "";
    const abstractIndex = {};
    for (const [key, valueList] of Object.entries(abstractInvertedIndex)) {
      for (const value of valueList) {
        abstractIndex[value] = key;
      }
    }
    const sortedKeys = Object.keys(abstractIndex).sort((a, b) => a - b);
    return sortedKeys.map((key) => abstractIndex[key]).join(" ");
  };

  // Helper function to extract ID from OpenAlex URL
  const extractId = (url) => {
    if (!url) return "";
    // Extract ID pattern (W\d+ for works, A\d+ for authors) from a full OpenAlex URL
    const match = url.match(/([WA]\d+)$/);
    return match ? match[0] : url;
  };

  // Core logic: toujours checker DB d'abord, puis OpenAlex sinon
  const fetchData = useCallback(async () => {
    const id = selectedArticleId;
    if (!id) {
      setAuthors([]);
      dispatch(setArticle({}));
      return;
    }

    // 1. Chercher dans la base locale
    try {
      const dbRes = await fetch(
        `https://oa-extractor-backend.vercel.app/articles/${id}`
      );
      if (dbRes.ok) {
        const dbArticle = await dbRes.json();
        // On retransforme authors pour affichage sur la gauche
        setAuthors(dbArticle.authors?.map((oaId) => ({ oaId })) || []);
        dispatch(setArticle({ ...dbArticle, isInDb: true }));
        return; // STOP ! Pas besoin de chercher OpenAlex.
      }
    } catch (err) {
      // On tente OpenAlex en fallback
    }

    // 2. Sinon, requête OpenAlex
    try {
      const res = await fetch(`https://api.openalex.org/works/${id}`);
      if (!res.ok) throw new Error("Failed to fetch article");
      const data = await res.json();

      const authorsList = data.authorships.map((author) => ({
        name: author.author?.display_name || "Unknown Author",
        oaId: extractId(author.author?.id) || "N/A",
        orcId: author.author?.orcid || "N/A",
        institutions: [
          ...new Set(
            (author.institutions || [])
              .map((inst) => inst.display_name)
              .filter(Boolean)
          ),
        ],
        countries: author.countries ? [...new Set(author.countries)] : [],
      }));

      setAuthors(authorsList);

      const articleDetails = {
        id: extractId(data.id),
        title: data.display_name || "Untitled Article",
        authors: authorsList.map((a) => a.oaId),
        authorsFullNames: authorsList.map(a => a.name),
        publishedIn: data.primary_location?.source?.display_name || "",
        abstract: reconstructAbstract(data.abstract_inverted_index),
        url: data.primary_location?.landing_page_url || "",
        pubyear: data.publication_year,
        doi: data.doi,
        pdfRelativePath: data.primary_location?.pdf_url || "",
        referenceType: data.type,
        oa_status: data.open_access?.is_oa || false,
        topics: [
          ...new Set(
            data.topics?.map((t) => t.display_name).filter(Boolean) || []
          ),
        ],
        domains: [
          ...new Set(
            data.topics?.map((t) => t.domain?.display_name).filter(Boolean) ||
              []
          ),
        ],
        fields: [
          ...new Set(
            data.topics?.map((t) => t.field?.display_name).filter(Boolean) || []
          ),
        ],
        subfields: [
          ...new Set(
            data.topics?.map((t) => t.subfield?.display_name).filter(Boolean) ||
              []
          ),
        ],
        isInDb: false, // Indique à l'UI "propose l'enregistrement"
      };

      dispatch(setArticle(articleDetails));
    } catch (err) {
      setAuthors([]);
      dispatch(setArticle({}));
      console.error("Fetch error:", err);
    }
  }, [selectedArticleId, dispatch]);

  // Rafraîchit à chaque changement de sélection
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Données Redux actuelles (pour ArticleCard)
  const articleRedux = useSelector((state) => state.article);

  return (
    <>
      <Head>
        <title>OA Extractor</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
        {/* Left Pane – Article Search */}
        <div className="lg:w-2/5 w-full p-4 flex flex-col h-full">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="w-full">
              <ArticleSearch />
            </div>
          </div>
          {/* Article Info */}
          <div className="flex-1 overflow-auto mb-2">
            {articleRedux && articleRedux.id ? (
              <ArticleCard article={articleRedux} />
            ) : (
              <p className="text-gray-600">Aucun article sélectionné.</p>
            )}
          </div>
          {/* Authors Section */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Authors ↓</h1>
            <h2 className="text-xs text-gray-900 italic">
              Click on author card to edit in author view
            </h2>
          </div>
          {authors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
              {authors.map((author, index) => (
                <div key={index} className="cursor-pointer">
                  <AuthorCard author={author} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No authors found.</p>
          )}
        </div>
        {/* Right Pane – Annotation */}
        <div className="lg:w-3/5 w-full p-4 bg-white shadow-md border-r border-gray-300 overflow-auto flex flex-col">
          <div className="flex-grow overflow-auto">
            <ArticleForm />
          </div>
        </div>
      </div>
    </>
  );
}