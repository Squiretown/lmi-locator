
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Search Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <SearchTypeTabs 
          searchType={searchType}
          onSearchTypeChange={onSearchTypeChange}
        />
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
      </CardContent>
    </Card>
  );
};
