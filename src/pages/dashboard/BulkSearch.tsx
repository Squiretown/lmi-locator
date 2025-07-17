
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkAddressUploadForm } from '@/components/marketing/BulkAddressUploadForm';
import { SearchForm } from '@/components/marketing/SearchForm';
import { SearchResults } from '@/components/marketing/SearchResults';
import { useMarketingSearch } from '@/hooks/useMarketingSearch';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Check, Filter } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const BulkSearchPage: React.FC = () => {
  const { user, userType } = useAuth();
  
  // Check if user type is allowed to access bulk search
  if (userType === 'client') {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border shadow-md p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            Bulk search functionality is not available for client accounts. 
            Please contact your real estate professional for assistance.
          </p>
        </div>
      </div>
    );
  }
  const [isPolling, setIsPolling] = useState(false);
  const [jobStatus, setJobStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [bulkSearchId, setBulkSearchId] = useState<string | null>(null);
  const [bulkResults, setBulkResults] = useState<any[] | null>(null);
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);
  const [filteredBulkResults, setFilteredBulkResults] = useState<any[] | null>(null);
  
  const {
    searchType,
    setSearchType,
    searchValue,
    setSearchValue,
    searchName,
    setSearchName,
    results,
    isLoading,
    handleSearch,
    handleExport,
    canExport
  } = useMarketingSearch();

  // Poll for job status
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPolling && bulkSearchId) {
      interval = setInterval(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('census-db', {
            body: {
              action: 'searchStatus',
              params: { searchId: bulkSearchId }
            }
          });
          
          if (error) throw error;
          
          setJobStatus(data.status);
          setProgress(Math.round((data.resultCount / data.totalCount) * 100) || 0);
          setStatusMessage(`Processing ${data.resultCount} of ${data.totalCount} addresses`);
          
          if (data.status === 'completed') {
            setIsPolling(false);
            fetchJobResults(bulkSearchId);
          } else if (data.status === 'error') {
            setIsPolling(false);
            setStatusMessage(data.errorMessage || 'An error occurred during search processing');
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, bulkSearchId]);

  // Handle filter changes
  React.useEffect(() => {
    if (bulkResults) {
      if (showOnlyEligible) {
        setFilteredBulkResults(bulkResults.filter(r => r.is_eligible === true));
      } else {
        setFilteredBulkResults(bulkResults);
      }
    }
  }, [showOnlyEligible, bulkResults]);
  
  const fetchJobResults = async (jobId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'searchResults',
          params: { searchId: jobId }
        }
      });
      
      if (error) throw error;
      
      setBulkResults(data.results);
      setFilteredBulkResults(data.results);
      
    } catch (error) {
      console.error('Error fetching job results:', error);
      setStatusMessage('Failed to fetch results. Please try again.');
    }
  };

  const handleBulkExport = async () => {
    if (!bulkSearchId || !filteredBulkResults?.length) return;
    
    try {
      // Create CSV content
      const headers = ["Address", "City", "State", "ZIP", "LMI Eligible"];
      const csvRows = [
        headers.join(','),
        ...filteredBulkResults.map(item => 
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
      a.setAttribute('download', `bulk-search-results.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Update download count
      await supabase.functions.invoke('census-db', {
        body: {
          action: 'updateDownloadCount',
          params: { searchId: bulkSearchId }
        }
      });
    } catch (error) {
      console.error('Error exporting results:', error);
      setStatusMessage('Failed to export results. Please try again.');
    }
  };

  const handleBulkSearchStarted = (jobId: string, addressCount: number) => {
    setBulkSearchId(jobId);
    setIsPolling(true);
    setJobStatus('processing');
    setStatusMessage(`Processing ${addressCount} addresses...`);
    setProgress(0);
    setBulkResults(null);
    setFilteredBulkResults(null);
  };

  const cancelSearch = async () => {
    if (!bulkSearchId) return;
    
    try {
      await supabase.functions.invoke('census-db', {
        body: {
          action: 'cancelSearch',
          params: { searchId: bulkSearchId }
        }
      });
      
      setIsPolling(false);
      setJobStatus('pending');
      setStatusMessage('Search cancelled');
    } catch (error) {
      console.error('Error cancelling search:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Property Search</h1>
      
      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Search</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Search</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="mt-6 space-y-6">
          <SearchForm
            searchType={searchType}
            onSearchTypeChange={setSearchType}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            searchName={searchName}
            onSearchNameChange={setSearchName}
            onSearch={handleSearch}
            isLoading={isLoading}
            canSearch={!!user}
          />
          
          {results.length > 0 && (
            <SearchResults 
              results={results} 
              onExport={handleExport}
              canExport={canExport}
            />
          )}
        </TabsContent>
        
        <TabsContent value="bulk" className="mt-6 space-y-6">
          {!bulkResults && !isPolling && (
            <BulkAddressUploadForm onSearchStarted={handleBulkSearchStarted} />
          )}
          
          {isPolling && (
            <div className="bg-white rounded-lg border shadow-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Search Progress</h3>
                <div className={`px-2 py-1 text-xs font-medium rounded ${
                  jobStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                  jobStatus === 'processing' ? 'bg-blue-100 text-blue-800' : 
                  jobStatus === 'error' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{statusMessage}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {jobStatus === 'processing' && (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={cancelSearch}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              {jobStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{statusMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          {bulkResults && (
            <>
              <div className="bg-white rounded-lg border shadow-md">
                <div className="p-4 border-b flex flex-wrap justify-between items-center">
                  <h3 className="text-lg font-medium">Search Results ({filteredBulkResults?.length || 0} Properties)</h3>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Button 
                      variant={showOnlyEligible ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setShowOnlyEligible(true)}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      LMI Eligible Only
                    </Button>
                    <Button 
                      variant={!showOnlyEligible ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setShowOnlyEligible(false)}
                    >
                      Show All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBulkExport}
                      disabled={!filteredBulkResults?.length}
                    >
                      Export CSV
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="px-4 py-3 text-left text-sm font-medium">Address</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">City</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">State</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">ZIP</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">LMI Eligible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBulkResults?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No properties match your filter criteria
                          </td>
                        </tr>
                      ) : (
                        filteredBulkResults?.map((prop, index) => (
                          <tr key={index} className="border-t hover:bg-muted/20">
                            <td className="px-4 py-3 text-sm">{prop.address}</td>
                            <td className="px-4 py-3 text-sm">{prop.city}</td>
                            <td className="px-4 py-3 text-sm">{prop.state}</td>
                            <td className="px-4 py-3 text-sm">{prop.zip_code}</td>
                            <td className="px-4 py-3 text-sm">
                              {prop.is_eligible === undefined ? (
                                <span className="text-yellow-500">Pending</span>
                              ) : prop.is_eligible ? (
                                <span className="flex items-center text-green-600">
                                  <Check className="mr-1 h-4 w-4" />
                                  Yes
                                </span>
                              ) : (
                                <span className="text-red-500">No</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {filteredBulkResults && filteredBulkResults.length > 20 && (
                  <div className="p-3 text-center text-sm text-muted-foreground border-t">
                    Showing {Math.min(filteredBulkResults.length, 20)} of {filteredBulkResults.length} results. Export to CSV to view all.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setBulkResults(null);
                    setFilteredBulkResults(null);
                    setBulkSearchId(null);
                    setJobStatus('pending');
                  }}
                >
                  New Search
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkSearchPage;
