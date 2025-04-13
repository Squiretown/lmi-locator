
import React from 'react';
import { SearchForm } from './SearchForm';
import { SearchResults } from './SearchResults';

interface SearchTabContentProps {
  searchType: 'county' | 'zip' | 'tract';
  searchValue: string;
  selectedState: string;
  states: Array<{code: string, name: string}>;
  counties: Array<{fips: string, name: string}>;
  isSearching: boolean;
  searchResults: any;
  onSearchTypeChange: (value: 'county' | 'zip' | 'tract') => void;
  onSearchValueChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onSearch: () => void;
  onExport: () => void;
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
  onExport
}) => {
  return (
    <div className="p-6 overflow-auto">
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

      {searchResults && (
        <SearchResults
          searchResults={searchResults}
          onExport={onExport}
          isLoading={isSearching}
        />
      )}
    </div>
  );
};
