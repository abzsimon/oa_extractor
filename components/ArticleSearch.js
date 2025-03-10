import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedArticleId } from "../reducers/user"; // Import action

export default function ArticleSearch() {
  const dispatch = useDispatch();
  const [searchedArticle, setSearchedArticle] = useState("");
  const [results, setResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async () => {
    if (searchedArticle.length > 3) {
      const apiUrl = `https://api.openalex.org/autocomplete/works?q=${searchedArticle}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          console.error("API returned an error:", response.status);
          return;
        }
        const data = await response.json();
        setResults(data.results || []);
        setIsModalOpen(true); // Open modal after fetching data
      } catch (error) {
        console.error("Fetch error:", error);
      }
    } else {
      console.warn("Search query must be at least 4 characters long.");
    }
  };

  const handleSelect = (id) => {
    const last11Chars = id.slice(-11); // Extract last 11 characters of ID
    dispatch(setSelectedArticleId(last11Chars)); // Store in Redux
    setIsModalOpen(false); // Close modal
    console.log("Selected ID stored in Redux:", last11Chars);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-md gap-2">
        <input
          type="text"
          placeholder="Search for an article..."
          value={searchedArticle}
          onChange={(e) => setSearchedArticle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Search
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Search Results</h3>
            <ul className="max-h-64 overflow-auto">
              {results.length > 0 ? (
                results.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center border-b border-gray-200 py-2"
                  >
                    <span>{item.display_name || "No title available"}</span>
                    <button
                      onClick={() => handleSelect(item.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                    >
                      Select
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-600">No results found.</p>
              )}
            </ul>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
