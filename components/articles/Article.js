import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedArticleId } from "../../reducers/user";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthorCard from "../../components/authors/AuthorCard";
import ArticleCard from "../../components/articles/ArticleCard";
import ArticleSearch from "../../components/articles/ArticleSearch";

export default function ArticlePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchQuery = useSelector((state) => state.user.selectedArticleId) || "";

  const [articleInfo, setArticleInfo] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [jsonData, setJsonData] = useState(null);

  const handleAuthorClick = (oaId) => {
    if (oaId && oaId.startsWith("https://openalex.org/")) {
      oaId = oaId.split("/").pop();
    }
    router.push(`/Authors?oa_id=${oaId}`);
  };

  useEffect(() => {
    if (searchQuery) {
      fetchData();
    }
  }, [searchQuery]);

  const fetchData = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`https://api.openalex.org/works/${searchQuery}`);
      if (!res.ok) throw new Error("Failed to fetch article");
      const data = await res.json();
      setJsonData(data);

      const authorsList = data.authorships.map((author) => ({
        name: author.author?.display_name || "Unknown Author",
        oaId: author.author?.id || "N/A",
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
        id: data.id.replace("https://openalex.org/works/", ""),
        title: data.display_name || "Untitled Article",
        authors: authorsList.map((a) => a.name).join(";"),
        publishedIn: data.primary_location?.source?.display_name || "",
        alternateName: "None",
        abstract: "", // à remplir manuellement
        url: data.primary_location?.landing_page_url || "",
        authorAddress: "None",
        pubyear: data.publication_year,
        doi: data.doi,
        pdfRelativePath: data.primary_location?.pdf_url || "",
        referenceType: data.type,
        oa_status: data.open_access?.is_oa || false,
        topics: [
          ...new Set(data.topics?.map((t) => t.display_name).filter(Boolean) || []),
        ],
        domains: [
          ...new Set(data.topics?.map((t) => t.domain?.display_name).filter(Boolean) || []),
        ],
        fields: [
          ...new Set(data.topics?.map((t) => t.field?.display_name).filter(Boolean) || []),
        ],
        subfields: [
          ...new Set(data.topics?.map((t) => t.subfield?.display_name).filter(Boolean) || []),
        ],
      };

      setArticleInfo(articleDetails);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  return (
    <>
      <Head>
        <title>OA Extractor</title>
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
        {/* Left Pane - JSON Viewer */}
        <div className="lg:w-1/3 w-full p-4 bg-white shadow-md border-r border-gray-300 overflow-auto flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Raw JSON Data</h2>
          <div className="bg-gray-200 p-3 rounded-md max-h-[80vh] overflow-auto flex-grow">
            {jsonData ? (
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600">Loading JSON data...</p>
            )}
          </div>
        </div>

        {/* Right Pane */}
        <div className="lg:w-2/3 w-full p-6">
          {/* Search Bars */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="w-full lg:w-1/2">
              <ArticleSearch />
            </div>
            <div className="w-full lg:w-1/2 flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSelectedArticleId(e.target.value))}
                placeholder="Enter article reference (e.g., W2741809807)"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={fetchData}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Show
              </button>
            </div>
          </div>

          {/* Article Info */}
          {articleInfo && <ArticleCard article={articleInfo} />}

          {/* Authors Section */}
          <h1 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Authors</h1>
          {authors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {authors.map((author, index) => (
                <div
                  key={index}
                  className="cursor-pointer"
                >
                  <AuthorCard author={author} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No authors found.</p>
          )}
        </div>
      </div>
    </>
  );
}
