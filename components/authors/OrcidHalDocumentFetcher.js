import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import PlotlyTreemaps from "./treemap";

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
      // 1) We'll do two separate requests:
      //    (a) docType distribution (group query)
      //    (b) all documents via pagination
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

      // 2) Pagination to fetch ALL documents
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
          // No more docs returned, break out
          break;
        }
      }

      // 3) We now have all documents in allDocs
      console.log("🔍 Number of docs fetched:", allDocs.length);

      // 4) Fractional domain counting
      let totalPublications = 0;
      const categoryCounts = {};
      const itemRegex = /^([^.]+)\.(.*)$/; // capture everything up to the first dot

      for (const doc of allDocs) {
        // domainAllCode_s is presumably an array of strings like ["shs.hisphilso", "shs.hist", "info.info-ir"]
        const domainArray = Array.isArray(doc.domainAllCode_s)
          ? doc.domainAllCode_s
          : [];

        // 4a) Gather the unique main domains in a set
        const uniqueCategories = new Set();
        for (const item of domainArray) {
          const match = item.match(itemRegex);
          if (match) {
            const category = match[1]; // everything before the first dot
            uniqueCategories.add(category);
          }
        }

        // 4b) Each doc counts as "1" split across all unique categories
        const n = uniqueCategories.size; // how many distinct main domains
        if (n > 0) {
          const fraction = 1 / n;
          for (const cat of uniqueCategories) {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + fraction;
          }
        }

        // We still count this doc as 1 doc in total
        totalPublications++;
      }

      // Convert categoryCounts to an array if you want to display it that way
      const domainStats = Object.entries(categoryCounts).map(
        ([category, count]) => ({
          category,
          count,
        })
      );

      console.log(
        "Category Counts (fractional):",
        JSON.stringify(categoryCounts, null, 2)
      );
      console.log("Total Publications:", totalPublications);

      // 5) Store results in state
      setDocuments({
        total: totalPublications,
        domains: domainStats,
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
          <p>Domains (Fractional Counts): {JSON.stringify(documents.domains)}</p>

          {/* Render the Plotly Treemaps */}
          <PlotlyTreemaps documents={documents} />
        </div>
      ) : (
        <p>No documents found.</p>
      )}
    </div>
  );
}
