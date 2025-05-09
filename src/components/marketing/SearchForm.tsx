
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SearchType } from '@/hooks/useMarketingSearch';
import { SearchTypeTabs } from './search/SearchTypeTabs';
import { SearchInputs } from './search/SearchInputs';

interface SearchFormProps {
  searchType: SearchType;
  onSearchTypeChange: (value: SearchType) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  searchName: string;
  onSearchNameChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  canSearch: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  searchType,
  onSearchTypeChange,
  searchValue,
  onSearchValueChange,
  searchName,
  onSearchNameChange,
  onSearch,
  isLoading,
  canSearch
}) => {
  return (
    <Card className="mb-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="border-b bg-muted/40">
        <CardTitle className="text-lg md:text-xl">Search Properties</CardTitle>
        <CardDescription>Find LMI-eligible properties by location details</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <SearchTypeTabs 
          searchType={searchType}
          onSearchTypeChange={onSearchTypeChange}
        />
        
        <div className="mt-6">
          <SearchInputs
            searchType={searchType}
            searchValue={searchValue}
            onSearchValueChange={onSearchValueChange}
            searchName={searchName}
            onSearchNameChange={onSearchNameChange}
            onSearch={onSearch}
            isLoading={isLoading}
            canSearch={canSearch}
          />
          
          <div className="mt-4 text-xs text-muted-foreground">
            {searchType === 'tract_id' && (
              <p>Enter a valid 11-digit census tract ID to find properties in that tract.</p>
            )}
            {searchType === 'zip_code' && (
              <p>Enter a valid 5-digit ZIP code to find properties in that area.</p>
            )}
            {searchType === 'city' && (
              <p>Enter a city name, optionally with state code (e.g., "Los Angeles, CA").</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
