// ./components/AuthorViewer.js
import { useSelector, useDispatch } from "react-redux";
import TopicTreeExpandable from "./TopicTreeExpandable";
import DbStatusPill from "./DbStatusPill";
import AuthorWorksBrowser from "./AuthorWorksCarousel";
import AuthorActions from "./AuthorActions";
import { updateAuthorField } from "../../reducers/author";

/* ----------------------------------------------------------------------- */
/* Mapping lettre → libellé complet                                        */
/* ----------------------------------------------------------------------- */
const statusLabels = {
  A: "A - Sénior : DiR, PU",
  B: "B - Intermédiaire : McF, CR",
  C: "C - Junior : Doct., IR, Post-doc",
  D: "D - Privé : cabinet, entreprise",
  E: "E - Adm. / Ing. infra",
  F: "F - Resp. politique / institutionnel",
  G: "G - Autre",
  H: "H - Non renseigné",
};

export default function AuthorViewer() {

  
  const dispatch = useDispatch();
  
  const a = useSelector((s) => s.author);
  
  console.log("log de isindb depuis authorviewer:"+a.isInDb)
  
  if (!a || !a.id) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 italic">Chargement de l'auteur...</p>
      </div>
    );
  }

  // Logique de permissions clarifiée
  const isOpenAlex = a.source === "openalex";
  const isManual = a.source === "manual";
  const isNewOpenAlex = isOpenAlex && a.isInDb === false;
  const isExistingOpenAlex = isOpenAlex && a.isInDb === true;
  const isExistingManual = isManual && a.isInDb === true; // toujours vrai pour manual

  // Permissions d'édition
  const canEditIdentityFields = isExistingManual; // seulement pour les auteurs manuels
  const canEditBasicFields =
    isExistingManual || isNewOpenAlex || isExistingOpenAlex; // gender, status, annotation

  // Affichage des données OpenAlex
  const showOpenAlexData = isOpenAlex;
  // Si l'auteur est en base, on convertit son topic_tree (Mongo) en structure du reducer
  const topicTree = a.topic_tree;

  const handleInput = (field) => (e) => {
    dispatch(updateAuthorField({ field, value: e.target.value }));
  };

  // Status banner logic
  const getBannerConfig = () => {
    if (isNewOpenAlex) {
      return {
        className: "bg-blue-50 border-blue-200 text-blue-800",
        text: "👤🆕 Nouvel auteur OpenAlex – complétez gender/status et sauvegardez",
      };
    }
    if (isExistingManual) {
      return {
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        text: "📝💾 Auteur manuel persisté en DB – toutes modifications autorisées",
      };
    }
    // isExistingOpenAlex
    return {
      className: "bg-green-50 border-green-200 text-green-800",
      text: "👤💾 Auteur OpenAlex persisté en DB – seuls gender/status/annotation modifiables",
    };
  };

  const bannerConfig = getBannerConfig();

  return (
    <div className="space-y-6 text-sm text-gray-800">
      {/* Statut banner */}
      <div className={`border rounded-lg p-3 ${bannerConfig.className}`}>
        <p className="font-medium">{bannerConfig.text}</p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Identity */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            {canEditIdentityFields ? (
              <input
                type="text"
                value={a.display_name || ""}
                onChange={handleInput("display_name")}
                className="w-full border rounded px-3 py-2"
              />
            ) : (
              <span className="block w-full border rounded px-3 py-2 bg-gray-100">
                {a.display_name || a.name || "Non renseigné"}
              </span>
            )}
            <DbStatusPill id={a.id} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OA ID
            </label>
            <span className="block w-full border rounded px-3 py-2 bg-gray-100">
              {a.id}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ORCID
            </label>
            {canEditIdentityFields ? (
              <input
                type="text"
                value={a.orcid || ""}
                onChange={handleInput("orcid")}
                className="w-full border rounded px-3 py-2"
              />
            ) : (
              <span className="block w-full border rounded px-3 py-2 bg-gray-100">
                {a.orcid || a.orcId || "Non renseigné"}
              </span>
            )}
          </div>

          {showOpenAlexData && (
            <>
              <p>
                <strong>Cité·e·par :</strong> {a.cited_by_count || 0}
              </p>
              <p>
                <strong>Publications :</strong> {a.works_count || 0}
              </p>
              {a.overall_works && (
                <a
                  href={a.overall_works}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Voir toutes les œuvres
                </a>
              )}
            </>
          )}
        </div>

        {/* Column 2: Demographics */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            {canEditBasicFields ? (
              <select
                value={a.gender || ""}
                onChange={handleInput("gender")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Choisir --</option>
                <option value="female">Femme</option>
                <option value="male">Homme</option>
                <option value="nonbinary">Non-défini</option>
              </select>
            ) : (
              <span className="block w-full border rounded px-3 py-2 bg-gray-100">
                {a.gender || "Non renseigné"}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            {canEditBasicFields ? (
              <select
                value={a.status || ""}
                onChange={handleInput("status")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Choisir --</option>
                {Object.entries(statusLabels).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="block w-full border rounded px-3 py-2 bg-gray-100">
                {a.status
                  ? `${a.status} – ${statusLabels[a.status]}`
                  : "Non renseigné"}
              </span>
            )}
          </div>
          {showOpenAlexData && a.top_two_domains?.length > 0 ? (
            <div>
              <h2 className="font-semibold">Top 2 Domaines</h2>
              <div className="flex flex-wrap gap-2">
                {a.top_two_domains.map((d, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    {d.name} ({d.percentage}%)
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Top 2 Domaines
              </label>
              {canEditBasicFields ? (
                <div className="space-y-2">
                  {(a.top_two_domains || []).map((d, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={d.name || ""}
                        onChange={(e) => {
                          const updated = [...a.top_two_domains];
                          updated[i] = { ...updated[i], name: e.target.value };
                          dispatch(
                            updateAuthorField({
                              field: "top_two_domains",
                              value: updated,
                            })
                          );
                        }}
                        placeholder="Nom du domaine"
                        className="flex-1 border rounded px-3 py-2"
                      />
                      <input
                        type="number"
                        value={d.percentage || ""}
                        onChange={(e) => {
                          const updated = [...a.top_two_domains];
                          updated[i] = {
                            ...updated[i],
                            percentage: Number(e.target.value),
                          };
                          dispatch(
                            updateAuthorField({
                              field: "top_two_domains",
                              value: updated,
                            })
                          );
                        }}
                        placeholder="Pourcentage"
                        min="0"
                        max="100"
                        className="w-20 border rounded px-3 py-2"
                      />
                      <span className="text-sm text-gray-500">%</span>
                      <button
                        onClick={() => {
                          const updated = a.top_two_domains.filter(
                            (_, idx) => idx !== i
                          );
                          dispatch(
                            updateAuthorField({
                              field: "top_two_domains",
                              value: updated,
                            })
                          );
                        }}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(a.top_two_domains || []).length < 2 && (
                    <button
                      onClick={() => {
                        const updated = [
                          ...(a.top_two_domains || []),
                          { name: "", percentage: 0 },
                        ];
                        dispatch(
                          updateAuthorField({
                            field: "top_two_domains",
                            value: updated,
                          })
                        );
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Ajouter un domaine
                    </button>
                  )}
                </div>
              ) : (
                a.top_two_domains?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {a.top_two_domains.map((d, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 rounded-full text-xs"
                      >
                        {d.name} ({d.percentage}%)
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {showOpenAlexData && a.top_five_topics?.length > 0 && (
            <div>
              <h2 className="font-semibold">Top 5 Thèmes</h2>
              <div className="flex flex-wrap gap-2">
                {a.top_five_topics.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Topic Tree & Docs */}
        <div className="space-y-3">
          {showOpenAlexData &&
            topicTree &&
            Object.keys(topicTree).length > 0 && (
              <>
                <h2 className="font-semibold">Topic Tree</h2>
                <TopicTreeExpandable topicTree={topicTree} />
              </>
            )}

          {showOpenAlexData && a.doctypes?.length > 0 && (
            <div>
              <h2 className="font-semibold">Types de documents</h2>
              <ul className="flex flex-wrap gap-2 text-xs">
                {a.doctypes.map((d, i) => (
                  <li key={i} className="bg-gray-100 px-2 py-1 rounded">
                    {d.name}: {d.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showOpenAlexData && a.study_works?.length > 0 && (
            <div>
              <h2 className="font-semibold">Œuvres d'étude</h2>
              <ul className="list-disc ml-5">
                {a.study_works.map((w, i) => (
                  <li key={i}>{w.title || w.id}</li>
                ))}
              </ul>
            </div>
          )}

          {canEditIdentityFields && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Top 5 topics
              </label>
              <div className="space-y-2">
                {(a.top_five_topics || []).map((t, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={t || ""}
                      onChange={(e) => {
                        const updated = [...a.top_five_topics];
                        updated[i] = e.target.value;
                        dispatch(
                          updateAuthorField({
                            field: "top_five_topics",
                            value: updated,
                          })
                        );
                      }}
                      placeholder={`topic ${i + 1}`}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button
                      onClick={() => {
                        const updated = a.top_five_topics.filter(
                          (_, idx) => idx !== i
                        );
                        dispatch(
                          updateAuthorField({
                            field: "top_five_topics",
                            value: updated,
                          })
                        );
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {(a.top_five_topics || []).length < 5 && (
                  <button
                    onClick={() => {
                      const updated = [...(a.top_five_topics || []), ""];
                      dispatch(
                        updateAuthorField({
                          field: "top_five_topics",
                          value: updated,
                        })
                      );
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Ajouter un thème
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remarks/Edit */}
      {canEditBasicFields && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarques
          </label>
          <textarea
            rows={4}
            value={a.annotation || ""}
            onChange={handleInput("annotation")}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      )}

      {/* Actions - afficher pour tous les cas éditables */}
      {(canEditIdentityFields || canEditBasicFields) && <AuthorActions />}

      {/* Works Carousel */}
      {showOpenAlexData && <AuthorWorksBrowser authorId={a.id} />}
    </div>
  );
}
