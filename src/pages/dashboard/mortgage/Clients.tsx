import React from 'react';
import { RecentContactsSection } from '@/components/dashboard/mortgage';

const MortgageClients: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Client Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your mortgage clients
        </p>
      </div>
      
      <RecentContactsSection />
    </div>
  );
};

export default MortgageClients;