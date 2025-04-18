
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SearchType } from '@/hooks/useMarketingSearch';

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
      </CardContent>
    </Card>
  );
};
