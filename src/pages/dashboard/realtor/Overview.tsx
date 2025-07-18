import React from 'react';
import { StatCards } from '@/components/dashboard/realtor/StatCards';
import { PropertyChecker } from '@/components/dashboard/realtor/PropertyChecker';
import { TeamContent } from '@/components/dashboard/client/TeamContent';
import { LMIListings } from '@/components/dashboard/realtor/LMIListings';
import { InviteContact } from '@/components/dashboard/realtor/InviteContact';
import { RecentActivity } from '@/components/dashboard/realtor/RecentActivity';
import { RecentContacts } from '@/components/dashboard/realtor/RecentContacts';

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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PropertyChecker />
        <TeamContent />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LMIListings />
        <InviteContact />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <RecentContacts />
      </div>
    </div>
  );
};

export default RealtorOverview;