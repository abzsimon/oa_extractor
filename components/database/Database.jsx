"use client";
// imports react
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Database as DatabaseIcon,
  Users,
  // FileText,
  BarChart3,
  // Activity,
  // Download,
} from "lucide-react";

import DatabaseAuthors from "./DatabaseAuthors";
import DatabaseArticles from "./DatabaseArticles";
import BackupButton from "../BackupButton";
import ArticleStatsDashboard from "./ArticleStats";
import AuthorStatsDashboard from "./AuthorStats";
import { useDispatch } from "react-redux";
import { clearAuthor } from "../../reducers/author";
import { clearArticle } from "../../reducers/article";

export default function Database() {
  const token = useSelector((s) => s.user.token);
  const projectId = useSelector((s) => s.user.projectIds?.[0]);
  const projectName = useSelector((s) => s.user.projectName);

  const dispatch = useDispatch();

  const handleReset = () => {
    dispatch(clearAuthor());
    dispatch(clearArticle());
  };

  // Onglet actif : "data" | "authorsStats" | "articlesStats"
  const [panel, setPanel] = useState("data");

  const tabs = [
    {
      key: "data",
      label: "Données",
      icon: DatabaseIcon,
      description: "Fiches auteurs & articles",
    },
    {
      key: "authorsStats",
      label: "Auteurs",
      icon: Users,
      description: "Statistiques des auteurs",
    },
    {
      key: "articlesStats",
      label: "Articles",
      icon: BarChart3,
      description: "Statistiques des articles",
    },
  ];

  const tabClasses = (key) => {
    const isActive = panel === key;
    return `group relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 cursor-pointer ${
      isActive
        ? "bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg shadow-slate-800/25"
        : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200 hover:border-slate-300 hover:shadow-md"
    }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-full mx-auto px-4 py-4">
        {/* Navigation par onglets */}
        <div className="flex justify-center items-center gap-4 mb-6 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setPanel(tab.key)}
                className={tabClasses(tab.key)}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    panel === tab.key ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
                <div className="text-left">
                  <div className="font-semibold text-sm">{tab.label}</div>
                  <div
                    className={`text-xs ${
                      panel === tab.key ? "text-slate-200" : "text-slate-400"
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Contenu principal */}
        <div className="relative">
          {panel === "data" && (
            <div className="relative">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                <div className="space-y-4">
                  <DatabaseAuthors />
                </div>
                <div className="space-y-4">
                  <DatabaseArticles />
                </div>
              </div>

              {/* Bouton reset flottant à 40% */}
              <button
                onClick={handleReset}
                title="Réinitialiser la sélection"
                className="absolute top-4 left-[50%] -translate-x-1/2 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          )}

          {panel === "authorsStats" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <AuthorStatsDashboard
                  token={token}
                  projectId={projectId}
                  projectName={projectName}
                />
              </div>
            </div>
          )}

          {panel === "articlesStats" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <ArticleStatsDashboard
                  token={token}
                  projectId={projectId}
                  projectName={projectName}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton de sauvegarde flottant */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="group relative">
          <BackupButton />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Sauvegarder les données
          </div>
        </div>
      </div>
    </div>
  );
}
