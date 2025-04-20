import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { setAuthor } from "../../reducers/author";
import {
  buildTopicTree,
  getTopTwoDomains,
  getTopFiveFields,
} from "./Authors.utils";
import { convertTopicTreeForReducer } from "./Authors.utils";

export default function AuthorSearch({ onAuthorSelected }) {
  const dispatch = useDispatch();
  const OaWorksQuery = useSelector((state) => state.user.OaWorksQuery);
  const [disambiguationQuery, setDisambiguationQuery] = useState("");
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  const fetchData = async () => {
    if (!disambiguationQuery.trim()) return;
    setIsLoading(true);

    const apiUrl = `https://api.openalex.org/autocomplete/authors?q=${disambiguationQuery}`;

    try {
      const response = await fetch(apiUrl, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch authors");

      const data = await response.json();
      const rawAuthorsResults = data.results || [];

      if (rawAuthorsResults.length > 0) {
        const parsedAuthors = rawAuthorsResults.map((author) => ({
          oa_id: author.id.match(/A\d+/)?.[0] || "",
          orcid_id:
            author.external_id?.match(/\d{4}-\d{4}-\d{4}-\d{4}/)?.[0] || "",
          name: author.display_name || "Unknown Author",
          workCount: author.works_count || 0,
        }));
        setAuthors(parsedAuthors);
      } else {
        setAuthors([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAuthor = async (author) => {
    const { oa_id } = author;
    if (!oa_id) return;
  
    setSelectedAuthor(author);
  
    try {
      // 🧪 1. Check si l'auteur existe dans ta DB interne
      const dbRes = await fetch(`http://localhost:3000/authors/${oa_id}`);
  
      if (dbRes.ok) {
        const dbAuthor = await dbRes.json();
        console.log("📥 Auteur trouvé dans la DB:", dbAuthor);
  
        // ✅ Convertir topic_tree avant dispatch
        const transformedAuthor = {
          ...dbAuthor,
          topic_tree: convertTopicTreeForReducer(dbAuthor.topic_tree),
          isInDb: true,
        };
        console.log("DB Author reçu : ", dbAuthor);
        dispatch(setAuthor(transformedAuthor));
  
        if (onAuthorSelected && typeof onAuthorSelected === 'function') {
          onAuthorSelected(transformedAuthor);
        }
  
        return; // 🛑 Stop ici : pas besoin d'aller chez OpenAlex
      }
  
      // 📥 2. Sinon, fallback sur OpenAlex
      const res = await fetch(`https://api.openalex.org/authors/${oa_id}`);
      const data = await res.json();
  
      // 📚 3. Types de documents
      const typesRes = await fetch(`${data.works_api_url}&group_by=type`);
      const typesData = await typesRes.json();
      const doctypes = (typesData.group_by || [])
        .filter((d) => d.count > 0)
        .map((d) => ({
          name: d.key_display_name,
          quantity: d.count,
        }));
  
      // 🌳 4. Arbre thématique
      const topic_tree = buildTopicTree(data.topics || []);
  
      // 🔝 5. Résumés
      const top_two_domains = getTopTwoDomains(topic_tree);
      const top_five_fields = getTopFiveFields(topic_tree);
      const top_five_topics = (data.topics || [])
        .slice(0, 5)
        .map((t) => t.display_name);
  
      // 🧩 6. Auteur structuré
      const structuredAuthor = {
        oa_id: data.id.replace("https://openalex.org/", ""),
        orcid: data.orcid?.replace("https://orcid.org/", "") || "",
        display_name: data.display_name || "",
        cited_by_count: data.cited_by_count || 0,
        works_count: data.works_count || 0,
        institutions: author.institution?.display_name
        ? [author.institution.display_name]
        : [],
      countries: author.institution?.country_code
        ? [author.institution.country_code.toUpperCase()]
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
      };
  
      dispatch(setAuthor(structuredAuthor));
      console.log("✅ Auteur structuré envoyé au reducer :", structuredAuthor);
  
      if (onAuthorSelected && typeof onAuthorSelected === 'function') {
        onAuthorSelected(structuredAuthor);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'auteur :", error);
    } finally {
      setSelectedAuthor(null);
    }
  };
  
  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-6">
        {/* Header with Logo and Search */}
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
              placeholder="Enter author name (minimum 10 characters)..."
              className="flex-grow h-10 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium disabled:bg-gray-400"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Search Status */}
        <div className="w-full text-center">
          {isLoading && (
            <p className="text-blue-600">Searching for authors...</p>
          )}
        </div>

        {/* Results Grid - Taking more horizontal space */}
        {authors.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              Found Authors ({authors.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {authors.map((author, index) => {
                const identifier = author.orcid_id || author.oa_id;
                const isSelected = OaWorksQuery?.includes(identifier);

                return (
                  <div
                    key={index}
                    onClick={() => handleSelectAuthor(author)}
                    className={`bg-white p-3 shadow-md rounded-lg cursor-pointer flex flex-col transition-all duration-200 h-48 ${
                      isSelected
                        ? "border-2 border-red-400 transform scale-105"
                        : "hover:border-red-300 border border-gray-200 hover:shadow-lg"
                    } ${
                      selectedAuthor?.oa_id === author.oa_id ? "opacity-70" : ""
                    }`}
                  >
                    {selectedAuthor?.oa_id === author.oa_id && (
                      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg">
                        <p className="text-blue-600 font-medium animate-pulse">
                          Loading author data...
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {author.name}
                      </h3>
                      {isSelected && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="mb-2">
                        {author.oa_id && (
                          <div className="border border-gray-300 rounded px-2 py-1 bg-gray-50 mb-1 flex items-center">
                            <span className="font-medium text-gray-600 mr-1 text-xs">
                              OpenAlex ID:
                            </span>
                            <span className="text-blue-600 text-xs truncate">
                              {author.oa_id}
                            </span>
                          </div>
                        )}

                        {author.orcid_id ? (
                          <a
                            href={`https://orcid.org/${author.orcid_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-green-200 rounded px-2 py-1 bg-green-50 hover:bg-green-100 flex items-center mb-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-green-700 text-xs mr-1">
                              ORCID:
                            </span>
                            <span className="text-green-600 text-xs truncate">
                              {author.orcid_id}
                            </span>
                          </a>
                        ) : (
                          <div className="border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-500 text-xs mb-2">
                            No ORCID ID available
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {author.workCount > 0 && (
                        <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          {author.workCount} Publications
                        </div>
                      )}

                      <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}