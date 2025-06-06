import { useEffect, useState } from "react";
import { useSelector } from "react-redux";  // Pour accéder au store Redux
import AuthorCard from "../authors/AuthorCard";

export default function DatabaseAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer le token et le projectId depuis Redux
  const token = useSelector((state) => state.user.token);  // Remplacez 'user.token' par le chemin correct vers votre token
  const projectId = useSelector((state) => state.user.projectIds?.[0]);  // Remplacez par le chemin correct vers projectId

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        if (!token || !projectId) {
          console.error("Token ou projectId manquant");
          return;
        }

        // Utilisation de la variable d'environnement BACKEND pour l'URL
        const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;

        // Effectuer la requête en incluant le token et le projectId dans l'en-tête et l'URL
        const res = await fetch(`${backendUrl}/authors?projectId=${projectId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Ajout du token dans l'en-tête Authorization
            'Content-Type': 'application/json', // Indique que la réponse sera en JSON
          }
        });

        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        setAuthors(json.data || json || []); // Traiter la réponse
      } catch (err) {
        console.error("Erreur chargement auteurs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAuthors();
  }, [token, projectId]); // Dépendances sur le token et le projectId pour recharger les auteurs lorsque l'un d'eux change

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Auteurs</h2>
      {loading ? (
        <p className="text-gray-500">Chargement des auteurs...</p>
      ) : authors.length === 0 ? (
        <p className="text-gray-500 italic">Connectez-vous pour accéder à la liste des fiches d'auteurs annotés</p>
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
