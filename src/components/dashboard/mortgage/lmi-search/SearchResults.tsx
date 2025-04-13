
import React from 'react';
import { SearchSummary } from './SearchSummary';
import { CensusTractsTable } from './CensusTractsTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangleIcon, Loader2 } from 'lucide-react';

interface SearchResultsProps {
  results: {
    summary: {
      totalTracts: number;
      lmiTracts: number;
      propertyCount: number;
      lmiPercentage?: number;
    };
    tracts: any[];
    searchType: string;
    searchValue: string;
  } | null;
  isLoading: boolean;
  onReportProblem?: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  isLoading,
  onReportProblem
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Searching for census tracts...</p>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { summary, tracts } = results;

  if (!tracts || tracts.length === 0) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>No census tracts found matching your search criteria.</span>
            {onReportProblem && (
              <button 
                onClick={onReportProblem}
                className="text-xs underline hover:text-red-700"
              >
                Report this issue
              </button>
            )}
          </AlertDescription>
        </Alert>
        <p className="text-sm text-gray-500">
          Try adjusting your search parameters or verify that the information provided is correct.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchSummary summary={summary} searchType={results.searchType} searchValue={results.searchValue} />
      <CensusTractsTable tracts={tracts} />
    </div>
  );
};
