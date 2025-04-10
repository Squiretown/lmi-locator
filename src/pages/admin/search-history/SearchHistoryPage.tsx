
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import SearchHistoryFilters from './components/SearchHistoryFilters';
import SearchHistoryTable from './components/SearchHistoryTable';
import { SearchHistory, DateRangeType } from './types';
import { checkUserPermission } from '@/lib/supabase/user';

export default function SearchHistoryPage() {
  // State
  const [searchRecords, setSearchRecords] = useState<SearchHistory[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  
  // Filter state
  const [searchAddress, setSearchAddress] = useState('');
  const [searchTractId, setSearchTractId] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeType>({
    from: undefined,
    to: undefined
  });
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const permission = await checkUserPermission('view_reports');
      setHasPermission(permission);

      if (permission) {
        fetchSearchHistory();
      } else {
        setIsLoading(false);
        toast.error("You don't have permission to view search history");
      }
    };

    checkPermission();
  }, []);

  const fetchSearchHistory = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call when ready
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('searched_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Ensure data conforms to SearchHistory type
      const typedData: SearchHistory[] = data.map(item => ({
        ...item,
        search_params: typeof item.search_params === 'string' 
          ? JSON.parse(item.search_params) 
          : item.search_params,
        result: typeof item.result === 'string' 
          ? JSON.parse(item.result) 
          : item.result
      }));

      setSearchRecords(typedData);
      setFilteredRecords(typedData);
    } catch (error) {
      console.error('Error fetching search history:', error);
      toast.error('Failed to load search history');
      // If fetch fails, set some mock data for development
      const mockData: SearchHistory[] = [
        {
          id: '1',
          address: '123 Main St, Anytown, CA',
          user_id: null,
          searched_at: new Date().toISOString(),
          is_eligible: true,
          income_category: 'Low',
          result_count: 5,
          lmi_result_count: 3,
          search_params: { address: '123 Main St', includeNearby: true },
          result: { programs: [{ id: 1, name: 'First Time Homebuyer' }] },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          tract_id: '06001423300',
          search_query: '123 Main St'
        },
        {
          id: '2',
          address: '456 Oak Ave, Somewhere, CA',
          user_id: 'user123',
          searched_at: new Date(Date.now() - 86400000).toISOString(),
          is_eligible: false,
          income_category: null,
          result_count: 0,
          lmi_result_count: 0,
          search_params: { address: '456 Oak Ave' },
          result: { error: 'No results found' },
          ip_address: '10.0.0.1',
          user_agent: 'Chrome/94.0.4606.81',
          tract_id: null,
          search_query: '456 Oak Ave'
        }
      ];
      setSearchRecords(mockData);
      setFilteredRecords(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...searchRecords];

    // Filter by address
    if (searchAddress) {
      results = results.filter(record => 
        record.address.toLowerCase().includes(searchAddress.toLowerCase())
      );
    }

    // Filter by tract ID
    if (searchTractId) {
      results = results.filter(record => 
        record.tract_id && record.tract_id.includes(searchTractId)
      );
    }

    // Filter by date range
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      results = results.filter(record => {
        const recordDate = new Date(record.searched_at);
        return recordDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      results = results.filter(record => {
        const recordDate = new Date(record.searched_at);
        return recordDate <= toDate;
      });
    }

    // Filter by eligibility
    if (showEligibleOnly) {
      results = results.filter(record => record.is_eligible === true);
    }

    setFilteredRecords(results);
  };

  const resetFilters = () => {
    setSearchAddress('');
    setSearchTractId('');
    setDateRange({ from: undefined, to: undefined });
    setShowEligibleOnly(false);
    setFilteredRecords(searchRecords);
  };

  const exportData = () => {
    try {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add headers
      csvContent += "ID,Address,Date,Eligible,Tract ID,Income Category,Results\n";
      
      // Add data rows
      filteredRecords.forEach(record => {
        const row = [
          record.id,
          `"${record.address}"`,
          new Date(record.searched_at).toLocaleString(),
          record.is_eligible === null ? "Unknown" : record.is_eligible ? "Yes" : "No",
          record.tract_id || "",
          record.income_category || "",
          record.result_count
        ];
        csvContent += row.join(",") + "\n";
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `search-history-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
      toast.success("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  if (!hasPermission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You don't have permission to view the search history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Search History</h1>
        <Button onClick={exportData} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export Data
        </Button>
      </div>

      <SearchHistoryFilters 
        searchAddress={searchAddress}
        setSearchAddress={setSearchAddress}
        searchTractId={searchTractId}
        setSearchTractId={setSearchTractId}
        dateRange={dateRange}
        setDateRange={setDateRange}
        showEligibleOnly={showEligibleOnly}
        setShowEligibleOnly={setShowEligibleOnly}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
      />

      <SearchHistoryTable 
        filteredRecords={filteredRecords}
        isLoading={isLoading}
      />
    </div>
  );
}
