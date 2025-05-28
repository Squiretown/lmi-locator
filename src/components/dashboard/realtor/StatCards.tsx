
import React from 'react';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useBrokers } from '@/hooks/useBrokers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Search, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const StatCards = () => {
  const { savedAddresses, isLoading: isSavedLoading } = useSavedAddresses();
  const { activities, isLoading: isActivitiesLoading } = useClientActivity();
  const { brokers, isLoadingBrokers } = useBrokers();

  // Calculate stats from real data
  const mortgageBrokersCount = brokers.length;
  const clientsCount = 0; // Would come from clients API
  const searchesCount = activities.filter(a => a.type === 'search').length;
  const estimatedCommission = "$0"; // This would need a calculation based on saved properties

  const isLoading = isSavedLoading || isActivitiesLoading || isLoadingBrokers;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <StatCard title="Mortgage Brokers" value={isLoading ? null : mortgageBrokersCount.toString()} icon={Briefcase} />
      <StatCard title="Clients" value={isLoading ? null : clientsCount.toString()} icon={Users} />
      <StatCard title="Property Searches" value={isLoading ? null : searchesCount.toString()} icon={Search} />
      <StatCard title="Est. Commission" value={isLoading ? null : estimatedCommission} icon={DollarSign} />
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
