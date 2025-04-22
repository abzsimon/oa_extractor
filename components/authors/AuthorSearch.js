import Image from "next/image";
import { useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { clearAuthor, setAuthor } from "../../reducers/author";
import {
  buildTopicTree,
  convertTopicTreeForReducer,
  getTopFiveFields,
  getTopTwoDomains,
} from "./Authors.utils";
import AuthorCard from "./AuthorCard";

export default function AuthorSearch({ onAuthorSelected, oa_id }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [disambiguationQuery, setDisambiguationQuery] = useState("");
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  const alreadyLoaded = useRef(false); // ✅ éviter double chargement

  // 🔄 Si on arrive avec un ?oa_id=... depuis un autre écran
  useEffect(() => {
    if (oa_id && !alreadyLoaded.current) {
      alreadyLoaded.current = true;
      dispatch(clearAuthor());
      handleSelectAuthor({ oa_id });

      // Nettoyer l'URL après chargement
      router.replace("/Authors", undefined, { shallow: true });
    }
  }, [oa_id]);

  const fetchData = async () => {
    if (!disambiguationQuery.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch(
        `https://api.openalex.org/autocomplete/authors?q=${disambiguationQuery}`
      );
      const data = await res.json();
      const parsed = (data.results || []).map((a) => ({
        oa_id: a.id.match(/A\d+/)?.[0] || "",
        orcid_id:
          a.external_id?.match(/\d{4}-\d{4}-\d{4}-\d{4}/)?.[0] || "",
        name: a.display_name || "Unknown Author",
        workCount: a.works_count || 0,
      }));
      setAuthors(parsed);
    } catch (err) {
      console.error("❌ Error fetching authors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAuthor = async (author) => {
    const { oa_id } = author;
    if (!oa_id) return;

    setSelectedAuthor(author);

    try {
      // Check local DB first
      const dbRes = await fetch(`https://oa-extractor-backend.vercel.app/authors/${oa_id}`);
      if (dbRes.ok) {
        console.log("vercel backend reached")
        const dbAuthor = await dbRes.json();
        const structured = {
          ...dbAuthor,
          topic_tree: convertTopicTreeForReducer(dbAuthor.topic_tree),
          isInDb: true,
        };
        dispatch(setAuthor(structured));
        onAuthorSelected?.(structured);
        return;
      }

      // Fallback to OpenAlex
      const res = await fetch(`https://api.openalex.org/authors/${oa_id}`);
      const data = await res.json();

      const typesRes = await fetch(`${data.works_api_url}&group_by=type`);
      const typesData = await typesRes.json();
      const doctypes = (typesData.group_by || [])
        .filter((d) => d.count > 0)
        .map((d) => ({
          name: d.key_display_name,
          quantity: d.count,
        }));

      const topic_tree = buildTopicTree(data.topics || []);
      const top_two_domains = getTopTwoDomains(topic_tree);
      const top_five_fields = getTopFiveFields(topic_tree);
      const top_five_topics = (data.topics || [])
        .slice(0, 5)
        .map((t) => t.display_name);

      const structuredAuthor = {
        oa_id: data.id.replace("https://openalex.org/", ""),
        orcid: data.orcid?.replace("https://orcid.org/", "") || "",
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
      };

      dispatch(setAuthor(structuredAuthor));
      onAuthorSelected?.(structuredAuthor);
    } catch (err) {
      console.error("❌ Error retrieving author data:", err);
    } finally {
      setSelectedAuthor(null);
    }
  };

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
              placeholder="Enter author name (min. 10 chars)"
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

        {isLoading && (
          <p className="text-blue-600 text-center">Searching for authors...</p>
        )}

        {authors.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              Found Authors ({authors.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {authors.map((author, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAuthor(author)}
                  className={`relative cursor-pointer ${
                    selectedAuthor?.oa_id === author.oa_id
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  {selectedAuthor?.oa_id === author.oa_id && (
                    <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center rounded-lg">
                      <p className="text-blue-600 font-medium animate-pulse">
                        Loading...
                      </p>
                    </div>
                  )}

                  <AuthorCard
                    author={{
                      display_name: author.name,
                      oa_id: author.oa_id,
                      orcid: author.orcid_id,
                      works_count: author.workCount,
                    }}
                    source="autocomplete"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
