import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { updateArticleField } from "../../reducers/article";
import ArticleActions from "./ArticleActions";
import ArticleFormBarriers from "./ArticleFormBarriers";
import FilteredDatalist from "./ArticleFormSelectedSubfield";

const languageOptions = ["FR", "EN", "ES", "DE", "IT", "PT", "Autre"];

const objectFocusOptions = [
  "Données de la recherche (toutes sciences)",
  "Données de la recherche en SHS",
  "SHS en général",
];
const dataTypesOptions = [
  "Observation/Observation en général",
  "Observation/Notes",
  "Observation/Photo",
  "Observation/Audio",
  "Observation/Vidéo",
  "Questionnaire/Questionnaire en général",
  "Questionnaire/Questions",
  "Questionnaire/Réponses",
  "Questionnaire/Statistiques",
  "Entretien/Entretien en général",
  "Entretien/Audio",
  "Entretien/Vidéo",
  "Entretien/Transcription",
  "Entretien/Grille",
  "Analyse computationnelle/Analyse computationnelle en général",
  "Analyse computationnelle/Corpus textuel",
  "Analyse computationnelle/Réseaux",
  "Analyse computationnelle/Logs",
  "Analyse computationnelle/Mesures géographiques",
  "Analyse computationnelle/Mesures numériques",
  "Analyse computationnelle/Carte",
  "Analyse computationnelle/Code",
  "Analyse computationnelle/Corpus d'images",
  "Analyse computationnelle/Documentation complémentaire",
  "Archive/Archive en général",
  "Archive/Sources textuelles",
  "Archive/Sources visuelles (plans, cadastres, relevés archéo...)",
  "Archive/Photographies",
  "Archive/Artefacts archéologiques",
  "Archive/Mesures numériques",
  "Archive/Tableaux, sculptures, bâti...",
  "Archive/Autres (partitions musicales...)",
  "Expérimentation/Expérimentation en général",
  "Expérimentation/Audio",
  "Expérimentation/Vidéo",
  "Expérimentation/Transcriptions",
  "Expérimentation/Notes",
  "Expérimentation/Mesures numériques",
  "Autres/Autres",
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
  "Favorise une science incrémentale et non redondante",
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
  const [activeSection, setActiveSection] = useState("general");

  const article = useSelector((state) => state.article);
  if (!article || !article.id) return null;

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <section className="flex flex-col gap-4">
            {/* Page 1 Généralités : Langue, Objet de recherche, Financement */}
            <h3 className="font-bold pt-4 pb-3 text-gray-500">Généralités</h3>
            <div className="flex flex-col gap-y-4">
              {/* Langue */}
              <div>
                <label className="block font-medium mb-0.5">Langue</label>
                <div className="border rounded p-2 flex flex-wrap gap-4">
                  {languageOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="language"
                        value={opt}
                        checked={article.language === opt}
                        onChange={(e) =>
                          dispatch(
                            updateArticleField({
                              field: "language",
                              value: e.target.value,
                            })
                          )
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Accès ouvert */}
              <div>
                <label className="block font-medium mb-0.5">
                  Article disponible en accès ouvert
                </label>
                <div className="border rounded p-2 flex gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="openAccess"
                      checked={article.openAccess === true}
                      onChange={() =>
                        dispatch(
                          updateArticleField({
                            field: "openAccess",
                            value: true,
                          })
                        )
                      }
                    />
                    Oui
                  </label>

                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="openAccess"
                      checked={article.openAccess === false}
                      onChange={() =>
                        dispatch(
                          updateArticleField({
                            field: "openAccess",
                            value: false,
                          })
                        )
                      }
                    />
                    Non
                  </label>
                </div>
              </div>

              {/* Mots-clés article */}
              <div>
                <label className="block font-medium mb-0.5">Sous-champ AJSC pertinent</label>
                <FilteredDatalist
                  id="disciplines-list"
                  value={article.selectedSubfield || ""}
                  placeholder="Tapez le nom du subfield pour faire apparaître une préselection"
                  onChange={(val) =>
                    dispatch(
                      updateArticleField({
                        field: "selectedSubfield",
                        value: val,
                      })
                    )
                  }
                />
              </div>

              {/* Mots-clés article */}
              <div>
                <label className="block font-medium mb-0.5">Mots-clés</label>
                <div className="flex flex-col gap-1">
                  <textarea
                    onPaste={handleKeywordPaste}
                    onChange={handleKeywordChange}
                    placeholder="Collez votre liste de mots-clés séparés par des virgules, points-virgules ou retours à la ligne"
                    className="w-full p-2 border rounded h-20 resize-none"
                  />
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

              {/* Objet de recherche */}
              <div>
                <label className="block font-medium mb-0.5">
                  Objet de recherche
                </label>
                <div className="border rounded p-2 flex flex-col gap-1">
                  {objectFocusOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="objectFocus"
                        value={opt}
                        checked={article.objectFocus === opt}
                        onChange={(e) =>
                          dispatch(
                            updateArticleField({
                              field: "objectFocus",
                              value: e.target.value,
                            })
                          )
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Financement */}
              <div>
                <label className="block font-medium mb-0.5">Financement</label>
                <div className="border rounded p-2 flex flex-col gap-1">
                  {[
                    "Sans financement",
                    "Agence publique de financement (ANR, Europe, Fonds national suisse, National Science Foundation...)",
                    "Public autre",
                    "Privé",
                    "Autre",
                    "Non relevé",
                  ].map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="funding"
                        value={opt}
                        checked={article.funding === opt}
                        onChange={(e) =>
                          dispatch(
                            updateArticleField({
                              field: "funding",
                              value: e.target.value,
                            })
                          )
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case "content":
        return (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col">
              <h3 className="font-bold pt-4 pb-3 text-gray-500">
                Genre, méthodologie et types de données
              </h3>
              <div className="flex flex-col md:flex-row gap-3 flex-1 text-sm">
                {/* Colonne gauche */}
                <div className="flex flex-col justify-between flex-1 w-full md:w-[37%]">
                  {/* Genre discursif */}
                  <div className="flex flex-col gap-2">
                    <label className="block font-medium mb-0.5">
                      Genre discursif
                    </label>
                    <div className="border rounded p-2 flex flex-col gap-2">
                      {discourseGenreOptions.map((opt) => (
                        <label key={opt} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            value={opt}
                            checked={article.discourseGenre.includes(opt)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...article.discourseGenre, opt]
                                : article.discourseGenre.filter(
                                    (v) => v !== opt
                                  );
                              dispatch(
                                updateArticleField({
                                  field: "discourseGenre",
                                  value: updated,
                                })
                              );
                            }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Méthodologie */}
                  <div className="flex flex-col gap-2">
                    <label className="block font-medium mb-0.5">
                      Méthodologie
                    </label>
                    <div className="border rounded p-2 flex flex-wrap gap-y-1">
                      {methodologyOptions.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 mb-1 w-1/2"
                        >
                          <input
                            type="checkbox"
                            value={opt}
                            checked={article.methodology.includes(opt)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...article.methodology, opt]
                                : article.methodology.filter((v) => v !== opt);
                              dispatch(
                                updateArticleField({
                                  field: "methodology",
                                  value: updated,
                                })
                              );
                            }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="flex flex-col gap-3 w-full md:w-[63%]">
                  {/* Types de données */}
                  <div>
                    <label className="block font-medium mb-2.5">
                      Types de données discutées
                    </label>
                    <div className="border rounded p-1 flex flex-col gap-2">
                      {Object.entries(
                        dataTypesOptions.reduce((acc, opt) => {
                          const [category, sub] = opt.split("/", 2);
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(opt);
                          return acc;
                        }, {})
                      ).map(([category, options]) => (
                        <div
                          key={category}
                          className="bg-gray-50 rounded-sm py-1 px-1"
                        >
                          <h4 className="text-xs font-semibold">{category}</h4>
                          <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                            {options.map((opt) => (
                              <label
                                key={opt}
                                className="flex items-center gap-1"
                              >
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={article.dataTypesDiscussed.includes(
                                    opt
                                  )}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...article.dataTypesDiscussed, opt]
                                      : article.dataTypesDiscussed.filter(
                                          (v) => v !== opt
                                        );
                                    dispatch(
                                      updateArticleField({
                                        field: "dataTypesDiscussed",
                                        value: updated,
                                      })
                                    );
                                  }}
                                />
                                {opt.split("/")[1] || opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Types additionnels de données */}
                  <div>
                    <label className="block font-medium mb-2.5">
                      Types additionnels de données
                    </label>
                    <div className="flex flex-col gap-1">
                      <textarea
                        onPaste={handleDataKeywordPaste}
                        onChange={handleDataKeywordChange}
                        placeholder="Si la taxonomie ci-dessus ne suffit pas, saisir un type de donnée personnalisé"
                        className="w-full p-2 border rounded h-8 resize-none"
                      />
                      <div className="flex flex-wrap gap-1 border border-gray-200 rounded p-1 min-h-10">
                        {article.additionalDataTypes.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 border border-green-200 rounded text-sm flex items-center"
                          >
                            {kw}
                            <button
                              type="button"
                              onClick={() => removeAdditionalDataKeyword(i)}
                              className="ml-1 text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "position":
        return (
          <section className="flex flex-col gap-4 h-full">
            <h3 className="font-bold pt-4 pb-3 text-gray-500">
              Prises de position
            </h3>
            <div className="grid grid-cols-2 gap-4 flex-grow">
              {/* Colonne de gauche */}
              <div className="flex flex-col gap-4">
                {/* Position sur l'ouverture des données */}
                <div>
                  <label className="block font-medium mb-0.5">
                    Position sur l'ouverture des données
                  </label>
                  <div className="border rounded p-2 flex flex-col gap-1">
                    {positionOnDataOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="positionOnDataOpenAccess"
                          value={opt}
                          checked={
                            Array.isArray(article.positionOnDataOpenAccess) &&
                            article.positionOnDataOpenAccess.includes(opt)
                          }
                          onChange={() => {
                            const current = Array.isArray(
                              article.positionOnDataOpenAccess
                            )
                              ? article.positionOnDataOpenAccess
                              : [];
                            const next = current.includes(opt)
                              ? current.filter((v) => v !== opt)
                              : [...current, opt];
                            dispatch(
                              updateArticleField({
                                field: "positionOnDataOpenAccess",
                                value: next,
                              })
                            );
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Freins */}
                <div>
                  <label className="block font-medium mb-0.5">Freins</label>
                  <div className="border rounded p-2 flex flex-col gap-1">
                    {barriersOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={opt}
                          checked={article.barriers.includes(opt)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...article.barriers, opt]
                              : article.barriers.filter((v) => v !== opt);
                            dispatch(
                              updateArticleField({
                                field: "barriers",
                                value: updated,
                              })
                            );
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colonne de droite */}
              <div className="flex flex-col gap-4">
                {/* Position sur Open Access & enjeux */}
                <div>
                  <label className="block font-medium mb-0.5">
                    Position sur Open Access & enjeux
                  </label>
                  <div className="border rounded p-2 flex flex-col gap-1">
                    {positionOnOpenAccessOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={opt}
                          checked={article.positionOnOpenAccessAndIssues.includes(
                            opt
                          )}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...article.positionOnOpenAccessAndIssues, opt]
                              : article.positionOnOpenAccessAndIssues.filter(
                                  (v) => v !== opt
                                );
                            dispatch(
                              updateArticleField({
                                field: "positionOnOpenAccessAndIssues",
                                value: updated,
                              })
                            );
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Freins */}

                <ArticleFormBarriers
                  remarksOnBarriers={article.remarksOnBarriers}
                />
              </div>
            </div>
            {/* Remarques */}
            <div className="flex flex-col flex-grow">
              <label className="block font-medium mb-0.5">
                Remarques générales
              </label>
              <textarea
                value={article.remarks}
                onChange={(e) =>
                  dispatch(
                    updateArticleField({
                      field: "remarks",
                      value: e.target.value,
                    })
                  )
                }
                rows={9}
                className="flex-grow w-full p-0.5 border rounded resize-none"
              />
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const handleKeywordPaste = (e) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.trim()) {
      e.preventDefault();
      processKeywords(pastedText);
      e.target.value = "";
    }
  };

  const handleKeywordChange = (e) => {
    const value = e.target.value;
    // Si l'utilisateur tape et termine par une virgule ou point-virgule
    if (value.includes(",") || value.includes(";")) {
      processKeywords(value);
      e.target.value = "";
    }
  };

  const processKeywords = (text) => {
    // Sépare par virgules, points-virgules ou retours à la ligne
    const newKeywords = text
      .split(/[,;\n\r]+/)
      .map((kw) => kw.trim())
      .filter((kw) => kw && !article.keywords.includes(kw));

    if (newKeywords.length > 0) {
      dispatch(
        updateArticleField({
          field: "keywords",
          value: [...article.keywords, ...newKeywords],
        })
      );
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

  // Au collage
  const handleDataKeywordPaste = (e) => {
    const text = e.clipboardData.getData("text");
    if (!text.trim()) return;
    e.preventDefault();
    processAdditionalData(text);
    e.target.value = "";
  };

  // À la frappe
  const handleDataKeywordChange = (e) => {
    const v = e.target.value;
    if (!v.includes(",") && !v.includes(";")) return;
    processAdditionalData(v);
    e.target.value = "";
  };

  // Extraction et dispatch dans additionalDataTypes
  const processAdditionalData = (text) => {
    const current = article.additionalDataTypes;
    const newKeys = text
      .split(/[,;\n\r]+/)
      .map((kw) => kw.trim())
      .filter((kw) => kw && !current.includes(kw));
    if (newKeys.length) {
      dispatch(
        updateArticleField({
          field: "additionalDataTypes",
          value: [...current, ...newKeys],
        })
      );
    }
  };

  // Suppression
  const removeAdditionalDataKeyword = (idx) => {
    const current = article.additionalDataTypes;
    dispatch(
      updateArticleField({
        field: "additionalDataTypes",
        value: current.filter((_, i) => i !== idx),
      })
    );
  };

  // Version avec des # et des .
  const renderProgressBar = (completionRate) => {
    const rate = Math.max(0, Math.min(100, completionRate || 0));
    const filled = Math.round(rate / 5);
    const empty = 20 - filled;
    const bar = "#".repeat(filled) + ".".repeat(empty);
    return `⏳ [${bar}] ${rate}%`;
  };

  return (
    <div className="bg-white shadow mr-1 mt-1 p-3 text-sm flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm p-2 flex items-center justify-between gap-4 text-sm">
        <h2 className="font-bold text-base m-0 whitespace-nowrap">
          Annotation
        </h2>
        <div>
          {/* Barre de progression ASCII */}
          <span className="font-mono text-xs text-gray-600">
            {renderProgressBar(article.completionRate)}
          </span>
        </div>
        <nav className="flex gap-4 flex-wrap justify-center">
          <button
            className={`hover:underline ${
              activeSection === "general" ? "font-bold" : ""
            }`}
            onClick={() => setActiveSection("general")}
          >
            Généralités
          </button>
          <button
            className={`hover:underline ${
              activeSection === "content" ? "font-bold" : ""
            }`}
            onClick={() => setActiveSection("content")}
          >
            Méthodologie
          </button>
          <button
            className={`hover:underline ${
              activeSection === "position" ? "font-bold" : ""
            }`}
            onClick={() => setActiveSection("position")}
          >
            Prises de position
          </button>
        </nav>
        <ArticleActions />
      </header>

      <form className="flex flex-col gap-2" autoComplete="off">
        <div className="min-h-[85vh]">{renderSection()}</div>
      </form>
    </div>

    //     <div className="bg-white shadow mr-1 mt-1 p-3 text-sm flex flex-col">
    // <header className="sticky top-0 z-30 bg-white border-b shadow-sm p-2 flex items-center justify-between gap-4 text-sm">
    //   {/* Titre */}
    //   <h2 className="font-bold text-base m-0 whitespace-nowrap">Annotation</h2>

    //   {/* Menu de navigation */}
    //   <nav className="flex gap-4 flex-wrap justify-center">
    //     <a href="#general" className="hover:underline text-gray-700">
    //       Généralités
    //     </a>
    //     <a href="#content" className="hover:underline text-gray-700">
    //       Méthodologie
    //     </a>
    //     <a href="#position" className="hover:underline text-gray-700">
    //       Prises de position
    //     </a>
    //   </nav>

    //   {/* Actions */}
    //   <ArticleActions />
    // </header>

    //       {/* On ouvre le formulaire*/}
    //       <form className="flex flex-col gap-2" autoComplete="off">
    //         {/* Page 1 Généralités : Langue, Objet de recherche, Financement, */}
    //         <div className="min-h-[85vh] max-h-[85vh] h-[85vh] flex flex-col gap-y-4">
    //           <h3 id="general" className="italic text-amber-800 scroll-mt-36">
    //             Généralités
    //           </h3>
    //           {/* Langue */}
    //           <div>
    //             <label className="block font-medium mb-0.5">Langue</label>
    //             <div className="border rounded p-2 flex flex-wrap gap-4">
    //               {languageOptions.map((opt) => (
    //                 <label key={opt} className="flex items-center gap-1">
    //                   <input
    //                     type="radio"
    //                     name="language"
    //                     value={opt}
    //                     checked={article.language === opt}
    //                     onChange={(e) =>
    //                       dispatch(
    //                         updateArticleField({
    //                           field: "language",
    //                           value: e.target.value,
    //                         })
    //                       )
    //                     }
    //                   />
    //                   {opt}
    //                 </label>
    //               ))}
    //             </div>
    //           </div>

    //           {/* Mots-clés */}
    //           <div>
    //             <label className="block font-medium mb-0.5">Mots-clés</label>
    //             <div className="flex flex-col gap-1">
    //               <textarea
    //                 onPaste={handleKeywordPaste}
    //                 onChange={handleKeywordChange}
    //                 placeholder="Collez votre liste de mots-clés séparés par des virgules, points-virgules ou retours à la ligne"
    //                 className="w-full p-2 border rounded h-20 resize-none"
    //               />
    //               <div className="flex flex-wrap gap-1 border border-gray-200 rounded p-1 min-h-14">
    //                 {article.keywords.map((kw, i) => (
    //                   <span
    //                     key={i}
    //                     className="px-2 py-0.5 border border-green-200 rounded text-sm flex items-center"
    //                   >
    //                     {kw}
    //                     <button
    //                       type="button"
    //                       onClick={() => removeKeyword(i)}
    //                       className="ml-1 text-red-500"
    //                     >
    //                       ×
    //                     </button>
    //                   </span>
    //                 ))}
    //               </div>
    //             </div>
    //           </div>

    //           {/* Objet de recherche */}
    //           <div>
    //             <label className="block font-medium mb-0.5">
    //               Objet de recherche
    //             </label>
    //             <div className="border rounded p-2 flex flex-col gap-1">
    //               {objectFocusOptions.map((opt) => (
    //                 <label key={opt} className="flex items-center gap-2">
    //                   <input
    //                     type="radio"
    //                     name="objectFocus"
    //                     value={opt}
    //                     checked={article.objectFocus === opt}
    //                     onChange={(e) =>
    //                       dispatch(
    //                         updateArticleField({
    //                           field: "objectFocus",
    //                           value: e.target.value,
    //                         })
    //                       )
    //                     }
    //                   />
    //                   {opt}
    //                 </label>
    //               ))}
    //             </div>
    //           </div>

    //           {/* Financement */}
    //           <div>
    //             <label className="block font-medium mb-0.5">Financement</label>
    //             <div className="border rounded p-2 flex flex-col gap-1">
    //               {[
    //                 "Sans financement",
    //                 "Agence publique de financement (ANR, Europe, Fonds national suisse, National Science Foundation...)",
    //                 "Public autre",
    //                 "Privé",
    //                 "Autre",
    //                 "Non relevé",
    //               ].map((opt) => (
    //                 <label key={opt} className="flex items-center gap-2">
    //                   <input
    //                     type="radio"
    //                     name="funding"
    //                     value={opt}
    //                     checked={article.funding === opt}
    //                     onChange={(e) =>
    //                       dispatch(
    //                         updateArticleField({
    //                           field: "funding",
    //                           value: e.target.value,
    //                         })
    //                       )
    //                     }
    //                   />
    //                   {opt}
    //                 </label>
    //               ))}
    //             </div>
    //           </div>
    //         </div>

    //         {/* Page 2 Contenu : Genre, Méthodologie, Type de données */}
    // <div className="min-h-[85vh] max-h-[85vh] h-[85vh] border-t border-gray-200 pt-4 mt-4 flex flex-col">
    //   <h3 id="content" className="italic text-amber-800 scroll-mt-12">
    //     Genre, méthodologie et types de données
    //   </h3>

    //   <div className="flex flex-col md:flex-row gap-3 flex-1 text-sm">
    //     {/* Colonne gauche */}
    //     <div className="flex flex-col gap-3 w-full md:w-[40%] md:justify-between md:h-full">
    //       {/* Genre discursif */}
    //       <div className="flex flex-col gap-1">
    //         <label className="block font-medium mb-0.5">
    //           Genre discursif
    //         </label>
    //         <div className="border rounded p-2 flex flex-col gap-2">
    //           {discourseGenreOptions.map((opt) => (
    //             <label key={opt} className="flex items-center gap-1">
    //               <input
    //                 type="checkbox"
    //                 value={opt}
    //                 checked={article.discourseGenre.includes(opt)}
    //                 onChange={(e) => {
    //                   const updated = e.target.checked
    //                     ? [...article.discourseGenre, opt]
    //                     : article.discourseGenre.filter((v) => v !== opt);
    //                   dispatch(
    //                     updateArticleField({
    //                       field: "discourseGenre",
    //                       value: updated,
    //                     })
    //                   );
    //                 }}
    //               />
    //               {opt}
    //             </label>
    //           ))}
    //         </div>
    //       </div>

    //       {/* Méthodologie */}
    //       <div className="flex flex-col gap-1">
    //         <label className="block font-medium mb-0.5">Méthodologie</label>
    //         <div className="border rounded p-2 flex flex-wrap gap-y-1">
    //           {methodologyOptions.map((opt) => (
    //             <label
    //               key={opt}
    //               className="flex items-center gap-2 mb-1 w-1/2"
    //             >
    //               <input
    //                 type="checkbox"
    //                 value={opt}
    //                 checked={article.methodology.includes(opt)}
    //                 onChange={(e) => {
    //                   const updated = e.target.checked
    //                     ? [...article.methodology, opt]
    //                     : article.methodology.filter((v) => v !== opt);
    //                   dispatch(
    //                     updateArticleField({
    //                       field: "methodology",
    //                       value: updated,
    //                     })
    //                   );
    //                 }}
    //               />
    //               {opt}
    //             </label>
    //           ))}
    //         </div>
    //       </div>
    //     </div>

    //     {/* Colonne droite */}
    //     <div className="flex flex-col gap-3 w-full md:w-[60%]">
    //       {/* Types de données */}
    //       <div>
    //         <label className="block font-medium mb-0.5">
    //           Types de données discutées
    //         </label>
    //         <div className="border rounded p-1 flex flex-col gap-2">
    //           {Object.entries(
    //             dataTypesOptions.reduce((acc, opt) => {
    //               const [category, sub] = opt.split("/", 2);
    //               if (!acc[category]) acc[category] = [];
    //               acc[category].push(opt);
    //               return acc;
    //             }, {})
    //           ).map(([category, options]) => (
    //             <div
    //               key={category}
    //               className="bg-gray-50 rounded-sm py-1 px-1"
    //             >
    //               <h4 className="text-xs font-semibold">{category}</h4>
    //               <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
    //                 {options.map((opt) => (
    //                   <label key={opt} className="flex items-center gap-1">
    //                     <input
    //                       type="checkbox"
    //                       value={opt}
    //                       checked={article.dataTypesDiscussed.includes(opt)}
    //                       onChange={(e) => {
    //                         const updated = e.target.checked
    //                           ? [...article.dataTypesDiscussed, opt]
    //                           : article.dataTypesDiscussed.filter(
    //                               (v) => v !== opt
    //                             );
    //                         dispatch(
    //                           updateArticleField({
    //                             field: "dataTypesDiscussed",
    //                             value: updated,
    //                           })
    //                         );
    //                       }}
    //                     />
    //                     {opt.split("/")[1] || opt}
    //                   </label>
    //                 ))}
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //       </div>

    //       {/* Mots-clés */}
    //       <div>
    //         <label className="block font-medium mb-0.5">Mots-clés</label>
    //         <div className="flex flex-col gap-1">
    //           <textarea
    //             onPaste={handleKeywordPaste}
    //             onChange={handleKeywordChange}
    //             placeholder="Si aucune donnée ne figure ci-dessus, saisir le type de données manuellement ici"
    //             className="w-full p-2 border rounded h-8 resize-none"
    //           />
    //           <div className="flex flex-wrap gap-1 border border-gray-200 rounded p-1 min-h-10">
    //             {article.keywords.map((kw, i) => (
    //               <span
    //                 key={i}
    //                 className="px-2 py-0.5 border border-green-200 rounded text-sm flex items-center"
    //               >
    //                 {kw}
    //                 <button
    //                   type="button"
    //                   onClick={() => removeKeyword(i)}
    //                   className="ml-1 text-red-500"
    //                 >
    //                   ×
    //                 </button>
    //               </span>
    //             ))}
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>

    // {/* Page 3 Prises de position : sur l'ouverture des données, sur l'open access et les enjeux, sur les freins*/}
    // <div className="min-h-[85vh] max-h-[85vh] h-[85vh] flex flex-col">
    //   <h3 id="position" className="italic text-amber-800 scroll-mt-36">
    //     Prises de position
    //   </h3>

    //   {/* Position sur l'ouverture des données */}
    //   <div>
    //     <label className="block font-medium mb-0.5">
    //       Position sur l'ouverture des données
    //     </label>
    //     <div className="border rounded p-2 flex flex-col gap-1">
    //       {positionOnDataOptions.map((opt) => (
    //         <label key={opt} className="flex items-center gap-2">
    //           <input
    //             type="radio"
    //             name="positionOnDataOpenAccess"
    //             value={opt}
    //             checked={article.positionOnDataOpenAccess === opt}
    //             onChange={(e) =>
    //               dispatch(
    //                 updateArticleField({
    //                   field: "positionOnDataOpenAccess",
    //                   value: e.target.value,
    //                 })
    //               )
    //             }
    //           />
    //           {opt}
    //         </label>
    //       ))}
    //     </div>
    //   </div>

    //   {/* Position sur Open Access & Enjeux */}
    //   <div>
    //     <label className="block font-medium mb-0.5">
    //       Position sur Open Access & enjeux
    //     </label>
    //     <div className="border rounded p-2 flex flex-col gap-1 max-h-40 overflow-auto">
    //       {positionOnOpenAccessOptions.map((opt) => (
    //         <label key={opt} className="flex items-center gap-2">
    //           <input
    //             type="checkbox"
    //             value={opt}
    //             checked={article.positionOnOpenAccessAndIssues.includes(
    //               opt
    //             )}
    //             onChange={(e) => {
    //               const updated = e.target.checked
    //                 ? [...article.positionOnOpenAccessAndIssues, opt]
    //                 : article.positionOnOpenAccessAndIssues.filter(
    //                     (v) => v !== opt
    //                   );
    //               dispatch(
    //                 updateArticleField({
    //                   field: "positionOnOpenAccessAndIssues",
    //                   value: updated,
    //                 })
    //               );
    //             }}
    //           />
    //           {opt}
    //         </label>
    //       ))}
    //     </div>
    //   </div>

    //   {/* Freins */}
    //   <div>
    //     <label className="block font-medium mb-0.5">Freins</label>
    //     <div className="border rounded p-2 flex flex-col gap-1 max-h-40 overflow-auto">
    //       {barriersOptions.map((opt) => (
    //         <label key={opt} className="flex items-center gap-2">
    //           <input
    //             type="checkbox"
    //             value={opt}
    //             checked={article.barriers.includes(opt)}
    //             onChange={(e) => {
    //               const updated = e.target.checked
    //                 ? [...article.barriers, opt]
    //                 : article.barriers.filter((v) => v !== opt);
    //               dispatch(
    //                 updateArticleField({
    //                   field: "barriers",
    //                   value: updated,
    //                 })
    //               );
    //             }}
    //           />
    //           {opt}
    //         </label>
    //       ))}
    //     </div>
    //   </div>

    //   {/* Remarques */}
    //   <div className="md:col-span-2">
    //     <label className="block font-medium mb-0.5">Remarques</label>
    //     <textarea
    //       value={article.remarks}
    //       onChange={(e) =>
    //         dispatch(
    //           updateArticleField({
    //             field: "remarks",
    //             value: e.target.value,
    //           })
    //         )
    //       }
    //       rows={6}
    //       className="w-full p-0.5 border rounded resize-none"
    //     />
    //   </div>
    // </div>
    //       </form>
    //     </div>
  );
}
