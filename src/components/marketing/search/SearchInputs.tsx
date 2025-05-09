
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
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
  const getPlaceholder = (): string => {
    switch (searchType) {
      case 'tract_id':
        return 'Enter census tract ID (e.g., 36103169901)';
      case 'zip_code':
        return 'Enter ZIP code (e.g., 90210)';
      case 'city':
        return 'Enter city name (e.g., Los Angeles, CA)';
      default:
        return `Enter ${String(searchType).replace('_', ' ')}`;
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="relative">
        <Input 
          placeholder={getPlaceholder()}
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          className="transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          {searchType === 'tract_id' && searchValue.length > 0 && `${searchValue.length}/11`}
          {searchType === 'zip_code' && searchValue.length > 0 && `${searchValue.length}/5`}
        </div>
      </div>
      
      <div className="relative">
        <Input 
          placeholder="Optional: Name this search for reference"
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
          className="transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {searchName && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            {searchName.length}/50
          </div>
        )}
      </div>
      
      <Button 
        onClick={onSearch} 
        disabled={!searchValue || isLoading || !canSearch}
        className="w-full relative"
        variant={searchValue && canSearch ? "default" : "outline"}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </>
        )}
      </Button>
    </div>
  );
};
