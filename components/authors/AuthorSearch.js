import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { setAuthor } from "../../reducers/author";
import {
  buildTopicTree,
  convertTopicTreeForReducer,
  getTopFiveFields,
  getTopTwoDomains,
} from "./Authors.utils";
import AuthorCard from "./AuthorCard";

export default function AuthorSearch() {
  const dispatch = useDispatch();

  // --- Redux auth ----------------------------------------------------
  const token = useSelector((s) => s.user.token);
  const projectId = useSelector((s) => s.user.projectIds?.[0]);
  const isLoggedIn = Boolean(token && projectId);
  const finalAuthor = useSelector((s) => s.author)

  // --- Config API --------------------------------------------------
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
  const apiUrl = `${backendUrl}/authors`;

  // --- Local state ------------------------------------------------
  const [disambiguationQuery, setDisambiguationQuery] = useState("");
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // ----------------------------------------------------------------
  // Autocomplete fetch (OpenAlex)
  // ----------------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (disambiguationQuery.trim().length < 5) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.openalex.org/autocomplete/authors?q=${disambiguationQuery}`
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      const parsed = (data.results || []).map((a) => ({
        id: a.id.match(/A\d+/)?.[0] || a.id,
        orcid:
          a.external_id?.match(/\d{4}-\d{4}-\d{4}-\d{4}/)?.[0] || "",
        name: a.display_name || "Unknown Author",
        workCount: a.works_count || 0,
        isInDb : false,
      }));
      setAuthors(parsed);
    } catch (err) {
      console.error("❌ Error fetching authors:", err);
      setError("Une erreur est survenue lors de la recherche.");
    } finally {
      setIsLoading(false);
    }
  }, [disambiguationQuery]);

  // ----------------------------------------------------------------
  // Select author (DB or OpenAlex)
  // ----------------------------------------------------------------
  const handleSelectAuthor = useCallback(
    async (author) => {
      const { id } = author;
      if (!id) return;
      setSelectedAuthor(author);
        console.log(finalAuthor)

      try {
        // 1) Interne si connecté
        if (isLoggedIn) {
          const dbRes = await fetch(
            `${apiUrl}/${id}?projectId=${projectId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (dbRes.ok) {
            const dbAuthor = await dbRes.json();
            const structured = {
              ...dbAuthor,
              topic_tree: convertTopicTreeForReducer(dbAuthor.topic_tree),
              isInDb: true,
            };
            dispatch(setAuthor(structured));
            return;
          }
        }

        // 2) Fallback OpenAlex
        const res = await fetch(`https://api.openalex.org/authors/${id}`);
        const data = await res.json();
        const typesRes = await fetch(
          `${data.works_api_url}&group_by=type`
        );
        const typesData = await typesRes.json();
        const doctypes = (typesData.group_by || [])
          .filter((d) => d.count > 0)
          .map((d) => ({ name: d.key_display_name, quantity: d.count }));

        const topic_tree = buildTopicTree(data.topics || []);
        const top_two_domains = getTopTwoDomains(topic_tree);
        const top_five_fields = getTopFiveFields(topic_tree);
        const top_five_topics = (data.topics || [])
          .slice(0, 5)
          .map((t) => t.display_name);

        const structuredAuthor = {
          id: data.id.replace("https://openalex.org/", ""),
          orcid:
            data.orcid?.replace("https://orcid.org/", "") || "",
          display_name: data.display_name || "",
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
          top_five_topics,
          top_five_fields,
          top_two_domains,
          topic_tree,
          gender: "",
          status: "",
          annotation: "",
          isInDb: false,
          source: "openalex",
        };

        dispatch(setAuthor(structuredAuthor));
      } catch (err) {
        console.error("❌ Error retrieving author data:", err);
        setError("Impossible de charger les détails de l'auteur.");
      } finally {
        setSelectedAuthor(null);
      }
    },
    [isLoggedIn, apiUrl, projectId, token, dispatch]
  );

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="w-full flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Image
              src="https://openalex.org/img/openalex-logo-icon-black-and-white.ea51cede.png"
              alt="OpenAlex Logo"
              width={40}
              height={40}
              className="filter brightness-50"
            />
            <h1 className="text-xl font-bold text-gray-800">
              OpenAlex Author Search
            </h1>
          </div>

          <div className="flex gap-2 w-1/2">
            <input
              type="text"
              value={disambiguationQuery}
              onChange={(e) => setDisambiguationQuery(e.target.value)}
              placeholder="Enter author name (min. 5 chars)"
              className="flex-grow h-10 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={fetchData}
              disabled={isLoading || disambiguationQuery.trim().length < 5}
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium disabled:bg-gray-400"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}
        {isLoading && <p className="text-blue-600 text-center">Searching for authors...</p>}

        {authors.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              Found Authors ({authors.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {authors.map((author) => (
                <div
                  key={author.id}
                  onClick={() => handleSelectAuthor(author)}
                  className={`relative cursor-pointer ${
                    selectedAuthor?.id === author.id ? "opacity-60" : ""
                  }`}
                >
                  {selectedAuthor?.id === author.id && (
                    <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center rounded-lg">
                      <p className="text-blue-600 font-medium animate-pulse">
                        Loading...
                      </p>
                    </div>
                  )}

                  <AuthorCard
                    author={{
                      display_name: author.name,
                      id:            author.id,
                      orcid:         author.orcid,
                      works_count:   author.workCount,
                    }}
                    source="autocomplete"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          !isLoading && disambiguationQuery.trim().length >= 5 && !error && (
            <p className="text-center text-gray-500">Aucun auteur trouvé.</p>
          )
        )}
      </div>
    </div>
  );
}