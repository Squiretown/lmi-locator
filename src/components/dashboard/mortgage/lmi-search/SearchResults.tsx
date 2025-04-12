
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, LoaderCircle } from 'lucide-react';
import { SearchSummary } from './SearchSummary';
import { CensusTractsTable } from './CensusTractsTable';
import { Skeleton } from '@/components/ui/skeleton';

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
  isLoading?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchResults, 
  onExport,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="mt-8 space-y-6">
        <div className="p-6 bg-background border rounded-lg">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/4" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        
        <div className="rounded-md border">
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        
        <Button disabled className="w-full">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Loading results...
        </Button>
      </div>
    );
  }

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
