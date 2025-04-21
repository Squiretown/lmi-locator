
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SearchType } from '@/hooks/useMarketingSearch';

interface SearchInputsProps {
  searchType: SearchType;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  searchName: string;
  onSearchNameChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  canSearch: boolean;
}

export const SearchInputs: React.FC<SearchInputsProps> = ({
  searchType,
  searchValue,
  onSearchValueChange,
  searchName,
  onSearchNameChange,
  onSearch,
  isLoading,
  canSearch,
}) => {
  return (
    <div className="mt-4 space-y-4">
      <Input 
        placeholder={`Enter ${searchType.replace('_', ' ')}`}
        value={searchValue}
        onChange={(e) => onSearchValueChange(e.target.value)}
      />
      <Input 
        placeholder="Optional: Name this search"
        value={searchName}
        onChange={(e) => onSearchNameChange(e.target.value)}
      />
      <Button 
        onClick={onSearch} 
        disabled={!searchValue || isLoading || !canSearch}
        className="w-full"
      >
        {isLoading ? 'Searching...' : 'Search Properties'}
      </Button>
    </div>
  );
};
