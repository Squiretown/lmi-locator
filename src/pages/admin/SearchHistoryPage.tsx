
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminPermissions } from "@/components/admin/layout/AdminPermissionsContext";
import { SearchHistory } from "@/lib/types";
import { format } from "date-fns";

const SearchHistoryPage = () => {
  const [searchEntries, setSearchEntries] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const { toast } = useToast();
  const { hasPermission } = useAdminPermissions();

  useEffect(() => {
    fetchSearchHistory();
  }, [timeRange]);

  const fetchSearchHistory = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('search_history')
        .select('*')
        .order('searched_at', { ascending: false });
      
      // Apply time range filter if needed
      if (timeRange === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('searched_at', today.toISOString());
      } else if (timeRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('searched_at', weekAgo.toISOString());
      } else if (timeRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('searched_at', monthAgo.toISOString());
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      setSearchEntries(data || []);
    } catch (error) {
      console.error('Error fetching search history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load search history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Get data to export (apply current filters)
      let query = supabase
        .from('search_history')
        .select('*')
        .order('searched_at', { ascending: false });
      
      if (searchTerm) {
        query = query.ilike('address', `%${searchTerm}%`);
      }
      
      if (timeRange === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('searched_at', today.toISOString());
      } else if (timeRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('searched_at', weekAgo.toISOString());
      } else if (timeRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('searched_at', monthAgo.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({
          title: 'No data',
          description: 'No search history to export',
        });
        return;
      }

      // Create CSV content
      const headers = ['Address', 'Date', 'User ID', 'LMI Eligible', 'Census Tract', 'Income Category'];
      const csvRows = [headers.join(',')];
      
      data.forEach(entry => {
        const row = [
          `"${entry.address || ''}"`,
          `"${entry.searched_at ? format(new Date(entry.searched_at), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
          `"${entry.user_id || ''}"`,
          `"${entry.is_eligible !== null ? (entry.is_eligible ? 'Yes' : 'No') : ''}"`,
          `"${entry.tract_id || ''}"`,
          `"${entry.income_category || ''}"`,
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      // Download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `search-history-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export successful',
        description: `Exported ${data.length} search records`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export search history',
        variant: 'destructive',
      });
    }
  };

  const filteredEntries = searchEntries.filter(entry => 
    entry.address && entry.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Search History</h1>
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={isLoading || filteredEntries.length === 0}
        >
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Address Lookup History</CardTitle>
            <div className="flex gap-2">
              <Tabs 
                defaultValue="all" 
                value={timeRange} 
                onValueChange={setTimeRange}
              >
                <TabsList>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                  <TabsTrigger value="month">Last Month</TabsTrigger>
                  <TabsTrigger value="week">Last Week</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <CardDescription>
            View all past address lookups and their eligibility status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search addresses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading search history...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No search history found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>LMI Eligible</TableHead>
                    <TableHead>Census Tract</TableHead>
                    <TableHead>Income Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.address}</TableCell>
                      <TableCell>
                        {entry.searched_at ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(entry.searched_at), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </TableCell>
                      <TableCell>{entry.user_id ? entry.user_id.substring(0, 8) + '...' : 'Anonymous'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.is_eligible === true 
                            ? 'bg-green-100 text-green-800' 
                            : entry.is_eligible === false 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.is_eligible === true ? 'Yes' : 
                           entry.is_eligible === false ? 'No' : 
                           'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>{entry.tract_id || 'N/A'}</TableCell>
                      <TableCell>{entry.income_category || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchHistoryPage;
