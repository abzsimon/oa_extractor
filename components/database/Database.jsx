import DatabaseAuthors from "./DatabaseAuthors";
import DatabaseArticles from "./DatabaseArticles";

export default function Database() {
  return (
    <div className="p-3 max-w-[90vh]-xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatabaseAuthors />
        <DatabaseArticles />
      </div>
    </div>
  );
}