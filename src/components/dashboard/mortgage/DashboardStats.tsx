
import React from 'react';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useProfessionalLmiStats } from '@/hooks/useProfessionalLmiStats';
import { Card } from '@/components/ui/card';
import { Users, Home, FileText, Users2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardStats: React.FC = () => {
  // Use real data from hooks instead of static values
  const { savedAddresses, isLoading: isSavedLoading } = useSavedAddresses();
  const { activities, isLoading: isActivitiesLoading } = useClientActivity();
  const { stats: lmiStats, isLoading: isLmiLoading } = useProfessionalLmiStats();
  
  // Calculate stats from real data
  const totalClients = 0; // This would come from a clients API if available
  const propertiesChecked = activities.filter(a => a.type === 'search').length + lmiStats.totalSearches;
  const lmiEligibleProperties = lmiStats.lmiEligibleSearches;
  const realtorPartnerships = 0; // This would come from a partnerships API if available
  
  const isLoading = isSavedLoading || isActivitiesLoading || isLmiLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Clients"
        value={isLoading ? null : totalClients.toString()}
        icon={<Users className="w-5 h-5 text-blue-500" />}
      />
      <StatCard
        title="Properties Checked"
        value={isLoading ? null : propertiesChecked.toString()}
        icon={<Home className="w-5 h-5 text-green-500" />}
      />
      <StatCard
        title="LMI Eligible"
        value={isLoading ? null : lmiEligibleProperties.toString()}
        icon={<FileText className="w-5 h-5 text-purple-500" />}
      />
      <StatCard
        title="Realtors"
        value={isLoading ? null : realtorPartnerships.toString()}
        icon={<Users2 className="w-5 h-5 text-orange-500" />}
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
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {value === null ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold mt-1">{value}</p>
        )}
      </div>
      {icon}
    </div>
  </Card>
);
