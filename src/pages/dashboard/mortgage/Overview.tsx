import React from 'react';
import { DashboardStats, PropertyCheckSection, MarketingSection, RecentActivitySection, RecentContactsSection } from '@/components/dashboard/mortgage';

const MortgageOverview: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Mortgage Professional Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your mortgage business
        </p>
      </div>
      
      <div className="space-y-6">
        <DashboardStats />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckSection />
          <MarketingSection />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentActivitySection />
          <RecentContactsSection />
        </div>
      </div>
    </div>
  );
};

export default MortgageOverview;