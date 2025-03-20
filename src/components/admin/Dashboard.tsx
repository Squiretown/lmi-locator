
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from '@/lib/supabase-api';
import { SearchHistory, DashboardStats } from '@/lib/types';
import { Chart } from "@/components/ui/chart";
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardStats();
        if (data.searchHistory && Array.isArray(data.searchHistory)) {
          // Map the search history to our expected format
          const searchHistory: SearchHistory[] = data.searchHistory.map((search: any) => ({
            ...search,
            result: typeof search.result === 'string' ? JSON.parse(search.result) : search.result,
            search_params: typeof search.search_params === 'string' ? JSON.parse(search.search_params) : search.search_params
          }));
  
          const dashboardStats: DashboardStats = {
            totalSearches: searchHistory.length,
            lmiProperties: searchHistory.filter(s => s.is_eligible).length,
            lmiPercentage: Math.round((searchHistory.filter(s => s.is_eligible).length / searchHistory.length) * 100) || 0,
            recentSearches: searchHistory.slice(0, 5),
            totalUsers: data.userCount || 0,
            totalProperties: data.propertyCount || 0,
            totalRealtors: data.realtorCount || 0
          };
          
          setStats(dashboardStats);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return <div>No data available</div>;
  }

  // Prepare data for charts
  const searchChartData = {
    labels: ['LMI Eligible', 'Non-LMI'],
    datasets: [
      {
        data: [stats.lmiProperties, stats.totalSearches - stats.lmiProperties],
        backgroundColor: ['#10b981', '#6b7280'],
        hoverBackgroundColor: ['#047857', '#4b5563'],
      },
    ],
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSearches}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LMI Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lmiProperties}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LMI Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lmiPercentage}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Property Statistics</CardTitle>
            <CardDescription>
              Distribution of LMI eligible properties
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-60 w-60">
              <Chart type="pie" data={searchChartData} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentSearches.map((search) => (
                <div key={search.id} className="border-b pb-2">
                  <div className="font-medium">{search.address}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(search.searched_at || '').toLocaleString()}
                  </div>
                  <div className="text-sm">
                    {search.is_eligible ? 
                      <span className="text-green-600">LMI Eligible</span> : 
                      <span className="text-gray-600">Not Eligible</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User and Property Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Realtors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRealtors || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
