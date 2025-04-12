
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Upload, FileSpreadsheet, MapPin, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type SearchType = 'tract_id' | 'zip_code' | 'city' | 'county' | 'bulk';
type SearchResult = {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  is_eligible?: boolean;
};

export const BulkAddressSearch: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<SearchType>('zip_code');
  const [searchValue, setSearchValue] = useState('');
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [jobStatus, setJobStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');
  const [isPolling, setIsPolling] = useState(false);

  // Reset filtered results when main results change
  useEffect(() => {
    setFilteredResults(results);
  }, [results]);

  // Poll for job status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPolling && searchId) {
      interval = setInterval(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('census-db', {
            body: {
              action: 'searchStatus',
              params: { searchId }
            }
          });
          
          if (error) throw error;
          
          setJobStatus(data.status);
          setProgress(Math.round((data.resultCount / data.totalCount) * 100) || 0);
          setStatusMessage(`Processing ${data.resultCount} of ${data.totalCount} addresses`);
          
          if (data.status === 'completed') {
            setIsPolling(false);
            fetchJobResults(searchId);
            toast({
              title: 'Search completed',
              description: `Found ${data.resultCount} properties`,
            });
          } else if (data.status === 'error') {
            setIsPolling(false);
            setIsLoading(false);
            toast({
              title: 'Search failed',
              description: data.errorMessage || 'An error occurred during search processing',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, searchId, toast]);
  
  const fetchJobResults = async (jobId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'searchResults',
          params: { searchId: jobId }
        }
      });
      
      if (error) throw error;
      
      setResults(data.results);
      setFilteredResults(data.results);
      setIsLoading(false);
      setIsPolling(false);
      
    } catch (error) {
      console.error('Error fetching job results:', error);
      toast({
        title: 'Failed to fetch results',
        description: 'Unable to retrieve search results. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      setIsPolling(false);
    }
  };

  const handleSearch = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to search for properties',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setJobStatus('pending');
    setResults([]);
    setFilteredResults([]);
    
    try {
      if (searchType === 'bulk') {
        // Handle bulk address search
        const addresses = bulkAddresses
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);

        if (addresses.length === 0) {
          throw new Error('No valid addresses provided');
        }

        // Create a marketing job for bulk processing
        const { data: jobData, error: jobError } = await supabase
          .from('marketing_jobs')
          .insert({
            user_id: user.id,
            campaign_name: searchName || 'Bulk Address Search',
            status: 'pending',
            total_addresses: addresses.length,
            eligible_addresses: 0
          })
          .select('marketing_id')
          .single();

        if (jobError) throw jobError;

        // Insert addresses for processing
        const addressInserts = addresses.map(address => ({
          marketing_id: jobData.marketing_id,
          address: address,
          status: 'pending'
        }));

        const { error: addressError } = await supabase
          .from('marketing_addresses')
          .insert(addressInserts);

        if (addressError) throw addressError;

        // Start processing job
        await supabase.functions.invoke('lmi-check', {
          body: {
            action: 'process_marketing_job',
            jobId: jobData.marketing_id
          }
        });

        setSearchId(jobData.marketing_id);
        setIsPolling(true);
        setJobStatus('processing');
        setStatusMessage(`Processing ${addresses.length} addresses...`);
        
        toast({
          title: 'Bulk processing started',
          description: `${addresses.length} addresses submitted for processing.`,
        });

      } else {
        // Handle single search criteria (zip, city, tract, county)
        const { data, error } = await supabase.functions.invoke('lmi-tract-search', {
          body: {
            search_type: searchType,
            search_value: searchValue,
            user_id: user.id,
            search_name: searchName || `${searchType} Search`
          }
        });

        if (error) throw error;
        
        if (data.searchId) {
          setSearchId(data.searchId);
          setIsPolling(true);
          setJobStatus('processing');
          setStatusMessage(`Starting search for properties in ${searchValue}...`);
        } else {
          // If results are returned immediately
          setResults(data.results || []);
          setFilteredResults(data.results || []);
          setIsLoading(false);
          setSearchCount(prev => prev + 1);
          
          toast({
            title: 'Search completed',
            description: `Found ${data.results?.length || 0} properties`,
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: error.message || 'Unable to complete the search. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      setIsPolling(false);
    }
  };

  const handleExport = async () => {
    if (filteredResults.length === 0) {
      toast({
        title: 'Export Error',
        description: 'No search results to export',
        variant: 'destructive',
      });
      return;
    }
    
    // Create CSV content
    const headers = ["Address", "City", "State", "ZIP", "LMI Eligible"];
    const csvRows = [
      headers.join(','),
      ...filteredResults.map(item => 
        [
          `"${item.address}"`, 
          `"${item.city}"`, 
          `"${item.state}"`, 
          `"${item.zip_code}"`,
          item.is_eligible === undefined ? "Pending" : item.is_eligible ? "Yes" : "No"
        ].join(',')
      )
    ];
    const csvContent = csvRows.join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${searchName || 'marketing-list'}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Update download count if we have a searchId
    if (searchId) {
      try {
        await supabase.functions.invoke('census-db', {
          body: {
            action: 'updateDownloadCount',
            params: { searchId }
          }
        });
      } catch (error) {
        console.error('Error updating download count:', error);
      }
    }
    
    toast({
      title: 'Export successful',
      description: 'Your marketing list has been downloaded',
    });
  };

  const handleFilter = (eligibleOnly: boolean) => {
    setShowOnlyEligible(eligibleOnly);
    if (eligibleOnly) {
      setFilteredResults(results.filter(r => r.is_eligible === true));
    } else {
      setFilteredResults(results);
    }
  };

  const cancelSearch = async () => {
    if (!searchId) return;
    
    try {
      await supabase.functions.invoke('census-db', {
        body: {
          action: 'cancelSearch',
          params: { searchId }
        }
      });
      
      setIsPolling(false);
      setIsLoading(false);
      setJobStatus('pending');
      
      toast({
        title: 'Search cancelled',
        description: 'The search operation has been cancelled',
      });
    } catch (error) {
      console.error('Error cancelling search:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel the search operation',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Bulk Address Search</CardTitle>
        <CardDescription>Search for LMI-eligible properties by location or upload addresses in bulk</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={searchType} 
          onValueChange={(value) => setSearchType(value as SearchType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="zip_code">ZIP Code</TabsTrigger>
            <TabsTrigger value="city">City</TabsTrigger>
            <TabsTrigger value="tract_id">Census Tract</TabsTrigger>
            <TabsTrigger value="county">County</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Addresses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bulk" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchName">Search Name</Label>
              <Input 
                id="searchName"
                placeholder="Name this search for reference"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulkAddresses">Enter addresses (one per line)</Label>
              <Textarea 
                id="bulkAddresses"
                placeholder="123 Main St, Anytown, CA, 90210&#10;456 Oak Ave, Othertown, CA, 90211"
                value={bulkAddresses}
                onChange={(e) => setBulkAddresses(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-sm text-muted-foreground">
                Format: Street Address, City, State, ZIP (comma separated)
              </p>
            </div>
          </TabsContent>
          
          {searchType !== 'bulk' && (
            <TabsContent value={searchType} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="searchName">Search Name</Label>
                <Input 
                  id="searchName"
                  placeholder="Name this search for reference"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="searchValue">
                  {searchType === 'zip_code' ? 'ZIP Code' : 
                   searchType === 'city' ? 'City Name' :
                   searchType === 'tract_id' ? 'Census Tract ID' : 'County Name'}
                </Label>
                <Input 
                  id="searchValue"
                  placeholder={`Enter ${searchType.replace('_', ' ')}`}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        {isLoading && isPolling && (
          <div className="my-6 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">{statusMessage}</div>
              <Badge variant={
                jobStatus === 'completed' ? 'default' : 
                jobStatus === 'processing' ? 'secondary' : 
                jobStatus === 'error' ? 'destructive' : 
                'outline'
              }>
                {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={cancelSearch}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-6 gap-2">
          <Button 
            onClick={handleSearch} 
            disabled={
              isLoading || 
              (searchType === 'bulk' ? !bulkAddresses.trim() : !searchValue.trim())
            }
            className="flex-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Properties
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleExport} 
            disabled={filteredResults.length === 0}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
        
        {results.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Search Results ({filteredResults.length} Properties)</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant={showOnlyEligible ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleFilter(true)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  LMI Eligible Only
                </Button>
                <Button 
                  variant={!showOnlyEligible ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleFilter(false)}
                >
                  Show All
                </Button>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>ZIP</TableHead>
                    <TableHead>LMI Eligible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {isLoading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No results found</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {filteredResults.slice(0, 50).map((prop, index) => (
                        <TableRow key={index}>
                          <TableCell>{prop.address}</TableCell>
                          <TableCell>{prop.city}</TableCell>
                          <TableCell>{prop.state}</TableCell>
                          <TableCell>{prop.zip_code}</TableCell>
                          <TableCell>
                            {prop.is_eligible === undefined ? (
                              <span className="text-yellow-500">Pending</span>
                            ) : prop.is_eligible ? (
                              <span className="text-green-500">Yes</span>
                            ) : (
                              <span className="text-red-500">No</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredResults.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Showing 50 of {filteredResults.length} results. Export to CSV to view all.
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
