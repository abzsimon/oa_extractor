import React from "react";
import Plot from "react-plotly.js";

export default function PlotlyTreemaps({ documents }) {
  if (!documents) return null;

  // 1) Document Types
  const docTypeLabels = Object.keys(documents.docTypes || {});
  const docTypeValues = Object.values(documents.docTypes || {});
  // Insert explicit root
  const docTypeAllLabels = ["Document Types", ...docTypeLabels];
  const docTypeAllValues = [0, ...docTypeValues];
  const docTypeAllParents = [
    "", 
    ...docTypeLabels.map(() => "Document Types")
  ];

  // 2) Domains
  const domainLabels = (documents.domains || []).map((d) => d.category);
  const domainValues = (documents.domains || []).map((d) => d.count);
  const domainAllLabels = ["Domains", ...domainLabels];
  const domainAllValues = [0, ...domainValues];
  const domainAllParents = [
    "", 
    ...domainLabels.map(() => "Domains")
  ];

  // Tailwind-inspired custom color scale
  const tailwindColorScale = [
    [0, "#ffffff"],    // red-300: soft red for the lowest values
    [0.25, "#fecaca"],  // red-200: even lighter red
    [0.5, "#fee2e2"],   // red-100: very light red
    [0.75, "#f3f4f6"],   // gray-100: near-white gray
    [1, "#e5e7eb"]      // gray-200: light gray for the highest values
  ];
  

  const commonLayout = {
    autosize: true,
    margin: { t: 10, b: 0, l: 5, r: 5 },
    paper_bgcolor: "white",
    plot_bgcolor: "white",
    template: null
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
      {/* A) Document Types Treemap */}
      <div style={{ width: "50%" }}>
        <Plot
          data={[
            {
              type: "treemap",
              labels: docTypeAllLabels,
              values: docTypeAllValues,
              parents: docTypeAllParents,
              root: {
                showroot: "white"
              },
              marker: {
                colorscale: tailwindColorScale,
                line: { width: 0.2, color: "darksalmon" }
              },
              textinfo: "label+value+percent entry",
              hovertemplate:
                "%{label}<br>Count: %{value}<br>%{percentEntry:.1%}<extra></extra>"
            }
          ]}
          layout={{
            title: "Document Types Treemap",
            ...commonLayout
          }}
          style={{ width: "100%", height: "200px" }}
          useResizeHandler
        />
      </div>

      {/* B) Domains Treemap */}
      <div style={{ width: "50%" }}>
        <Plot
          data={[
            {
              type: "treemap",
              labels: domainAllLabels,
              values: domainAllValues,
              parents: domainAllParents,
              root: {
                color: "white"
              },
              marker: {
                colorscale: tailwindColorScale,
                line: { width: 0.2, color: "darksalmon" }
              },
              textinfo: "label+value+percent entry",
              hovertemplate:
                "%{label}<br>Fraction: %{value:.2f}<br>%{percentEntry:.1%}<extra></extra>"
            }
          ]}
          layout={{
            title: "Domains Treemap",
            ...commonLayout
          }}
          style={{ width: "100%", height: "200px" }}
          useResizeHandler
        />
      </div>
    </div>
  );
}
