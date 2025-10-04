
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logLmiSearchError, notifyAdminsOfLmiError } from '@/lib/api/lmi/error-logger';

export function useLmiSearch() {
  const [searchType, setSearchType] = useState<'county' | 'zip' | 'tract'>('county');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [counties, setCounties] = useState<Array<{fips: string, name: string}>>([]);
  const [states, setStates] = useState<Array<{code: string, name: string}>>([]);
  const [selectedState, setSelectedState] = useState<string>('');

  // Load states on mount
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

  // Load counties when state changes
  useEffect(() => {
    if (!selectedState) {
      setCounties([]);
      return;
    }

    const fetchCounties = async () => {
      try {
        console.log(`Fetching counties for state: ${selectedState}`);
        
        // Fetch counties from the county_fips_codes table via edge function
        const { data, error } = await supabase.functions.invoke('census-db', {
          body: {
            action: 'getCountiesForState',
            params: { state: selectedState }
          }
        });

        if (error) {
          throw error;
        }

        if (data && data.success && data.counties) {
          setCounties(data.counties);
          console.log(`Loaded ${data.counties.length} counties for ${selectedState}`);
        } else {
          throw new Error(data?.error || 'No counties returned');
        }
      } catch (error) {
        console.error("Error fetching counties:", error);
        
        // Set empty array on error - let user know something went wrong
        setCounties([]);
        
        toast.error("Error", {
          description: "Failed to load counties. Please try again."
        });
        
        // Log the counties fetch error
        await logLmiSearchError(
          'county', 
          selectedState, 
          error, 
          { action: 'fetchCounties', stateCode: selectedState }
        );
      }
    };

    fetchCounties();
  }, [selectedState]);

  const handleSearch = async () => {
    if (!searchValue) {
      toast.error("Input required", {
        description: `Please enter a ${searchType} to search`
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

      if (error) {
        // Log the search error
        const errorLogResult = await logLmiSearchError(
          searchType, 
          searchValue, 
          error, 
          searchParams
        );
        
        // If it's a serious error, notify admins
        if (errorLogResult.success && errorLogResult.id) {
          await notifyAdminsOfLmiError(errorLogResult.id, 'medium');
        }
        
        throw error;
      }

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

        if (tracts.length === 0) {
          toast.error("No results found", {
            description: "Try another search criteria or check your input"
          });
          
          // Log the "no results" case (not an error but worth tracking)
          await logLmiSearchError(
            searchType, 
            searchValue, 
            new Error("No results found"), 
            { ...searchParams, isNoResultsCase: true }
          );
        }
      } else {
        toast.error("No results", {
          description: "No results returned from search"
        });
        
        // Log the empty response case
        await logLmiSearchError(
          searchType, 
          searchValue, 
          new Error("Empty response from search function"), 
          searchParams
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed", {
        description: "Unable to complete the search. Please try again."
      });
      
      // Log the general search error
      await logLmiSearchError(searchType, searchValue, error, { searchTypeDetails: searchType });
    } finally {
      setIsSearching(false);
    }
  };

  return {
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
  };
}
