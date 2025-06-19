// ./components/DatabaseAuthors.js
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import AuthorCard from "../authors/AuthorCard";
import { setAuthor } from "../../reducers/author";
import { convertTopicTreeForReducer } from "../authors/Authors.utils";

export default function DatabaseAuthors({ authors = [] }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const token = useSelector((state) => state.user.token);
  const projectId = useSelector((state) => state.user.projectIds?.[0]);
  const isLoggedIn = Boolean(token && projectId);

  const handleClick = (author) => {
    if (!author.id) return;

    dispatch(
      setAuthor({
        ...author,
        topic_tree: convertTopicTreeForReducer(author.topic_tree),
      })
    );
    router.push({ pathname: "/Authors" });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Auteurs annotés</h2>

      {!isLoggedIn ? (
        <p className="text-gray-500 italic">
          Vous devez être connecté pour voir les auteurs.
        </p>
      ) : authors.length === 0 ? (
        <p className="text-gray-500 italic">Aucun auteur pour le moment.</p>
      ) : (
        <div className="columns-1 sm:columns-2 gap-4">
          {authors.map((author) => (
            <div key={author.id} className="mb-4 break-inside-avoid">
              <AuthorCard author={author} onClick={() => handleClick(author)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
