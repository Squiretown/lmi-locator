
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
  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      trend: '+12% this month',
      trendUp: true,
    },
    {
      label: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      trend: '+8% this month',
      trendUp: true,
    },
    {
      label: 'New Signups',
      value: newSignups,
      icon: Users,
      trend: '-3% this month',
      trendUp: false,
    },
    {
      label: 'Pending Verifications',
      value: pendingVerifications,
      icon: AlertTriangle,
      trend: 'Needs attention',
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
            <div className={`text-xs flex items-center gap-1 mt-1 ${
              stat.trendUp === true ? 'text-green-600' : 
              stat.trendUp === false ? 'text-red-600' : 
              'text-amber-600'
            }`}>
              {stat.trendUp === true && <span>↗</span>}
              {stat.trendUp === false && <span>↘</span>}
              {stat.trendUp === null && <Clock className="h-3 w-3" />}
              {stat.trend}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
