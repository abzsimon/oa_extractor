import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import DocumentDisplay from "./documentJson";

// Disable SSR for Plotly Treemaps
const PlotlyTreemapsNoSSR = dynamic(() => import("./treemap"), { ssr: false });

export default function OrcidOaDocumentFetcher() {
  const OaWorksQuery = useSelector((state) => state.user.OaWorksQuery);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (OaWorksQuery) fetchDocuments(OaWorksQuery);
    console.log(OaWorksQuery)
  }, [OaWorksQuery]);

  const transformToAuthorUrl = (inputString) => {
    const orcidPattern = /filter=author\.orcid:([\d-]+)/;
    const oaIdPattern = /filter=author\.id:(A\d+)/;

    const orcidMatch = inputString.match(orcidPattern);
    const oaIdMatch = inputString.match(oaIdPattern);

    if (orcidMatch) return `https://api.openalex.org/authors/https://orcid.org/${orcidMatch[1]}`;
    if (oaIdMatch) return `https://api.openalex.org/authors/${oaIdMatch[1]}`;
    return null;
  };

  const fetchDocuments = async (url) => {
    if (!url) return;
    setLoading(true);

    try {
      // Fetch grouped document types
      const groupResponse = await fetch(`${url}&group_by=type`);
      if (!groupResponse.ok) throw new Error("Group API error");

      const groupData = await groupResponse.json();
      const docTypeDistribution = Object.fromEntries(
        (groupData.group_by || []).map(({ key_display_name, count }) => [key_display_name, count])
      );

      console.log(`this is groupData ${groupData}`)

      // Transform URL and fetch works data
      const authorUrl = transformToAuthorUrl(url);
      console.log(authorUrl)
      if (!authorUrl) throw new Error("Invalid author URL");

      const worksResponse = await fetch(authorUrl);
      if (!worksResponse.ok) throw new Error("Works API error");

      const worksData = await worksResponse.json();

      // Process topics hierarchy
      const categoryCounts = {};

      worksData.topics.forEach((doc) => {
        // Ensure each nested level exists before assigning values
        categoryCounts[doc.domain.display_name] ||= { total: 0, fields: {} };
        categoryCounts[doc.domain.display_name].total += doc.count;

        categoryCounts[doc.domain.display_name].fields[doc.field.display_name] ||= { total: 0, subfields: {} };
        categoryCounts[doc.domain.display_name].fields[doc.field.display_name].total += doc.count;

        categoryCounts[doc.domain.display_name].fields[doc.field.display_name].subfields[doc.subfield.display_name] ||= { total: 0, topics: {} };
        categoryCounts[doc.domain.display_name].fields[doc.field.display_name].subfields[doc.subfield.display_name].total += doc.count;

        categoryCounts[doc.domain.display_name].fields[doc.field.display_name].subfields[doc.subfield.display_name].topics[doc.display_name] ||= 0;
        categoryCounts[doc.domain.display_name].fields[doc.field.display_name].subfields[doc.subfield.display_name].topics[doc.display_name] += doc.count;
      });

      console.log(categoryCounts)
      console.log(docTypeDistribution)

      // Update state
      setDocuments({
        total: worksData.works_count,
        docTypes: docTypeDistribution,
        topics: categoryCounts,
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

      {loading ? (
        <p>Loading...</p>
      ) : documents.total > 0 ? (
        <div className="flex flex-col md:flex-row gap-2">
          {/* Left Pane: Document JSON Display */}
          <div className="w-full md:w-[30%] overflow-hidden">
            <DocumentDisplay documents={documents} />
          </div>

          {/* Right Pane: Treemap */}
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
