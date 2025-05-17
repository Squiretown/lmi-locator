import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./dashboard/Overview";
import { RecentActivity } from "./dashboard/RecentActivity";
import { StatisticsCards } from "./dashboard/StatisticsCards";
import { getDashboardStats } from "@/lib/supabase/dashboard";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    propertyCount: 0,
    realtorCount: 0,
    searchHistory: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [retryCount]); // Dependency on retryCount to enable manual refresh

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data for fallback
      const mockData = {
        userCount: 156,
        propertyCount: 2874,
        realtorCount: 42,
        searchHistory: [
          { id: '1', user_id: 'user1', address: '123 Main St', timestamp: new Date().toISOString(), result: 'Eligible' },
          { id: '2', user_id: 'user2', address: '456 Elm St', timestamp: new Date().toISOString(), result: 'Not eligible' },
          { id: '3', user_id: 'user3', address: '789 Oak Ave', timestamp: new Date().toISOString(), result: 'Eligible' }
        ]
      };
      
      console.log("Attempting to load dashboard data");
      
      try {
        const apiData = await getDashboardStats();
        
        if (apiData && apiData.success !== false) {
          console.log('Dashboard stats loaded successfully:', apiData);
          setStats(apiData);
        } else {
          console.log('API returned error, using mock data');
          setStats(mockData);
          if (apiData?.error) {
            setError(`API Error: ${apiData.error}`);
          }
        }
      } catch (apiError) {
        console.error('API call failed, using mock data', apiError);
        setStats(mockData);
        setError(`Failed to fetch dashboard data: ${apiError.message}`);
      }
    } catch (err) {
      console.error('Error in dashboard data loading:', err);
      setError('Failed to load dashboard data. Using default values instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    toast.info("Refreshing dashboard data...");
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        
        <Button 
          variant="outline" 
          onClick={handleRetry}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? "Loading..." : "Refresh Data"}
        </Button>
      </div>
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium">Note</p>
            <p className="text-amber-700 text-sm">
              {error} 
              <span className="block mt-1">
                Using demo data instead. You can refresh to try again.
              </span>
            </p>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <StatisticsCards 
            isLoading={isLoading} 
            userCount={stats.userCount} 
            propertyCount={stats.propertyCount} 
            realtorCount={stats.realtorCount} 
          />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Recent system activity across all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity 
                  isLoading={isLoading} 
                  activities={stats.searchHistory || []} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed system usage analytics and trends
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <p className="text-sm text-muted-foreground">Analytics will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Comprehensive list of recent system activities
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <p className="text-sm text-muted-foreground">Detailed activity log will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
