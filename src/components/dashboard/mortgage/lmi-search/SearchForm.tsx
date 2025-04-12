
import React from 'react';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import { SearchTypeSelector } from './SearchTypeSelector';
import { StateSelector } from './StateSelector';
import { CountySelector } from './CountySelector';
import { SearchInput } from './SearchInput';

interface SearchFormProps {
  searchType: 'county' | 'zip' | 'tract';
  searchValue: string;
  selectedState: string;
  states: Array<{code: string, name: string}>;
  counties: Array<{fips: string, name: string}>;
  isSearching: boolean;
  onSearchTypeChange: (value: 'county' | 'zip' | 'tract') => void;
  onSearchValueChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  searchType,
  searchValue,
  selectedState,
  states,
  counties,
  isSearching,
  onSearchTypeChange,
  onSearchValueChange,
  onStateChange,
  onSearch
}) => {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SearchTypeSelector 
          searchType={searchType}
          onSearchTypeChange={onSearchTypeChange}
        />

        {searchType === 'county' && (
          <StateSelector
            selectedState={selectedState}
            states={states}
            onStateChange={onStateChange}
          />
        )}
      </div>

      {searchType === 'county' && selectedState && (
        <CountySelector
          searchValue={searchValue}
          counties={counties}
          onSearchValueChange={onSearchValueChange}
        />
      )}

      {searchType !== 'county' && (
        <SearchInput
          searchType={searchType}
          searchValue={searchValue}
          onSearchValueChange={onSearchValueChange}
        />
      )}
      
      <Button 
        onClick={onSearch} 
        disabled={isSearching || !searchValue}
        className="w-full"
      >
        {isSearching ? 'Searching...' : 'Search'}
        {!isSearching && <SearchIcon className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
};
