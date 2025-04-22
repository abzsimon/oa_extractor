import { useSelector, useDispatch } from "react-redux";
import TopicTreeExpandable from "./TopicTreeExpandable";
import { updateAuthorField } from "../../reducers/author";
import AuthorActions from "./AuthorActions";
import DbStatusPill from "./DbStatusPill";

export default function AuthorViewer() {
  const author = useSelector((state) => state.author);
  const dispatch = useDispatch();

  if (!author || !author.oa_id) {
    return (
      <p className="text-gray-500 italic text-center">
        Aucun auteur sélectionné.
      </p>
    );
  }

  const handleInput = (field) => (e) => {
    dispatch(updateAuthorField({ field, value: e.target.value }));
  };

  return (
    <div className="space-y-4 text-sm text-gray-800">
      {/* 🧠 Grid en 3 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne 1 : Infos générales */}
        <div className="space-y-1">
          <p className="flex items-center gap-3">
            <strong>Nom</strong> {author.display_name}
            <DbStatusPill
              key={author.oa_id + (author.isInDb ? "-in" : "-out")}
              oaId={author.oa_id}
            />
          </p>
          <p>
            <strong>OA ID</strong> {author.oa_id}
          </p>
          <p>
            <strong>ORCID</strong> {author.orcid || undefined}
          </p>
          <p>
            <strong>Citations</strong> {author.cited_by_count}
          </p>
          <p>
            <strong>Publications</strong> {author.works_count}
          </p>
          <p>
            <strong>Top 2 Domains</strong>
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {author.top_two_domains.map((d, i) => {
              const isHighest =
                d.percentage ===
                Math.max(...author.top_two_domains.map((x) => x.percentage));
              const percentageBg = isHighest ? "#d0f5d8" : "#fddede"; // vert ou rouge clair
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

        {/* Colonne 2 : Top topics & domains */}
        <div className="space-y-3 ml-4">
          <div>
            <p className="font-semibold">Top 5 Topics</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {author.top_five_topics.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm font-medium text-gray-800"
                  style={{
                    backgroundColor: "#f0f0f0",
                    borderRadius: "999px",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne 3 : Topic Tree */}
        <div>
          <p className="font-semibold mb-1">Topic Tree</p>
          <div className="max-h-64 overflow-auto border border-gray-200 rounded p-2 bg-gray-50">
            <TopicTreeExpandable topicTree={author.topic_tree} />
          </div>

          {/* 📚 Types de documents */}
          {author.doctypes.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Types de documents</h4>
              <ul className="flex flex-wrap gap-2 text-xs mt-1">
                {author.doctypes.map((d, i) => (
                  <li key={i} className="bg-gray-100 px-2 py-1 rounded">
                    {d.name}: {d.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ✏️ Informations manuelles */}
      <div className="flex gap-4">
        {/* Bloc de gauche - Champs à compléter */}
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 w-1/5">
          <div className="flex flex-col gap-2 mr-2">
            <label>
              Genre
              <select
                value={author.gender}
                onChange={handleInput("gender")}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1"
              >
                <option value="">--</option>
                <option value="female">Femme</option>
                <option value="male">Homme</option>
                <option value="nonbinary">Non-binaire</option>
              </select>
            </label>
            <label>
              Statut
              <select
                value={author.status}
                onChange={handleInput("status")}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1"
              >
                <option value="">--</option>
                {["A", "B", "C", "D", "E", "F", "G", "H"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Bloc de droite - Remarques */}
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 w-4/5">
          <h3 className="font-semibold text-gray-700 mb-2">Remarques</h3>
          <textarea
            value={author.annotation}
            onChange={handleInput("annotation")}
            rows={4}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="Ajouter un commentaire ou une note"
          />
        </div>
      </div>

      {/* 🔢 Works IDs */}
      {/* <div>
        <h4 className="font-semibold">
          Publications ({author.overall_works.length})
        </h4>
        <div className="max-h-24 overflow-auto text-xs bg-gray-50 p-2 border border-gray-200 rounded">
          {author.overall_works.join(", ")}
        </div>
      </div> */}
      <AuthorActions />
    </div>
  );
}
