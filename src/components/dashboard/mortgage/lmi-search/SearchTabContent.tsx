
import React from 'react';
import { SearchForm } from './SearchForm';
import { SearchResults } from './SearchResults';
import { Button } from '@/components/ui/button';

interface SearchTabContentProps {
  searchType: 'county' | 'zip' | 'tract';
  searchValue: string;
  selectedState: string;
  states: Array<{code: string, name: string}>;
  counties: Array<{fips: string, name: string}>;
  isSearching: boolean;
  searchResults: any;
  onSearchTypeChange: (type: 'county' | 'zip' | 'tract') => void;
  onSearchValueChange: (value: string) => void;
  onStateChange: (state: string) => void;
  onSearch: () => void;
  onExport: () => void;
  onReportProblem?: () => void;
}

export const SearchTabContent: React.FC<SearchTabContentProps> = ({
  searchType,
  searchValue,
  selectedState,
  states,
  counties,
  isSearching,
  searchResults,
  onSearchTypeChange,
  onSearchValueChange,
  onStateChange,
  onSearch,
  onExport,
  onReportProblem
}) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <SearchForm
          searchType={searchType}
          searchValue={searchValue}
          selectedState={selectedState}
          states={states}
          counties={counties}
          isSearching={isSearching}
          onSearchTypeChange={onSearchTypeChange}
          onSearchValueChange={onSearchValueChange}
          onStateChange={onStateChange}
          onSearch={onSearch}
        />
      </div>
      
      {searchResults && (
        <div className="flex-grow overflow-auto">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!searchResults.tracts?.length}
              onClick={onExport}
            >
              Export Results
            </Button>
          </div>
          
          <SearchResults 
            results={searchResults} 
            isLoading={isSearching} 
            onReportProblem={onReportProblem} 
          />
        </div>
      )}
      
      {!searchResults && !isSearching && (
        <div className="flex-grow flex items-center justify-center text-gray-500">
          <p>Enter search criteria and click "Search" to find LMI-eligible census tracts</p>
        </div>
      )}
    </div>
  );
};
