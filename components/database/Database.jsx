"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Database as DatabaseIcon,
  Users,
  FileText,
  BarChart3,
  Activity,
  Download,
} from "lucide-react";
import DatabaseAuthors from "./DatabaseAuthors";
import DatabaseArticles from "./DatabaseArticles";
import BackupButton from "../BackupButton";
import ArticleStatsDashboard from "./ArticleStats";
import AuthorStatsDashboard from "./AuthorStats";

export default function Database() {
  const token = useSelector((s) => s.user.token);
  const projectId = useSelector((s) => s.user.projectIds?.[0]);
  const projectName = useSelector((s) => s.user.projectName);

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
        <div className="flex justify-center gap-4 mb-6">
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
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 w-full">
              <div className="col-span-5 xl:col-span-2 space-y-4">
                <DatabaseAuthors />
              </div>

              <div className="col-span-5 xl:col-span-3 space-y-4">
                <DatabaseArticles />
              </div>
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
