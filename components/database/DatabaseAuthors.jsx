import { useEffect, useState } from "react";
import AuthorCard from "../authors/AuthorCard";

export default function DatabaseAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const res = await fetch("http://localhost:3000/authors");
        const json = await res.json();
        setAuthors(json.data || []);
      } catch (err) {
        console.error("Erreur chargement auteurs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAuthors();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Auteurs</h2>
      {loading ? (
        <p className="text-gray-500">Chargement des auteurs...</p>
      ) : authors.length === 0 ? (
        <p className="text-gray-500 italic">Aucun auteur pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {authors.map((a, i) => (
            <AuthorCard
              key={a.oa_id || i}
              author={{ ...a, isInDb: true }}
              source="db"
            />
          ))}
        </div>
      )}
    </div>
  );
}
