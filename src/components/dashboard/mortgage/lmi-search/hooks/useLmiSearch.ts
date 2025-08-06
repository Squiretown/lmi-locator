
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
      { code: 'DE', name: 'Delaware' },
      { code: 'DC', name: 'District of Columbia' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' },
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
        
        // Fetch real counties from the census_tracts table
        const { data, error } = await supabase.functions.invoke('census-db', {
          body: {
            action: 'searchBatch',
            params: { state: selectedState }
          }
        });

        if (error) {
          throw error;
        }

        // Extract unique counties from the tracts data
        const uniqueCounties = new Map();
        if (data && data.tracts) {
          data.tracts.forEach((tract: any) => {
            if (tract.county && !uniqueCounties.has(tract.county)) {
              uniqueCounties.set(tract.county, {
                fips: `${selectedState}_${tract.county}`, // Using a combination as fips
                name: tract.county
              });
            }
          });
        }

        const countiesArray = Array.from(uniqueCounties.values()).sort((a, b) => a.name.localeCompare(b.name));
        setCounties(countiesArray);
        
        console.log(`Loaded ${countiesArray.length} counties for ${selectedState}`);
      } catch (error) {
        console.error("Error fetching counties:", error);
        
        // Fallback to a basic list if the real data fetch fails
        const fallbackCounties = [
          { fips: `${selectedState}001`, name: `${selectedState} County` }
        ];
        setCounties(fallbackCounties);
        
        toast.error("Error", {
          description: "Failed to load counties. Using fallback data."
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
      
      if (data && data.success) {
        // Use the actual response structure from the enhanced census-db function
        const tracts = data.tracts || [];
        const summary = data.summary || {
          totalTracts: tracts.length || 0,
          lmiTracts: tracts.filter((t: any) => t.isLmiEligible).length || 0,
          propertyCount: tracts.reduce((sum: number, t: any) => sum + (t.propertyCount || 0), 0) || 0,
          lmiPercentage: data.summary?.lmiPercentage || 0
        };

        setSearchResults({
          summary,
          tracts,
          searchType,
          searchValue
        });

        if (tracts.length === 0) {
          toast.error("No results found", {
            description: "No census tracts found matching your criteria. Try adjusting your search."
          });
          
          // Log the "no results" case (not an error but worth tracking)
          await logLmiSearchError(
            searchType, 
            searchValue, 
            new Error("No results found"), 
            { ...searchParams, isNoResultsCase: true }
          );
        } else {
          toast.success("Search completed", {
            description: `Found ${tracts.length} census tracts (${summary.lmiTracts} LMI-eligible)`
          });
        }
      } else if (data && !data.success) {
        // Handle error response from the function
        toast.error("Search failed", {
          description: data.error || "An error occurred during search"
        });
        
        // Log the function error
        await logLmiSearchError(
          searchType, 
          searchValue, 
          new Error(data.error || "Function returned error"), 
          searchParams
        );
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
