import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setAuthor } from "../../reducers/author";
import { convertTopicTreeForReducer } from "./Authors.utils";
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

export default function AuthorCard({
  author,
  small = false,
  onClick,
  onDelete,
}) {
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
    source = "",
  } = author || {};

  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const articleId = useSelector((state) => state.article.id);

  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;

  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = useCallback(() => {
    dispatch(
      setAuthor({
        ...author,
        topic_tree: convertTopicTreeForReducer(author.topic_tree),
        isInDb: true,
      })
    );
    router.push("/Authors");
  }, [dispatch, author, router]);

  // ancienne fonction handle delete qui détruit entièrement l'auteur
  // const handleDelete = async () => {
  //   if (!window.confirm(`Supprimer "${display_name}" ?`)) return;
  //   if (!token || !projectId) {
  //     alert("Authentification requise.");
  //     return;
  //   }

  //   setIsDeleting(true);
  //   try {
  //     const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
  //     const res = await fetch(
  //       `${backendUrl}/authors/${id}?projectId=${projectId}`,
  //       {
  //         method: "DELETE",
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     const data = await res.json();
  //     if (!res.ok) {
  //       alert(`Erreur : ${data.message}`);
  //     } else {
  //       alert("Auteur supprimé 🗑️");
  //       if (!res.ok) {
  //         alert(`Erreur : ${data.message}`);
  //       } else {
  //         alert("Auteur supprimé 🗑️");
  //         if (onDelete) onDelete(id); // 🔗 callback vers parent
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Erreur suppression auteur:", err);
  //     alert("Erreur réseau.");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  // nouvelle fonction handle delete qui le sort juste de la liste des auteurs d'un article, une fonction de suppression complète sera faite dans AuthorViewer > AuthorActions

  const handleDelete = async () => {
    if (!window.confirm(`Retirer "${display_name}" de l’article courant ?`))
      return;
    if (!token || !projectId) {
      alert("Authentification requise.");
      return;
    }
    if (!articleId) {
      alert("Aucun article courant trouvé.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(
        `${backendUrl}/articles/${articleId}/authors/${id}?projectId=${projectId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (!res.ok) {
        alert(`Erreur suppression : ${data.message}`);
      } else {
        alert("Auteur retiré de l’article 🧹");
        if (onDelete) onDelete(id); // met à jour l'affichage si callback fourni
      }
    } catch (err) {
      console.error(
        "Erreur réseau lors de la suppression d’auteur de l’article :",
        err
      );
      alert("Erreur réseau.");
    } finally {
      setIsDeleting(false);
    }
  };

  const CompletionCircle = ({ rate = 0, size = 28, stroke = 3 }) => {
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
        <div
          className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-gray-700"
          title={`Completion ${progress}%`}
        >
          {progress}%
        </div>
      </div>
    );
  };

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
      className="h-full bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition text-xs flex flex-col cursor-pointer min-h-[180px]"
    >
      {/* Header avec status, completion, boutons et liens externes */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2 items-center">
          <DbStatusPill id={id} />
          <CompletionCircle rate={completionRate} />
        </div>

        {/* Boutons Modifier / Supprimer */}
        <div className="flex gap-2 border border border-1 p-1 border-blue-400 rounded-md">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="px-2 py-0.5 text-xs hover:bg-gray-100 transition"
            title="Modifier"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className={`px-2 py-0.5 text-sm transition ${
              isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            }`}
            title="Supprimer"
          >
            🗑
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          {id && source === "openalex" ? (
            <a
              href={`https://openalex.org/authors/${id}`}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded"
              rel="noopener noreferrer"
            >
              OpenAlex
            </a>
          ) : (
            <div className="bg-gray-200 text-blue-500 text-xs px-1.5 py-0.5 rounded">
              📝 Manuel
            </div>
          )}
          {orcid && source === "openalex" && (
            <a
              href={`https://orcid.org/${orcid}`}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded"
              rel="noopener noreferrer"
            >
              ORCID
            </a>
          )}
        </div>
      </div>

      {/* Nom et statut */}
      <div className="flex items-start gap-2 mb-1.5">
        <h3 className="text-sm font-semibold text-gray-800 flex-1 text-wrap leading-tight max-w-[40%] truncate overflow">
          {display_name}
        </h3>
        <span
          title={statusLabels[status]}
          className="text-xs font-medium bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-full border border-gray-200 flex-shrink-0 max-w-[60%] truncate overflow"
        >
          {`${status} – ${statusLabels[status]}`}
        </span>
      </div>

      {/* Publications et Genre sur la même ligne */}
      <div className="flex justify-between items-center mb-1.5">
        {works_count > 0 && (
          <div className="text-xs text-gray-600">
            📚 {works_count} pub{works_count > 1 ? "s" : ""}
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Genre:</span>
          <span
            className={`px-1.5 py-0.5 rounded-full font-medium text-xs ${genderColor[gender]}`}
          >
            {gender === "unknown" ? "N/A" : gender}
          </span>
        </div>
      </div>

      {/* Institutions */}
      {institutions.length > 0 && (
        <div className="flex items-start text-xs mb-1">
          <span className="text-gray-500 flex-shrink-0 w-12">Inst:</span>
          <div className="flex-1 flex gap-1 overflow-hidden">
            <div className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 truncate whitespace-nowrap flex-1 text-xs">
              {institutions[0]}
            </div>
            {institutions.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className="text-blue-600 underline flex-shrink-0 text-xs"
              >
                +{institutions.length - 1}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pays */}
      {countries.length > 0 && (
        <div className="flex items-start text-xs mb-1">
          <span className="text-gray-500 w-12 flex-shrink-0">Pays:</span>
          <span className="text-gray-700 truncate text-xs">
            {countries.join(", ")}
          </span>
        </div>
      )}

      {/* Domaines */}
      {top_two_domains.length > 0 && (
        <div className="mb-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-xs font-medium text-gray-500">Domaines:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {top_two_domains.map((d, i) => (
              <span
                key={i}
                className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs leading-tight"
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

      {/* Topics */}
      {top_five_topics.length > 0 && (
        <div className="flex-1">
          <div className="w-full break-all hyphens-auto ..." lang="en">
            <span className="text-xs font-medium text-gray-500 mr-1">
              Topics:
            </span>
            {top_five_topics.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className={`mr-1 text-xs ${
                  i % 2 === 0 ? "text-rose-400 italic" : "text-gray-500"
                } break-words`}
              >
                {t.display_name || t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Modal institutions */}
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
              Toutes les institutions
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
