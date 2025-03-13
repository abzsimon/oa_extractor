import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
// Use dynamic imports for Plotly-based components
import dynamic from "next/dynamic";

// This ensures the PlotlyTreemaps component is *not* SSR'd (which causes the `self is not defined` error).
const PlotlyTreemapsNoSSR = dynamic(() => import("./treemap"), { ssr: false });

export default function OrcidHalDocumentFetcher() {
  const dispatch = useDispatch();
  const selectedOrcid = useSelector((state) => state.user.selectedOrcid);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedOrcid) {
      fetchDocuments();
    }
  }, [selectedOrcid]);

  const cleanOrcid = (orcid) => orcid.replace("https://orcid.org/", "");

  const fetchDocuments = async () => {
    if (!selectedOrcid) return;
    setLoading(true);

    const orcidId = cleanOrcid(selectedOrcid);

    try {
      // (a) docType distribution (group query)
      const groupApiUrl = `https://api.archives-ouvertes.fr/search/?wt=json&q=authORCIDIdExt_s:%22${orcidId}%22&fl=docType_s&group=true&group.field=docType_s`;
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
        const apiUrl = `https://api.archives-ouvertes.fr/search/?wt=json&q=authORCIDIdExt_s:%22${orcidId}%22&fl=docid,domainAllCode_s,docType_s&start=${start}&rows=${rows}`;
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

      // 4) Fractional domain counting
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

      // 2) Add a percentage field for each domain
      const domainStatsWithPercent = domainStats.map((entry) => {
        const percentage =
          sumOfCounts === 0 ? 0 : (entry.count / sumOfCounts) * 100;
        return {
          ...entry,
          percentage: parseFloat(percentage.toFixed(2)), // round to 2 decimals (or remove if you prefer)
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
    <div className="p-4 w-full">
      <h1 className="text-xl font-bold text-gray-900 mb-3">Documents</h1>
      <button
        onClick={fetchDocuments}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        disabled={!selectedOrcid || loading}
      >
        {loading ? "Loading..." : "Fetch Documents"}
      </button>

      {documents.total > 0 ? (
        <div className="mt-4">
          <p>Total Publications: {documents.total}</p>
          <p>Document Types: {JSON.stringify(documents.docTypes)}</p>
          <p>
            Domains (Fractional Counts): {JSON.stringify(documents.domains)}
          </p>

          {/* IMPORTANT: We now render the NO-SSR dynamic import */}
          <PlotlyTreemapsNoSSR documents={documents} />
        </div>
      ) : (
        <p>No documents found.</p>
      )}
    </div>
  );
}
