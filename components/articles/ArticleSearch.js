import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedArticleId } from "../../reducers/user";

export default function ArticleSearch() {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSubmit = async () => {
    if (query.length < 4) return;
    try {
      const res = await fetch(`https://api.openalex.org/autocomplete/works?q=${query}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Erreur API OpenAlex:", err);
      setResults([]);
    }
  };

  const handleSelect = (id) => {
    const match = id.match(/W\d+$/);
    if (!match) return alert("ID OpenAlex invalide (ex: W123456)");
    dispatch(setSelectedArticleId(match[0]));
    setResults([]); // on ferme la liste
  };

  return (
    <div className="w-full">
      {/* Barre de recherche compacte */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type here to look for an article"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400"
        />
        <button
          onClick={handleSubmit}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Go
        </button>
      </div>

      {/* Liste des résultats compacte */}
      {results.length > 0 && (
        <ul className="text-sm border rounded divide-y max-h-[180px] overflow-auto">
          {results.map((item) => (
            <li
              key={item.id}
              className="px-2 py-1 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
            >
              <span className="truncate pr-2">{item.display_name || "Sans titre"}</span>
              <button
                onClick={() => handleSelect(item.id)}
                className="text-xs text-green-600 hover:underline"
              >
                Choisir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
