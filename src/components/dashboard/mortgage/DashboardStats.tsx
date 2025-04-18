
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Home, FileText, Users2 } from 'lucide-react';

export const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Clients"
        value="20"
        icon={<Users className="w-5 h-5 text-blue-500" />}
      />
      <StatCard
        title="Properties Checked"
        value="42"
        icon={<Home className="w-5 h-5 text-green-500" />}
      />
      <StatCard
        title="New LMI Listings"
        value="12"
        icon={<FileText className="w-5 h-5 text-purple-500" />}
      />
      <StatCard
        title="Realtors"
        value="8"
        icon={<Users2 className="w-5 h-5 text-orange-500" />}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      {icon}
    </div>
  </Card>
);
