import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedArticleId } from "../../reducers/user";
import { useState, useCallback } from "react";

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
      <div
        className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-700"
        title={`Completion ${progress}%`}
      >
        {progress}%
      </div>
    </div>
  );
};

export default function ArticleCard({
  article,
  small = false,
  onViewModal,
  onClick,
  onDelete,
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedArticleId = useSelector(
    (state) => state.user.selectedArticleId
  );
  const token = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = useCallback(() => {
    if (onViewModal) onViewModal(article);
  }, [onViewModal, article]);

  const handleEdit = useCallback(() => {
    dispatch(setSelectedArticleId(article.id));
    router.push("/Article");
  }, [dispatch, article.id, router]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete article "${article.title}"?`)) return;

    if (!token || !projectId) {
      alert("Authentication required.");
      return;
    }

    setIsDeleting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const res = await fetch(
        `${backendUrl}/articles/${article.id}?projectId=${projectId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(`Delete error: ${data.message}`);
      } else {
        alert("Article deleted 🗑️");
        if (onDelete) onDelete(article.id);
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!article) return null;

  if (small) {
    return (
      <div
        className={`${
          selectedArticleId === article.id ? "bg-rose-50" : "bg-white"
        } border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition text-sm flex items-center justify-between gap-2 cursor-pointer`}
        onClick={() => onClick(article)}
      >
        <div className="flex flex-col overflow-hidden cursor-pointer">
          <span className="text-gray-800 font-medium truncate max-w-[35rem]">
            {article.title || "(No title)"}
          </span>
          <div className="text-xs text-gray-600 flex gap-2 mt-0.5">
            <span>{article.pubyear || "?"}</span>
            <span>•</span>
            <span>{article.referenceType || "-"}</span>
            {article.oa_status && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                OA
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-800">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
            title="View"
            className="px-3 py-1 flex items-center gap-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
          >
            🔍 <span>See</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            title="Edit"
            className="px-3 py-1 flex items-center gap-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
          >
            ✎ <span>Edit</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            title="Delete"
            className={`px-3 py-1 flex items-center gap-2 rounded-md border border-gray-300 transition ${
              isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            }`}
          >
            🗑 <span>Del</span>
          </button>

          <CompletionCircle rate={article.completionRate || 0} />
        </div>
      </div>
    );
  }

  const renderRow = (label, values) =>
    values?.length > 0 ? (
      <tr key={label}>
        <td className="pr-2 align-top text-[10px] font-medium text-gray-500 whitespace-nowrap">
          {label}
        </td>
        <td className="text-[10px] text-gray-800">{values.join(", ")}</td>
      </tr>
    ) : null;

  return (
    <div
      className={`${
        selectedArticleId === article.id ? "bg-rose-50" : "bg-white"
      } p-4 flex flex-col gap-4 overflow-auto border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer`}
      onClick={() => onClick(article)}
    >
      <div className="flex gap-2 items-start">
        {/* Facettes (gauche) */}
        <div className="min-w-[160px] shrink-0 text-xs text-gray-600 space-y-1 mt-1">
          {renderRow("Domains", article.domains)}
          {renderRow("Fields", article.fields)}
          {renderRow("Subfields", article.subfields)}
          {renderRow("Topics", article.topics)}
        </div>

        {/* Titre + infos (droite) */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 leading-snug">
            {article.title || "Untitled Article"}
          </h2>
          <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-x-4 gap-y-1 items-center">
            {article.doi ? (
              <a
                href={article.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate max-w-[28rem]"
              >
                {article.doi}
              </a>
            ) : (
              <span className="italic text-gray-400">No DOI</span>
            )}
            <span>{article.pubyear || "?"}</span>
            <span>{article.referenceType || "Type ?"}</span>
            <span
              className={article.oa_status ? "text-green-700" : "text-red-600"}
            >
              {article.oa_status ? "Open Access" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {article.abstract && (
        <div>
          <label className="text-sm font-medium text-gray-600">Résumé</label>
          <p className="text-sm text-gray-800 whitespace-pre-line mt-1">
            {article.abstract}
          </p>
        </div>
      )}
    </div>
  );
}
