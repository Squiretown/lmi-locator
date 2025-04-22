
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, Search, DollarSign } from 'lucide-react';

export const StatCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <StatCard title="Properties" value="25" icon={Building} />
      <StatCard title="Clients" value="18" icon={Users} />
      <StatCard title="Property Searches" value="42" icon={Search} />
      <StatCard title="Est. Commission" value="$46K" icon={DollarSign} />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.FC<{ className?: string }>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);
