import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const DbStatusPill = ({ id }) => {
  // --- Auth depuis Redux ----------------------------------------------------
  const token      = useSelector((s) => s.user.token);
  const projectId  = useSelector((s) => s.user.projectIds?.[0]);
  const isLoggedIn = Boolean(token && projectId);

  // --- Config API -----------------------------------------------------------
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;      // ex : http://localhost:3000
  const apiUrl     = `${backendUrl}/authors`;

  // --- Local state ----------------------------------------------------------
  // status = "unknown" | "inDb" | "notInDb"
  const [status, setStatus] = useState("unknown");
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Vérifie la présence en DB (seulement si connecté)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoggedIn || !id) {
      setStatus("unknown");
      return;
    }

    const checkDb = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${apiUrl}/${id}?projectId=${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatus(res.ok ? "inDb" : "notInDb");
      } catch (err) {
        console.error("Error checking DB status:", err);
        setStatus("notInDb");
      } finally {
        setLoading(false);
      }
    };

    checkDb();
  }, [id, isLoggedIn, token, projectId, apiUrl]);

  // -------------------------------------------------------------------------
  // Rendu
  // -------------------------------------------------------------------------
  if (!id) return null;

  // Non connecté → invite à se connecter
  if (!isLoggedIn) {
    return (
      <span
        title="Connecte-toi pour sauvegarder cet auteur"
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-gray-50 text-gray-500 border border-gray-200"
      >
        💾❓
      </span>
    );
  }

  // En cours de vérification
  if (loading) {
    return <span className="text-xs text-gray-400 italic">checking…</span>;
  }

  // Résultat connu
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
        status === "inDb"
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-purple-50 text-purple-800 border border-purple-200"
      }`}
    >
      {status === "inDb" ? "💾✅" : "💾❌"}
    </span>
  );
};

export default DbStatusPill;
