import { useState } from "react";
import { normalizeAuthor } from "./Authors.utils";
import DbStatusPill from "./DbStatusPill";
import { useRouter } from "next/router";

const statusLabels = {
  A: "Directeur.ice de recherche ou professeur.e des universités",
  B: "Chargé.e de recherche ou maître.sse de conférence",
  C: "Post-doctorant.e, doctorant.e ou ingénieur.e de recherche",
  D: "Cabinet privé",
  E: "Administrateur.ice ou ingénieur.e d'infrastructure",
  F: "Responsable politique, institutionnel.le",
  G: "Autre",
  H: "Non renseigné",
};

/**
 * Affiche une carte auteur.
 *
 * Props:
 * - author    : objet auteur (OpenAlex ou DB)
 * - source    : "default" | "db" (masque DbStatusPill si "db")
 * - small     : bool → n'affiche que le nom + DbStatusPill
 */
const AuthorCard = ({ author, source = "default", small = false }) => {
  const router = useRouter();

  // Normalise pour avoir toujours { name, oaId, … }
  const {
    name,
    oaId,
    orcId,
    institutions,
    countries,
    top_two_domains,
    top_five_topics,
    gender,
    status,
    works_count,
  } = normalizeAuthor(author);

  const [showModal, setShowModal] = useState(false);

  // Helpers
  const g = gender || "unknown";
  const s = status || "H";

  const genderColor = {
    male: "bg-pink-100 text-pink-700",
    female: "bg-blue-100 text-blue-700",
    nonbinary: "bg-purple-100 text-purple-700",
    unknown: "bg-gray-100 text-gray-600",
  };

  const handleClick = () => {
    if (oaId) {
      const id = oaId.split("/").pop();
      router.push(`/Authors?oa_id=${id}`);
    }
  };

  /* ---------- VERSION COMPACTE ---------- */
  if (small) {
    return (
      <div
        onClick={handleClick}
        className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm hover:shadow-md transition text-sm flex items-center gap-2 cursor-pointer"
      >
        {source !== "db" && <DbStatusPill oaId={oaId} />}
        <span className="text-gray-800 truncate">{name}</span>
      </div>
    );
  }

  /* ---------- VERSION COMPLÈTE ---------- */
  return (
    <div
      onClick={handleClick}
      className="h-full bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition text-sm flex flex-col cursor-pointer"
    >
      {/* TOP ROW: DB + IDs */}
      <div className="flex items-center justify-between">
        {source !== "db" && <DbStatusPill oaId={oaId} />}
        <div className="flex flex-wrap gap-1">
          {oaId && (
            <a
              href={oaId}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded"
              rel="noopener noreferrer"
            >
              OpenAlex
            </a>
          )}
          {orcId && (
            <a
              href={`${orcId}`}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded"
              rel="noopener noreferrer"
            >
              ORCID
            </a>
          )}
        </div>
      </div>
      {/* NAME + STATUS */}
      <div className="flex items-center gap-2 mt-1.5">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{name}</h3>
        <span
          title={statusLabels[s]}
          className="text-xs font-medium bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-full"
        >
          {s}
        </span>
      </div>
      {/* PUBS */}
      {works_count > 0 && (
        <div className="text-xs text-gray-600 mt-1.5">
          📚 {works_count} publication{works_count > 1 ? "s" : ""}
        </div>
      )}
      {/* INSTITUTIONS */}
      {institutions.length > 0 && (
        <div className="flex items-start text-xs mt-1.5">
          <span className="w-20 text-gray-500 flex-shrink-0">Inst.:</span>

          <div className="flex-1 flex gap-1 overflow-hidden">
            <div className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 truncate overflow-hidden whitespace-nowrap flex-1">
              {institutions[0]}
            </div>

            {institutions.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className="text-blue-600 underline flex-shrink-0"
              >
                +{institutions.length - 1}
              </button>
            )}
          </div>
        </div>
      )}
      {/* COUNTRIES */}
      {countries.length > 0 && (
        <div className="flex items-start text-xs mt-1.5">
          <span className="w-20 text-gray-500">Countries:</span>
          <span className="text-gray-700 truncate">{countries.join(", ")}</span>
        </div>
      )}
      {/*GENDER*/}
      <div className="flex items-start text-xs mt-1.5">
        <span className="w-20 text-gray-500">Gender:</span>
        <span
          className={`px-2 py-0.5 rounded-full font-medium ${genderColor[g]} truncate max-w-[6ch]`}
        >
          {g === "unknown" ? "N/A" : g}
        </span>
      </div>
      {/* DOMAINS */}
      {top_two_domains.length > 0 && (
        <div className="mt-1.5">
          <h4 className="text-xs font-semibold text-gray-500">Domains</h4>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {top_two_domains.map((d, i) => (
              <span
                key={i}
                className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs"
              >
                {d.name}
                <span className="ml-1 bg-blue-100 text-blue-800 px-1 rounded-full">
                  {d.percentage}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
      {/* TOPICS */}
      {top_five_topics.length > 0 && (
        <div className="mt-1.5">
          <h4 className="text-xs font-semibold text-gray-500">Topics</h4>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {top_five_topics.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
              >
                {t.display_name || t}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              All Institutions
            </h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1 text-sm text-gray-700">
              {institutions.map((inst, i) => (
                <li key={i} className="border-b border-gray-200 pb-1">
                  {inst}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorCard;
