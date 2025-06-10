import { useEffect, useState } from "react";
import { useSelector } from "react-redux";  // Pour accéder au store Redux
import AuthorCard from "../authors/AuthorCard";

export default function DatabaseAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer le token et le projectId depuis Redux
  const token = useSelector((state) => state.user.token);  // Accéder au token dans Redux
  const projectId = useSelector((state) => state.user.projectIds?.[0]);  // Accéder au projectId dans Redux

  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = Boolean(token && projectId);

  useEffect(() => {
    const loadAuthors = async () => {
      if (!isLoggedIn) {
        console.log("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      try {
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
  }, [isLoggedIn, token, projectId]); // Dépendances sur le token et projectId pour recharger les auteurs lorsque l'un d'eux change

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Auteurs annotés</h2>
      {loading ? (
        <p className="text-gray-500">Chargement des auteurs...</p>
      ) : !isLoggedIn ? (
        <p className="text-gray-500 italic">Vous devez être connecté pour voir les auteurs.</p>
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
