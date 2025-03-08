import React from "react";

const ArticleCard = ({ article }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-5 mb-4 border border-gray-200">
      {/* Article Title */}
      <h2 className="text-lg font-semibold text-gray-800">{article.title || "Untitled Article"}</h2>

      {/* Domains, Fields, and Subfields */}
      <div className="mt-2 text-sm text-gray-700">
        {/* Domains */}
        {article.domains.length > 0 && (
          <div className="flex flex-wrap items-center">
            <span className="font-semibold text-[#E57373]">Domains: </span>
            <div className="flex flex-wrap gap-2 ml-2">
              {article.domains.map((domain, index) => (
                <span
                  key={index}
                  className="bg-[#A3D8F4] text-[#1E4D6B] text-xs font-medium px-2 py-1 rounded-md"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fields */}
        {article.fields.length > 0 && (
          <div className="flex flex-wrap items-center mt-1">
            <span className="font-semibold text-[#E57373]">Fields: </span>
            <div className="flex flex-wrap gap-2 ml-2">
              {article.fields.map((field, index) => (
                <span
                  key={index}
                  className="bg-[#FFD1C1] text-[#8B3E3E] text-xs font-medium px-2 py-1 rounded-md"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subfields */}
        {article.subfields.length > 0 && (
          <div className="flex flex-wrap items-center mt-1">
            <span className="font-semibold text-[#E57373]">Subfields: </span>
            <div className="flex flex-wrap gap-2 ml-2">
              {article.subfields.map((subfield, index) => (
                <span
                  key={index}
                  className="bg-[#FFC6C6] text-[#8B3E3E] text-xs font-medium px-2 py-1 rounded-md"
                >
                  {subfield}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleCard;
