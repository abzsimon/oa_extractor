"use client";

// ArticleStatsDashboard.jsx – full dashboard (v11)
// -----------------------------------------------------------------------------
// • Tous les jeux de données de la pipeline.
// • Histogrammes horizontaux en 2 colonnes, hauteur dynamique.
// • YAxis 160 px + nowrap.
// • Years sorted chronologically in LineChart.
// • Keywords in 4 columns.
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { RefreshCw, AlertCircle } from "lucide-react";

// Palette per dataset
const COLOR_MAP = {
  fields: "#59a14f",
  subfields: "#9c755f",
  languages: "#4e79a7",
  referenceTypes: "#f28e2b",
  objectFocus: "#8dd1e1",
  funding: "#2ca02c",
  positionOnDataOpenAccess: "#d084d0",
  discourseGenre: "#ff7300",
  barriers: "#ffc658",
  positionOnOpenAccessAndIssues: "#b07aa1",
};

// Reusable components -------------------------------------------------------
const StatsCard = ({ title, value }) => (
  <div className="bg-white rounded-md shadow p-3 border border-gray-200">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-xl font-semibold text-gray-800">{value}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-md shadow p-3 border border-gray-200">
    <h3 className="text-md font-semibold text-gray-800 mb-2">{title}</h3>
    {children}
  </div>
);

// Horizontal bar chart ------------------------------------------------------
const HorizontalBars = ({ data, color }) => {
  /*  - 30 px par barre   (hauteur visuelle)
      - +40 px de marge interne (titre/padding)
      - min 120 px pour les petits jeux                   */
  const BAR_H = 30;
  const height = Math.max(120, data.length * BAR_H + 40);

  /* graduations 0 → max(count) par pas de 1              */
  const maxCount = Math.max(...data.map((d) => d.count), 0);
  const ticks = Array.from({ length: maxCount + 1 }, (_, i) => i);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ left: 0, right: 0 }} /* barres plus courtes */
        barSize={18}
        barCategoryGap={6}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, maxCount]} ticks={ticks} />
        <YAxis
          type="category"
          dataKey="_id"
          width={220} /* légendes plus larges */
          tick={{ style: { whiteSpace: "nowrap" } }}
        />
        <Tooltip formatter={(v) => v.toLocaleString("fr-FR") + " articles"} />
        <Bar dataKey="count" fill={color} radius={[4, 4, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const trim = (s, max = 50) =>
  typeof s === "string" && s.length > max ? s.slice(0, max) + "..." : s || "";
  
// ---------------------------------------------------------------------------
export default function ArticleStatsDashboard({
  token,
  projectId,
  projectName,
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !projectId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_API_BACKEND || "";
        const url = `${base.replace(
          /\/$/,
          ""
        )}/articleStats?projectId=${projectId}`;
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
  }, [token, projectId]);

  if (!token || !projectId) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <span className="text-sm text-yellow-700">
          Token ou projectId manquant.
        </span>
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

  // Facettes à dessiner en barres horizontales
  const barFacets = [
    { key: "fields", label: "Répartition du corpus en fields" },
    { key: "subfields", label: "Répartition du corpus en subfields" },
    { key: "languages", label: "Langues" },
    { key: "referenceTypes", label: "Types de référence" },
    { key: "objectFocus", label: "Focus objet" },
    { key: "funding", label: "Financement" },
    { key: "positionOnDataOpenAccess", label: "Position sur data OA" },
    { key: "discourseGenre", label: "Genres de discours" },
    { key: "barriers", label: "Barrières" },
    { key: "positionOnOpenAccessAndIssues", label: "Position OA & Issues" },
  ];

  // Open‑Access pie data fusionnée
  const oa = stats.openAccess.reduce((acc, cur) => {
    const k = cur._id ? "Accès libre" : "Accès restreint";
    acc[k] = (acc[k] || 0) + cur.count;
    return acc;
  }, {});
  const oaData = Object.entries(oa).map(([name, value]) => ({ name, value }));

  // Années triées chronologiquement
  const yearData = [...stats.byYear].sort((a, b) => a._id - b._id);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Statistiques articles – {projectName || projectId}
        </h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("fr-FR")} – {stats.totalArticles}{" "}
          articles
        </p>
      </div>

      {/* Cartes clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Articles" value={stats.totalArticles} />
        <StatsCard title="Langues" value={stats.languages.length} />
        <StatsCard
          title="Accès libre (%)"
          value={
            (((oa["Accès libre"] || 0) * 100) / stats.totalArticles).toFixed(
              1
            ) + "%"
          }
        />
        <StatsCard title="Mots‑clés" value={stats.topKeywords.length} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Publications par année */}
        {yearData.length > 0 && (
          <ChartCard title="Publications par année" className="p-2">
            {/* ↘️ hauteur ramenée de 220 px à 140 px */}
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Open Access Pie */}
        {oaData.length > 0 && (
          <ChartCard title="Répartition Accès libre" className="p-2">
            {/* ↘️ hauteur ramenée de 200 px à 140 px */}
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={oaData.map((d) => ({
                    ...d,
                    percent: +((d.value * 100) / stats.totalArticles).toFixed(
                      1
                    ),
                    count: d.value,
                  }))}
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  /* ↘️ rayon externe 80 → 60 */
                  outerRadius={60}
                  label={({ name, percent }) => `${name}: ${percent}%`}
                >
                  {oaData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "#4e79a7" : "#e15759"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(_, __, { payload }) => [
                    `${payload.percent}%`,
                    payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Histogrammes — 2 colonnes en flux continu */}
      <div className="columns-1 md:columns-2 gap-4 space-y-4">
        {barFacets.map(({ key, label }) =>
          stats[key] && stats[key].length > 0 ? (
            <div key={key} className="break-inside-avoid mb-4">
              <ChartCard title={label}>
                <HorizontalBars
                  data={stats[key].map((d) => ({ ...d, _id: trim(d._id) }))}
                  color={COLOR_MAP[key]}
                />
              </ChartCard>
            </div>
          ) : null
        )}
      </div>

      {/* Top keywords */}
      {stats.topKeywords.length > 0 && (
        <ChartCard title="Top mots‑clés (top 10)">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
            {stats.topKeywords.slice(0, 10).map((k) => (
              <div
                key={k._id}
                className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded"
              >
                <span className="truncate" title={k._id}>
                  {k._id}
                </span>
                <span className="font-medium text-gray-600">{k.percent}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
