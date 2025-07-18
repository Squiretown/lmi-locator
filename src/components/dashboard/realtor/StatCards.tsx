
import React from 'react';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useBrokers } from '@/hooks/useBrokers';
import { useRealtorClientManagement } from '@/hooks/useRealtorClientManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Search, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const StatCards = () => {
  const { savedAddresses, isLoading: isSavedLoading } = useSavedAddresses();
  const { activities, isLoading: isActivitiesLoading } = useClientActivity();
  const { brokers, isLoadingBrokers } = useBrokers();
  const { clients } = useRealtorClientManagement();

  // Calculate real statistics from actual data
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const propertySearches = activities.length;
  const firstTimeBuyers = clients.filter(client => client.first_time_buyer === true).length;

  const isLoading = isSavedLoading || isActivitiesLoading || isLoadingBrokers;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <StatCard title="Total Clients" value={isLoading ? null : totalClients.toString()} icon={Users} />
      <StatCard title="Active Clients" value={isLoading ? null : activeClients.toString()} icon={UserCheck} />
      <StatCard title="Property Searches" value={isLoading ? null : propertySearches.toString()} icon={Search} />
      <StatCard title="First Time Buyers" value={isLoading ? null : firstTimeBuyers.toString()} icon={UserPlus} />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | null;
  icon: React.FC<{ className?: string }>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
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
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);
