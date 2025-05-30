import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedArticleId } from "../../reducers/user";
import { useRouter } from "next/router";

// Petit utilitaire pour normaliser l’ID OpenAlex → "W...."
const stripOpenAlexId = (id) => id?.replace("https://openalex.org/", "") || id;

// Pause asynchrone
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AuthorWorksBrowser({ authorId, displayCount = 6 }) {
  const [allWorks, setAllWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!authorId) return;

    let cancelled = false;
    const fetchAllWorks = async () => {
      try {
        setLoading(true);
        setError(null);

        const perPage = 60;
        const baseUrl =
          `https://api.openalex.org/works?filter=author.id:${authorId}` +
          `&select=id,doi,title,display_name,publication_year,language,open_access` +
          `&per-page=${perPage}&sort=publication_year:desc&mailto=simon.apartis@cnrs.fr`;

        // --- Page 1 ---
        const firstPage = await fetch(baseUrl).then((res) => res.json());
        if (cancelled) return;

        let results = firstPage.results || [];
        const total = firstPage.meta?.count || 0;
        const pages = Math.ceil(total / perPage);

        // --- Pages suivantes avec 1 s d'intervalle ---
        for (let p = 2; p <= pages; p++) {
          await sleep(1000); // <—— pause de 1 s avant chaque appel
          const pageData = await fetch(`${baseUrl}&page=${p}`).then((res) => res.json());
          if (cancelled) return;
          results = results.concat(pageData.results || []);
        }

        setAllWorks(results);
      } catch (err) {
        console.error("Error fetching works:", err);
        setError("Failed to load publications.");
        setAllWorks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAllWorks();

    // Cleanup si le composant se démonte ou si authorId change
    return () => {
      cancelled = true;
    };
  }, [authorId]);

  // --- Filtrage et pagination côté client ---
  const filteredWorks = allWorks.filter((pub) =>
    (pub.title || pub.display_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filteredWorks.length / displayCount);
  const currentWorks = filteredWorks.slice(
    page * displayCount,
    (page + 1) * displayCount
  );

  // Réinitialise la page affichée si la recherche ou l'auteur change
  useEffect(() => {
    setPage(0);
  }, [search, authorId]);

  if (!authorId) return null;

  return (
    <div className="mt-6">
      {/* En-tête : titre, barre de recherche, pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <h3 className="text-base font-bold flex-shrink-0">
          Publications de l’auteur
        </h3>
        <h2 className="text-xs text-amber-300 italic">
          Le chargement est lent pour éviter les erreurs 429 OpenAlex
        </h2>
        <input
          type="text"
          placeholder="Rechercher dans les titres…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-64 w-full p-2 border rounded text-sm"
        />
        <div className="flex gap-2 items-center flex-shrink-0">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 text-xs"
          >
            Précédent
          </button>
          <span className="text-xs text-gray-600">
            Page {page + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page + 1 >= pageCount}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 text-xs"
          >
            Suivant
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 italic">Chargement…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredWorks.length === 0 ? (
        <p className="text-gray-400 italic">Aucune publication trouvée.</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {currentWorks.map((pub) => {
              const wId = stripOpenAlexId(pub.id);
              return (
                <div
                  key={wId}
                  className="bg-white border rounded p-2 shadow flex flex-col justify-between min-h-[120px]"
                >
                  <div className="font-semibold text-xs line-clamp-3 mb-1">
                    {pub.title || pub.display_name || "Sans titre"}
                  </div>
                  <div className="text-xs text-gray-600">
                    {pub.publication_year || "Année ?"} | {pub.language || "langue ?"} |{" "}
                    <span
                      className={
                        pub.open_access
                          ? "text-green-700 font-semibold"
                          : "text-red-700"
                      }
                    >
                      {pub.open_access ? "Open Access" : "Closed"}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <a
                      href={pub.doi ? pub.doi : pub.id}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      See publication
                    </a>
                    <button
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      onClick={() => {
                        dispatch(setSelectedArticleId(wId));
                        router.push("/Article");
                      }}
                    >
                      Annotate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
