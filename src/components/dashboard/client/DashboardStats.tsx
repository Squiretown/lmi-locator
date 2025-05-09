
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Ensure we have the latest data when the component mounts
    const refreshData = async () => {
      try {
        await Promise.all([refreshAddresses(), refreshActivities()]);
        console.log("Dashboard stats refreshed with saved addresses:", savedAddresses.length);
      } catch (error) {
        console.error("Error refreshing dashboard stats:", error);
      }
    };
    
    refreshData();
    
    // Set up an interval to refresh data every 15 seconds
    const intervalId = setInterval(refreshData, 15000);
    
    return () => clearInterval(intervalId);
  }, [refreshAddresses, refreshActivities]);

  // Calculate real stats from user data
  const savedPropertiesCount = savedAddresses.length;
  const searchesCount = activities.filter(a => a.type === 'search').length;
  const eligibleCount = savedAddresses.filter(p => p.isLmiEligible).length;
  
  // For the remaining days, we'd need to fetch from an API
  // For now, set a placeholder or calculate based on user metadata if available
  const daysRemaining = 30; // Example: 30 days remaining in trial
  
  const isLoading = isSavedLoading || isActivitiesLoading;

  console.log("DashboardStats rendering with saved addresses:", savedAddresses);
  console.log("Saved properties count:", savedPropertiesCount);

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
          value={isLoading ? null : savedPropertiesCount.toString()}
          icon={<Home className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Property Searches"
          value={isLoading ? null : searchesCount.toString()}
          icon={<Search className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          title="LMI Eligible"
          value={isLoading ? null : eligibleCount.toString()}
          icon={<Check className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Days Remaining"
          value={isLoading ? null : daysRemaining.toString()}
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
