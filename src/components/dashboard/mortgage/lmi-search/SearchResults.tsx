
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { SearchSummary } from './SearchSummary';
import { CensusTractsTable } from './CensusTractsTable';

interface SearchResultsProps {
  searchResults: {
    summary: {
      totalTracts: number;
      lmiTracts: number;
      propertyCount: number;
    };
    tracts: Array<{
      tractId: string;
      isLmiEligible: boolean;
      amiPercentage: number;
      propertyCount: number;
    }>;
    searchType: string;
    searchValue: string;
  };
  onExport: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchResults, 
  onExport 
}) => {
  return (
    <div className="mt-8 space-y-6">
      <SearchSummary summary={searchResults.summary} />
      
      <CensusTractsTable tracts={searchResults.tracts} />
      
      <Button onClick={onExport} className="w-full">
        Export Results <DownloadIcon className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
