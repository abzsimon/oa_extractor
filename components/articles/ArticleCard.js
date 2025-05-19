const ArticleCard = ({ article }) => {
  const abstract = article?.abstract;
  if (!article) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 min-h-[75vh] flex flex-col">
      {/* Article Info */}
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {article.title || "Untitled Article"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {article.doi ? (
              <a
                href={article.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {article.doi}
              </a>
            ) : (
              <span className="italic text-gray-500">No DOI</span>
            )}
            <span className="bg-gray-100 px-2 py-0.5 rounded-md">
              {article.pubyear || "Year unknown"}
            </span>
            <span className="bg-gray-100 px-2 py-0.5 rounded-md">
              {article.referenceType || "Type unspecified"}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                article.oa_status
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {article.oa_status ? "Open" : "Closed"}
            </span>
          </div>
        </div>
        {/* Categories */}
        <div className="text-sm space-y-2">
          {article.domains?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="font-medium">Domains:</span>
              {article.domains.map((d, i) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
          {article.fields?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="font-medium">Fields:</span>
              {article.fields.map((f, i) => (
                <span
                  key={i}
                  className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
          {article.subfields?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="font-medium">Subfields:</span>
              {article.subfields.map((s, i) => (
                <span
                  key={i}
                  className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {article.topics?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="font-medium">Topics:</span>
              {article.topics.map((t, i) => (
                <span
                  key={i}
                  className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Abstract */}
      <div className="mt-6 flex flex-col flex-1">
        <label
          htmlFor={`abstract-${article.id}`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Abstract
        </label>
        <textarea
          id={`abstract-${article.id}`}
          readOnly
          className="w-full flex-1 text-sm border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-auto"
          value={abstract}
        />
      </div>
    </div>
  );
};

export default ArticleCard;
