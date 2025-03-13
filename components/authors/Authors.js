import React from 'react';
import HalAuthorDisambiguation from './HalAuthorDisambiguation';
import OrcidHalDocumentFetcher from './OrcidHalDocumentFetcher';
import { useSelector } from 'react-redux';

export default function AuthorsPage() {
  const selectedOrcid = useSelector((state) => state.user.selectedOrcid);

  return (
    <div className="w-full">
      <HalAuthorDisambiguation />
      {selectedOrcid && <OrcidHalDocumentFetcher />}
    </div>
  );
}