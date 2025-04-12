
import React from 'react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  searchType: 'zip' | 'tract';
  searchValue: string;
  onSearchValueChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  searchType, 
  searchValue, 
  onSearchValueChange 
}) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        {searchType === 'zip' ? 'ZIP Code' : 'Tract ID'}
      </label>
      <Input
        value={searchValue}
        onChange={(e) => onSearchValueChange(e.target.value)}
        placeholder={searchType === 'zip' ? 'Enter ZIP code' : 'Enter census tract ID'}
      />
    </div>
  );
};
