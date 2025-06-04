
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, AlertTriangle } from 'lucide-react';

interface UserStatisticsProps {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  pendingVerifications: number;
}

export const UserStatistics: React.FC<UserStatisticsProps> = ({
  totalUsers,
  activeUsers,
  newSignups,
  pendingVerifications,
}) => {
  // Calculate inactive users
  const inactiveUsers = totalUsers - activeUsers;
  
  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      trend: null,
      trendUp: null,
    },
    {
      label: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      trend: null,
      trendUp: null,
    },
    {
      label: 'Inactive Users',
      value: inactiveUsers,
      icon: Users,
      trend: null,
      trendUp: null,
    },
    {
      label: 'Pending Verifications',
      value: pendingVerifications,
      icon: AlertTriangle,
      trend: null,
      trendUp: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
