import { useState } from "react";
import { LucideSheet, Check, X } from "lucide-react";
import { useSelector } from "react-redux";

export default function ExcelButton() {
  const [status, setStatus] = useState("idle");   // idle | loading | success | error
  const [message, setMessage] = useState("");

  const token     = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const isLoggedIn = Boolean(token && projectId);

  const handleClick = async () => {
    if (!isLoggedIn || status === "loading") {
      setStatus("error");
      setMessage("Vous devez être connecté pour exporter.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const url = `${backendUrl}/csv/excel?projectId=${projectId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Essaye de récupérer le nom de fichier dans les headers
      const disposition = response.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match ? match[1] : `export_${new Date().toISOString()}.xlsx`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setStatus("success");
      setMessage("Export terminé !");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(`Échec : ${err.message}`);
    } finally {
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    }
  };

  const renderIcon = () => {
    switch (status) {
      case "loading":
        return (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        );
      case "success":
        return <Check size={20} className="text-green-500" />;
      case "error":
        return <X size={20} className="text-red-500" />;
      default:
        return <LucideSheet size={20} className="text-white" />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        {!isLoggedIn && (
          <span
            className="
              pointer-events-none absolute bottom-full right-0 mb-2
              whitespace-nowrap rounded bg-gray-800 px-3 py-1
              text-xs font-medium text-white shadow-lg
              opacity-0 transition-opacity duration-150 group-hover:opacity-100
              after:absolute after:top-full after:right-4
              after:border-6 after:border-transparent after:border-t-gray-800
            "
          >
            Login pour exporter
          </span>
        )}

        <button
          onClick={handleClick}
          disabled={status === "loading" || !isLoggedIn}
          title="Exporter en Excel"
          className={`
            rounded-full p-4 transition disabled:cursor-not-allowed
            ${status === "idle"
              ? "bg-green-400 enabled:hover:bg-green-600"
              : "bg-gray-200"
            }
          `}
        >
          {renderIcon()}
        </button>
      </div>

      {message && (
        <div
          className={`mt-2 rounded px-3 py-1 ${
            status === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
