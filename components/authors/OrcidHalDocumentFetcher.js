import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
// Use dynamic imports for Plotly-based components
import dynamic from "next/dynamic";
import DocumentDisplay from "./documentJson";

// This ensures the PlotlyTreemaps component is *not* SSR'd (which causes the `self is not defined` error).
const PlotlyTreemapsNoSSR = dynamic(() => import("./treemap"), { ssr: false });

// Helper function to decide which query field to use
const getQueryParameters = (identifier) => {
  // Convert identifier to string to avoid type errors.
  const idStr = String(identifier || "");
  // If identifier includes 'orcid.org' or contains a dash, we assume it's an ORCID.
  if (idStr.includes("orcid.org") || idStr.includes("-")) {
    const cleaned = idStr.includes("orcid.org")
      ? idStr.replace("https://orcid.org/", "")
      : idStr;
    return { field: "authORCIDIdExt_s", value: cleaned };
  }
  // If identifier is purely numeric, we assume it's a HAL ID.
  else if (/^\d+$/.test(idStr)) {
    return { field: "authIdPerson_i", value: idStr };
  }
  // Otherwise, assume it's a full name.
  else {
    return { field: "authFullName_s", value: idStr };
  }
};

export default function OrcidHalDocumentFetcher() {
  const dispatch = useDispatch();
  const selectedOrcid = useSelector((state) => state.user.selectedOrcid);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedOrcid) {
      fetchDocuments();
    }
  }, [selectedOrcid]);

  const fetchDocuments = async () => {
    if (!selectedOrcid) return;
    setLoading(true);

    // Determine which field to query based on the identifier.
    const { field, value } = getQueryParameters(selectedOrcid);

    try {
      // (a) docType distribution (group query)
      const groupApiUrl = `https://api.archives-ouvertes.fr/search?q=${field}:%22${value}%22&fl=docType_s&group=true&group.field=docType_s`;
      const groupResponse = await fetch(groupApiUrl);
      if (!groupResponse.ok) {
        console.error("Group API error:", groupResponse.status);
        return;
      }
      const groupData = await groupResponse.json();
      const groupedDocs = groupData.grouped?.docType_s?.groups || [];
      const docTypeDistribution = {};
      groupedDocs.forEach((group) => {
        docTypeDistribution[group.groupValue] = group.doclist.numFound;
      });

      // (b) Pagination to fetch ALL documents
      let allDocs = [];
      let start = 0;
      const rows = 30;
      let numFound = Infinity;

      while (start < numFound) {
        const apiUrl = `https://api.archives-ouvertes.fr/search?q=${field}:%22${value}%22&fl=docid,domainAllCode_s,docType_s&start=${start}&rows=${rows}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          console.error("API error:", response.status);
          break;
        }

        const data = await response.json();
        const docsPage = data.response?.docs || [];
        allDocs = allDocs.concat(docsPage);

        numFound = data.response?.numFound || 0;
        start += rows;

        if (docsPage.length === 0) {
          // No more docs returned
          break;
        }
      }

      console.log("🔍 Number of docs fetched:", allDocs.length);

      // (c) Fractional domain counting
      let totalPublications = 0;
      const categoryCounts = {};
      const itemRegex = /^([^.]+)\.(.*)$/; // up to first dot => category

      for (const doc of allDocs) {
        const domainArray = Array.isArray(doc.domainAllCode_s)
          ? doc.domainAllCode_s
          : [];

        // Collect unique main domains
        const uniqueCategories = new Set();
        for (const item of domainArray) {
          const match = item.match(itemRegex);
          if (match) {
            const category = match[1];
            uniqueCategories.add(category);
          }
        }

        const n = uniqueCategories.size;
        if (n > 0) {
          // distribute 1 doc among its unique domains
          const fraction = 1 / n;
          for (const cat of uniqueCategories) {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + fraction;
          }
        } else {
          // no domains => domainless
          categoryCounts["domainless"] =
            (categoryCounts["domainless"] || 0) + 1;
        }

        totalPublications++;
      }

      const domainStats = Object.entries(categoryCounts).map(
        ([category, count]) => ({
          category,
          count,
        })
      );

      const sumOfCounts = domainStats.reduce(
        (acc, { count }) => acc + count,
        0
      );

      // Add a percentage field for each domain
      const domainStatsWithPercent = domainStats.map((entry) => {
        const percentage =
          sumOfCounts === 0 ? 0 : (entry.count / sumOfCounts) * 100;
        return {
          ...entry,
          percentage: parseFloat(percentage.toFixed(2)),
        };
      });

      console.log("Category Counts (fractional):", categoryCounts);
      console.log("Total Publications:", totalPublications);

      // Store results in state
      setDocuments({
        total: totalPublications,
        domains: domainStatsWithPercent,
        docTypes: docTypeDistribution,
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 w-full">
      <h1 className="text-xl font-bold text-gray-900 mb-3">Documents</h1>
      {/* <button
        onClick={fetchDocuments}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        disabled={!selectedOrcid || loading}
      >
        {loading ? "Loading..." : "Fetch Documents"}
      </button> */}

      {documents.total > 0 ? (
        <div className="flex flex-col md:flex-row gap-2">
          {/* Left pane: Document JSON Display (3/10) */}
          <div className="w-full md:w-[30%] overflow-hidden">
            <DocumentDisplay documents={documents} />
          </div>

          {/* Right pane: Treemap (7/10) */}
          <div className="w-full md:w-[70%] flex-1 overflow-hidden">
            <PlotlyTreemapsNoSSR documents={documents} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700">No documents found.</p>
      )}
    </div>
  );
}
