import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Lock, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePermissionsSystem } from '@/hooks/usePermissionsSystem';

export const PermissionsStats: React.FC = () => {
  const { allPermissions, isLoading } = usePermissionsSystem();
  
  const stats = [
    {
      title: 'Total Permissions',
      value: allPermissions.length,
      icon: Key,
      description: 'Available permissions',
      color: 'text-blue-600'
    },
    {
      title: 'Active Roles',
      value: 4,
      icon: Users,
      description: 'System roles',
      color: 'text-green-600'
    },
    {
      title: 'Security Level',
      value: 'High',
      icon: Shield,
      description: 'Current status',
      color: 'text-emerald-600'
    },
    {
      title: 'Policy Status',
      value: 'Active',
      icon: CheckCircle,
      description: 'RLS enabled',
      color: 'text-green-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-12 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};