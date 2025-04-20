import React from "react";
import { normalizeAuthor } from "./Authors.utils";
import AuthorInstitutions from "./AuthorInstitutions";
const [showModal, setShowModal] = useState(false);

const AuthorCard = ({ author }) => {
  const {
    name,
    oaId,
    orcId,
    institutions,
    countries,
    top_two_domains,
    top_five_topics,
    gender,
    isInDb,
  } = normalizeAuthor(author);

  // Helper function to truncate text
  const truncate = (text, maxLength = 40) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength - 2) + "…" : text;
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Status badge */}
      <div className="absolute top-3 right-3">
        <span
          title={
            isInDb ? "Présent dans la base locale" : "Non encore sauvegardé"
          }
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isInDb
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-gray-100 text-gray-700 border border-gray-200"
          }`}
        >
          {isInDb ? (
            <>
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              In Database
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Not in DB
            </>
          )}
        </span>
      </div>

      {/* Author name and identifier links */}
      <div className="mb-3 pb-2 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-1.5">{name}</h3>
        <div className="flex flex-wrap gap-2">
          {oaId && (
            <a
              href={oaId}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium px-2.5 py-1 rounded-md hover:from-red-600 hover:to-red-700 transition-colors"
              title="View on OpenAlex"
            >
              <svg
                className="w-3.5 h-3.5 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 4H20V10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              OpenAlex
            </a>
          )}
          {orcId && (
            <a
              href={orcId}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium px-2.5 py-1 rounded-md hover:from-green-600 hover:to-green-700 transition-colors"
              title="View ORCID Profile"
            >
              <svg
                className="w-3.5 h-3.5 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 4H20V10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              ORCID
            </a>
          )}
        </div>
      </div>

      {/* Author details */}
      <div className="space-y-2 text-sm">
        {/* Institutions */}
        {institutions.length > 0 && (
          <div className="flex items-start">
            <span className="flex-shrink-0 w-20 font-medium text-gray-500 mt-0.5">
              Institutions:
            </span>
            <div className="flex-1 flex items-center gap-1 flex-wrap">
              {institutions.slice(0, 2).map((inst, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs border border-gray-200"
                >
                  {inst}
                </span>
              ))}
              {institutions.length > 2 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                  + {institutions.length - 2} autres
                </button>
              )}
            </div>
          </div>
        )}

        {/* Countries */}
        {countries.length > 0 && (
          <div className="flex items-start">
            <span className="flex-shrink-0 w-20 font-medium text-gray-500">
              Countries:
            </span>
            <span className="text-gray-700">{countries.join(", ")}</span>
          </div>
        )}

        {/* Gender */}
        {gender && (
          <div className="flex items-start">
            <span className="flex-shrink-0 w-20 font-medium text-gray-500">
              Gender:
            </span>
            <span className="text-gray-700">{gender}</span>
          </div>
        )}
      </div>

      {/* Research domains and topics */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        {/* Domains */}
        {top_two_domains.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
              Top Domains
            </h4>
            <div className="flex flex-wrap gap-1">
              {top_two_domains.map((domain, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                >
                  {domain.name}
                  <span className="ml-1 bg-blue-100 text-blue-800 px-1.5 rounded-full text-xs">
                    {domain.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {top_five_topics.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
              Top Topics
            </h4>
            <div className="flex flex-wrap gap-1">
              {top_five_topics.map((topic, idx) => {
                const topicName = topic.display_name || topic;
                return (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                  >
                    {truncate(topicName, 30)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorCard;
