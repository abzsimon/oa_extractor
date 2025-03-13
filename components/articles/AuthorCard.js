import React from "react";

const AuthorCard = ({ author }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-3 border border-gray-200 text-sm">
      {/* Author Name with OpenAlex & ORCID Bubbles */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-800">{author.name || "Unknown Author"}</h2>
        <div className="flex gap-1">
          {/* OpenAlex Bubble (Warm Coral) */}
          <a
            href={author.oaId}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF9F9F] text-white text-xs font-medium px-2 py-1 rounded-full hover:bg-[#FF6F6F] transition duration-200"
          >
            OpenAlex
          </a>

          {/* ORCID Bubble (Soft Coral) */}
          {author.orcId && (
            <a
              href={`${author.orcId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FFB3B3] text-white text-xs font-medium px-2 py-1 rounded-full hover:bg-[#FF7F7F] transition duration-200"
            >
              ORCID
            </a>
          )}
        </div>
      </div>

      {/* Institutions Section (Compact) */}
      {author.institutions.length > 0 && (
        <div className="mt-2">
          <h3 className="text-xs font-semibold text-[#E57373] mb-1">Institutions:</h3>
          <div className="flex flex-wrap gap-1">
            {author.institutions.map((inst, index) => (
              <span
                key={index}
                className="bg-[#A3D8F4] text-[#1E4D6B] text-xs font-medium px-2 py-1 rounded"
              >
                {inst}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Countries Section (Inline, No Line Jump) */}
      {author.countries.length > 0 && (
        <div className="mt-2 flex items-center">
          <h3 className="text-xs font-semibold text-[#E57373] mr-2">Countries:</h3>
          <div className="inline-flex flex-wrap gap-1">
            {author.countries.map((country, index) => (
              <span
                key={index}
                className="bg-[#FFD1C1] text-[#8B3E3E] text-xs font-medium px-2 py-1 rounded"
              >
                {country}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorCard;
