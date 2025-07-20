
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, TrendingUp, Calendar } from 'lucide-react';
import { QuickActions } from '@/components/dashboard/realtor/QuickActions';
import { PropertyChecker } from '@/components/dashboard/realtor/PropertyChecker';
import { RecentActivity } from '@/components/dashboard/realtor/RecentActivity';
import { RecentContacts } from '@/components/dashboard/realtor/RecentContacts';

const RealtorOverview: React.FC = () => {
  const stats = [
    { title: 'Active Clients', value: '24', icon: Users, color: 'text-blue-500' },
    { title: 'Properties Listed', value: '18', icon: Building, color: 'text-green-500' },
    { title: 'This Month Sales', value: '7', icon: TrendingUp, color: 'text-purple-500' },
    { title: 'Appointments', value: '12', icon: Calendar, color: 'text-orange-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Realtor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your realtor portal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Property Checker - Full Width */}
      <div className="mb-6">
        <PropertyChecker />
      </div>

      {/* Bottom Section - Recent Activity and Quick Actions + Recent Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity - Left Column */}
        <RecentActivity />

        {/* Right Column - Quick Actions and Recent Contacts */}
        <div className="space-y-6">
          <QuickActions />
          <RecentContacts />
        </div>
      </div>
    </div>
  );
};

export default RealtorOverview;
