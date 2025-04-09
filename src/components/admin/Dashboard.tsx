
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./dashboard/Overview";
import { RecentActivity } from "./dashboard/RecentActivity";
import { StatisticsCards } from "./dashboard/StatisticsCards";
import { getDashboardStats } from "@/lib/supabase/dashboard";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    propertyCount: 0,
    realtorCount: 0,
    searchHistory: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardStats();
        
        if (data.success === false) {
          throw new Error(data.error || 'Failed to load dashboard statistics');
        }
        
        setStats(data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      
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
