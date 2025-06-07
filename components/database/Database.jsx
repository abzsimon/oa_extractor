import { useSelector } from "react-redux";
import DatabaseAuthors   from "./DatabaseAuthors";
import DatabaseArticles  from "./DatabaseArticles";
import BackupButton      from "../BackupButton";
import ArticleStatsDashboard from "./ArticleStats";

export default function Database() {
  const token      = useSelector((s) => s.user.token);
  const projectId  = useSelector((s) => s.user.projectIds?.[0]);
  const projectName= useSelector((s) => s.user.projectName);

  return (
    <div className="relative p-3 max-w-[90vw] mx-auto">
      {/* Dashboard compact au-dessus */}
      <ArticleStatsDashboard
        token={token}
        projectId={projectId}
        projectName={projectName}      />

      {/* Auteurs / Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DatabaseAuthors />
        <DatabaseArticles />
      </div>

      {/* Backup */}
      <div className="fixed bottom-6 right-6 z-50">
        <BackupButton />
      </div>
    </div>
  );
}
