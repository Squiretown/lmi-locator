
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, LoaderCircle, AlertCircle } from 'lucide-react';
import { SearchSummary } from './SearchSummary';
import { CensusTractsTable } from './CensusTractsTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  const hasResults = searchResults.tracts && searchResults.tracts.length > 0;

  return (
    <div className="mt-8 space-y-6">
      {hasResults ? (
        <>
          <SearchSummary summary={searchResults.summary} />
          
          <CensusTractsTable tracts={searchResults.tracts} />
          
          <Button onClick={onExport} className="w-full">
            Export Results <DownloadIcon className="ml-2 h-4 w-4" />
          </Button>
        </>
      ) : (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No results found for "{searchResults.searchValue}" in {searchResults.searchType} search. 
              Please try with a different value or search type.
            </AlertDescription>
          </Alert>
          
          <div className="p-8 text-center text-muted-foreground border rounded-lg">
            <p className="mb-4">Possible reasons for no results:</p>
            <ul className="list-disc text-left ml-8">
              <li>The census tract ID may be incorrect</li>
              <li>The tract may not exist in our database</li>
              <li>There may be a formatting issue with the input</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
