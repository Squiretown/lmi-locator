
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { showSearchStarted, showSearchComplete, showSearchError, showExportSuccess, showExportError } from '@/utils/toastUtils';

// Export the SearchType so it can be used in other files
export type SearchType = 'tract_id' | 'zip_code' | 'city';
export type SearchResult = {
  address: string;
  city: string;
  state: string;
  zip_code: string;
};

export function useMarketingSearch() {
  const { user, userType } = useAuth();
  const [searchType, setSearchType] = useState<SearchType>('tract_id');
  const [searchValue, setSearchValue] = useState('');
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState(0);

  const validateSearch = (): boolean => {
    // Simple validation based on search type
    if (searchType === 'zip_code' && !/^\d{5}$/.test(searchValue)) {
      showSearchError('Please enter a valid 5-digit ZIP code');
      return false;
    }
    
    if (searchType === 'tract_id' && !/^\d{11}$/.test(searchValue)) {
      showSearchError('Please enter a valid 11-digit census tract ID');
      return false;
    }
    
    if (searchType === 'city' && searchValue.length < 2) {
      showSearchError('Please enter a valid city name');
      return false;
    }
    
    return true;
  };

  const handleSearch = async () => {
    if (!user) {
      showSearchError('You must be logged in to search for properties');
      return;
    }

    if (!validateSearch()) {
      return;
    }

    setIsLoading(true);
    try {
      showSearchStarted(1); // One search query
      
      const { data, error } = await supabase.functions.invoke('lmi-tract-search', {
        body: {
          search_type: searchType,
          search_value: searchValue,
          user_id: user.id,
          search_name: searchName || `${searchType} Search`
        }
      });

      if (error) throw error;

      setResults(data.results || []);
      setSearchId(data.searchId);
      setSearchCount(prev => prev + 1);
      
      showSearchComplete(data.results.length, data.lmiCount || 0);
    } catch (error) {
      console.error('Search error:', error);
      showSearchError(error.message || 'An error occurred during the search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!searchId || !user) {
      showExportError('No search results to export');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'exportSearchResults',
          params: {
            searchId,
            userId: user.id,
            format: 'csv'
          }
        }
      });

      if (error) throw error;
      
      // Create and download the CSV file
      const filename = `${searchName || 'marketing-list'}.csv`;
      const blob = new Blob([data.csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Update download count
      await supabase
        .from('census_tract_searches')
        .update({ download_count: data.downloadCount })
        .eq('id', searchId);
        
      showExportSuccess(filename);
    } catch (error) {
      console.error('Export error:', error);
      showExportError(error.message || 'Unable to export the data');
    }
  };

  return {
    searchType,
    setSearchType,
    searchValue,
    setSearchValue,
    searchName,
    setSearchName,
    results,
    isLoading,
    searchCount,
    handleSearch,
    handleExport,
    // Check if the user can export based on their type
    canExport: !!user && ['admin', 'mortgage_professional', 'realtor'].includes(userType || '')
  };
}
