import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

function GraphPage() {
  const [csvUrl, setCsvUrl] = useState(null);
  const [bibliographOpen, setBibliographOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const token = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!token || !projectId || !backendUrl) return;

      try {
        const res = await fetch(
          `${backendUrl}/csv/bibliograph/signed-url?projectId=${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Erreur lors de la récupération de l’URL signée");
        const data = await res.json();
        setCsvUrl(data.csvUrl);
      } catch (err) {
        console.error("Erreur CSV:", err);
      }
    };

    fetchSignedUrl();
  }, [token, projectId, backendUrl]);

  const bibliographHref = csvUrl
    ? `https://bibliograph.it/#?csvFile=${encodeURIComponent(csvUrl)}`
    : null;

  return (
    <div className="flex flex-col items-start ml-40 p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800">BiblioGraph : visualiser les paysages scientométriques</h1>

      <p className="text-gray-700">
        BiblioGraph est un outil expérimental développé avec le soutien de la MITI du CNRS et en collaboration avec Ouestware. Il transforme un corpus de notices bibliographiques en un paysage scientométrique, une visualisation en réseau de références et métadonnées. Utilisé notamment dans le projet CAIAC sur l’intelligence artificielle, BiblioGraph permet de dépasser les indicateurs classiques comme le facteur d’impact en proposant une cartographie relationnelle de la production scientifique.
      </p>

      <p className="text-gray-700">
        Le principe repose sur la co-citation ou le bibliographic coupling : les références extraites des bibliographies sont reliées entre elles si elles apparaissent ensemble, avec des poids proportionnels à leur fréquence de co-citation. Ce réseau de base est ensuite enrichi par des métadonnées — auteurs, mots-clés, institutions, etc. — projetées sur le graphe. Des seuils d’occurrence permettent de filtrer les éléments visibles. Les nœuds représentent les références ou métadonnées, et leur taille dépend de leur fréquence dans le corpus.
      </p>

      <p className="text-gray-700">
        L’outil génère ainsi un espace visuel pour explorer les dynamiques et clivages d’un champ de recherche. Un exemple cité concerne la géo-ingénierie des océans, dont la cartographie révèle des clusters distincts entre fertilisation et carbone bleu. Le graphe peut être exporté (GEXF, PNG) pour être analysé dans d'autres logiciels comme Gephi. BiblioGraph accepte des corpus issus de bases comme Scopus ou Web of Science, offrant une approche exploratoire des écosystèmes scientifiques.
      </p>

      <Link
        href="https://www.inshs.cnrs.fr/fr/cnrsinfo/bibliograph-un-outil-et-une-methode-pour-visualiser-les-paysages-scientometriques"
        legacyBehavior
      >
        <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          Lire l’article complet sur le site du CNRS
        </a>
      </Link>

      {csvUrl ? (
        <button
          onClick={() => {
            setBibliographOpen(true);
            setIframeLoaded(false);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Ouvrir dans Bibliograph
        </button>
      ) : (
        <p className="text-gray-600 italic">Chargement du lien vers Bibliograph…</p>
      )}

      {bibliographOpen && bibliographHref && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-lg w-[95vw] h-[95vh] overflow-hidden">
            <button
              onClick={() => setBibliographOpen(false)}
              className="absolute top-2 right-2 text-sm text-gray-500 hover:text-gray-800 z-10"
            >
              ✖️ Fermer
            </button>

            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-0">
                <p className="text-gray-600 italic">Chargement de Bibliograph…</p>
              </div>
            )}

            <iframe
              src={bibliographHref}
              className="w-full h-full border-none"
              title="Bibliograph Viewer"
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GraphPage;
