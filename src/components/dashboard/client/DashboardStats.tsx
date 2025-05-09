
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { useClientActivity } from '@/hooks/useClientActivity';
import { Home, Search, Check, Clock, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const DashboardStats = () => {
  const { savedAddresses, isLoading: isSavedLoading, refreshAddresses } = useSavedAddresses();
  const { activities, isLoading: isActivitiesLoading, refreshActivities } = useClientActivity();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [stats, setStats] = useState({
    savedCount: 0,
    searchesCount: 0,
    eligibleCount: 0,
    daysRemaining: 30,
  });

  // Force re-render when savedAddresses changes
  useEffect(() => {
    console.log("DashboardStats: savedAddresses changed, length:", savedAddresses.length);
    
    // Calculate derived statistics
    setStats({
      savedCount: savedAddresses.length,
      searchesCount: activities.filter(a => a.type === 'search').length,
      eligibleCount: savedAddresses.filter(p => p.isLmiEligible).length,
      daysRemaining: 30, // Example: 30 days remaining in trial
    });
    
    // Update last updated timestamp to force re-render
    setLastUpdated(Date.now());
  }, [savedAddresses, activities]);

  // Refresh data with delay
  const refreshData = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log("DashboardStats: Refreshing data...");
      await Promise.all([refreshAddresses(), refreshActivities()]);
      console.log("Dashboard stats refreshed with saved addresses:", savedAddresses.length);
    } catch (error) {
      console.error("Error refreshing dashboard stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAddresses, refreshActivities, savedAddresses.length, isRefreshing]);
  
  // Set up event listener for property-saved events
  useEffect(() => {
    const handlePropertySaved = () => {
      console.log("DashboardStats: Caught property-saved event");
      setTimeout(() => refreshData(), 500); // Small delay to ensure database has updated
    };
    
    document.addEventListener('property-saved', handlePropertySaved);
    
    // Initial load and interval refresh
    refreshData();
    
    // Set up an interval to refresh data every 3 seconds
    const intervalId = setInterval(() => {
      console.log("DashboardStats: Running interval refresh");
      refreshData();
    }, 3000);
    
    return () => {
      document.removeEventListener('property-saved', handlePropertySaved);
      clearInterval(intervalId);
    };
  }, [refreshData]);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([refreshAddresses(), refreshActivities()]);
      toast.success("Dashboard data refreshed");
      console.log("Manual refresh complete - saved addresses:", savedAddresses.length);
    } catch (error) {
      console.error("Error during manual refresh:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoading = isSavedLoading || isActivitiesLoading || isRefreshing;

  console.log("DashboardStats rendering with stats:", stats);

  return (
    <div className="relative mb-6">
      <div className="absolute top-0 right-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualRefresh} 
          disabled={isRefreshing || isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saved Properties"
          value={isLoading ? null : stats.savedCount.toString()}
          icon={<Home className="h-5 w-5 text-blue-500" />}
          key={`saved-${stats.savedCount}-${lastUpdated}`}
        />
        <StatCard
          title="Property Searches"
          value={isLoading ? null : stats.searchesCount.toString()}
          icon={<Search className="h-5 w-5 text-amber-500" />}
          key={`searches-${stats.searchesCount}-${lastUpdated}`}
        />
        <StatCard
          title="LMI Eligible"
          value={isLoading ? null : stats.eligibleCount.toString()}
          icon={<Check className="h-5 w-5 text-green-500" />}
          key={`eligible-${stats.eligibleCount}-${lastUpdated}`}
        />
        <StatCard
          title="Days Remaining"
          value={isLoading ? null : stats.daysRemaining.toString()}
          icon={<Clock className="h-5 w-5 text-purple-500" />}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | null;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        {value === null ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <span className="text-2xl font-bold">{value}</span>
        )}
        {icon}
      </div>
    </CardContent>
  </Card>
);
