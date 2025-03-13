import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { setSelectedOrcid } from '../../reducers/user';

export default function HalAuthorDisambiguation() {
  const dispatch = useDispatch();
  const selectedOrcid = useSelector((state) => state.user.selectedOrcid);
  const [disambiguationQuery, setDisambiguationQuery] = useState("");
  const [authors, setAuthors] = useState([]);

  const fetchData = async () => {
    if (!disambiguationQuery.trim()) return;
    console.log("Fetching data for:", disambiguationQuery);
    const apiUrl = `https://api.archives-ouvertes.fr/ref/author/?wt=json&q=fullName_s:"${disambiguationQuery}"&fl=person_i,orcidId_s,firstName_s,lastName_s`;
   
    try {
      const response = await fetch(apiUrl, { method: "GET" });
      if (!response.ok) {
        console.error("API returned an error:", response.status);
        return;
      }
     
      const data = await response.json();
      let rawAuthorsResults = data.response.docs || [];
     
      let parsedAuthors = rawAuthorsResults.map((author) => ({
        halID: author.person_i,
        orcidId: Array.isArray(author.orcidId_s)
          ? author.orcidId_s[0] || null // Always take the first ORCID if multiple
          : author.orcidId_s || null,
        firstname: author.firstName_s || "N/A",
        lastname: author.lastName_s || "N/A",
      }));
      console.log(authors)
      setAuthors(parsedAuthors);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Handle author selection
  const handleSelectAuthor = (orcidId) => {
    // Toggle selection - if already selected, unselect it, otherwise select it
    if (selectedOrcid === orcidId) {
      dispatch(setSelectedOrcid(null));
    } else {
      dispatch(setSelectedOrcid(orcidId));
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={disambiguationQuery}
          onChange={(e) => setDisambiguationQuery(e.target.value)}
          placeholder="Enter author name..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Search
        </button>
      </div>
     
      {/* Authors List */}
      <h1 className="text-xl font-bold text-gray-900 mt-4 mb-3">Authors</h1>
     
      {authors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {authors.map((author, index) => (
            <div key={index} className="bg-white p-2 shadow-md rounded-lg">
              <h3 className="text-base font-semibold text-gray-800 truncate">{author.firstname} {author.lastname}</h3>
              <div className="text-xs text-gray-600">
                {author.halID && <div className="truncate">HAL ID: {author.halID}</div>}
                {author.orcidId && <div className="truncate">ORCID: {author.orcidId}</div>}
              </div>
             
              <button
                onClick={() => handleSelectAuthor(author.orcidId)}
                className={`mt-2 px-3 py-1 text-sm rounded-md transition duration-200 w-full ${
                  selectedOrcid === author.orcidId
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {selectedOrcid === author.orcidId ? "Selected" : "Select"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No authors found.</p>
      )}
    </div>
  );
}