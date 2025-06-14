import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useEffect } from "react";
import TopicTreeExpandable from "./TopicTreeExpandable";
import { updateAuthorField, setAuthor } from "../../reducers/author";
import AuthorActions from "./AuthorActions";
import DbStatusPill from "./DbStatusPill";
import AuthorWorksBrowser from "./AuthorWorksCarousel";

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

export default function AuthorEditor() {
  const author = useSelector((state) => state.author);
  const dispatch = useDispatch();
  const router = useRouter();
  const { oa_id } = router.query;

  // 🧠 Initialisation pour les auteurs manuels qui n'existent pas encore
  useEffect(() => {
    if (oa_id && oa_id.startsWith("MA-") && (!author || author.oa_id !== oa_id)) {
      // Créer un auteur vide pour l'édition/création
      dispatch(setAuthor({
        oa_id: oa_id,
        display_name: "",
        orcid: "",
        cited_by_count: 0,
        works_count: 0,
        gender: "",
        status: "",
        annotation: "",
        isInDb: false, // Pas encore en base
        // Pas de données OpenAlex pour un auteur manuel
        top_two_domains: [],
        top_five_topics: [],
        topic_tree: {},
        doctypes: [],
        source: "manual"
      }));
    }
  }, [oa_id, author, dispatch]);

  if (!author || !author.oa_id) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 italic">
          Chargement de l'auteur...
        </p>
      </div>
    );
  }

  // 🧠 Détection si c'est un auteur manuel
  const isManualAuthor = author.oa_id && author.oa_id.startsWith("MA-");
  const isNewAuthor = !author.isInDb;

  const handleInput = (field) => (e) => {
    dispatch(updateAuthorField({ field, value: e.target.value }));
  };

  return (
    <div className="space-y-4 text-sm text-gray-800">
      {/* 🔔 Indicateur statut */}
      <div className={`border rounded-lg p-3 ${
        isNewAuthor 
          ? "bg-blue-50 border-blue-200" 
          : isManualAuthor 
            ? "bg-yellow-50 border-yellow-200" 
            : "bg-green-50 border-green-200"
      }`}>
        <p className={`font-medium ${
          isNewAuthor 
            ? "text-blue-800" 
            : isManualAuthor 
              ? "text-yellow-800" 
              : "text-green-800"
        }`}>
          {isNewAuthor 
            ? "🆕 Nouvel auteur - Remplissez les informations et sauvegardez"
            : isManualAuthor 
              ? "📝 Auteur manuel - Toutes les informations sont éditables"
              : "👤 Auteur OpenAlex - Informations enrichies automatiquement"
          }
        </p>
      </div>

      {/* 🧠 Grid en 3 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne 1 : Infos générales */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <div className="flex items-center gap-3">
              {isManualAuthor || isNewAuthor ? (
                <input
                  type="text"
                  value={author.display_name || ""}
                  onChange={handleInput("display_name")}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Nom complet de l'auteur"
                  required
                />
              ) : (
                <span className="flex-1">{author.display_name}</span>
              )}
              <DbStatusPill
                key={author.oa_id + (author.isInDb ? "-in" : "-out")}
                oaId={author.oa_id}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OA ID
            </label>
            <input
              type="text"
              value={author.oa_id}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100"
              disabled
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ORCID
            </label>
            {isManualAuthor || isNewAuthor ? (
              <input
                type="text"
                value={author.orcid || ""}
                onChange={handleInput("orcid")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="0000-0000-0000-0000"
                pattern="\\d{4}-\\d{4}-\\d{4}-\\d{4}"
              />
            ) : (
              <input
                type="text"
                value={author.orcid || "Non renseigné"}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100"
                disabled
              />
            )}
          </div> 

          {/* Domains - uniquement pour auteurs OpenAlex */}
          {!isManualAuthor && !isNewAuthor && author.top_two_domains?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top 2 Domains
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {author.top_two_domains.map((d, i) => {
                  const isHighest =
                    d.percentage ===
                    Math.max(...author.top_two_domains.map((x) => x.percentage));
                  const percentageBg = isHighest ? "#d0f5d8" : "#fddede";
                  const percentageColor = isHighest ? "#2e7d32" : "#c62828";

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#f0f0f0",
                          color: "#333",
                          padding: "6px 10px",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          borderTopLeftRadius: "999px",
                          borderBottomLeftRadius: "999px",
                        }}
                      >
                        {d.name}
                      </div>
                      <div
                        style={{
                          backgroundColor: percentageBg,
                          color: percentageColor,
                          padding: "6px 10px",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          borderTopRightRadius: "999px",
                          borderBottomRightRadius: "999px",
                        }}
                      >
                        {d.percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Colonne 2 : Informations éditables */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              value={author.gender || ""}
              onChange={handleInput("gender")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">-- Choisir --</option>
              <option value="female">Femme</option>
              <option value="male">Homme</option>
              <option value="nonbinary">Non-défini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={author.status || ""}
              onChange={handleInput("status")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">-- Choisir --</option>
              {Object.entries(statusLabels).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Top topics - uniquement pour auteurs OpenAlex */}
          {!isManualAuthor && !isNewAuthor && author.top_five_topics?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top 5 Topics
              </label>
              <div className="flex flex-wrap gap-2">
                {author.top_five_topics.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm font-medium text-gray-800"
                    style={{ backgroundColor: "#f0f0f0", borderRadius: "999px" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne 3 : Topic Tree ou Remarques */}
        <div>
          {!isManualAuthor && !isNewAuthor && author.topic_tree && Object.keys(author.topic_tree).length > 0 ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Tree
              </label>
              <div className="max-h-64 overflow-auto border border-gray-200 rounded p-2 bg-gray-50">
                <TopicTreeExpandable topicTree={author.topic_tree} />
              </div>

              {/* Types de documents */}
              {author.doctypes?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm">Types de documents</h4>
                  <ul className="flex flex-wrap gap-2 text-xs mt-1">
                    {author.doctypes.map((d, i) => (
                      <li key={i} className="bg-gray-100 px-2 py-1 rounded">
                        {d.name}: {d.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarques
              </label>
              <textarea
                value={author.annotation || ""}
                onChange={handleInput("annotation")}
                rows={8}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Ajouter un commentaire, une note, des informations supplémentaires..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Remarques pour auteurs OpenAlex */}
      {!isManualAuthor && !isNewAuthor && (
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarques
          </label>
          <textarea
            value={author.annotation || ""}
            onChange={handleInput("annotation")}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Ajouter un commentaire ou une note"
          />
        </div>
      )}

      {/* Actions CRUD */}
      <AuthorActions />

      {/* Works Browser - uniquement pour auteurs OpenAlex */}
      {!isManualAuthor && !isNewAuthor && (
        <AuthorWorksBrowser authorId={author.oa_id} />
      )}
    </div>
  );
}