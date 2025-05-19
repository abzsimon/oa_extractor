import { useSelector, useDispatch } from "react-redux";
import { updateArticleField } from "../../reducers/article";
import ArticleActions from "./ArticleActions"; // ou des placeholders si tu veux

const languageOptions = ["FR", "EN", "ES", "DE", "IT", "PT", "Autre"];
const objectFocusOptions = [
  "Données de la recherche (toutes sciences)",
  "Données de la recherche en SHS",
  "SHS en général",
];
const dataTypesOptions = [
  "Observation",
  "Observation/Notes",
  "Observation/Photo",
  "Observation/Audio",
  "Observation/Vidéo",
  "Questionnaire",
  "Questionnaire/Questions",
  "Questionnaire/Réponses",
  "Questionnaire/Statistiques",
  "Entretien",
  "Entretien/Audio",
  "Entretien/Vidéo",
  "Entretien/Transcription",
  "Entretien/Grille",
  "Analyse computationnelle",
  "Analyse computationnelle/Corpus textuel",
  "Analyse computationnelle/Réseaux",
  "Analyse computationnelle/Logs",
  "Analyse computationnelle/Mesures géographiques",
  "Analyse computationnelle/Mesures numériques",
  "Analyse computationnelle/Carte",
  "Analyse computationnelle/Code",
  "Analyse computationnelle/Corpus d'images",
  "Analyse computationnelle/Documentation complémentaire",
  "Archive",
  "Archive/Sources textuelles",
  "Archive/Sources visuelles (plans, cadastres, relevés archéo...)",
  "Archive/Photographies",
  "Archive/Artefacts archéologiques",
  "Archive/Mesures numériques",
  "Archive/Tableaux, sculptures, bâti...",
  "Archive/Autres (partitions musicales...)",
  "Expérimentation",
  "Expérimentation/Audio",
  "Expérimentation/Vidéo",
  "Expérimentation/Transcriptions",
  "Expérimentation/Notes",
  "Expérimentation/Mesures numériques",
  "Autres",
  "Autres/Brouillons",
  "Autres/Carnets",
  "Autres/Objet informatique (plateforme, interface...)",
  "Données non spécifiées",
];
const discourseGenreOptions = [
  "Essai réflexif",
  "Etude de terrain, données",
  "Pamphlet, texte polémique",
  "Texte normatif/Orientation stratégique, recommandations politiques",
  "Texte normatif/Guide de bonnes pratiques, manuel, dictionnaire, formation",
  "Etudes institutionnelles (ministère, université...)",
  "Autre",
];
const methodologyOptions = [
  "Observation",
  "Observation participante",
  "Étude de pratique réflexive (retour d'expérience)",
  "Entretien",
  "Expérimentation (focus group)",
  "Quanti/Questionnaire, sondage",
  "Quanti/Computationnel",
  "Réflexion conceptuelle (philosophique)",
  "Analyse statistique indirecte (méta-analyse)",
  "Analyse discursive",
  "Analyse sémiotique",
  "Analyse cartographique",
  "Analyse historique",
  "Etude de cas/Comparaison",
  "Monographie (1 seul cas)",
  "Aucune relevée",
];
const positionOnDataOptions = [
  "Opposition forte (rejet)",
  "Opposition (mise en garde)",
  "Neutre",
  "Faveur (recommendation)",
  "Faveur forte (injonction)",
  "Indéfini",
];
const positionOnOpenAccessOptions = [
  "Favoriser la réutilisation des données",
  "Favoriser l'intégrité, contre la fraude",
  "Favorise la cause écologique, environnement",
  "Favorise la publication libre",
  "Favorise la restitution à la société",
  "Autre",
  "Aucune",
];
const barriersOptions = [
  "A Frein épistémique diversité (coexistence de savoirs situés)",
  "B Frein épistémique constructivisme",
  "C Frein épistémique singularité des SHS",
  "D Frein juridique propriété",
  "E Frein juridique anonym/perso",
  "F Frein technique infra",
  "G Freins socio-technique (formation, compétences)",
  "H Frein éthique-socio",
  "I Frein liberté académique",
  "J Autres freins",
  "Aucun frein mentionné",
];

export default function ArticleForm() {
  const dispatch = useDispatch();

  const article = useSelector((state) => state.article);
  console.log("ARTICLE REDUX : ", article);
  if (!article || !article.id) {
    return <p className="text-gray-600 italic">Aucun article sélectionné.</p>;
  }

  const handleInput = (field) => (e) => {
    if (e.target.multiple) {
      const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
      dispatch(updateArticleField({ field, value: options }));
    } else {
      dispatch(updateArticleField({ field, value: e.target.value }));
    }
  };

  // Pour les mots-clés (entrée + suppression)
  const handleKeywordInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      if (!article.keywords.includes(e.target.value.trim())) {
        dispatch(
          updateArticleField({
            field: "keywords",
            value: [...article.keywords, e.target.value.trim()],
          })
        );
      }
      e.target.value = "";
    }
  };

  const removeKeyword = (idx) => {
    const newKeywords = article.keywords.filter((_, i) => i !== idx);
    dispatch(updateArticleField({ field: "keywords", value: newKeywords }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header + actions */}
      <div className="flex items-center justify-between my-2">
        <h2 className="font-bold text-xl">Annotation</h2>
        <ArticleActions />
      </div>    
      {/* Form grid */}
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm"
        autoComplete="off"
      >
        {/* Ligne 1 */}
        <div>
          <label className="block font-medium mb-0.5">Langue</label>
          <select
            value={article.language}
            onChange={handleInput("language")}
            required
            className="w-full p-1 border rounded"
          >
            <option value="">Sélectionner la langue</option>
            {languageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-0.5">Objet de recherche</label>
          <select
            value={article.objectFocus}
            onChange={handleInput("objectFocus")}
            required
            className="w-full p-1 border rounded"
          >
            <option value="">Sélectionner l'objet</option>
            {objectFocusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* Ligne 2 */}
        <div>
          <label className="block font-medium mb-0.5">Financement</label>
          <select
            value={article.funding}
            onChange={handleInput("funding")}
            required
            className="w-full p-1 border rounded"
          >
            <option value="">Sélectionner un financement</option>
            <option value="Sans financement">Sans financement</option>
            <option value="Agence publique de financement (ANR, Europe, Fonds national suisse, National Science Foundation...)">
              Agence publique de financement (ANR, Europe, Fonds national
              suisse, National Science Foundation...)
            </option>
            <option value="Public autre">Public autre</option>
            <option value="Privé">Privé</option>
            <option value="Autre">Autre</option>
            <option value="Non relevé">Non relevé</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-0.5">
            Position sur l'ouverture des données
          </label>
          <select
            value={article.positionOnDataOpenAccess}
            onChange={handleInput("positionOnDataOpenAccess")}
            required
            className="w-full p-1 border rounded"
          >
            <option value="">Sélectionner une position</option>
            {positionOnDataOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* Ligne 3 */}
        <div>
          <label className="block font-medium mb-0.5">Genre discursif</label>
          <select
            multiple
            size="5"
            value={article.discourseGenre}
            onChange={handleInput("discourseGenre")}
            required
            className="w-full p-1 border rounded h-24"
          >
            {discourseGenreOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-0.5">
            Maintenez Ctrl/Cmd pour sélectionner plusieurs
          </p>
        </div>
        <div>
          <label className="block font-medium mb-0.5">
            Types de données discutées
          </label>
          <select
            multiple
            size="5"
            value={article.dataTypesDiscussed}
            onChange={handleInput("dataTypesDiscussed")}
            required
            className="w-full p-1 border rounded h-28"
          >
            {dataTypesOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-0.5">
            Maintenez Ctrl/Cmd pour sélectionner plusieurs
          </p>
        </div>
        {/* Ligne 4 */}
        <div>
          <label className="block font-medium mb-0.5">Méthodologie</label>
          <select
            multiple
            size="5"
            value={article.methodology}
            onChange={handleInput("methodology")}
            required
            className="w-full p-1 border rounded h-24"
          >
            {methodologyOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-0.5">
            Maintenez Ctrl/Cmd pour sélectionner plusieurs
          </p>
        </div>
        <div>
          <label className="block font-medium mb-0.5">
            Position sur Open Access & enjeux
          </label>
          <select
            multiple
            size="5"
            value={article.positionOnOpenAccessAndIssues}
            onChange={handleInput("positionOnOpenAccessAndIssues")}
            required
            className="w-full p-1 border rounded h-24"
          >
            {positionOnOpenAccessOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-0.5">
            Maintenez Ctrl/Cmd pour sélectionner plusieurs
          </p>
        </div>
        {/* Ligne 5 */}
        <div>
          <label className="block font-medium mb-0.5">Mots-clés</label>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              onKeyDown={handleKeywordInput}
              className="flex-1 p-1 border rounded"
              placeholder="Entrez un mot-clé et pressez Entrée"
            />
            <div className="flex flex-wrap gap-1">
              {article.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="bg-green-100 px-2 py-0.5 rounded flex items-center"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(i)}
                    className="ml-1 text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-0.5">Freins</label>
          <select
            multiple
            size="5"
            value={article.barriers}
            onChange={handleInput("barriers")}
            required
            className="w-full p-1 border rounded h-24"
          >
            {barriersOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-0.5">
            Maintenez Ctrl/Cmd pour sélectionner plusieurs
          </p>
        </div>
        {/* Ligne 6 - Remarques sur 2 colonnes */}
        <div className="md:col-span-2">
          <label className="block font-medium mb-0.5">Remarques</label>
          <textarea
            value={article.remarks}
            onChange={handleInput("remarks")}
            rows={2}
            className="w-full p-1 border rounded resize-none"
          />
        </div>
      </form>
    </div>
  );
}
