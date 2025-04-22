import React, { useState } from "react";
import { exportToCsv } from "./ArticleExportToCsv";

const ArticleCard = ({ article }) => {
  const [abstract, setAbstract] = useState(article?.abstract || "");

  if (!article) return null;

  const handleAbstractChange = (e) => {
    const newAbstract = e.target.value;
    setAbstract(newAbstract);
  };

  // Handle export with latest abstract
  const handleExport = () => {
    // Create a modified copy of the article with the current abstract
    const articleWithCurrentAbstract = {
      ...article,
      abstract: abstract,
    };

    // Export the modified article
    exportToCsv(articleWithCurrentAbstract);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row md:gap-4">
        {/* Left column: Article info */}
        <div className="flex-1">
          {/* Article Header */}
          <div className="pb-2 mb-2 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-800">
              {article.title || "Untitled Article"}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {article.doi ? (
                <a
                  href={`${article.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {article.doi}
                </a>
              ) : (
                <span className="text-sm text-gray-500 italic">No DOI</span>
              )}

              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md">
                {article.pubyear || "Year unknown"}
              </span>

              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md">
                {article.referenceType || "Type unspecified"}
              </span>

              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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

          {/* Categories - Compact inline display */}
          <div className="space-y-1.5 text-xs">
            {article.domains?.length > 0 && (
              <div className="flex flex-wrap gap-x-1.5">
                <span className="font-medium text-gray-700">Domains:</span>
                {article.domains.map((domain, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            )}

            {article.fields?.length > 0 && (
              <div className="flex flex-wrap gap-x-1.5">
                <span className="font-medium text-gray-700">Fields:</span>
                {article.fields.map((field, index) => (
                  <span
                    key={index}
                    className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded"
                  >
                    {field}
                  </span>
                ))}
              </div>
            )}

            {article.subfields?.length > 0 && (
              <div className="flex flex-wrap gap-x-1.5">
                <span className="font-medium text-gray-700">Subfields:</span>
                {article.subfields.map((subfield, index) => (
                  <span
                    key={index}
                    className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded"
                  >
                    {subfield}
                  </span>
                ))}
              </div>
            )}

            {article.topics?.length > 0 && (
              <div className="flex flex-wrap gap-x-1.5">
                <span className="font-medium text-gray-700">Topics:</span>
                {article.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Abstract and export button */}
        <div className="mt-3 md:mt-0 md:w-2/5 flex flex-col">
          <div className="flex-1">
            <label
              htmlFor={`abstract-${article.id}`}
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Abstract
            </label>
            <textarea
              id={`abstract-${article.id}`}
              className="w-full h-full min-h-24 text-sm border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Copy and paste the article abstract here..."
              value={abstract}
              onChange={handleAbstractChange}
            ></textarea>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              onClick={handleExport}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1 shadow-[0_0_0_8px_white]"
            >
              <span>📄</span>
              <span>Exporter CSV SyRF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
