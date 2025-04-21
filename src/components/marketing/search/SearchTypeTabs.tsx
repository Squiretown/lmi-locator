
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SearchType } from '@/hooks/useMarketingSearch';

interface SearchTypeTabsProps {
  searchType: SearchType;
  onSearchTypeChange: (value: SearchType) => void;
}

export const SearchTypeTabs: React.FC<SearchTypeTabsProps> = ({
  searchType,
  onSearchTypeChange,
}) => {
  return (
    <Tabs 
      value={searchType} 
      onValueChange={(value) => onSearchTypeChange(value as SearchType)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tract_id">Census Tract</TabsTrigger>
        <TabsTrigger value="zip_code">ZIP Code</TabsTrigger>
        <TabsTrigger value="city">City</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
