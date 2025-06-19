import { useState } from "react";
import DbStatusPill from "./DbStatusPill";

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

export default function AuthorCard({ author, small = false, onClick }) {
  const {
    display_name = "",
    id = "",
    orcid = "",
    institutions = [],
    countries = [],
    top_two_domains = [],
    top_five_topics = [],
    gender = "unknown",
    status = "H",
    works_count = 0,
    completionRate = 0,
  } = author || {};

  const CompletionCircle = ({ rate = 0, size = 32, stroke = 4 }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(rate, 100));
    const offset = circumference - (progress / 100) * circumference;
    const isZero = progress === 0;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />
          {!isZero && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#22c55e"
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-700" title={`Completion ${progress}%`}>
          {progress}%
        </div>
      </div>
    );
  };

  const [showModal, setShowModal] = useState(false);

  const genderColor = {
    male: "bg-pink-100 text-pink-700",
    female: "bg-blue-100 text-blue-700",
    nonbinary: "bg-purple-100 text-purple-700",
    unknown: "bg-gray-100 text-gray-600",
  };

  if (small) {
    return (
      <div
        onClick={onClick}
        className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm hover:shadow-md transition text-sm flex items-center gap-2 cursor-pointer"
      >
        <DbStatusPill id={id} />
        <span className="text-gray-800 truncate">{display_name}</span>
        <CompletionCircle rate={completionRate} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="h-full bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition text-sm flex flex-col cursor-pointer min-h-[200px]"
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <DbStatusPill id={id} />
          <CompletionCircle rate={completionRate} />
        </div>

        <div className="flex flex-wrap gap-1">
          {id && (
            <a
              href={`https://openalex.org/authors/${id}`}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded"
              rel="noopener noreferrer"
            >
              OpenAlex
            </a>
          )}
          {orcid && (
            <a
              href={`https://orcid.org/${orcid}`}
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

      <div className="flex items-center gap-2 mt-1.5">
        <h3 className="text-sm font-semibold text-gray-800 text-clip text-wrap">
          {display_name}
        </h3>
        <span
          title={statusLabels[status]}
          className="text-xs font-medium bg-yellow-50 text-yellow-800 px-4 py-0.5 rounded-full text-clip text-wrap border border-gray-200"
        >
          {`${status} ${statusLabels[status]}`}
        </span>
      </div>

      <div className="flex justify-between">
        {works_count > 0 && (
          <div className="text-xs text-gray-600 mt-1.5">
            📚 {works_count} publication{works_count > 1 ? "s" : ""}
          </div>
        )}

        <div className="flex items-start text-xs mt-1.5">
          <span className="w-20 text-gray-500">Gender:</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${genderColor[gender]}`}>
            {gender === "unknown" ? "N/A" : gender}
          </span>
        </div>
      </div>

      {institutions.length > 0 && (
        <div className="flex items-start text-xs mt-1.5">
          <span className="w-20 text-gray-500 flex-shrink-0">Inst.:</span>
          <div className="flex-1 flex gap-1 overflow-hidden">
            <div className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 truncate whitespace-nowrap flex-1">
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

      {countries.length > 0 && (
        <div className="flex items-start text-xs mt-1.5">
          <span className="w-20 text-gray-500">Countries:</span>
          <span className="text-gray-700 truncate">{countries.join(", ")}</span>
        </div>
      )}

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

      {top_five_topics.length > 0 && (
        <div className="mt-1.5">
          <div className="w-full break-words">
            <span className="text-xs font-semibold text-gray-500 mr-2">
              Topics
            </span>
            {top_five_topics.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className={`mr-1 ${
                  i % 2 === 0 ? "text-rose-400 italic" : "text-gray-500"
                } break-words`}
              >
                {t.display_name || t}
              </span>
            ))}
          </div>
        </div>
      )}

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
}
  