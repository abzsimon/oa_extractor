import { useState } from "react";
import { Save, Check, X } from "lucide-react";

export default function BackupButton() {
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    if (status === "loading") return;
    
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(
        "https://oa-extractor-backend.vercel.app/backup",
        { method: "POST" }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setStatus("error");
        setMessage(
          errorData.message
            ? `Erreur : ${errorData.message}`
            : `Erreur inattendue (HTTP ${response.status})`
        );
        return;
      }

      const data = await response.json();
      setStatus("success");
      setMessage(`Sauvegarde réussie : ${data.commit.id.slice(0, 6)}`);
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage("Erreur réseau");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "relative group overflow-hidden rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl";
    
    switch (status) {
      case "loading":
        return `${baseStyles} bg-gradient-to-br from-blue-200 to-blue-300 cursor-wait`;
      case "success":
        return `${baseStyles} bg-gradient-to-br from-green-200 to-green-300`;
      case "error":
        return `${baseStyles} bg-gradient-to-br from-rose-200 to-rose-300`;
      default:
        return `${baseStyles} bg-gradient-to-br from-purple-200 to-indigo-200 hover:from-purple-300 hover:to-indigo-300`;
    }
  };

  const getIconColor = () => {
    switch (status) {
      case "loading":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-rose-600";
      default:
        return "text-purple-600";
    }
  };

  const renderIcon = () => {
    switch (status) {
      case "loading":
        return (
          <div className="relative">
            <div className="w-5 h-5 border-2 border-blue-600/40 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        );
      case "success":
        return <Check size={20} className={`${getIconColor()} animate-bounce`} />;
      case "error":
        return <X size={20} className={`${getIconColor()} animate-pulse`} />;
      default:
        return <Save size={20} className={`${getIconColor()} group-hover:rotate-12 transition-transform duration-300`} />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className={`
          w-14 h-14
          ${getButtonStyles()}
          flex items-center justify-center
          disabled:cursor-not-allowed
          focus:outline-none focus:ring-4 focus:ring-blue-500/20
        `}
        title={
          status === "loading" 
            ? "Sauvegarde en cours..." 
            : status === "success"
            ? "Sauvegarde réussie !"
            : status === "error"
            ? "Erreur lors de la sauvegarde"
            : "Lancer la sauvegarde"
        }
      >
        {/* Effet de brillance animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-full"></div>
        
        {/* Icône */}
        <div className="relative z-10">
          {renderIcon()}
        </div>
      </button>

      {/* Message de statut */}
      {message && (
        <div className={`
          px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
          ${status === "success" 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : status === "error"
            ? "bg-red-100 text-red-800 border border-red-200"
            : "bg-blue-100 text-blue-800 border border-blue-200"
          }
          animate-fadeIn
        `}>
          {message}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}