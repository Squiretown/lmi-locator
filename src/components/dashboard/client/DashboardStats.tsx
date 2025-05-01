
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { useClientActivity } from '@/hooks/useClientActivity';
import { Home, Search, Check, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardStats = () => {
  const { savedAddresses, isLoading: isSavedLoading, refreshAddresses } = useSavedAddresses();
  const { activities, isLoading: isActivitiesLoading } = useClientActivity();

  React.useEffect(() => {
    // Ensure we have the latest data when the component mounts
    refreshAddresses();
  }, [refreshAddresses]);

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
