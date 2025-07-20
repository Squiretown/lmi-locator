
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Search, TrendingUp, Database, ExternalLink } from "lucide-react";
import { getDashboardStats } from '@/lib/supabase/dashboard';
import { DashboardOverview } from './DashboardOverview';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    userCount: 0,
    propertyCount: 0,
    realtorCount: 0,
    searchHistory: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const stats = await getDashboardStats();
        
        if (stats.success) {
          setDashboardData({
            userCount: stats.userCount || 0,
            propertyCount: stats.propertyCount || 0,
            realtorCount: stats.realtorCount || 0,
            searchHistory: stats.searchHistory || []
          });
        } else {
          console.error('Failed to load dashboard stats:', stats.error);
          toast.error('Failed to load dashboard statistics');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error loading dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewSearchHistory = () => {
    navigate('/admin/search-history');
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.userCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered platform users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.propertyCount}</div>
            <p className="text-xs text-muted-foreground">
              Properties in database
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realtors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.realtorCount}</div>
            <p className="text-xs text-muted-foreground">
              Active real estate professionals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.searchHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              Property searches today
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 h-auto p-0 text-xs"
              onClick={handleViewSearchHistory}
            >
              View all searches <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <DashboardOverview 
        isLoading={isLoading}
        searchHistory={dashboardData.searchHistory}
      />
    </div>
  );
};
