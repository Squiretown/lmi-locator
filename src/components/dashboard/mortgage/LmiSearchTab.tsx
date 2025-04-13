
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

  useEffect(() => {
    setStates([
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
    ]);
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setCounties([]);
      return;
    }

    const fetchCounties = async () => {
      try {
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
      // Prepare search parameters based on search type
      const searchParams: any = {};
      
      if (searchType === 'county') {
        searchParams.state = selectedState;
        searchParams.county = searchValue;
      } else if (searchType === 'zip') {
        searchParams.zipCode = searchValue;
      } else if (searchType === 'tract') {
        searchParams.tractId = searchValue.trim();
      }
      
      console.log("Search parameters:", searchParams);
      
      const { data, error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'searchBatch',
          params: searchParams
        }
      });

      if (error) throw error;

      console.log("Search results:", data);
      
      if (data) {
        // Make sure we have a valid response structure
        const tracts = data.tracts || [];
        const summary = data.summary || {
          totalTracts: tracts.length || 0,
          lmiTracts: tracts.filter((t: any) => t.isLmiEligible).length || 0,
          propertyCount: tracts.reduce((sum: number, t: any) => sum + (t.propertyCount || 0), 0) || 0
        };

        setSearchResults({
          summary,
          tracts,
          searchType,
          searchValue
        });

        if (tracts.length > 0) {
          toast({
            title: "Search completed",
            description: `Found ${tracts.length} census tracts`,
          });
        } else {
          toast({
            title: "No results found",
            description: "Try another search criteria or check your input",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "No results",
          description: "No results returned from search",
          variant: "destructive"
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
