import { useEffect, useState } from "react";

const DbStatusPill = ({ oaId }) => {
  const [isInDb, setIsInDb] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oaId) return;

    const checkDb = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://oa-extractor-backend.vercel.app/authors/${oaId}`);
        setIsInDb(res.ok);
      } catch (err) {
        console.error("Error checking DB status:", err);
        setIsInDb(false);
      } finally {
        setLoading(false);
      }
    };

    checkDb();
  }, [oaId]); // ← KEY POINT: will re-run if oaId changes!

  if (loading) {
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
