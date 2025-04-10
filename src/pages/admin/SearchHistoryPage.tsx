
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

interface JsonRecord {
  [key: string]: any;
}

interface SearchHistory {
  id: string;
  address: string;
  user_id: string | null;
  searched_at: string;
  is_eligible: boolean | null;
  income_category: string | null;
  result_count: number;
  lmi_result_count: number;
  search_params: JsonRecord;
  result: JsonRecord;
  ip_address: string | null;
  user_agent: string | null;
  tract_id: string | null;
  search_query: string | null;
}

export default function SearchHistoryPage() {
  const [searchRecords, setSearchRecords] = useState<SearchHistory[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SearchHistory[]>([]);
  const [addressFilter, setAddressFilter] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isLoading, setIsLoading] = useState(true);

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
      setFilteredRecords(typedData);
      setIsLoading(false);
    }

    fetchSearchHistory();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = searchRecords;

    if (addressFilter) {
      const lowercaseFilter = addressFilter.toLowerCase();
      filtered = filtered.filter(record => 
        record.address.toLowerCase().includes(lowercaseFilter) ||
        (record.tract_id && record.tract_id.toLowerCase().includes(lowercaseFilter))
      );
    }

    if (dateRange.from) {
      filtered = filtered.filter(record => 
        new Date(record.searched_at) >= dateRange.from!
      );
    }

    if (dateRange.to) {
      const toDateWithEndOfDay = new Date(dateRange.to);
      toDateWithEndOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(record => 
        new Date(record.searched_at) <= toDateWithEndOfDay
      );
    }

    setFilteredRecords(filtered);
  }, [addressFilter, dateRange, searchRecords]);

  const handleExport = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Address,Date,Eligible,Tract ID,Income Category,Result Count\n";
    
    filteredRecords.forEach(record => {
      const row = [
        `"${record.address}"`,
        new Date(record.searched_at).toLocaleString(),
        record.is_eligible ? 'Yes' : 'No',
        record.tract_id || '',
        record.income_category || '',
        record.result_count
      ].join(',');
      csvContent += row + "\n";
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `search-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Search History</CardTitle>
        <CardDescription>
          View all address validation lookups in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter by address or tract ID"
                className="pl-8 w-[250px] md:w-[300px]"
                value={addressFilter}
                onChange={(e) => setAddressFilter(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MM/dd/yyyy")} -{" "}
                        {format(dateRange.to, "MM/dd/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MM/dd/yyyy")
                    )
                  ) : (
                    "Date Range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range) {
                      setDateRange(range);
                    } else {
                      setDateRange({ from: undefined, to: undefined });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            {(addressFilter || dateRange.from) && (
              <Button variant="ghost" size="sm" onClick={() => {
                setAddressFilter('');
                setDateRange({ from: undefined, to: undefined });
              }}>
                Clear filters
              </Button>
            )}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Eligible</TableHead>
                <TableHead>Tract ID</TableHead>
                <TableHead>Income Category</TableHead>
                <TableHead>Results</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Loading search history...</TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">No search history records found</TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.address}</TableCell>
                    <TableCell>{new Date(record.searched_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {record.is_eligible === null ? (
                        <Badge variant="outline">Unknown</Badge>
                      ) : record.is_eligible ? (
                        <Badge variant="success">Eligible</Badge>
                      ) : (
                        <Badge variant="destructive">Not Eligible</Badge>
                      )}
                    </TableCell>
                    <TableCell>{record.tract_id || '-'}</TableCell>
                    <TableCell>{record.income_category || '-'}</TableCell>
                    <TableCell>{record.result_count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
