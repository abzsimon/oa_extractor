"use client";

// AuthorStatsDashboard.jsx – dashboard auteurs (v5)
// -----------------------------------------------------------------------------
// • Consomme l'endpoint /authorstats/stats
// • Histos horizontaux en 2 colonnes.
// • Statut mappé (A‑H → libellés complets).
// • docTypes rendu avec pourcentage de l'ensemble des publications.
// • topDomains inclus comme histogramme horizontal.
// • Robustesse trim() safe.
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw, AlertCircle } from "lucide-react";

// ------------------------------------------------------------
// Constantes de présentation
// ------------------------------------------------------------

const statusLabels = {
  A: "A - Sénior : DiR, PU",
  B: "B - Intermédiaire : McF, CR",
  C: "C - Junior : Doct., IR, Post-doc",
  D: "D - Privé : cabinet, entreprise",
  E: "E - Adm. / Ing. infra",
  F: "F - Resp. politique / institutionnel",
  G: "G - Autre",
  H: "H - Non renseigné",
};

const COLOR_MAP = {
  gender: "#4e79a7",
  status: "#f28e2b",
  topInstitutions: "#d084d0",
  topCountries: "#ff7300",
  docTypes: "#ffc658",
  topTopics: "#b07aa1",
  topFields: "#59a14f",
  topDomains: "#9c755f",
};

// ---------------------------------------------------------------------------
// Composants utilitaires
// ---------------------------------------------------------------------------
const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-md shadow p-3 border border-gray-200">
    <h3 className="text-md font-semibold text-gray-800 mb-2">{title}</h3>
    {children}
  </div>
);

// Helper safe trim -----------------------------------------------------------
const trim = (s, max = 50) => {
  if (s === null || s === undefined) return "—";
  const str = String(s);
  return str.length > max ? str.slice(0, max) + "…" : str;
};

// Horizontal bar chart ------------------------------------------------------
const HorizontalBars = ({ data, color }) => {
  const BAR_H = 30;
  const height = Math.max(120, data.length * BAR_H + 40);
  const maxVal = Math.max(...data.map((d) => d.count), 0);
  const ticks = Array.from({ length: maxVal + 1 }, (_, i) => i);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ left: 0, right: 0 }}
        barSize={18}
        barCategoryGap={6}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, maxVal]} ticks={ticks} />
        <YAxis
          type="category"
          dataKey="_id"
          width={260}
          tick={{ style: { whiteSpace: "nowrap" } }}
        />
        <Tooltip
          formatter={(value, _name, { payload }) => {
            if (payload.percent !== undefined) {
              return [
                `${value.toLocaleString("fr-FR")} (${payload.percent}%)`,
                payload._id,
              ];
            }
            return [`${value.toLocaleString("fr-FR")}`, payload._id];
          }}
        />
        <Bar dataKey="count" fill={color} radius={[4, 4, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ---------------------------------------------------------------------------
export default function AuthorStatsDashboard({ token, projectId, projectName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_API_BACKEND || "";
        const url = `${base.replace(/\/$/, "")}/authorstats/stats`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur API " + res.status);
        const json = await res.json();
        setStats(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (!token) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <span className="text-sm text-yellow-700">Token manquant.</span>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <RefreshCw className="animate-spin w-4 h-4" /> Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm text-red-700">{error}</span>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Préparation des données
  // ------------------------------------------------------------

  const labelOf = (d, key) => {
    let raw =
      d._id !== undefined
        ? d._id
        : d.range !== undefined
        ? d.range
        : d.name !== undefined
        ? d.name
        : "—";
    if (key === "status" && statusLabels[raw]) raw = statusLabels[raw];
    return trim(raw);
  };

  // Facettes bar horizontales
  const barFacets = [
    { key: "gender", label: "Genre" },
    { key: "status", label: "Statut" },
    { key: "topInstitutions", label: "Top institutions" },
    { key: "topCountries", label: "Top pays" },
    { key: "docTypes", label: "Types de publications (sur l'ensemble)" },
    { key: "topTopics", label: "Top sujets" },
    { key: "topFields", label: "Top champs" },
    { key: "topDomains", label: "Top domaines" },
  ];

  // Calcul pourcentage docTypes
  const totalPubs = stats.docTypes.reduce((sum, d) => sum + d.count, 0);
  const docTypesPercent = stats.docTypes.map((d) => ({
    ...d,
    percent: +((d.count * 100) / (totalPubs || 1)).toFixed(1),
  }));

  // ------------------------------------------------------------
  // Rendu
  // ------------------------------------------------------------

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Statistiques auteurs – {projectName || projectId || "Global"}
        </h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("fr-FR")} – {stats.totalAuthors} auteurs
        </p>
      </div>

      {/* Histogrammes */}
      <div className="columns-1 md:columns-2 gap-4 space-y-4">
        {barFacets.map(({ key, label }) => {
          if (!stats[key] || stats[key].length === 0) return null;

          const data =
            key === "docTypes"
              ? docTypesPercent.map((d) => ({ ...d, _id: labelOf(d, key) }))
              : stats[key].map((d) => ({ ...d, _id: labelOf(d, key) }));

          return (
            <div key={key} className="break-inside-avoid mb-4">
              <ChartCard title={label}>
                <HorizontalBars data={data} color={COLOR_MAP[key] || "#999"} />
              </ChartCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
