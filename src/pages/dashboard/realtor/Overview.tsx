import React from 'react';
import { StatCards } from '@/components/dashboard/realtor/StatCards';
import { PropertyActivityChart } from '@/components/dashboard/realtor/PropertyActivityChart';
import { ClientList } from '@/components/dashboard/realtor/ClientList';
import { TeamContent } from '@/components/dashboard/client/TeamContent';

const RealtorOverview: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Real Estate Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your real estate business
        </p>
      </div>
      
      <StatCards />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <PropertyActivityChart />
        <div className="md:col-span-1">
          <TeamContent />
        </div>
      </div>
      
      <ClientList />
    </div>
  );
};

export default RealtorOverview;