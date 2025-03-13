import React from "react";
import Plot from "react-plotly.js";

export default function PlotlyTreemaps({ documents }) {
  if (!documents) return null;

  // Prepare docTypes data
  const docTypeLabels = Object.keys(documents.docTypes || {});
  const docTypeValues = Object.values(documents.docTypes || {});
  const docTypeParents = docTypeLabels.map(() => "");

  // Prepare domains data
  const domainLabels = (documents.domains || []).map((d) => d.category);
  const domainValues = (documents.domains || []).map((d) => d.count);
  const domainParents = domainLabels.map(() => "");

  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
      {/* 1) Document Types Treemap */}
      <div style={{ width: "50%" }}>
        <Plot
          data={[
            {
              type: "treemap",
              labels: docTypeLabels,
              values: docTypeValues,
              parents: docTypeParents,
              textinfo: "label+value+percent entry",
              hovertemplate:
                "%{label}<br>Count: %{value}<br>%{percentEntry:.1%}<extra></extra>",
            },
          ]}
          layout={{
            title: "Document Types Treemap",
            autosize: true, // let it fill the parent div
            margin: { t: 30, b: 20, l: 20, r: 20 },
          }}
          style={{ width: "100%", height: "400px" }}
          useResizeHandler
        />
      </div>

      {/* 2) Domains (Fractional Counts) Treemap */}
      <div style={{ width: "50%" }}>
        <Plot
          data={[
            {
              type: "treemap",
              labels: domainLabels,
              values: domainValues,
              parents: domainParents,
              textinfo: "label+value+percent entry",
              hovertemplate:
                "%{label}<br>Fraction: %{value:.2f}<br>%{percentEntry:.1%}<extra></extra>",
            },
          ]}
          layout={{
            title: "Domains Treemap",
            autosize: true,
            margin: { t: 30, b: 20, l: 20, r: 20 },
          }}
          style={{ width: "100%", height: "400px" }}
          useResizeHandler
        />
      </div>
    </div>
  );
}
