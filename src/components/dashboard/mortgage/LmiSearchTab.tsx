
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MapView } from '@/components/admin/marketing-dashboard/map-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchForm } from './lmi-search/SearchForm';
import { SearchResults } from './lmi-search/SearchResults';

interface LmiSearchTabProps {
  onExportResults: (results: any[]) => void;
}

export const LmiSearchTab: React.FC<LmiSearchTabProps> = ({ onExportResults }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('map');
  const [searchType, setSearchType] = useState<'county' | 'zip' | 'tract'>('county');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [counties, setCounties] = useState<Array<{fips: string, name: string}>>([]);
  const [states, setStates] = useState<Array<{code: string, name: string}>>([]);
  const [selectedState, setSelectedState] = useState<string>('');

  // Load states list on component mount
  useEffect(() => {
    // This would typically come from an API or database
    setStates([
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      // ... add more states as needed
    ]);
  }, []);

  // Load counties when state is selected
  useEffect(() => {
    if (!selectedState) {
      setCounties([]);
      return;
    }

    const fetchCounties = async () => {
      try {
        // In a real implementation, this would be an API call
        // For demo purposes, we'll generate some mock counties
        const mockCounties = [
          { fips: `${selectedState}001`, name: `${selectedState} County 1` },
          { fips: `${selectedState}002`, name: `${selectedState} County 2` },
          { fips: `${selectedState}003`, name: `${selectedState} County 3` },
        ];
        setCounties(mockCounties);
      } catch (error) {
        console.error("Error fetching counties:", error);
        toast({
          title: "Error",
          description: "Failed to load counties. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchCounties();
  }, [selectedState, toast]);

  const handleSearch = async () => {
    if (!searchValue) {
      toast({
        title: "Input required",
        description: `Please enter a ${searchType} to search`,
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      // Call the appropriate Supabase function based on search type
      const { data, error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'searchBatch',
          params: {
            state: searchType === 'county' ? selectedState : undefined,
            county: searchType === 'county' ? searchValue : undefined,
            zipCode: searchType === 'zip' ? searchValue : undefined,
            tractId: searchType === 'tract' ? searchValue : undefined
          }
        }
      });

      if (error) throw error;

      if (data) {
        setSearchResults({
          summary: data.summary || {
            totalTracts: data.tracts?.length || 0,
            lmiTracts: data.tracts?.filter((t: any) => t.isLmiEligible).length || 0,
            propertyCount: data.tracts?.reduce((sum: number, t: any) => sum + (t.propertyCount || 0), 0) || 0
          },
          tracts: data.tracts || [],
          searchType,
          searchValue
        });

        toast({
          title: "Search completed",
          description: `Found ${data.tracts?.length || 0} census tracts`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Unable to complete the search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleExport = () => {
    if (!searchResults?.tracts?.length) {
      toast({
        title: "No results",
        description: "There are no results to export",
        variant: "destructive"
      });
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
            <div className="h-full">
              <MapView onExportResults={onExportResults} />
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="flex-grow p-6 overflow-auto">
            <SearchForm
              searchType={searchType}
              searchValue={searchValue}
              selectedState={selectedState}
              states={states}
              counties={counties}
              isSearching={isSearching}
              onSearchTypeChange={setSearchType}
              onSearchValueChange={setSearchValue}
              onStateChange={setSelectedState}
              onSearch={handleSearch}
            />

            {searchResults && (
              <SearchResults
                searchResults={searchResults}
                onExport={handleExport}
                isLoading={isSearching}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Alert variant="outline" className="w-full">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Search results are estimates based on Census data and may not reflect current market conditions.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
};
