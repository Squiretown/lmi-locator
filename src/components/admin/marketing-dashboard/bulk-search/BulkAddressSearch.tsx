
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { SearchType, JobStatus, SearchResult } from "./types";
import { SearchTypeSelector } from "./SearchTypeSelector";
import { SingleSearchForm } from "./SingleSearchForm";
import { BulkAddressForm } from "./BulkAddressForm";
import { SearchProgress } from "./SearchProgress";
import { SearchActions } from "./SearchActions";
import { ResultsFilter } from "./ResultsFilter";
import { SearchResultsTable } from "./SearchResultsTable";

export const BulkAddressSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchType, setSearchType] = useState<SearchType>('zip_code');
  const [searchValue, setSearchValue] = useState('');
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [jobStatus, setJobStatus] = useState<JobStatus>('pending');
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
            toast.success('Search completed', {
              description: `Found ${data.resultCount} properties`
            });
          } else if (data.status === 'error') {
            setIsPolling(false);
            setIsLoading(false);
            toast.error('Search failed', {
              description: data.errorMessage || 'An error occurred during search processing'
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
  }, [isPolling, searchId]);
  
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
      toast.error('Failed to fetch results', {
        description: 'Unable to retrieve search results. Please try again.'
      });
      setIsLoading(false);
      setIsPolling(false);
    }
  };

  const handleSearch = async () => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'You must be logged in to search for properties'
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
        
        toast.success('Bulk processing started', {
          description: `${addresses.length} addresses submitted for processing.`
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
          
          toast.success('Search completed', {
            description: `Found ${data.results?.length || 0} properties`
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed', {
        description: error.message || 'Unable to complete the search. Please try again.'
      });
      setIsLoading(false);
      setIsPolling(false);
    }
  };

  const handleExport = async () => {
    if (filteredResults.length === 0) {
      toast.error('Export Error', {
        description: 'No search results to export'
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
    
    toast.success('Export successful', {
      description: 'Your marketing list has been downloaded'
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
      
      toast.success('Search cancelled', {
        description: 'The search operation has been cancelled'
      });
    } catch (error) {
      console.error('Error cancelling search:', error);
      toast.error('Error', {
        description: 'Failed to cancel the search operation'
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
          <SearchTypeSelector 
            searchType={searchType}
            onSearchTypeChange={setSearchType}
          />
          
          <TabsContent value="bulk" className="space-y-4">
            <BulkAddressForm
              searchName={searchName}
              bulkAddresses={bulkAddresses}
              onSearchNameChange={setSearchName}
              onBulkAddressesChange={setBulkAddresses}
            />
          </TabsContent>
          
          {searchType !== 'bulk' && (
            <TabsContent value={searchType} className="space-y-4">
              <SingleSearchForm
                searchType={searchType as Exclude<SearchType, 'bulk'>}
                searchName={searchName}
                searchValue={searchValue}
                onSearchNameChange={setSearchName}
                onSearchValueChange={setSearchValue}
              />
            </TabsContent>
          )}
        </Tabs>
        
        {isLoading && isPolling && (
          <SearchProgress
            jobStatus={jobStatus}
            progress={progress}
            statusMessage={statusMessage}
            onCancel={cancelSearch}
          />
        )}
        
        <SearchActions
          onSearch={handleSearch}
          onExport={handleExport}
          isLoading={isLoading}
          disabled={(searchType === 'bulk' ? !bulkAddresses.trim() : !searchValue.trim())}
          canExport={filteredResults.length > 0}
        />
        
        {results.length > 0 && (
          <div className="mt-6">
            <ResultsFilter
              showOnlyEligible={showOnlyEligible}
              onFilterChange={handleFilter}
              resultsCount={results.length}
              filteredCount={filteredResults.length}
            />
            
            <SearchResultsTable
              results={filteredResults}
              isLoading={isLoading}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
