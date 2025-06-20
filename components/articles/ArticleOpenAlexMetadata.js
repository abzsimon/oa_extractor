import { useEffect, useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setArticle } from "../../reducers/article";
import ArticleSearch from "./ArticleSearch";
import ArticleCard from "./ArticleCard";
import {
  buildTopicTree,
  convertTopicTreeForMongoose,
  getTopFiveFields,
  getTopTwoDomains,
} from "../authors/Authors.utils";

export default function ArticleOpenAlexMetadata() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.user.token);
  const projectId = useSelector((s) => s.user.projectIds?.[0]);
  const selectedArticleId = useSelector((s) => s.user.selectedArticleId);
  const article = useSelector((s) => s.article);
  const isLoggedIn = Boolean(token && projectId);
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
  const apiUrl = `${backendUrl}/articles`;

  const authorsToSync = useRef([]);
  const [syncStatus, setSyncStatus] = useState("");

  const extractId = (url) => {
    const match = url?.match(/([WA]\d+)$/);
    return match ? match[0] : url;
  };

  const reconstructAbstract = (abstractInvertedIndex) => {
    if (!abstractInvertedIndex) return "";
    const index = {};
    for (const [word, positions] of Object.entries(abstractInvertedIndex)) {
      for (const pos of positions) index[pos] = word;
    }
    return Object.keys(index)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((k) => index[k])
      .join(" ");
  };

  const fetchArticle = useCallback(async () => {
    if (!selectedArticleId) {
      dispatch(setArticle({}));
      return;
    }

    // 1. Chercher dans la DB
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

    // 2. Sinon, fallback OpenAlex
    try {
      const res = await fetch(
        `https://api.openalex.org/works/${selectedArticleId}`
      );
      if (!res.ok) throw new Error("Échec OpenAlex");
      const data = await res.json();

      const authorsList = data.authorships.map((a) => ({
        name: a.author?.display_name || "Unknown Author",
        oaId: extractId(a.author?.id) || "N/A",
      }));

      const newArticle = {
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
        source: "openalex",
      };

      dispatch(setArticle(newArticle));
    } catch (err) {
      console.error("❌ Erreur OpenAlex :", err);
      dispatch(setArticle({}));
    }
  }, [selectedArticleId, isLoggedIn, token, projectId, apiUrl, dispatch]);

  const handleSyncAuthors = async () => {
    setSyncStatus("⏳ Requête en cours...");

    try {
      // 1. Récupération depuis OpenAlex
      const res = await fetch(
        `https://api.openalex.org/works/${selectedArticleId}`
      );
      if (!res.ok)
        throw new Error("Impossible de récupérer les auteurs OpenAlex");
      const data = await res.json();

      const authorsList = data.authorships.map((a) => ({
        name: a.author?.display_name || "Unknown Author",
        oaId: extractId(a.author?.id) || "N/A",
      }));

      const enrichedAuthors = await Promise.all(
        authorsList.map(async ({ name, oaId }) => {
          try {
            const res = await fetch(`https://api.openalex.org/authors/${oaId}`);
            const data = await res.json();

            const typesRes = await fetch(`${data.works_api_url}&group_by=type`);
            const typesData = await typesRes.json();
            const doctypes = (typesData.group_by || [])
              .filter((d) => d.count > 0)
              .map((d) => ({ name: d.key_display_name, quantity: d.count }));

            const topicTree = buildTopicTree(data.topics || []);

            return {
              id: oaId,
              orcid: data.orcid?.replace("https://orcid.org/", "") || "",
              display_name: name,
              cited_by_count: data.cited_by_count || 0,
              works_count: data.works_count || 0,
              institutions: data.last_known_institution?.display_name
                ? [data.last_known_institution.display_name]
                : [],
              countries: data.last_known_institution?.country_code
                ? [data.last_known_institution.country_code.toUpperCase()]
                : [],
              overall_works: data.works_api_url,
              doctypes,
              study_works: [],
              top_five_topics: (data.topics || [])
                .slice(0, 5)
                .map((t) => t.display_name),
              top_five_fields: getTopFiveFields(topicTree),
              top_two_domains: getTopTwoDomains(topicTree),
              topic_tree: convertTopicTreeForMongoose(topicTree),
              gender: "",
              status: "",
              annotation: "",
              isInDb: false,
              source: "openalex",
              projectId,
            };
          } catch {
            return {
              id: oaId,
              display_name: name,
              source: "openalex",
              projectId,
            };
          }
        })
      );

      authorsToSync.current = enrichedAuthors;

      // 2. Création des auteurs
      const bulkRes = await fetch(`${backendUrl}/authors/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authorsToSync.current),
      });

      const bulkData = await bulkRes.json();
      if (!bulkRes.ok) {
        setSyncStatus(`❌ Erreur: ${bulkData.message}`);
        return;
      }

      // 3. PATCH article
      const authors = authorsToSync.current.map((a) => a.id);
      const authorsFullNames = authorsToSync.current.map((a) => a.display_name);

      const patchRes = await fetch(
        `${backendUrl}/articles/${selectedArticleId}/authors?projectId=${projectId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authors: authorsToSync.current.map((a) => a.id),
            authorsFullNames: authorsToSync.current.map((a) => a.display_name),
          }),
        }
      );

      if (!patchRes.ok) {
        const err = await patchRes.json();
        setSyncStatus(
          `⚠️ Créés mais erreur mise à jour article : ${err.message}`
        );
        return;
      }

      dispatch(setArticle({ ...article, authors, authorsFullNames }));
      setSyncStatus(
        `✅ ${bulkData.created} créés, ${bulkData.skipped} ignorés, article mis à jour`
      );
    } catch (err) {
      console.error("❌ handleSyncAuthors:", err);
      setSyncStatus("❌ Erreur réseau ou OpenAlex");
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return (
    <div className="flex flex-col gap-4">
      <ArticleSearch />
      {article?.id ? (
        <>
          <ArticleCard article={article} />
          <button
            onClick={handleSyncAuthors}
            className="self-start px-8 py-1 bg-gray-400 text-sm text-white rounded hover:bg-green-600"
          >
            📥 envoyer / resynchroniser les auteurs en DB
          </button>
          {syncStatus && <p className="text-sm text-gray-700">{syncStatus}</p>}
        </>
      ) : (
        <p className="text-gray-600">Aucun article sélectionné.</p>
      )}
    </div>
  );
}
