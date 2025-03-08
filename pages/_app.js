import '../styles/globals.css';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import user from '../reducers/user';
import { useEffect, useState } from 'react';
import AuthorCard from '../components/AuthorCard';

const store = configureStore({
  reducer: { user },
});

function App({ Component, pageProps }) {
  const [articleInfo, setArticleInfo] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [jsonData, setJsonData] = useState(null); // Stores full JSON response
  const [extractedData, setExtractedData] = useState({}); // Stores extracted objects

  useEffect(() => {
    const fetchArticleInfo = async () => {
      const singleWorkApi = `https://api.openalex.org/works/W2741809807`;

      try {
        const response = await fetch(singleWorkApi, { method: "GET" });
        if (!response.ok) {
          console.error("API returned an error:", response.status);
          return;
        }

        const data = await response.json();
        setJsonData(data); // Store full JSON data for left pane

        let articleDetails = {
          title: data.display_name || "Untitled Article",
          domains: [...new Set(data.topics?.map(topic => topic.domain?.display_name) || [])],
          fields: [...new Set(data.topics?.map(topic => topic.field?.display_name) || [])],
          subfields: [...new Set(data.topics?.map(topic => topic.subfield?.display_name) || [])]
        };

        setArticleInfo(articleDetails);
        setExtractedData(prevState => ({ ...prevState, articleDetails }));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    const fetchAuthors = async () => {
      const singleWorkApi = `https://api.openalex.org/works/W2741809807`;

      try {
        const response = await fetch(singleWorkApi, { method: "GET" });
        if (!response.ok) {
          console.error("API returned an error:", response.status);
          return;
        }

        const data = await response.json();

        let authorsList = data.authorships.map((author) => {
          return {
            name: author.author?.display_name || "Unknown Author",
            oaId: author.author?.id || "N/A",
            orcId: author.author?.orcid || "N/A",
            institutions: [...new Set(author.institutions?.map(inst => 
              inst.display_name.length > 30 
                ? inst.display_name.slice(0, 30) + "..." 
                : inst.display_name
            ) || [])],
            countries: author.countries ? [...new Set(author.countries)] : []
          };
        });

        setAuthors(authorsList);
        setExtractedData(prevState => ({ ...prevState, authorsList }));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchArticleInfo();
    fetchAuthors();
  }, []);

  return (
    <Provider store={store}>
      <Head>
        <title>Best Friends</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
        {/* Left Pane - JSON Viewer (1/3 of screen) */}
        <div className="lg:w-1/3 w-full p-4 bg-white shadow-md border-r border-gray-300 overflow-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Raw JSON Data</h2>
          <div className="bg-gray-200 p-3 rounded-md max-h-[40vh] overflow-auto">
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

          {/* Extracted Objects Section */}
          <h2 className="text-lg font-bold text-gray-900 mb-3">Extracted Data</h2>
          <div className="bg-gray-200 p-3 rounded-md max-h-[40vh] overflow-auto">
            {extractedData ? (
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600">Extracting data...</p>
            )}
          </div>
        </div>

        {/* Right Pane - Article & Authors (2/3 of screen) */}
        <div className="lg:w-2/3 w-full p-4">
          {/* 📌 Article Section */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Article</h1>
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

                {/* Subfields */}
                {articleInfo.subfields?.length > 0 && (
                  <div className="flex items-center">
                    <span className="font-semibold text-[#E57373] w-24">Subfields:</span>
                    <div className="flex flex-wrap gap-2">
                      {articleInfo.subfields.map((subfield, index) => (
                        <span key={index} className="bg-[#FFC6C6] text-[#8B3E3E] text-xs font-medium px-3 py-2 rounded-md">
                          {subfield}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 📌 Authors Section */}
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-6">Authors</h1>
          {authors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {authors.map((author, index) => (
                <AuthorCard key={index} author={author} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Loading authors...</p>
          )}
        </div>
      </div>
    </Provider>
  );
}

export default App;
