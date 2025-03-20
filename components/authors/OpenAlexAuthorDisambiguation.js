import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { setOaWorksQuery } from "../../reducers/user";

export default function OpenAlexAuthorDisambiguation() {
  const dispatch = useDispatch();
  const OaWorksQuery = useSelector((state) => state.user.OaWorksQuery);
  const [disambiguationQuery, setDisambiguationQuery] = useState("");

  useEffect(() => {
    if (disambiguationQuery.length > 10) {
      fetchData();
    }
  }, [disambiguationQuery]);

  const [authors, setAuthors] = useState([]);

  const fetchData = async () => {
    if (!disambiguationQuery.trim()) return;
    const apiUrl = `https://api.openalex.org/autocomplete/authors?q=${disambiguationQuery}`;

    try {
      const response = await fetch(apiUrl, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch authors");

      const data = await response.json();
      const rawAuthorsResults = data.results || [];

      if (rawAuthorsResults.length > 0) {
        const parsedAuthors = rawAuthorsResults.map((author) => ({
          oaId: author.id.match(/A\d+/)?.[0] || "",
          orcidId:
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
    }
  };

  const handleSelectAuthor = (author) => {
    const { orcidId, oaId } = author;
    if (!orcidId && !oaId) return;

    const newQuery = orcidId
      ? `https://api.openalex.org/works?filter=author.orcid:${orcidId}`
      : `https://api.openalex.org/works?filter=author.id:${oaId}`;

    if (OaWorksQuery !== newQuery) {
      dispatch(setOaWorksQuery(newQuery));
    }
  };

  return (
    <div className="p-2 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Image
          src="https://openalex.org/img/openalex-logo-icon-black-and-white.ea51cede.png"
          alt="OpenAlex Logo"
          width={30}
          height={30}
        />
        <input
          type="text"
          value={disambiguationQuery}
          onChange={(e) => setDisambiguationQuery(e.target.value)}
          placeholder="Enter author name..."
          className="flex-1 h-8 p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchData}
          className="bg-red-400 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
        >
          Search
        </button>
      </div>

      {/* Authors Section */}
      <h1 className="text-lg font-bold text-gray-900 mb-2">Authors</h1>

      {authors.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {authors.map((author, index) => {
            const identifier = author.orcidId || author.oaId;
            return (
              <div
                key={index}
                onClick={() => handleSelectAuthor(author)}
                className={`bg-white p-1 shadow-md rounded-md cursor-pointer flex flex-col items-center text-xs transition duration-200 w-[120px] ${
                  OaWorksQuery?.includes(identifier)
                    ? "border-2 border-red-200"
                    : "hover:border-red-300 border border-gray-200"
                }`}
              >
                <h3 className="font-semibold text-gray-800 truncate w-full text-center">
                  {author.name}
                </h3>

                {/* Info Row */}
                <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                  {author.oaId && (
                    <div className="border border-gray-300 rounded px-1 bg-gray-50">
                      OA: {author.oaId}
                    </div>
                  )}
                  {author.orcidId ? (
                    <a
                      href={`https://orcid.org/${author.orcidId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-300 rounded px-1 bg-gray-50 hover:bg-blue-100"
                    >
                      ORCID
                    </a>
                  ) : (
                    <div className="border border-gray-300 rounded px-1 bg-gray-50">
                      No ORCID
                    </div>
                  )}
                </div>

                {/* Work Count Bubble */}
                {author.workCount > 0 && (
                  <div className="mt-1 bg-blue-500 text-white text-xs px-2 rounded-full">
                    {author.workCount} Works
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600 text-center">No authors found.</p>
      )}
    </div>
  );
}
