import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

export default function GraphPage() {
  const [csvUrl, setCsvUrl] = useState(null);
  const [showBibliograph, setShowBibliograph] = useState(false);
  const [zoom] = useState(0.9); // on garde 1 par défaut puisqu'on n'affiche plus le slider

  const token = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;

  useEffect(() => {
    async function fetchSignedUrl() {
      if (!token || !projectId || !backendUrl) return;
      try {
        const res = await fetch(
          `${backendUrl}/csv/bibliograph/signed-url?projectId=${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Erreur lors de la récupération de l'URL signée");
        const { csvUrl } = await res.json();
        setCsvUrl(csvUrl);
      } catch (err) {
        console.error("Erreur CSV:", err);
      }
    }
    fetchSignedUrl();
  }, [token, projectId, backendUrl]);

  const bibliographHref = csvUrl
    ? `https://bibliograph.it/#?csvFile=${encodeURIComponent(csvUrl)}`
    : null;

  if (showBibliograph && bibliographHref) {
    return (
      <div className="relative w-full h-screen">
        <button
          onClick={() => setShowBibliograph(false)}
          className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 px-3 py-1 text-sm bg-gray-200 rounded transition-colors hover:bg-gray-300"
        >
          ← Retour
        </button>
        <div
          style={{
            width: `${100 / zoom}%`,
            height: `${100 / zoom}vh`,
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <iframe
            src={bibliographHref}
            title="Bibliograph Viewer"
            style={{ width: "100%", height: "93%", border: "none" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">BiblioGraph : paysages scientométriques</h1>
      <p className="text-gray-700">
        BiblioGraph transforme un corpus bibliographique en un réseau interactif de
        co-citations et métadonnées. Utilisé dans le projet CAIAC, il offre une
        cartographie relationnelle de la production scientifique.
      </p>
      <p className="text-gray-700">
        Le graphique, exportable en GEXF ou PNG, peut être affiné par seuils
        d’occurrence et explore dynamiquement clusters et nœuds selon fréquence et
        attributs (auteurs, mots-clés, institutions).
      </p>
      <Link
        href="https://www.inshs.cnrs.fr/fr/cnrsinfo/bibliograph-un-outil-et-une-methode-pour-visualiser-les-paysages-scientometriques"
        legacyBehavior
      >
        <a
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          En savoir plus
        </a>
      </Link>
      {csvUrl ? (
        <button
          onClick={() => setShowBibliograph(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ouvrir Bibliograph
        </button>
      ) : (
        <p className="italic text-gray-600">Chargement du lien vers Bibliograph…</p>
      )}
    </div>
  );
}
