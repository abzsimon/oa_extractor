// Place ce fichier à côté, ou dans un dossier "components/articles/ArticleModal.jsx"
export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  const Label = ({ children }) => (
    <span className="block text-xs font-bold text-gray-500 uppercase">{children}</span>
  );
  const Field = ({ label, value }) =>
    value && value.length > 0 ? (
      <div className="mb-2">
        <Label>{label}</Label>
        <div className="text-sm text-gray-800">
          {Array.isArray(value) ? value.join(", ") : value}
        </div>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-3 text-2xl text-red-500 hover:text-red-700"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-2">{article.title}</h3>
        <div className="mb-3 text-gray-700 text-xs italic">
          {article.id} • {article.pubyear || "?"} • {article.referenceType || "-"}
        </div>
        <div className="mb-4">
          <Label>Résumé / Abstract</Label>
          <div className="text-sm whitespace-pre-line bg-gray-50 p-2 rounded border">
            {article.abstract}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Field label="Auteurs" value={article.authorsFullNames} />
          <Field label="Langue" value={article.language} />
          <Field label="Publié dans" value={article.publishedIn} />
          <Field label="DOI" value={article.doi} />
          <Field label="Open Access" value={article.oa_status ? "Oui" : "Non"} />
          <Field label="Objet de recherche" value={article.objectFocus} />
          <Field label="Types de données discutées" value={article.dataTypesDiscussed} />
          <Field label="Genre discursif" value={article.discourseGenre} />
          <Field label="Méthodologie" value={article.methodology} />
          <Field label="Financement" value={article.funding} />
          <Field label="Position sur ouverture des données" value={article.positionOnDataOpenAccess} />
          <Field label="Freins" value={article.barriers} />
          <Field label="Position sur Open Access & enjeux" value={article.positionOnOpenAccessAndIssues} />
          <Field label="Mots-clés" value={article.keywords} />
          <Field label="Remarques" value={article.remarks} />
        </div>
        <div className="mt-4">
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              Voir l'article original ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
