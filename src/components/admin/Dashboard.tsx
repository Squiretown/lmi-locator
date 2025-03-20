
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building, Users, Home, Search, PieChart, Map, Calendar, List } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats, Property, Realtor, SearchHistory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSearches: 0,
    lmiProperties: 0,
    lmiPercentage: 0,
    recentSearches: [],
    totalUsers: 0,
    totalProperties: 0,
    totalRealtors: 0,
    popularZipCodes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch search history stats
        const { data: searchHistoryData, error: searchError } = await supabase
          .from('search_history')
          .select('*')
          .order('searched_at', { ascending: false });
        
        if (searchError) throw searchError;
        
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        
        // Fetch property count
        const { count: propertyCount, error: propertyError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
        
        if (propertyError) throw propertyError;
        
        // Fetch realtor count
        const { count: realtorCount, error: realtorError } = await supabase
          .from('realtors')
          .select('*', { count: 'exact', head: true });
        
        if (realtorError) throw realtorError;
        
        // Calculate LMI eligible properties
        const lmiEligible = searchHistoryData?.filter(item => item.is_eligible).length || 0;
        
        // Calculate popular zip codes
        const zipCodes: Record<string, number> = {};
        searchHistoryData?.forEach(search => {
          if (search.result && typeof search.result === 'object') {
            // Handle case where zip_code might be in the result object
            const zipCode = search.result.zip_code as string;
            if (zipCode) {
              zipCodes[zipCode] = (zipCodes[zipCode] || 0) + 1;
            }
          }
        });
        
        const popularZipCodes = Object.entries(zipCodes)
          .map(([zipCode, count]) => ({ zipCode, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Transform search history data to match our types
        const typedSearchHistory = searchHistoryData?.map(item => ({
          ...item,
          search_params: item.search_params as Record<string, any>,
          result: item.result as Record<string, any>
        })) as SearchHistory[];
        
        setStats({
          totalSearches: searchHistoryData?.length || 0,
          lmiProperties: lmiEligible,
          lmiPercentage: searchHistoryData?.length ? 
            Math.round((lmiEligible / searchHistoryData.length) * 100) : 0,
          recentSearches: typedSearchHistory?.slice(0, 10) || [],
          totalUsers: userCount || 0,
          totalProperties: propertyCount || 0, 
          totalRealtors: realtorCount || 0,
          popularZipCodes
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Chart data
  const chartData = stats.popularZipCodes?.map(item => ({
    name: item.zipCode,
    searches: item.count
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="searches">Searches</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSearches}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.lmiPercentage}% LMI eligible
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties || 0}</div>
                <p className="text-xs text-muted-foreground">
                  In database
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Registered accounts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Realtors</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRealtors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  In database
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Popular Zip Codes</CardTitle>
                <CardDescription>
                  Most frequently searched zip codes in the system
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="searches" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
                <CardDescription>
                  Latest property searches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentSearches.slice(0, 5).map((search) => (
                    <div key={search.id} className="flex items-center">
                      <div className={`mr-2 h-2 w-2 rounded-full ${search.is_eligible ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                          {search.address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(search.searched_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Showing {stats.recentSearches.slice(0, 5).length} of {stats.totalSearches} searches
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Statistics</CardTitle>
              <CardDescription>
                Details about properties in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Property statistics will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="searches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Analytics</CardTitle>
              <CardDescription>
                Detailed search history and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Search analytics will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage system users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                User management interface will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
