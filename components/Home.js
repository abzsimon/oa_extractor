import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedArticleId } from '../reducers/user';
import { useEffect, useState } from 'react';
import AuthorCard from '../components/AuthorCard';
import ArticleSearch from '../components/ArticleSearch';

export default function Home() {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.user.selectedArticleId) || "";

  const [articleInfo, setArticleInfo] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [jsonData, setJsonData] = useState(null);
  const [extractedData, setExtractedData] = useState({});

  const fetchData = async () => {
    if (!searchQuery.trim()) return;

    const apiUrl = `https://api.openalex.org/works/${searchQuery}`;

    try {
      const response = await fetch(apiUrl, { method: "GET" });
      if (!response.ok) {
        console.error("API returned an error:", response.status);
        return;
      }

      const data = await response.json();
      setJsonData(data);

      let articleDetails = {
        id : data.id.slice(-11),
        title: data.display_name || "Untitled Article",
        domains: [...new Set(data.topics?.map(topic => topic.domain?.display_name) || [])],
        fields: [...new Set(data.topics?.map(topic => topic.field?.display_name) || [])],
        subfields: [...new Set(data.topics?.map(topic => topic.subfield?.display_name) || [])]
      };

      setArticleInfo({...articleDetails});
      setExtractedData(prevState => ({ ...prevState, ...articleDetails }));

      let authorsList = data.authorships.map((author) => ({
        name: author.author?.display_name || "Unknown Author",
        oaId: author.author?.id || "N/A",
        orcId: author.author?.orcid || "N/A",
        institutions: [...new Set(author.institutions?.map(inst =>
          inst.display_name.length > 30
            ? inst.display_name.slice(0, 30) + "..."
            : inst.display_name
        ) || [])],
        countries: author.countries ? [...new Set(author.countries)] : [],
      }));

      setAuthors(authorsList);
      setExtractedData(prevState => ({ ...prevState, authorsList }));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  return (
    <>
      <Head>
        <title>OA Extractor</title>
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
        {/* Left Pane - JSON Viewer & Extracted Data */}
        <div className="lg:w-1/3 w-full p-4 bg-white shadow-md border-r border-gray-300 overflow-auto flex flex-col">
          {/* JSON Viewer (Top Left) */}
          <h2 className="text-lg font-bold text-gray-900 mb-3">Raw JSON Data</h2>
          <div className="bg-gray-200 p-3 rounded-md max-h-[40vh] overflow-auto flex-grow">
            {jsonData ? (
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600">Loading JSON data...</p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-400 my-4"></div>

          {/* Extracted Data (Bottom Left) */}
          <h2 className="text-lg font-bold text-gray-900 mb-3">Extracted Data</h2>
          <div className="bg-gray-200 p-3 rounded-md max-h-[40vh] overflow-auto">
            {extractedData && Object.keys(extractedData).length > 0 ? (
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600">Extracting data...</p>
            )}
          </div>
        </div>

        {/* Right Pane - Search + Article & Authors */}
        <div className="lg:w-2/3 w-full p-6">
          {/* 📌 TWO SEARCH BARS (Side by Side) */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Left Search Bar - Article Search */}
            <div className="w-full lg:w-1/2">
              <ArticleSearch />
            </div>

            {/* Right Search Bar - Manual Search Input */}
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
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
                Show
              </button>
            </div>
          </div>

          {/* 📌 Article Section */}
          {articleInfo && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{articleInfo.title}</h2>

              {/* Domains, Fields, Subfields (Left Aligned) */}
              <div className="mt-4 space-y-3">
                {/* Domains */}
                {articleInfo.domains?.length > 0 && (
                  <div className="flex items-center">
                    <span className="font-semibold text-[#E57373] w-24">Domains:</span>
                    <div className="flex flex-wrap gap-2">
                      {articleInfo.domains.map((domain, index) => (
                        <span key={index} className="bg-[#A3D8F4] text-[#1E4D6B] text-xs font-medium px-3 py-2 rounded-md">
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fields */}
                {articleInfo.fields?.length > 0 && (
                  <div className="flex items-center">
                    <span className="font-semibold text-[#E57373] w-24">Fields:</span>
                    <div className="flex flex-wrap gap-2">
                      {articleInfo.fields.map((field, index) => (
                        <span key={index} className="bg-[#FFD1C1] text-[#8B3E3E] text-xs font-medium px-3 py-2 rounded-md">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 📌 Authors Section */}
          <h1 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Authors</h1>
          {authors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {authors.map((author, index) => (
                <AuthorCard key={index} author={author} />
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
