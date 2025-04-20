import { useEffect, useState } from "react";

const DbStatusPill = ({ oaId }) => {
  const [isInDb, setIsInDb] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkDb = async () => {
      if (!oaId) return;

      try {
        const res = await fetch(`http://localhost:3000/authors/${oaId}`);
        setIsInDb(res.ok);
      } catch (err) {
        console.error("Error checking DB status:", err);
        setIsInDb(false);
      } finally {
        setChecked(true);
      }
    };

    checkDb();
  }, [oaId]); // <--- Important: re-run if oaId changes (after creation)

  if (!checked) {
    return (
      <span className="text-xs text-gray-400 italic">checking DB…</span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
        isInDb
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-purple-50 text-purple-800 border border-purple-200"
      }`}
    >
      💾 {isInDb ? "In DB" : "Not in DB"}
    </span>
  );
};

export default DbStatusPill;
