
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MapView } from '@/components/admin/marketing-dashboard/map-view';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DownloadIcon, InfoIcon, SearchIcon, DatabaseIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Type</label>
                  <Select 
                    value={searchType} 
                    onValueChange={(value: 'county' | 'zip' | 'tract') => setSearchType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="county">County</SelectItem>
                      <SelectItem value="zip">ZIP Code</SelectItem>
                      <SelectItem value="tract">Tract ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {searchType === 'county' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">State</label>
                    <Select
                      value={selectedState}
                      onValueChange={setSelectedState}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {searchType === 'county' && selectedState && (
                <div>
                  <label className="text-sm font-medium mb-2 block">County</label>
                  <Select
                    value={searchValue}
                    onValueChange={setSearchValue}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map(county => (
                        <SelectItem key={county.fips} value={county.fips}>
                          {county.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {searchType !== 'county' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {searchType === 'zip' ? 'ZIP Code' : 'Tract ID'}
                  </label>
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchType === 'zip' ? 'Enter ZIP code' : 'Enter census tract ID'}
                  />
                </div>
              )}
              
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchValue}
                className="w-full"
              >
                {isSearching ? 'Searching...' : 'Search'}
                {!isSearching && <SearchIcon className="ml-2 h-4 w-4" />}
              </Button>
            </div>

            {searchResults && (
              <div className="mt-8 space-y-6">
                <div className="bg-muted rounded-md p-4">
                  <h3 className="text-lg font-medium mb-4">Search Results Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{searchResults.summary.totalTracts}</div>
                      <div className="text-sm text-muted-foreground">Total Tracts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{searchResults.summary.lmiTracts}</div>
                      <div className="text-sm text-muted-foreground">LMI Eligible Tracts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{searchResults.summary.propertyCount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Estimated Properties</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Census Tracts</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Tract ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            LMI Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            AMI %
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Properties
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {searchResults.tracts.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
                              No tracts found for this search
                            </td>
                          </tr>
                        ) : (
                          searchResults.tracts.map((tract: any, index: number) => (
                            <tr key={index} className={tract.isLmiEligible ? "bg-green-50" : ""}>
                              <td className="px-4 py-3 text-sm font-medium">
                                {tract.tractId}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={tract.isLmiEligible ? "success" : "outline"}>
                                  {tract.isLmiEligible ? "LMI" : "Non-LMI"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {tract.amiPercentage}%
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {tract.propertyCount.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Button onClick={handleExport} className="w-full">
                  Export Results <DownloadIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
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
