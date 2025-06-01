import DatabaseAuthors from "./DatabaseAuthors";
import DatabaseArticles from "./DatabaseArticles";
import BackupButton from "../BackupButton";

export default function Database() {
  return (
    <div className="relative p-3 max-w-[90vh]-xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatabaseAuthors />
        <DatabaseArticles />
      </div>
      
      {/* Bouton de backup fixé en bas à droite */}
      <div className="fixed bottom-6 right-6 z-50">
        <BackupButton />
      </div>
    </div>
  );
}