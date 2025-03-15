import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { setSelectedOrcid } from "../../reducers/user";

export default function HalAuthorDisambiguation() {
  const dispatch = useDispatch();
  const selectedOrcid = useSelector((state) => state.user.selectedOrcid);
  const [disambiguationQuery, setDisambiguationQuery] = useState("");
  const [authors, setAuthors] = useState([]);

  const fetchData = async () => {
    if (!disambiguationQuery.trim()) return;
    const apiUrl = `https://api.archives-ouvertes.fr/ref/author/?wt=json&q=fullName_s:\"${disambiguationQuery}\"&fl=person_i,orcidId_s,firstName_s,lastName_s`;

    try {
      const response = await fetch(apiUrl, { method: "GET" });
      if (!response.ok) return;

      const data = await response.json();
      const rawAuthorsResults = data.response.docs || [];

      const parsedAuthors = rawAuthorsResults.map((author) => ({
        halID: author.person_i,
        orcidId: Array.isArray(author.orcidId_s)
          ? author.orcidId_s[0] || null
          : author.orcidId_s || null,
        firstname: author.firstName_s || "N/A",
        lastname: author.lastName_s || "N/A",
      }));

      setAuthors(parsedAuthors);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleSelectAuthor = async (author) => {
    const { orcidId, halID, firstname, lastname } = author;
    let apiUrl;

    if (orcidId) {
      apiUrl = `https://api.archives-ouvertes.fr/search?q=authORCIDIdExt_s:%22${orcidId}%22&fl=docType_s&group=true&group.field=docType_s`;
    } else if (halID) {
      apiUrl = `https://api.archives-ouvertes.fr/search?q=authIdPerson_i:%22${halID}%22&fl=*`;
    } else {
      apiUrl = `https://api.archives-ouvertes.fr/search?q=authFullName_s:%22${firstname} ${lastname}%22&fl=*`;
    }

    try {
      const response = await fetch(apiUrl, { method: "GET" });
      if (!response.ok) return;
      const data = await response.json();
      console.log(data);

      // Use a unified identifier (ORCID > HAL ID > full name)
      const identifier = orcidId || halID || `${firstname} ${lastname}`;
      if (selectedOrcid === identifier) {
        dispatch(setSelectedOrcid(null));
      } else {
        dispatch(setSelectedOrcid(identifier));
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="relative h-10 w-10">
          <Image
            src="https://openalex.org/img/openalex-logo-icon-black-and-white.ea51cede.png"
            alt="OpenAlex Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <input
          type="text"
          value={disambiguationQuery}
          onChange={(e) => setDisambiguationQuery(e.target.value)}
          placeholder="Enter author name..."
          className="flex-1 mx-4 h-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchData}
          className="bg-red-400 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Search
        </button>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-4 mb-3">Authors</h1>

      {authors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {authors.map((author, index) => {
            const identifier =
              author.orcidId ||
              author.halID ||
              `${author.firstname} ${author.lastname}`;
            return (
              <div
                key={index}
                onClick={() => handleSelectAuthor(author)}
                className={`bg-white p-2 shadow-md rounded-lg cursor-pointer transition duration-200 ${
                  selectedOrcid === identifier
                    ? "border-2 border-red-200"
                    : "hover:border-red-300 border-2 border-transparent"
                }`}
              >
                <h3 className="text-base font-semibold text-gray-800 truncate">
                  {author.firstname} {author.lastname}
                </h3>
                <div className="flex flex-row gap-2 text-xs text-gray-600">
                  {author.halID && (
                    <div className="inline-block border border-gray-300 rounded px-1 py-0.5 bg-gray-50 truncate max-w-[100px]">
                      HAL ID: {author.halID}
                    </div>
                  )}
                  {author.orcidId ? (
                    <a
                      href={`${author.orcidId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block border border-gray-300 rounded px-1 py-0.5 bg-gray-50 hover:bg-blue-100"
                    >
                      ORCID
                    </a>
                  ) : (
                    <div className="inline-block border border-gray-300 rounded px-1 py-0.5 bg-gray-50">
                      No ORCID ID
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600">No authors found.</p>
      )}
    </div>
  );
}
