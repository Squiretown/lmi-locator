
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleNotification } from '@/hooks/useSimpleNotification';
import { useAuth } from '@/hooks/useAuth';

type SearchType = 'tract_id' | 'zip_code' | 'city';
export type SearchResult = {
  address: string;
  city: string;
  state: string;
  zip_code: string;
};

export function useMarketingSearch() {
  const { user, userType } = useAuth();
  const notification = useSimpleNotification();
  const [searchType, setSearchType] = useState<SearchType>('tract_id');
  const [searchValue, setSearchValue] = useState('');
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!user) {
      notification.error(
        'Authentication Required',
        'You must be logged in to search for properties'
      );
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('lmi-tract-search', {
        body: {
          search_type: searchType,
          search_value: searchValue,
          user_id: user.id,
          search_name: searchName || `${searchType} Search`
        }
      });

      if (error) throw error;

      setResults(data.results);
      setSearchId(data.searchId);
      
      notification.success(
        'Search completed',
        `Found ${data.results.length} properties`
      );
    } catch (error) {
      console.error('Search error:', error);
      notification.error(
        'Search failed',
        'Unable to complete the search. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!searchId || !user) {
      notification.error('Export Error', 'No search results to export');
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
      
      const blob = new Blob([data.csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${searchName || 'marketing-list'}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      await supabase
        .from('census_tract_searches')
        .update({ download_count: data.downloadCount })
        .eq('id', searchId);
        
      notification.success(
        'Export successful',
        'Your marketing list has been downloaded'
      );
    } catch (error) {
      console.error('Export error:', error);
      notification.error(
        'Export failed',
        'Unable to export the data. Please try again.'
      );
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
    handleSearch,
    handleExport
  };
}
