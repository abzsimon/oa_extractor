import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { setArticle } from "../../reducers/article";
import AuthorCard from "../../components/authors/AuthorCard";
import ArticleCard from "../../components/articles/ArticleCard";
import ArticleSearch from "../../components/articles/ArticleSearch";
import ArticleForm from "./ArticleForm";

export default function ArticlePage() {
  const selectedArticleId =
    useSelector((state) => state.user.selectedArticleId) || "";
  const dispatch = useDispatch();
  const [authors, setAuthors] = useState([]);

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

  const extractId = (url) => {
    if (!url) return "";
    const match = url.match(/([WA]\d+)$/);
    return match ? match[0] : url;
  };

  const fetchData = useCallback(async () => {
    const id = selectedArticleId;
    if (!id) {
      setAuthors([]);
      dispatch(setArticle({}));
      return;
    }

    try {
      const dbRes = await fetch(
        `https://oa-extractor-backend.vercel.app/articles/${id}`
      );
      if (dbRes.ok) {
        const dbArticle = await dbRes.json();
        setAuthors(dbArticle.authors?.map((oaId) => ({ oaId })) || []);
        dispatch(setArticle({ ...dbArticle, isInDb: true }));
        return;
      }
    } catch {}

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
        authorsFullNames: authorsList.map((a) => a.name),
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
        isInDb: false,
      };

      dispatch(setArticle(articleDetails));
    } catch (err) {
      setAuthors([]);
      dispatch(setArticle({}));
      console.error("Fetch error:", err);
    }
  }, [selectedArticleId, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const articleRedux = useSelector((state) => state.article);

  return (
    <>
      <Head>
        <title>OA Extractor</title>
      </Head>
      <div className="flex h-screen">
        {/* Colonne de gauche 4/10 */}
        <div className="w-2/5 p-4 flex flex-col">
          {/* Barre de recherche */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="w-full">
              <ArticleSearch />
            </div>
          </div>
          {/* Article info scrollable */}
          <div className="flex-1 overflow-auto mb-4 max-h-[50vh]">
            {articleRedux && articleRedux.id ? (
              <ArticleCard article={articleRedux} />
            ) : (
              <p className="text-gray-600">Aucun article sélectionné.</p>
            )}
          </div>
          {/* Auteurs en bas */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              {authors.map((author, idx) => (
                <div key={idx} className="cursor-pointer">
                  <AuthorCard author={author} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Colonne de droite 6/10 */}
        <div className="w-3/5 p-1 overflow-auto flex flex-col justify-start">
          <ArticleForm />
        </div>
      </div>
    </>
  );
}
