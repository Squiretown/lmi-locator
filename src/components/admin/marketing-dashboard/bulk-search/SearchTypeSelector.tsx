
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchType } from "./types";

interface SearchTypeSelectorProps {
  searchType: SearchType;
  onSearchTypeChange: (value: SearchType) => void;
}

export const SearchTypeSelector: React.FC<SearchTypeSelectorProps> = ({
  searchType,
  onSearchTypeChange
}) => {
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger 
        value="zip_code" 
        onClick={() => onSearchTypeChange('zip_code')}
        data-state={searchType === 'zip_code' ? 'active' : ''}
      >
        ZIP Code
      </TabsTrigger>
      <TabsTrigger 
        value="city" 
        onClick={() => onSearchTypeChange('city')}
        data-state={searchType === 'city' ? 'active' : ''}
      >
        City
      </TabsTrigger>
      <TabsTrigger 
        value="tract_id" 
        onClick={() => onSearchTypeChange('tract_id')}
        data-state={searchType === 'tract_id' ? 'active' : ''}
      >
        Census Tract
      </TabsTrigger>
      <TabsTrigger 
        value="county" 
        onClick={() => onSearchTypeChange('county')}
        data-state={searchType === 'county' ? 'active' : ''}
      >
        County
      </TabsTrigger>
      <TabsTrigger 
        value="bulk" 
        onClick={() => onSearchTypeChange('bulk')}
        data-state={searchType === 'bulk' ? 'active' : ''}
      >
        Bulk Addresses
      </TabsTrigger>
    </TabsList>
  );
};
