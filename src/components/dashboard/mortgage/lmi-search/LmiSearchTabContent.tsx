
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, AlertTriangleIcon } from 'lucide-react';
import { MapTabContent } from './MapTabContent';
import { SearchTabContent } from './SearchTabContent';
import { useLmiSearch } from './hooks/useLmiSearch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LmiSearchTabContentProps {
  onExportResults: (results: any[]) => void;
}

export const LmiSearchTabContent: React.FC<LmiSearchTabContentProps> = ({
  onExportResults
}) => {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  
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

  // Check for recent errors on component mount
  useEffect(() => {
    const checkForErrors = async () => {
      try {
        // Get error count from the last 24 hours
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        
        const { count, error } = await supabase
          .from('lmi_search_error_logs')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', twentyFourHoursAgo.toISOString());
        
        if (error) {
          console.error("Error checking for LMI search errors:", error);
          return;
        }
        
        if (count && count > 0) {
          setHasErrors(true);
          setErrorCount(count);
        }
      } catch (error) {
        console.error("Error checking LMI error status:", error);
      }
    };
    
    checkForErrors();
  }, []);

  const handleExport = () => {
    if (!searchResults?.tracts?.length) {
      return;
    }
    onExportResults(searchResults.tracts);
  };
  
  const handleReportProblem = async () => {
    try {
      toast.info("Reporting search issue...");
      
      // Create a debug log with the current state
      const debugInfo = {
        searchType,
        searchValue,
        selectedState,
        browser: navigator.userAgent,
        timestamp: new Date().toISOString(),
        resultsReceived: searchResults ? true : false,
        resultsCount: searchResults?.tracts?.length || 0
      };
      
      const { error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'reportIssue',
          params: {
            debugInfo,
            searchType,
            searchValue,
            userMessage: "User-reported search issue"
          }
        }
      });
      
      if (error) {
        toast.error("Failed to report issue. Please try again.");
        return;
      }
      
      toast.success("Thank you for reporting this issue. Our team will investigate.");
    } catch (error) {
      console.error("Error reporting problem:", error);
      toast.error("Failed to report issue. Please try again.");
    }
  };

  return <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>LMI Census Tract Search</CardTitle>
            <CardDescription>
              Search for LMI-eligible properties by census tract to target your marketing efforts
            </CardDescription>
          </div>
          
          {hasErrors && (
            <Alert className="bg-yellow-50 border-yellow-200 w-auto p-2">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  {errorCount} search {errorCount === 1 ? 'error' : 'errors'} detected in the last 24h
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">Interactive Map</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
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
              onReportProblem={handleReportProblem}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="flex justify-between items-center w-full">
          <Alert className="w-full">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Search results are estimates based on Census data and may not reflect current market conditions.
            </AlertDescription>
          </Alert>
          <button 
            onClick={handleReportProblem}
            className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
          >
            Report a Problem
          </button>
        </div>
      </CardFooter>
    </Card>;
};
