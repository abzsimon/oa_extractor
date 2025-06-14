import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import ArticleForm from "./ArticleForm";
import AuthorCard from "../../components/authors/AuthorCard";
import ArticleManualMetadata from "./ArticleManualMetadata";
import ArticleOpenAlexMetadata from "../../components/articles/ArticleOpenAlexMetadata";
import { setArticle } from "../../reducers/article";

export default function ArticlePage() {
  const dispatch = useDispatch();

  // -- Source mode: 'openalex' ou 'manual'
  const [sourceMode, setSourceMode] = useState("openalex");

  // -- Article chargé depuis Redux
  const articleRedux = useSelector((s) => s.article);

  return (
    <>
      <Head>
        <title>OA Extractor</title>
      </Head>

      <div className="flex h-screen">
        {/* Colonne de gauche */}
        <div className="w-2/5 p-4 flex flex-col overflow-auto">
          {/* Onglets de sélection de source */}
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            {["openalex", "manual"].map((mode) => (
              <button
                key={mode}
                onClick={() => setSourceMode(mode)}
                className={`px-4 py-2 rounded-t-md text-sm font-medium ${
                  sourceMode === mode
                    ? "bg-white border border-b-transparent border-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {mode === "openalex" ? "🔍 OpenAlex" : "✍️ Manuel"}
              </button>
            ))}
          </div>

          {/* Mode conditionnel */}
          {sourceMode === "openalex" ? (
            <ArticleOpenAlexMetadata />
          ) : (
            <ArticleManualMetadata />
          )}

          {/* Auteurs : toujours affichés */}
          {articleRedux?.authorsFullNames?.length > 0 && (
            <div className="pt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Auteurs
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
                {articleRedux.authorsFullNames.map((name, idx) => (
                  <div key={idx} className="cursor-pointer">
                    <AuthorCard
                      author={{
                        name,
                        oaId: articleRedux.authors?.[idx] || "N/A",
                      }}
                      small
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite */}
        <div className="w-3/5 p-1 overflow-auto flex flex-col justify-start">
          <ArticleForm />
        </div>
      </div>
    </>
  );
}
