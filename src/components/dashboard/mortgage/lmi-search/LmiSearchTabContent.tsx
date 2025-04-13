
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { MapTabContent } from './MapTabContent';
import { SearchTabContent } from './SearchTabContent';
import { useLmiSearch } from './hooks/useLmiSearch';

interface LmiSearchTabContentProps {
  onExportResults: (results: any[]) => void;
}

export const LmiSearchTabContent: React.FC<LmiSearchTabContentProps> = ({ 
  onExportResults 
}) => {
  const [activeTab, setActiveTab] = useState<string>('map');
  const {
    searchType,
    setSearchType,
    searchValue,
    setSearchValue,
    isSearching,
    searchResults,
    counties,
    states,
    selectedState,
    setSelectedState,
    handleSearch
  } = useLmiSearch();

  const handleExport = () => {
    if (!searchResults?.tracts?.length) {
      return;
    }
    
    onExportResults(searchResults.tracts);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>LMI Census Tract Search</CardTitle>
        <CardDescription>
          Search for LMI-eligible properties by census tract to target your marketing efforts
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">Interactive Map</TabsTrigger>
              <TabsTrigger value="search">County Search</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="map" className="flex-grow">
            <MapTabContent onExportResults={onExportResults} />
          </TabsContent>
          
          <TabsContent value="search" className="flex-grow overflow-auto">
            <SearchTabContent
              searchType={searchType}
              searchValue={searchValue}
              selectedState={selectedState}
              states={states}
              counties={counties}
              isSearching={isSearching}
              searchResults={searchResults}
              onSearchTypeChange={setSearchType}
              onSearchValueChange={setSearchValue}
              onStateChange={setSelectedState}
              onSearch={handleSearch}
              onExport={handleExport}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Alert className="w-full">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Search results are estimates based on Census data and may not reflect current market conditions.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
};
