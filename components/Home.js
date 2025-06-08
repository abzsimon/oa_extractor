import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ProjectPage() {
  const { token, projectIds } = useSelector((s) => s.user);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;
  const apiUrl = `${backendUrl}/projects`;

  // Helper to format dates consistently
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("fr-FR", {
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  useEffect(() => {
    if (!token || !projectIds?.[0]) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProject = async () => {
      try {
        const response = await fetch(`${apiUrl}/${projectIds[0]}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setProject(data);
            setEditedDescription(data.projectDescription || "");
          }
        } else {
          throw new Error("Failed to fetch project");
        }
      } catch (error) {
        if (isMounted) {
          setProject({});
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProject();

    return () => {
      isMounted = false;
    };
  }, [token, projectIds, apiUrl]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedDescription(project.projectDescription || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDescription(project.projectDescription || "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/${projectIds[0]}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectDescription: editedDescription }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProject(updatedProject);
        setIsEditing(false);
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Chargement...</div>;

  if (!token) {
    return (
      <div className="p-4 text-red-500">
        Login to access project description
      </div>
    );
  }

  if (!project || !Object.keys(project).length)
    return <div className="p-4 text-red-500">Erreur</div>;

  return (
    <div className="max-w-8xl mx-auto p-4 space-y-4 text-sm">
      {/* Description */}
      <div className="border rounded p-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Description</h2>
          <div className="space-x-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
              >
                ✏️ Modifier
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-800 text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-800 text-sm px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                  disabled={saving}
                >
                  {saving ? "💾 Sauvegarde..." : "💾 Sauvegarder"}
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full h-64 p-3 border rounded font-mono text-sm resize-vertical"
              placeholder="Entrez votre description en Markdown..."
            />
            <div className="text-xs text-gray-500">
              💡 Utilisez la syntaxe Markdown: **gras**, *italique*, # Titre, -
              Liste, [lien](url)
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.projectDescription || "*Pas de description*"}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Admin */}
      <div className="border rounded p-3 bg-gray-50">
        <h2 className="font-bold mb-2">Admin</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {[
            ["ID", project.identifiant],
            ["Titre", project.titre],
            ["Site", project.site],
            ["Partenaires", project.nombre_partenaires],
            ["Chargé sci", project.charge_projet_scientifique],
            ["Serv conv", project.service_conventionnement],
            ["Serv fin", project.service_financier],
            ["T0 admin", formatDate(project.T0_administratif)],
            ["T0 sci", formatDate(project.T0_scientifique)],
            [
              "Durée init",
              `${project.duree_scientifique_initiale || 0} mois`,
            ],
            [
              "Durée post-prolong.",
              `${project.duree_scientifique_prolongations || 0} mois`,
            ],
            ["Tfinal", formatDate(project.Tfinal_projet)],
            ["GitLab Token", project.gitlabToken ? "✓" : "—"],
            ["GitLab Backup", project.gitlabBackupProjectId ? "✓" : "—"],
            ["Créé", formatDate(project.createdAt)],
            ["Modifié", formatDate(project.updatedAt)],
          ].map(([k, v], i) => (
            <div key={i} className="truncate">
              <span className="text-gray-600">{k}:</span> {v || "—"}
            </div>
          ))}
        </div>
        {project.site && (
          <a
            href={project.site}
            className="text-blue-600 text-xs block mt-1 truncate"
            target="_blank"
          >
            🔗 {project.site}
          </a>
        )}
      </div>

      {/* Partenaires */}
      {project.partenaires?.length > 0 && (
        <div className="border rounded p-3">
          <h3 className="font-bold mb-2">
            Partenaires ({project.partenaires.length})
          </h3>
          {project.partenaires.map((p, i) => (
            <div
              key={i}
              className="mb-2 last:mb-0 border-l-2 border-blue-200 pl-2"
            >
              <div className="font-medium">
                {p.nom} ({p.sigle}) - {p.categorie}
              </div>
              {p.membres.map((m, j) => (
                <div key={j} className="text-xs text-gray-600 ml-2">
                  {m.prenom} {m.nom} {m.coord && "👑"} - {m.role} - {m.email}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
