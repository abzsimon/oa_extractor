import { useState } from "react";
import { Save, Check, X } from "lucide-react";
import { useSelector } from "react-redux";

export default function BackupButton() {
  const [status, setStatus] = useState("idle");   // idle | loading | success | error
  const [message, setMessage] = useState("");

  const token     = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const isLoggedIn = Boolean(token && projectId);

  /* ------------------------- Handler ------------------------- */
  const handleClick = async () => {
    if (!isLoggedIn || status === "loading") {
      setStatus("error");
      setMessage("Vous devez être connecté pour effectuer une sauvegarde.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      const response   = await fetch(`${backendUrl}/backup`, {
        method:  "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({ projectId }),
      });

      const rawText = await response.text();

      if (!response.ok) {
        const { message: msg = `Erreur (HTTP ${response.status})` } =
          safeJSON(rawText);
        throw new Error(msg);
      }

      const { commit } = JSON.parse(rawText);
      setStatus("success");
      setMessage(`Sauvegarde réussie : ${commit.id.slice(0, 6)}`);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(`Échec : ${err.message}`);
    } finally {
      // Repos automatique après 3 s
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    }
  };

  /* ------------------------- Helpers ------------------------- */
  const safeJSON = (txt) => {
    try   { return JSON.parse(txt); }
    catch { return {}; }
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
        return <Save size={20} className="text-purple-500" />;
    }
  };

  /* ------------------------- JSX ------------------------- */
  return (
    <div className="flex flex-col items-center">
      {/* Bouton + tooltip */}
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
    Login to version on GitLab
  </span>
)}

        <button
          onClick={handleClick}
          disabled={status === "loading" || !isLoggedIn}
          title="Effectuer une sauvegarde"
          className="
            rounded-full bg-purple-200 p-4 transition
            enabled:hover:bg-purple-300 disabled:cursor-not-allowed
          "
        >
          {renderIcon()}
        </button>
      </div>

      {/* Message de retour */}
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
