export default function ArticleCard({ article }) {
  if (!article) return null;

  const renderRow = (label, values) =>
    values?.length > 0 ? (
      <tr>
        <td className="pr-2 align-top text-[10px] font-medium text-gray-500 whitespace-nowrap">
          {label}
        </td>
        <td className="text-[10px] text-gray-800">
          {values.join(", ")}
        </td>
      </tr>
    ) : null;

  return (
    <div className="p-2 flex flex-col gap-2 overflow-auto">
      {/* Top section: categories left, title/meta right */}
      <div className="flex flex-row gap-4">

        {/* Title & Meta */}
        <div className="flex-1">
          <h1 className="text-m font-semibold text-gray-800 leading-tight">
            {article.title || "Untitled Article"}
          </h1>
          <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
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
              <span className="italic text-gray-400">No DOI</span>
            )}
            <span>{article.pubyear || "?"}</span>
            <span>{article.referenceType || "Type ?"}</span>
            <span className={article.oa_status ? "text-green-700" : "text-red-700"}>
              {article.oa_status ? "Open Access" : "Closed"}
            </span>
          </div>
        </div>
        {/* Categories */}
        <div className="w-1/3">
          <table className="w-full text-left border-collapse">
            <tbody>
              {renderRow("Domains", article.domains)}
              {renderRow("Fields", article.fields)}
              {renderRow("Subfields", article.subfields)}
              {renderRow("Topics", article.topics)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Abstract */}
      {article?.abstract && (
        <div>
          <label className="text-xs font-medium text-gray-600">Résumé</label>
          <p className="text-sm text-gray-800 whitespace-pre-line mt-1">
            {article.abstract}
          </p>
        </div>
      )}
    </div>
  );
}
