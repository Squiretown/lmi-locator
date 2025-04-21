
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, CheckCircle, Calendar, Clock } from 'lucide-react';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { useAuth } from '@/hooks/useAuth';

export const DashboardStats: React.FC = () => {
  const { savedAddresses } = useSavedAddresses();
  const { user } = useAuth();
  
  // Calculate LMI eligible properties
  const lmiEligibleCount = savedAddresses.filter(a => a.isLmiEligible).length;
  
  // Calculate days active (using account creation date)
  const daysActive = user ? Math.ceil(
    (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 3600 * 24)
  ) : 0;
  
  const stats = [
    {
      label: 'Saved Properties',
      value: savedAddresses.length,
      icon: <Home className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50'
    },
    {
      label: 'LMI Eligible',
      value: lmiEligibleCount,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: 'bg-green-50'
    },
    {
      label: 'Days Active',
      value: daysActive,
      icon: <Calendar className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50'
    },
    {
      label: 'Recent Searches',
      value: '5',
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50'
    }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
