import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setArticle, clearArticle } from "../../reducers/article";
import { Search, Plus, X } from "lucide-react";

function ArticleManualMetadata() {
  // État pour l'article saisi manuellement
  const [manualArticle, setManualArticle] = useState({
    source: "manual",
    id: "",
    title: "",
    authors: [],
    authorsFullNames: [],
    abstract: "",
    publishedIn: "",
    url: "",
    pubyear: null,
    referenceType: "",
    isInDb: false,
  });

  // État pour un auteur saisi manuellement
  const [manualAuthor, setManualAuthor] = useState({
    source: "manual",
    id: "",
    display_name: "",
  });

  // pour envoyer l'article final dans le reducer.
  // --> si il est nouveau : on enverra que les champs renseignés dans l'inital state de manualArticle, qu'on aura enrichi avec ce composant,
  // --> s'il est pré-chargé depuis la db et mis à jour, il enverra tous les champs additionnels pour que ArticleForm (dans le composant parent) aie bien tout.

  const dispatch = useDispatch();

  //----------------------------ETATS LOCAUX----------------------------------------------------------

  // pour les deux barres de recherche qui permettent de vérifier si un article existe en DB seulement, et si un auteur existe en DB ou sur openalex
  const [articleQuery, setArticleQuery] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");

  // stockage temporaire des résultats de recherche
  const [articleSearchResults, setArticleSearchResults] = useState([]);
  const [authorSearchResults, setAuthorSearchResults] = useState([]);

  // la recherche a-t-elle déjà été effectuée ?
  const [hasSearchedArticle, setHasSearchedArticle] = useState(false);
  const [hasSearchedAuthor, setHasSearchedAuthor] = useState(false);

  // staging temporaire des auteurs d'un article, pour éviter les erreurs de synchronisation entre la collection article et la collection auteurs
  const [stagedAuthors, setStagedAuthors] = useState([]);

  // Génération d'id aléatoires pour ajout manuel de l'article
  const genArticleId = () =>
    `MW-${Math.random()
      .toString(16)
      .slice(2, 10)
      .padEnd(8, "0")
      .toUpperCase()}`;

  // Helper pour monitorer les états et les reducers articles et auteurs
  const articleRedux = useSelector((s) => s.article);
  const authorsRedux = useSelector((s) => s.authors);

  useEffect(() => {
    if (manualArticle) console.log("Article local :", manualArticle);
    if (stagedAuthors) console.log("Auteurs locaux :", stagedAuthors);
    if (articleRedux) console.log("Article store :", articleRedux);
    if (authorsRedux) console.log("Auteurs store :", authorsRedux);
  }, [manualArticle, stagedAuthors, articleRedux, authorsRedux]);

  // Infos utilisateur & API
  const token = useSelector((s) => s.user.token);
  const projectId = useSelector((s) => s.user.projectIds?.[0]);
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
  const articlesApiUrl = `${backendUrl}/articles/search`;
  const authorsApiUrl = `${backendUrl}/authors/search`;

  // --------------------------------------FONCTIONS------------------------------------------------
  /**  🔄  Synchronise tous les auteurs de stagedAuthors
   *      - crée les nouveaux
   *      - ignore ceux qui existent déjà (bulk upsert)
   */
  const syncStagedAuthors = async (authorsToSync) => {
    if (authorsToSync.length === 0) return;

    try {
      const res = await fetch(`${backendUrl}/authors/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authorsToSync), // ← utilise ce paramètre
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Erreur synchro auteurs : ${data.message}`);
      } else {
        console.log(
          `👍 ${data.created} auteurs créés, ${data.skipped} déjà présents`
        );
        setStagedAuthors([]);
      }
    } catch {
      alert("Erreur réseau pendant la synchro auteurs.");
    }
  };

  // Fonction pour réinitialiser l'article manuel
  const resetManualArticle = () => {
    setManualArticle({
      source: "manual",
      id: "",
      title: "",
      authors: [],
      authorsFullNames: [],
      abstract: "",
      publishedIn: "",
      url: "",
      pubyear: null,
      referenceType: "",
      isInDb: false,
    });
    setStagedAuthors([]);
  };

  // -------------------------------RECHERCHE ARTICLE ----------------------------------------------
  const handleArticleSubmit = async () => {
    if (articleQuery.length < 2) return;
    // On reset le reducer article pour dégager l'ArticleForm de l'élément parent qui perturbe la saisie
    dispatch(clearArticle())
    // On efface les anciens résultats et on marque qu'une recherche est en cours
    setArticleSearchResults([]);
    setHasSearchedArticle(false);

    try {
      const res = await fetch(
        `${articlesApiUrl}?title=${encodeURIComponent(
          articleQuery
        )}&projectId=${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      // On met à jour avec les nouveaux résultats (ou tableau vide)
      const articles = (data?.articles || []).filter(
        (article) => article.source === "manual"
      );
      setArticleSearchResults(articles); // État mis à jour uniquement avec les « manual »
      setHasSearchedArticle(true); // Indique qu’une recherche a été faite

      // SI AUCUN RÉSULTAT, ON RÉINITIALISE LE FORMULAIRE MANUEL
      if (articles.length === 0) {
        resetManualArticle();
      }
    } catch (err) {
      console.error("Erreur API :", err);
      setArticleSearchResults([]);
      setHasSearchedArticle(true);
      // EN CAS D'ERREUR AUSSI, ON RÉINITIALISE LE FORMULAIRE
      resetManualArticle();
    }
  };

  // Fonction pour mettre à jour les champs de l'article
  const handleArticleChange = (field, value) => {
    setManualArticle((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* utilitaire : enlève le préfixe URL OpenAlex */
  const stripOpenAlexId = (id = "") => id.replace("https://openalex.org/", "");

  /* ---------------- RECHERCHE AUTEUR ---------------- */
  const handleAuthorSubmit = async () => {
    if (authorQuery.trim().length < 2) return;

    setAuthorSearchResults([]);
    setHasSearchedAuthor(false);

    /* 1️⃣  DB interne */
    try {
      const res = await fetch(
        `${authorsApiUrl}?display_name=${encodeURIComponent(
          authorQuery
        )}&projectId=${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.authors?.length) {
        setAuthorSearchResults(
          data.authors.map((a) => ({
            ...(a.source && { source: a.source }), // garde la source si dispo
            id: stripOpenAlexId(a.id ?? a.oa_id),
            display_name: a.display_name,
          }))
        );
        setHasSearchedAuthor(true);
        return; // trouvé → on arrête là
      }
    } catch {
      /* on ignore et on passe au fallback */
    }

    /* 2️⃣  Fallback OpenAlex autocomplete */
    try {
      const res = await fetch(
        `https://api.openalex.org/autocomplete/authors?search=${encodeURIComponent(
          authorQuery
        )}`
      );
      const data = await res.json();

      if (data.results?.length) {
        setAuthorSearchResults(
          data.results.map((a) => ({
            source: "openalex",
            id: stripOpenAlexId(a.id),
            display_name: a.display_name,
            works_count: a.works_count,
          }))
        );
        setHasSearchedAuthor(true);
        return;
      }
    } catch (err) {
      console.error("OpenAlex fallback error:", err);
    }

    /* 3️⃣  Aucun résultat */
    setAuthorSearchResults([]);
    setHasSearchedAuthor(true);
  };

  /* -------------- AJOUTER UN AUTEUR ------------------ */
  /*  - appeler addAuthor() pour la saisie manuelle
    - appeler addAuthor(authorObj) pour un auteur OpenAlex sélectionné */
  const addAuthor = (author) => {
    const src = author ?? manualAuthor; // priorité au paramètre
    const name = (src.display_name || "").trim();
    if (!name) return; // rien à ajouter

    const id = src.id // id OpenAlex dispo ?
      ? stripOpenAlexId(src.id)
      : "MA-" +
        Math.random().toString(16).slice(2, 10).padEnd(8, "0").toUpperCase();

    setManualArticle((prev) => ({
      ...prev,
      authors: [...prev.authors, id],
      authorsFullNames: [...prev.authorsFullNames, name],
    }));
    setStagedAuthors((prev) => [
      ...prev,
      { id, display_name: name, source: src.source },
    ]);

    if (!author) {
      // si saisie manuelle
      setManualAuthor({ source: "manual", id: "", display_name: "" });
    }
  };

  // Fonction pour supprimer un auteur
  const removeAuthor = (index) => {
    setManualArticle((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
      authorsFullNames: prev.authorsFullNames.filter((_, i) => i !== index),
    }));
    setStagedAuthors((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-h-[80vh] bg-gray-50 p-2 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Recherche article */}
        <div className="bg-white rounded p-3 border">
          <label className="text-[12px] text-gray-500 font-medium">
            Entrer le nom de l'article et vérifier si il existe déjà en 💾
          </label>
          <div className="flex gap-2 my-1">
            <input
              type="text"
              placeholder="Rechercher un article existant..."
              value={articleQuery}
              onChange={(e) => setArticleQuery(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={() => {
                resetManualArticle();
                handleArticleSubmit();
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Go
            </button>
          </div>

          {hasSearchedArticle && articleSearchResults.length === 0 && (
            <div className="text-xs text-gray-500">
              Aucun résultat, renseigne les informations ci-dessous pour créér
              l'article et ses auteur.ices
            </div>
          )}

          {articleSearchResults.map((article) => (
            <div
              key={article.id || article.title}
              className="mb-2 p-2 bg-gray-50 rounded text-sm"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium truncate">{article.title}</span>
                <button
                  onClick={() => {
                    // les résultats de recherche renvoient un article en DB. Il faut bien le dire au reducer en ajoutant isInDb:true, pour que ArticleForm ne propose pas de recréér mais de mettre à jour !
                    setManualArticle({ ...article, isInDb: true });
                    setStagedAuthors(
                      (article.authors || []).map((id, i) => ({
                        id,
                        display_name:
                          article.authorsFullNames?.[i] ?? "Auteur inconnu",
                      }))
                    );
                    setArticleSearchResults([]);
                    setHasSearchedArticle(false);
                  }}
                  className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  Choisir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Métadonnées article */}
        <div className="bg-white rounded p-3 border">
          {/* Champs : flex-wrap sur 4-5 lignes max, avec overflow si besoin */}
          <div className="flex flex-wrap gap-1 overflow-y-auto max-h-96">
            {/* Titre */}
            <div className="flex flex-col flex-1 min-w-[220px]">
              <label className="text-[12px] text-gray-500 font-medium mb-1">
                Titre *
              </label>
              <input
                type="text"
                value={manualArticle.title}
                onChange={(e) => handleArticleChange("title", e.target.value)}
                className="h-10 px-3 border rounded text-sm m-1"
                placeholder="Titre"
              />
            </div>

            {/* ID */}
            <div className="flex flex-col flex-1 min-w-[120px]">
              <label className="text-[12px] text-gray-500 font-medium mb-1">
                ID
              </label>
              <input
                type="text"
                value={manualArticle.id}
                readOnly
                className="h-10 px-3 border rounded text-sm m-1 bg-gray-200"
                placeholder="Autogénéré"
              />
            </div>

            {/* Année */}
            <div className="flex flex-col w-24">
              <label className="text-[12px] text-gray-500 font-medium mb-1">
                Année
              </label>
              <input
                type="number"
                value={manualArticle.pubyear ?? ""}
                onChange={(e) =>
                  handleArticleChange(
                    "pubyear",
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                className="h-10 px-3 border rounded text-sm m-1"
                placeholder="Année"
              />
            </div>

            {/* Publication */}
            <div className="flex flex-col flex-1 min-w-[180px]">
              <label className="text-[12px] text-gray-500 font-medium mb-1">
                Publication
              </label>
              <input
                type="text"
                value={manualArticle.publishedIn}
                onChange={(e) =>
                  handleArticleChange("publishedIn", e.target.value)
                }
                className="h-10 px-3 border rounded text-sm m-1"
                placeholder="Publication"
              />
            </div>

            {/* Type de référence */}
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label className="text-[12px] text-gray-500 font-medium mb-1">
                Type
              </label>
              <select
                value={manualArticle.referenceType}
                onChange={(e) =>
                  handleArticleChange("referenceType", e.target.value)
                }
                className="h-10 px-3 border rounded text-sm m-1"
              >
                <option value="">-- Choisir --</option>
                <option value="article">article</option>
                <option value="book-chapter">book-chapter</option>
                <option value="dataset">dataset</option>
                <option value="preprint">preprint</option>
                <option value="dissertation">dissertation</option>
                <option value="book">book</option>
                <option value="review">review</option>
                <option value="paratext">paratext</option>
                <option value="libguides">libguides</option>
                <option value="letter">letter</option>
                <option value="other">other</option>
                <option value="reference-entry">reference-entry</option>
                <option value="report">report</option>
                <option value="editorial">editorial</option>
                <option value="peer-review">peer-review</option>
                <option value="erratum">erratum</option>
                <option value="standard">standard</option>
                <option value="grant">grant</option>
                <option value="supplementary-materials">
                  supplementary-materials
                </option>
                <option value="retraction">retraction</option>
              </select>
            </div>

            {/* URL */}
            <div className="flex flex-col flex-1 min-w-[220px]">
              <label className="text-[12px] text-gray-500 font-medium mb-1">
                URL
              </label>
              <input
                type="url"
                value={manualArticle.url}
                onChange={(e) => handleArticleChange("url", e.target.value)}
                className="h-10 px-3 border rounded text-sm m-1"
                placeholder="URL"
              />
            </div>

            {/* Résumé */}
            <div className="flex flex-col flex-1 min-w-[300px]">
              <label className="text-[12px] text-gray-500 font-medium mb-1">
                Résumé
              </label>
              <textarea
                value={manualArticle.abstract}
                onChange={(e) =>
                  handleArticleChange("abstract", e.target.value)
                }
                rows={3}
                className="px-3 py-2 border rounded text-sm resize-none m-1"
                placeholder="Résumé…"
              />
            </div>
          </div>
        </div>

        {/* Gestion auteurs */}
        
        <div className="bg-white rounded p-3 border">
                    <label className="text-[12px] text-gray-500 font-medium">
            Entrer le nom de l'auteur et vérifier si il existe déjà en 💾
          </label>
          {/* Recherche auteur */}
          <div className="flex gap-2 my-1">
            <input
              value={authorQuery}
              onChange={(e) => setAuthorQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuthorSubmit()}
              placeholder="Rechercher auteur..."
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={handleAuthorSubmit}
              className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 m-1"
            >
              <Search className="w-3 h-3" />
            </button>
          </div>

          {hasSearchedAuthor && authorSearchResults.length > 0 && (
            <div className="mb-2 space-y-1">
              {authorSearchResults.slice(0, 3).map((author) => (
                <div
                  key={author.id}
                  onClick={() => {
                    addAuthor(author);
                    setAuthorSearchResults([]);
                  }}
                  className="flex items-center justify-between p-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 text-sm"
                >
                  <span className="truncate">{author.display_name}</span>
                  <div className="flex items-center gap-1 text-xs">
                    <span
                      className={`px-1 rounded ${
                        author.source === "openalex"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {author.source === "openalex" ? "OA" : "M"}
                    </span>
                    {author.source === "openalex" && (
                      <span className="text-gray-500">
                        {author.works_count}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ajout manuel */}
                      <label className="text-[12px] text-gray-500 font-medium mb-2">
              Si vous ne trouvez aucun auteur en base de données, vous pouvez l'ajouter manuellement ici
            </label>
          <div className="flex gap-2 my-1">
            <input
              value={manualAuthor.display_name}
              onChange={(e) =>
                setManualAuthor({
                  ...manualAuthor,
                  display_name: e.target.value,
                })
              }
              placeholder="Nouvel auteur..."
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={() => addAuthor()}
              className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Liste auteurs */}
          {manualArticle.authorsFullNames.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {manualArticle.authorsFullNames.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                >
                  <span className="truncate max-w-32">{name}</span>
                  <button
                    onClick={() => removeAuthor(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          title="Attention, après avoir cliqué sur poursuivre, ne pas oublier de cliquer sur créér/mettre à jour en haut à droite pour modifier l'article !"
          onClick={async () => {
            const articleToSave = {
              ...manualArticle,
              id: manualArticle.id || genArticleId(),
              isInDb: manualArticle.isInDb ?? false,
            };

            setManualArticle(articleToSave);
            dispatch(setArticle(articleToSave));

            // ✅ Ici, construis explicitement le tableau corrigé
            const authorsWithProjectId = stagedAuthors.map((author) => ({
              ...author,
              projectId: author.projectId || projectId,
            }));

            // Optionnel : met à jour l'état stagedAuthors immédiatement (pour interface)
            setStagedAuthors(authorsWithProjectId);

            // Passe ce tableau directement à syncStagedAuthors
            await syncStagedAuthors(authorsWithProjectId);
          }}
          className="w-full py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded font-medium hover:from-green-600 hover:to-blue-600"
        >
          {manualArticle.isInDb ? "🔥Poursuivre l'édition" : "🔥Poursuivre l'ajout"}
        </button>
                <span className="text-[12px] text-gray-500 font-medium mb-2">
              
            </span>
      </div>
    </div>
  );
}

export default ArticleManualMetadata;
