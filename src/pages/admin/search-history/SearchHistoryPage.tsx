
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchHistoryFilters } from './hooks/useSearchHistoryFilters';
import SearchHistoryFilters from './components/SearchHistoryFilters';
import SearchHistoryTable from './components/SearchHistoryTable';
import { SearchHistory } from './types';

export default function SearchHistoryPage() {
  const [searchRecords, setSearchRecords] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    filteredRecords, 
    addressFilter, 
    setAddressFilter, 
    dateRange, 
    setDateRange, 
    handleExport 
  } = useSearchHistoryFilters(searchRecords);

  useEffect(() => {
    async function fetchSearchHistory() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('searched_at', { ascending: false });

      if (error) {
        console.error('Error fetching search history:', error);
        setIsLoading(false);
        return;
      }

      // Cast the data to ensure it matches our type
      const typedData: SearchHistory[] = data.map(item => ({
        ...item,
        search_params: item.search_params || {},
        result: item.result || {}
      }));
      
      setSearchRecords(typedData);
      setIsLoading(false);
    }

    fetchSearchHistory();
  }, []);

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Search History</CardTitle>
        <CardDescription>
          View all address validation lookups in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SearchHistoryFilters 
          addressFilter={addressFilter}
          setAddressFilter={setAddressFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          handleExport={handleExport}
        />
        
        <SearchHistoryTable 
          filteredRecords={filteredRecords}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
