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
  if (!article || !article.id) {
    return <p className="text-gray-600 italic">Aucun article sélectionné.</p>;
  }

  const handleInput = (field) => (e) => {
    const value = e.target.multiple
      ? Array.from(e.target.selectedOptions, (opt) => opt.value)
      : e.target.value;
    dispatch(updateArticleField({ field, value }));
  };

  const handleKeywordInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const kw = e.target.value.trim();
      if (!article.keywords.includes(kw)) {
        dispatch(
          updateArticleField({
            field: "keywords",
            value: [...article.keywords, kw],
          })
        );
      }
      e.target.value = "";
    }
  };

  const removeKeyword = (idx) => {
    dispatch(
      updateArticleField({
        field: "keywords",
        value: article.keywords.filter((_, i) => i !== idx),
      })
    );
  };

  return (
    <div className="bg-white shadow mr-1 mt-1 p-3 max-h-[95vh] text-sm flex flex-col">
      <div className="flex items-baseline justify-between mb-4 w-full">
        <h2 className="m-0 font-bold text-lg leading-none">Annotation</h2>
        <ArticleActions />
      </div>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1"
        autoComplete="off"
      >
        {/* Langue */}
        <div>
          <label className="block font-medium mb-0.5">Langue</label>
          <select
            value={article.language}
            onChange={handleInput("language")}
            required
            className="w-full p-0.5 border rounded"
          >
            <option value="">Sélectionner la langue</option>
            {languageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* Objet de recherche */}
        <div>
          <label className="block font-medium mb-0.5">Objet de recherche</label>
          <select
            value={article.objectFocus}
            onChange={handleInput("objectFocus")}
            required
            className="w-full p-0.5 border rounded"
          >
            <option value="">Sélectionner l'objet</option>
            {objectFocusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* Financement */}
        <div>
          <label className="block font-medium mb-0.5">Financement</label>
          <select
            value={article.funding}
            onChange={handleInput("funding")}
            required
            className="w-full p-0.5 border rounded"
          >
            <option value="">Sélectionner un financement</option>
            <option value="Sans financement">Sans financement</option>
            <option value="Agence publique de financement (ANR, Europe, Fonds national suisse, National Science Foundation...)">
              Agence publique de financement (ANR, Europe, Fonds national
              suisse, NSF...)
            </option>
            <option value="Public autre">Public autre</option>
            <option value="Privé">Privé</option>
            <option value="Autre">Autre</option>
            <option value="Non relevé">Non relevé</option>
          </select>
        </div>
        {/* Position sur l'ouverture des données */}
        <div>
          <label className="block font-medium mb-0.5">
            Position sur l'ouverture des données
          </label>
          <select
            value={article.positionOnDataOpenAccess}
            onChange={handleInput("positionOnDataOpenAccess")}
            required
            className="w-full p-0.5 border rounded"
          >
            <option value="">Sélectionner une position</option>
            {positionOnDataOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* Genre discursif */}
        <div>
          <label className="block font-medium mb-0.5">Genre discursif</label>
          <select
            multiple
            size="4"
            value={article.discourseGenre}
            onChange={handleInput("discourseGenre")}
            className="w-full p-0.5 border rounded h-20"
          >
            {discourseGenreOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Méthodologie */}
        <div>
          <label className="block font-medium mb-0.5">Méthodologie</label>
          <select
            multiple
            size="4"
            value={article.methodology}
            onChange={handleInput("methodology")}
            className="w-full p-0.5 border rounded h-20"
          >
            {methodologyOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* Position sur Open Access et enjeux */}
        <div>
          <label className="block font-medium mb-0.5">
            Position sur Open Access & enjeux
          </label>
          <select
            multiple
            size="4"
            value={article.positionOnOpenAccessAndIssues}
            onChange={handleInput("positionOnOpenAccessAndIssues")}
            className="w-full p-0.5 border rounded h-20"
          >
            {positionOnOpenAccessOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* Mots-clés */}
        <div>
          <label className="block font-medium mb-0.5">Mots-clés</label>
          <div className="flex flex-col gap-1">
            {/* 1. Input full-width, hauteur ≈ 3 lignes */}
            <input
              type="text"
              onKeyDown={handleKeywordInput}
              placeholder="Entrez un mot-clé et pressez Entrée"
              className="w-full p-1 border rounded h-6" // h-14 ≈ 3.5rem soit ~3 lignes
            />

            {/* 2. Tags container en dessous, hauteur minimale = 3 lignes, léger padding */}
            <div className="flex flex-wrap gap-1 border border-gray-200 rounded p-1 min-h-14">
              {article.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 border border-green-200 rounded text-sm flex items-center"
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
        {/* Types de données */}
        <div>
          <label className="block font-medium mb-0.5">
            Types de données discutées
          </label>
          <select
            multiple
            size="4"
            value={article.dataTypesDiscussed}
            onChange={handleInput("dataTypesDiscussed")}
            className="w-full p-0.5 border rounded h-20"
          >
            {dataTypesOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* Freins */}
        <div>
          <label className="block font-medium mb-0.5">Freins</label>
          <select
            multiple
            size="4"
            value={article.barriers}
            onChange={handleInput("barriers")}
            className="w-full p-0.5 border rounded h-20"
          >
            {barriersOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* Remarques */}
        <div className="md:col-span-2">
          <label className="block font-medium mb-0.5">Remarques</label>
          <textarea
            value={article.remarks}
            onChange={handleInput("remarks")}
            rows={6}
            className="w-full p-0.5 border rounded resize-none"
          />
        </div>
      </form>
    </div>
  );
}
