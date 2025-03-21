import React from 'react';
import HalAuthorDisambiguation from './HalAuthorDisambiguation';
import OrcidHalDocumentFetcher from './OrcidHalDocumentFetcher';
import OpenAlexAuthorDisambiguation from './OpenAlexAuthorDisambiguation';
import OrcidOaDocumentFetcher from './OrcidOaDocumentFetcher';
import { useSelector } from 'react-redux';

export default function AuthorsPage() {
  const selectedOrcid = useSelector((state) => state.user.selectedOrcid);
  const OaWorksQuery = useSelector((state) => state.user.OaWorksQuery);

  return (
    <div className="w-full grid grid-cols-2 grid-rows-16">
      {/* Left Column: Main components with dotted border and border radius */}
      <div className="col-start-1 row-start-1 row-span-14 border border-solid border-gray-200 rounded-lg my-2 ml-2 mr-1 p-1">
        <HalAuthorDisambiguation />
        {selectedOrcid && <OrcidHalDocumentFetcher />}
      </div>

      {/* Right Column remains empty */}
      <div className="col-start-2 row-start-1 p-4 border border-solid border-gray-200 rounded-lg my-2 mr-2 ml-1 p-1">
        <OpenAlexAuthorDisambiguation/>
        {OaWorksQuery && <OrcidOaDocumentFetcher />}
      </div>

      {/* Bottom Component spanning both columns with dotted border and border radius */}
      <div className="col-span-2 row-start-15 row-span-2 p-4 border border-solid border-gray-200 rounded-lg">
        <p>Additional Bottom Component</p>
      </div>
    </div>
  );
}
