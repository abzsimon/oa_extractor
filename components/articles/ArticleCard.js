import React from "react";

const ArticleCard = ({ article }) => {
  if (!article) return null;

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-gray-200">
      {/* Article Title with reduced margins */}
      <h1 className="text-xl font-bold text-gray-800 mb-2 pb-2 border-b border-gray-100">
        {article.title || "Untitled Article"}
      </h1>

      {/* Article Metadata in a compact grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
        <div className="flex items-center">
          <span className="text-gray-500 font-medium w-16">DOI:</span>
          <span className="font-medium text-blue-600 hover:underline truncate">
            {article.doi || "Not available"}
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-gray-500 font-medium w-16">Year:</span>
          <span className="text-gray-800">{article.pubyear || "Unknown"}</span>
        </div>

        <div className="flex items-center">
          <span className="text-gray-500 font-medium w-16">Type:</span>
          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">
            {article.type || "Unspecified"}
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-gray-500 font-medium w-16">Status:</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
              typeof article.oa_status === "string" &&
              article.oa_status.toLowerCase() === "open"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {article.oa_status ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      {/* Fields/topics/domains in a tabular format without line breaks */}
      <div className="mt-3 text-sm">
        {article.domains?.length > 0 && (
          <div className="flex items-center mb-1">
            <span className="text-gray-500 font-medium w-16">Domains :</span>
            <div className="flex flex-wrap gap-1">
              {article.domains.map((domain, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}

        {article.fields?.length > 0 && (
          <div className="flex items-center mb-1">
            <span className="text-gray-500 font-medium w-16">Fields :</span>
            <div className="flex flex-wrap gap-1">
              {article.fields.map((field, index) => (
                <span
                  key={index}
                  className="bg-purple-50 text-purple-700 text-xs font-medium px-1.5 py-0.5 rounded"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {article.subfields?.length > 0 && (
          <div className="flex items-center mb-1">
            <span className="text-gray-500 font-medium w-16">Subfields :</span>
            <div className="flex flex-wrap gap-1">
              {article.subfields.map((subfield, index) => (
                <span
                  key={index}
                  className="bg-teal-50 text-teal-700 text-xs font-medium px-1.5 py-0.5 rounded"
                >
                  {subfield}
                </span>
              ))}
            </div>
          </div>
        )}

        {article.topics?.length > 0 && (
          <div className="flex items-center">
            <span className="text-gray-500 font-medium w-16">Topics :</span>
            <div className="flex flex-wrap gap-1">
              {article.topics.map((topic, index) => (
                <span
                  key={index}
                  className="bg-orange-50 text-orange-700 text-xs font-medium px-1.5 py-0.5 rounded"
                >
                  {topic}
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
